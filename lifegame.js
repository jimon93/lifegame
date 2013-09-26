// Generated by CoffeeScript 1.6.3
(function() {
  var Builder, CanvasBuilder, CanvasVisitor, Cell, CellField, ConsoleBuilder, ConsoleVisitor, Director, LifeGame, Position, Rectangle, Timer, builder, director, extend, game, _ref, _ref1,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  extend = function() {
    var args, key, o, obj, val, _i, _len;
    obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      o = args[_i];
      if (o != null) {
        for (key in o) {
          val = o[key];
          obj[key] = val;
        }
      }
    }
    return obj;
  };

  LifeGame = (function() {
    function LifeGame(field, visitor) {
      this.field = field;
      this.visitor = visitor;
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.generation = 0;
      this.render();
    }

    LifeGame.prototype.update = function(fps) {
      this.generation++;
      this.field.update();
      return this;
    };

    LifeGame.prototype.render = function(fps) {
      var _base;
      console.log(fps);
      if (this.visitor != null) {
        this.visitor.reset();
        this.field.render(this.visitor);
        return typeof (_base = this.visitor).view === "function" ? _base.view() : void 0;
      }
    };

    return LifeGame;

  })();

  CellField = (function() {
    function CellField(height, width) {
      var rect,
        _this = this;
      this.height = height;
      this.width = width;
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      rect = new Rectangle(this.height, this.width);
      this.cells = rect.list.map(function(pos) {
        return new Cell(pos);
      }).map(function(cell) {
        cell.live = Math.random() * 3 < 1;
        return cell;
      }).reduce((function(obj, cell) {
        obj[cell.pos] = cell;
        return obj;
      }), {});
    }

    CellField.prototype.update = function() {
      var cell, count, key, offset, rect, _ref, _results,
        _this = this;
      rect = new Rectangle(3, 3);
      offset = new Position(-1, -1);
      _ref = this.cells;
      _results = [];
      for (key in _ref) {
        cell = _ref[key];
        count = rect.list.map(function(pos) {
          return pos.add(offset).add(cell.pos);
        }).filter(function(pos) {
          return !(pos.toString() === cell.pos.toString());
        }).filter(function(pos) {
          var _ref1;
          return (_ref1 = _this.cells[pos]) != null ? _ref1.live : void 0;
        }).length;
        _results.push(cell.update(count));
      }
      return _results;
    };

    CellField.prototype.render = function(visitor) {
      var cell, key, _ref, _results;
      _ref = this.cells;
      _results = [];
      for (key in _ref) {
        cell = _ref[key];
        _results.push(cell.render(visitor));
      }
      return _results;
    };

    return CellField;

  })();

  Cell = (function() {
    function Cell(pos) {
      this.pos = pos;
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.live = false;
    }

    Cell.prototype.update = function(neigbor) {
      return this.live = (function() {
        switch (neigbor) {
          case 2:
            return this.live;
          case 3:
            return true;
          default:
            return false;
        }
      }).call(this);
    };

    Cell.prototype.render = function(visitor) {
      return visitor.visit(this);
    };

    return Cell;

  })();

  ConsoleVisitor = (function() {
    function ConsoleVisitor() {
      this.view = __bind(this.view, this);
      this.visit = __bind(this.visit, this);
      this.reset = __bind(this.reset, this);
    }

    ConsoleVisitor.prototype.reset = function() {
      return this.res = [];
    };

    ConsoleVisitor.prototype.visit = function(cell) {
      var _base, _name;
      if ((_base = this.res)[_name = cell.pos.y] == null) {
        _base[_name] = [];
      }
      return this.res[cell.pos.y][cell.pos.x] = cell.live ? '*' : ' ';
    };

    ConsoleVisitor.prototype.view = function() {
      return console.log(this.res);
    };

    return ConsoleVisitor;

  })();

  CanvasVisitor = (function() {
    function CanvasVisitor(canvas, height, width, cellSize) {
      this.height = height;
      this.width = width;
      this.cellSize = cellSize;
      this.setupContext = __bind(this.setupContext, this);
      this.setupCanvas = __bind(this.setupCanvas, this);
      this.visit = __bind(this.visit, this);
      this.reset = __bind(this.reset, this);
      this.canvas = this.setupCanvas(canvas);
      this.context = this.setupContext(this.canvas);
    }

    CanvasVisitor.prototype.reset = function() {
      return this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    CanvasVisitor.prototype.visit = function(cell) {
      if (cell.live) {
        return this.context.fillRect(cell.pos.x * this.cellSize, cell.pos.y * this.cellSize, this.cellSize, this.cellSize);
      }
    };

    CanvasVisitor.prototype.setupCanvas = function(canvas) {
      canvas.width = canvas.style.width = this.width * this.cellSize;
      canvas.height = canvas.style.height = this.height * this.cellSize;
      return canvas;
    };

    CanvasVisitor.prototype.setupContext = function(canvas) {
      var context;
      context = canvas.getContext('2d');
      context.fillStyle = "rgb(0,0,0)";
      return context;
    };

    return CanvasVisitor;

  })();

  Builder = (function() {
    Builder.prototype.defaults = {
      height: 10,
      width: 10,
      fps: 10
    };

    function Builder(options) {
      this.createTimer = __bind(this.createTimer, this);
      this.createGame = __bind(this.createGame, this);
      this.createField = __bind(this.createField, this);
      this.options = extend({}, this.defaults, options);
    }

    Builder.prototype.createField = function() {
      return new CellField(this.options.height, this.options.width);
    };

    Builder.prototype.createGame = function(field, visitor) {
      return new LifeGame(field, visitor);
    };

    Builder.prototype.createTimer = function(game) {
      var func,
        _this = this;
      func = function(fps) {
        return game.update(fps).render(fps);
      };
      return new Timer(func, this.options.fps);
    };

    return Builder;

  })();

  ConsoleBuilder = (function(_super) {
    __extends(ConsoleBuilder, _super);

    function ConsoleBuilder() {
      this.createVisitor = __bind(this.createVisitor, this);
      _ref = ConsoleBuilder.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ConsoleBuilder.prototype.createVisitor = function() {
      return new ConsoleVisitor;
    };

    return ConsoleBuilder;

  })(Builder);

  CanvasBuilder = (function(_super) {
    __extends(CanvasBuilder, _super);

    CanvasBuilder.prototype.defaults = {
      cellSize: 10
    };

    function CanvasBuilder(canvas, options) {
      this.canvas = canvas;
      this.createVisitor = __bind(this.createVisitor, this);
      CanvasBuilder.__super__.constructor.call(this, extend({}, this.defaults, options));
    }

    CanvasBuilder.prototype.createVisitor = function() {
      return new CanvasVisitor(this.canvas, this.options.height, this.options.width, this.options.cellSize);
    };

    return CanvasBuilder;

  })(Builder);

  Director = (function() {
    function Director(builder) {
      this.builder = builder;
      this.construct = __bind(this.construct, this);
    }

    Director.prototype.construct = function() {
      var field, game, timer, visitor;
      field = this.builder.createField();
      visitor = null;
      game = this.builder.createGame(field, visitor);
      return timer = this.builder.createTimer(game);
    };

    return Director;

  })();

  Position = (function() {
    function Position(x, y) {
      this.x = x;
      this.y = y;
      this.toString = __bind(this.toString, this);
      this.add = __bind(this.add, this);
    }

    Position.prototype.add = function(other) {
      return new Position(this.x + other.x, this.y + other.y);
    };

    Position.prototype.toString = function() {
      return "(" + this.x + ", " + this.y + ")";
    };

    return Position;

  })();

  Rectangle = (function() {
    function Rectangle(height, width) {
      var x, y, _i, _j, _ref1, _ref2;
      this.height = height;
      this.width = width;
      this.list = [];
      for (y = _i = 0, _ref1 = this.height; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; y = 0 <= _ref1 ? ++_i : --_i) {
        for (x = _j = 0, _ref2 = this.width; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; x = 0 <= _ref2 ? ++_j : --_j) {
          this.list.push(new Position(x, y));
        }
      }
    }

    return Rectangle;

  })();

  Timer = (function() {
    function Timer(func, targetFPS) {
      this.func = func;
      this.targetFPS = targetFPS;
      this.getFPS = __bind(this.getFPS, this);
      this.getTime = __bind(this.getTime, this);
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.next = __bind(this.next, this);
      this.prevTime = this.getTime();
    }

    Timer.prototype.next = function() {
      return this.func(this.getFPS());
    };

    Timer.prototype.start = function() {
      return this.id = setInterval(this.next, 1000.0 / this.targetFPS);
    };

    Timer.prototype.stop = function() {
      return clearInterval(this.id);
    };

    Timer.prototype.getTime = function() {
      return (new Date).getTime();
    };

    Timer.prototype.getFPS = function() {
      var fps, nowTime;
      nowTime = this.getTime();
      fps = 1000.0 / (nowTime - this.prevTime);
      this.prevTime = nowTime;
      return fps;
    };

    return Timer;

  })();

  if (typeof $ !== "undefined" && $ !== null) {
    $.fn.LifeGame = function(options) {
      var builder, director, game;
      if (options == null) {
        options = {};
      }
      builder = new CanvasBuilder(this[0], options);
      director = new Director(builder);
      game = director.construct();
      return game.start();
    };
  }

  if ((typeof __filename !== "undefined" && __filename !== null) && __filename === (typeof process !== "undefined" && process !== null ? (_ref1 = process.mainModule) != null ? _ref1.filename : void 0 : void 0)) {
    builder = new ConsoleBuilder({
      height: 5,
      fps: 1
    });
    director = new Director(builder);
    game = director.construct();
    game.start();
  }

}).call(this);
