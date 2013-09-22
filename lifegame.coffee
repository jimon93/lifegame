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
    @rectangleEach @initCell
    @rectangleEach @randomCellLive

  update: =>
    cell.update() for pos, cell of @cells

  render: (visitor)=>
    cell.render(visitor) for key, cell of @cells

  onCellChange: (cell)=>
    diff = if cell.live then 1 else -1
    @neigborEach cell.pos, (pos)=> @cells[pos]?.neigbor += diff

  rectangleEach: (func)=>
    for y in [0...@height]
      for x in [0...@width]
        func new Position(x, y)

  neigborEach: (pos, func)=>
    for dy in [-1..1]
      for dx in [-1..1]
        unless dy == 1 and dx == 1
          func new Position(pos.x + dx, pos.y + dy)

  initCell: (pos)=>
    @cells[pos] = new Cell(pos)
    @cells[pos].changeEvents.push(@onCellChange)

  randomCellLive: (pos)=>
    @cells[pos].setLive(Math.random() * 3 < 1)

class Cell
  constructor: (@pos)->
    @live = false
    @neigbor = 0
    @changeEvents = []

  update: =>
    @setLive switch @neigbor
      when 2 then @live
      when 3 then true
      else false

  render: (visitor)=>
    visitor.visit(@)

  setLive: (next)=>
    if next != @live
      @live = next
      event(@) for event in @changeEvents

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
  constructor: (canvas, @width, @height, @cellSize)->
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

  toString: =>
    "(#{@x}, #{@y})"

if $?
  $.fn.LifeGame = (options = {})->
    builder = new CanvasBuilder(@[0], options)
    director = new Director(builder)
    game = director.construct()
    game.start()

if __filename? __filename == process?.mainModule?.filename?
  builder = new ConsoleBuilder {fps:1}
  director = new Director(builder)
  game = director.construct()
  game.start()
