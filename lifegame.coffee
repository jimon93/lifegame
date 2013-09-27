extend = (obj, args...)->
  for o in args when o?
    for key, val of o
      obj[key] = val
  return obj

class LifeGame
  constructor: (@field, @visitor)->
    @generation = 0
    @render()

  update: (fps)=>
    @generation++
    @field.update()
    return @

  render: (fps)=>
    console?.log fps
    if @visitor?
      @visitor.reset()
      @field.render(@visitor)
      @visitor.view?()

class CellField
  constructor: (@height, @width)->
    #Cell::changeEvent = @onChanged
    @cells = @makeMatrix((x,y)=>(new Cell(x,y)).setRandomLive())
    #@changed = []

  update: =>
    count = null
    @each (cell)=>
      {x,y} = cell
      count = 0
      for dy in [-1..1]
        for dx in [-1..1] when dy != 0 or dx != 0
          count++ if @cells[y+dy]?[x+dx]?.live == true
      cell.neigbor = count
    @each (cell)=>
      cell.update()

  render: (visitor)=>
    @each (cell)=>
      cell.render(visitor)

  onChanged: (cell)=>
    @chenged.push cell

  each: (func)=>
    func(cell) for cell in line for line in @cells

  makeMatrix: (init)=>
    (init(x,y) for x in [0...@width] for y in [0...@height])

class Cell
  constructor: (@x, @y)->
    @live = false
    @prevLive = @live
    @neigbor = 0

  update: =>
    @prevLive = @live
    @live = switch @neigbor
      when 2 then @live
      when 3 then true
      else false
    @changeEvent?(@) if @live != @prevLive

  render: (visitor)=>
    visitor.visit(@)

  setRandomLive: =>
    @live = (Math.random() * 3 < 1)
    return @

# ==============================================================================
# rendering visitor
# ==============================================================================
class ConsoleVisitor
  reset: =>
    @res = []

  visit: (cell)=>
    @res[cell.y] ?= []
    @res[cell.y][cell.x] = if cell.live then '*' else ' '

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
      cell.x * @cellSize
      cell.y * @cellSize
      @cellSize #- 1
      @cellSize #- 1
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

  createGame: (field, visitor)=>
    new LifeGame(field, visitor)

  createTimer: (game)=>
    func = (fps)=> game.update(fps).render(fps)
    new Timer(func, @options.fps)

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
    field   = @builder.createField()
    visitor = @builder.createVisitor()
    game    = @builder.createGame(field, visitor)
    timer   = @builder.createTimer(game)

# ==============================================================================
# Util
# ==============================================================================
class Timer
  constructor: (@func, @targetFPS)->

  next: =>
    @func @getFPS()

  start: =>
    @id = setInterval(@next, 1000.0 / @targetFPS)

  stop: =>
    clearInterval @id

  getFPS: =>
    nowTime = (new Date).getTime()
    fps = 1000.0 / (nowTime - @prevTime)
    @prevTime = nowTime
    return fps

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
  builder = new ConsoleBuilder { height:5, fps:1 }
  director = new Director(builder)
  game = director.construct()
  game.start()
