log = console.log
extend = (obj, args...)->
  for o in args
    for key, val of o
      obj[key] = val
  return obj

class LifeGame
  defaults: {
    height: 10
    width: 10
    fps: 10
  }

  constructor: (options)->
    @options = extend {}, @defaults, options
    @field = @createCellField()

  createCellField: =>
    new CellField(@options.height, @options.width, @options)

  update: =>
    @field.update()
    return @

  start: =>
    @render?()
    setInterval( (=> @update(); @render?()), 1000/@options.fps )

class CellField
  constructor: (@height, @width, @options)->
    @cells = {}
    @rectangleEach @initCell
    @rectangleEach @randomCellLive

  update: =>
    cell.update() for pos, cell of @cells

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
    @cells[pos] = @createCell(pos)
    @cells[pos].changeEvents.push(@onCellChange)

  randomCellLive: (pos)=>
    @cells[pos].setLive(Math.random() * 3 < 1)

  createCell: (pos)=>
    new Cell(pos, @options)

class Cell
  constructor: (@pos, @options)->
    @live = false
    @neigbor = 0
    @changeEvents = []

  update: =>
    @setLive switch @neigbor
      when 2 then @live
      when 3 then true
      else false

  setLive: (next)=>
    if next != @live
      @live = next
      event(@) for event in @changeEvents
# ==============================================================================
class LifeGame4Console extends LifeGame
  createCellField: =>
    new CellField4Console(@options.height, @options.width, @options)

  render: =>
    log @field.render()

class CellField4Console extends CellField
  createCell: (pos)=>
    new Cell4Console(pos, @options)

  render: =>
    @rectangleEach (pos) => @cells[pos].render()

class Cell4Console extends Cell
  render: =>
    if @live then '*' else ' '
# ==============================================================================
class LifeGame4Canvas extends LifeGame
  defaults: {
    height: 10
    width: 10
    fps: 50
    cellSize: 10
  }

  constructor: (options)->
    super
    @canvas = @setupCanvas @options.canvas
    @context = @setupContext @canvas

  createCellField: =>
    new CellField4Canvas(@options.height, @options.width, @options)

  setupCanvas: (canvas)=>
    canvas.width  = canvas.style.width  = @options.width  * @options.cellSize
    canvas.height = canvas.style.height = @options.height * @options.cellSize
    canvas

  setupContext: (canvas)=>
    context = canvas.getContext('2d')
    context.fillStyle = "rgb(0,0,0)"
    context

  render: =>
    @context.clearRect(0, 0, @canvas.width, @canvas.height)
    @field.render(@context)

class CellField4Canvas extends CellField
  createCell: (pos)=>
    new Cell4Canvas(pos, @options)

  render: (context)=>
    @rectangleEach (pos) => @cells[pos].render(context)

class Cell4Canvas extends Cell
  render: (context)=>
    context.fillRect(
      @pos.x * @options.cellSize
      @pos.y * @options.cellSize
      @options.cellSize - 1
      @options.cellSize - 1
    ) if @live
# ==============================================================================
class Position
  constructor: (@x, @y)->

  toString: =>
    "(#{@x}, #{@y})"

if $?
  $.fn.LifeGame = (options = {})->
    options.canvas = @[0]
    game = new LifeGame4Canvas( options )
    game.start()
else
  game = new LifeGame4Console {
    height: 5
    width: 10
  }
  game.start()


