// Generated by CoffeeScript 1.8.0
var RoboRacing, bot, timerId,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

RoboRacing = (function(_super) {
  __extends(RoboRacing, _super);

  function RoboRacing(driver) {
    var RoboGameClock, RoboGameFinding, RoboGaming, RoboPlaying;
    this.driver = driver;
    RoboRacing.__super__.constructor.call(this, "ready", ["stop"]);
    this.limited = this.addChild(new RoboTiming("limiting", [], 180));
    this.sequence = new RoboSequencing("stepping", ["go"]);
    this.calibrator = new RoboCompassCalibrating("auto compass calibrating", [], this.driver);
    this.limited.addChild(new RoboInterrupting("require calibrated compass", [], this.sequence, this.calibrator, function(bot) {
      return !bot.announcers.compass;
    }));
    this.limited.addChild(new RoboFlagging("storing", ["store"], (function(_this) {
      return function(coords) {
        return _this.sequence.addChild(new RoboFinding("p", [], new RoboSteering(_this.driver), coords));
      };
    })(this)));
    this.driving = this.limited.addChild(new RoboDriving("driving", ["drive"], this.driver, 5));
    this.resetting = this.addChild(new RoboDoing("resetting", ["reset"]));
    this.addChild(new RoboPhotographing("shooting", ["shoot"], "picture1"));
    this.addChild(new RoboCompassCalibrating("compass calibrating", ["calibrate"], this.driver));
    this.addChild(new RoboCompassDisplaying("compass", ["compass"]));
    this.playing = this.addChild(new RoboSequencing("playing", ["play"]));
    this.playing.addChild(new RoboFlagging("homebasing", [], (function(_this) {
      return function(coords) {
        return _this.playing.behaviors[3] = new RoboFinding("home", [], new RoboSteering(_this.driver), coords);
      };
    })(this)));
    this.playing.addChild(new RoboTiming("gamelimit", [], 180));
    RoboGameFinding = (function(_super1) {
      __extends(_Class, _super1);

      function _Class() {
        return _Class.__super__.constructor.apply(this, arguments);
      }

      _Class.prototype.listener = function(currentState, event, bot) {
        var game, newState;
        newState = _Class.__super__.listener.call(this, currentState, event, bot);
        if (event.broadcast) {
          game = event.broadcast.game;
          if (game && game.reached) {
            return this.parent.behaviors[game.reached];
          }
        }
        if (newState === this.parent) {
          bot.broadcast({
            game: {
              location: this.current_location
            }
          });
        }
        return null;
      };

      return _Class;

    })(RoboFinding);
    RoboGameClock = (function(_super1) {
      __extends(_Class, _super1);

      function _Class() {
        return _Class.__super__.constructor.apply(this, arguments);
      }

      _Class.prototype.completed = function(bot) {
        return bot.broadcast({
          game: {
            running: false,
            won: true,
            elapsed: this.elapsed
          }
        });
      };

      _Class.prototype.alarmed = function(bot) {
        return bot.broadcast({
          game: {
            running: false,
            won: false,
            elapsed: this.elapsed
          }
        });
      };

      return _Class;

    })(RoboTiming);
    RoboGameFinding = (function(_super1) {
      __extends(_Class, _super1);

      function _Class() {
        return _Class.__super__.constructor.apply(this, arguments);
      }

      _Class.prototype.listener = function(currentState, event, bot) {
        var broadcast, distance, game, next;
        broadcast = event.broadcast;
        if (broadcast && broadcast.game) {
          game = broadcast.game;
          if (game.location) {
            distance = this.distance(game.location.coords, this.location);
            if (distance < this.perimeter) {
              next = 1 + (__indexOf.call(this.parent.behaviors, this) >= 0);
              bot.broadcast({
                game: {
                  running: true,
                  sender: broadcast.sender,
                  next: next
                }
              });
              return this.parent;
            }
          }
        }
        return null;
      };

      return _Class;

    })(RoboFinding);
    RoboGaming = (function(_super1) {
      __extends(_Class, _super1);

      function _Class(name, goals, copyFrom) {
        this.copyFrom = copyFrom;
        _Class.__super__.constructor.call(this, name, goals);
      }

      _Class.prototype.entering = function(oldState, currentState, bot) {
        var flag, item, _i, _len, _ref;
        if (currentState === this && !this.contains(oldState)) {
          this.behaviors = [];
          _ref = this.copyFrom.behaviors;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            flag = _ref[_i];
            this.addChild(new RoboGameFinding(flag.basename, [], null, flag.location));
          }
          return bot.broadcast({
            game: {
              running: true,
              flags: (function() {
                var _j, _len1, _ref1, _results;
                _ref1 = this.copyFrom.behaviors;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  item = _ref1[_j];
                  _results.push(item.location);
                }
                return _results;
              }).call(this)
            }
          });
        }
      };

      return _Class;

    })(RoboSequencing);
    RoboPlaying = (function(_super1) {
      __extends(_Class, _super1);

      function _Class(name, goals, sequence) {
        this.sequence = sequence;
        _Class.__super__.constructor.call(this, name, goals);
      }

      _Class.prototype.listener = function(currentState, event) {
        var location, _i, _len, _ref;
        if (!(event.broadcast && event.broadcast.game && event.broadcast.game.flags)) {
          return null;
        }
        this.sequence.behaviors = [];
        _ref = event.broadcast.game.flags;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          location = _ref[_i];
          this.sequence.addChild(new RoboGameFinding("game", [], new RoboSteering(this.driver), location));
        }
        return this.sequence;
      };

      return _Class;

    })(RoboDoing);
    this.gaming = this.addChild(new RoboGameClock("gaming", ["game"], 180));
    this.gaming.addChild(new RoboGaming("gamesequencing", [], this.sequence));
    this.playing = this.addChild(new RoboPlaying("playing", ["play"], this.sequence));
  }

  RoboRacing.prototype.listener = function(currentState, event) {
    if (currentState === this.resetting) {
      return new RoboRacing(this.driver);
    } else {
      return RoboRacing.__super__.listener.call(this, currentState, event);
    }
  };

  RoboRacing.prototype.entering = function(oldState, currentState, bot) {
    if (currentState === this) {
      this.driver.drive(0);
      return bot.broadcast({
        game: {
          running: false
        }
      });
    }
  };

  return RoboRacing;

})(RoboButtonWatching);

timerId = null;

bot = new Bot(function(state, event) {
  var eventkey, eventval, html, lastevent;
  console.log("now " + (state.fullName()));
  lastevent = event ? (eventkey = Object.keys(event)[0], eventval = event[eventkey], " " + eventkey + ":" + eventval) : "";
  html = state.ancestor().accordian(state, lastevent);
  clearTimeout(timerId);
  return timerId = setTimeout((function(html) {
    return $("#set").html(html).collapsibleset("refresh");
  }), 1000, html);
});

$(function() {
  bot.setState(new RoboRacing(new LittleCar(bot)));
  bot.addAnnouncer(new ButtonAnnouncer("button", ["go", "stop", "store", "reset", "drive", "shoot", "calibrate", "compass", "game", "play"]));
  bot.addAnnouncer(new CrashAnnouncer("crash"));
  bot.addAnnouncer(new OrientationAnnouncer("orientation"));
  bot.addAnnouncer(new LocationAnnouncer("location"));
  bot.addAnnouncer(new TimeAnnouncer("time"));
  bot.addAnnouncer(new CorrectionAnnouncer("correction"));
  return bot.addAnnouncer(new BroadcastAnnouncer("broadcasts"));
});
