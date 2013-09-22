// Generated by CoffeeScript 1.6.3
(function() {
  var Builder, CanvasBuilder, CanvasVisitor, Cell, CellField, ConsoleBuilder, ConsoleVisitor, Director, LifeGame, Position, builder, director, extend, game, _ref, _ref1,
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
    function LifeGame(field, visitor, fps) {
      this.field = field;
      this.visitor = visitor;
      this.fps = fps;
      this.start = __bind(this.start, this);
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
    }

    LifeGame.prototype.update = function() {
      this.field.update();
      return this;
    };

    LifeGame.prototype.render = function() {
      var _base;
      if (this.visitor != null) {
        this.visitor.reset();
        this.field.render(this.visitor);
        return typeof (_base = this.visitor).view === "function" ? _base.view() : void 0;
      }
    };

    LifeGame.prototype.start = function() {
      var _this = this;
      this.render();
      return setInterval((function() {
        _this.update();
        return _this.render();
      }), 1000 / this.fps);
    };

    return LifeGame;

  })();

  CellField = (function() {
    function CellField(height, width) {
      this.height = height;
      this.width = width;
      this.randomCellLive = __bind(this.randomCellLive, this);
      this.initCell = __bind(this.initCell, this);
      this.neigborEach = __bind(this.neigborEach, this);
      this.rectangleEach = __bind(this.rectangleEach, this);
      this.onCellChange = __bind(this.onCellChange, this);
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.cells = {};
      this.rectangleEach(this.initCell);
      this.rectangleEach(this.randomCellLive);
    }

    CellField.prototype.update = function() {
      var cell, pos, _ref, _results;
      _ref = this.cells;
      _results = [];
      for (pos in _ref) {
        cell = _ref[pos];
        _results.push(cell.update());
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

    CellField.prototype.onCellChange = function(cell) {
      var diff,
        _this = this;
      diff = cell.live ? 1 : -1;
      return this.neigborEach(cell.pos, function(pos) {
        var _ref;
        return (_ref = _this.cells[pos]) != null ? _ref.neigbor += diff : void 0;
      });
    };

    CellField.prototype.rectangleEach = function(func) {
      var x, y, _i, _ref, _results;
      _results = [];
      for (y = _i = 0, _ref = this.height; 0 <= _ref ? _i < _ref : _i > _ref; y = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (x = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
            _results1.push(func(new Position(x, y)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    CellField.prototype.neigborEach = function(pos, func) {
      var dx, dy, _i, _results;
      _results = [];
      for (dy = _i = -1; _i <= 1; dy = ++_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (dx = _j = -1; _j <= 1; dx = ++_j) {
            if (!(dy === 1 && dx === 1)) {
              _results1.push(func(new Position(pos.x + dx, pos.y + dy)));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        })());
      }
      return _results;
    };

    CellField.prototype.initCell = function(pos) {
      this.cells[pos] = new Cell(pos);
      return this.cells[pos].changeEvents.push(this.onCellChange);
    };

    CellField.prototype.randomCellLive = function(pos) {
      return this.cells[pos].setLive(Math.random() * 3 < 1);
    };

    return CellField;

  })();

  Cell = (function() {
    function Cell(pos) {
      this.pos = pos;
      this.setLive = __bind(this.setLive, this);
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.live = false;
      this.neigbor = 0;
      this.changeEvents = [];
    }

    Cell.prototype.update = function() {
      return this.setLive((function() {
        switch (this.neigbor) {
          case 2:
            return this.live;
          case 3:
            return true;
          default:
            return false;
        }
      }).call(this));
    };

    Cell.prototype.render = function(visitor) {
      return visitor.visit(this);
    };

    Cell.prototype.setLive = function(next) {
      var event, _i, _len, _ref, _results;
      if (next !== this.live) {
        this.live = next;
        _ref = this.changeEvents;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          _results.push(event(this));
        }
        return _results;
      }
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
    function CanvasVisitor(canvas, width, height, cellSize) {
      this.width = width;
      this.height = height;
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
        return this.context.fillRect(cell.pos.x * this.cellSize, cell.pos.y * this.cellSize, this.cellSize - 1, this.cellSize - 1);
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
      this.getFPS = __bind(this.getFPS, this);
      this.createField = __bind(this.createField, this);
      this.options = extend({}, this.defaults, options);
    }

    Builder.prototype.createField = function() {
      return new CellField(this.options.height, this.options.width);
    };

    Builder.prototype.getFPS = function() {
      return this.options.fps;
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
      var field, fps, visitor;
      field = this.builder.createField();
      visitor = this.builder.createVisitor();
      fps = this.builder.getFPS();
      return new LifeGame(field, visitor, fps);
    };

    return Director;

  })();

  Position = (function() {
    function Position(x, y) {
      this.x = x;
      this.y = y;
      this.toString = __bind(this.toString, this);
    }

    Position.prototype.toString = function() {
      return "(" + this.x + ", " + this.y + ")";
    };

    return Position;

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

  if (typeof __filename === "function" ? __filename(__filename === ((typeof process !== "undefined" && process !== null ? (_ref1 = process.mainModule) != null ? _ref1.filename : void 0 : void 0) != null)) : void 0) {
    builder = new ConsoleBuilder({
      fps: 1
    });
    director = new Director(builder);
    game = director.construct();
    game.start();
  }

}).call(this);
