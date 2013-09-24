extend = (obj, args...)->
  for o in args when o?
    for key, val of o
      obj[key] = val
  return obj

class LifeGame
  constructor: (@field, @visitor, @fps)->

  update: =>
    @field.update()
    return @

  render: =>
    if @visitor?
      @visitor.reset()
      @field.render(@visitor)
      @visitor.view?()

  start: =>
    @render()
    setInterval( (=> @update(); @render()), 1000 / @fps )

class CellField
  constructor: (@height, @width)->
    @cells = {}
    rect = new Rectangle(@height, @width)
    rect.list.forEach @initCell

  update: =>
    rect = new Rectangle(3, 3)
    offset = new Position(-1, -1)
    for key, cell of @cells
      count = rect.list
        .map( (pos)=> pos.add(offset).add(cell.pos) )
        .filter( (pos)=> !(pos.toString() == cell.pos.toString()) )
        .filter( (pos)=> @cells[pos]?.live )
        .length
      cell.update(count)

  render: (visitor)=>
    cell.render(visitor) for key, cell of @cells

  initCell: (pos)=>
    @cells[pos] = cell = new Cell(pos)
    @randomCellLive(cell)

  randomCellLive: (cell)=>
    cell.live = (Math.random() * 3 < 1)

class Cell
  constructor: (@pos)->
    @live = false

  update: (neigbor)=>
    @live = switch neigbor
      when 2 then @live
      when 3 then true
      else false

  render: (visitor)=>
    visitor.visit(@)

# ==============================================================================
# rendering visitor
# ==============================================================================
class ConsoleVisitor
  reset: =>
    @res = []

  visit: (cell)=>
    @res[cell.pos.y] ?= []
    @res[cell.pos.y][cell.pos.x] = if cell.live then '*' else ' '

  view: =>
    console.log @res

class CanvasVisitor
  constructor: (canvas, @height, @width, @cellSize)->
    @canvas = @setupCanvas canvas
    @context = @setupContext @canvas

  reset: =>
    @context.clearRect(0, 0, @canvas.width, @canvas.height)

  visit: (cell)=>
    @context.fillRect(
      cell.pos.x * @cellSize
      cell.pos.y * @cellSize
      @cellSize - 1
      @cellSize - 1
    ) if cell.live

  setupCanvas: (canvas)=>
    canvas.width  = canvas.style.width  = @width  * @cellSize
    canvas.height = canvas.style.height = @height * @cellSize
    canvas

  setupContext: (canvas)=>
    context = canvas.getContext('2d')
    context.fillStyle = "rgb(0,0,0)"
    context

# ==============================================================================
# Builder
# ==============================================================================
class Builder
  defaults:
    height: 10
    width: 10
    fps: 10

  constructor: (options)->
    @options =(extend {}, @defaults, options)

  createField: =>
    new CellField(@options.height, @options.width)

  getFPS: =>
    @options.fps

class ConsoleBuilder extends Builder
  createVisitor: =>
    new ConsoleVisitor

class CanvasBuilder extends Builder
  defaults:
    cellSize: 10

  constructor: (@canvas, options)->
    super(extend {}, @defaults, options)

  createVisitor: =>
    new CanvasVisitor( @canvas, @options.height, @options.width, @options.cellSize )

class Director
  constructor: (@builder)->

  construct: =>
    field = @builder.createField()
    visitor = @builder.createVisitor()
    fps = @builder.getFPS()
    new LifeGame(field, visitor, fps)

# ==============================================================================
# Util
# ==============================================================================
class Position
  constructor: (@x, @y)->

  add: (other)=>
    new Position(@x + other.x, @y + other.y)

  toString: =>
    "(#{@x}, #{@y})"

class Rectangle
  constructor: (@height, @width)->
    @list = []
    for y in [0...@height]
      for x in [0...@width]
        @list.push new Position(x, y)

# ==============================================================================
# Setup
# ==============================================================================
if $?
  $.fn.LifeGame = (options = {})->
    builder = new CanvasBuilder(@[0], options)
    director = new Director(builder)
    game = director.construct()
    game.start()

if __filename? and __filename == process?.mainModule?.filename
  builder = new ConsoleBuilder { height:5, fps:1}
  director = new Director(builder)
  game = director.construct()
  game.start()
