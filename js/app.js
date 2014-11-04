// Generated by CoffeeScript 1.8.0
var BigCar, RobotBatteryLimit, RobotFindingState, RobotFlaggingState, RobotLoopState, RobotPhotographingState, RobotSequentialState, RobotState, RobotTestMachine, RobotTimeLimit, announceBotEvent, car, car2connect, carSocket, drive, drive2command, driveBigCar, driveLittleCar, finderBotState,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

RobotState = (function() {
  function RobotState(name, goals, listener, entering) {
    this.name = name;
    this.goals = goals;
    this.listener = listener;
    this.entering = entering;
    this.behaviors = [];
    this.parent = null;
    this.addForward = true;
  }

  RobotState.prototype.addChild = function(state) {
    state.parent = this;
    if (this.addForward) {
      this.behaviors.push(state);
    } else {
      this.behaviors.unshift(state);
    }
    return state;
  };

  RobotState.prototype.processEvent = function(currentState, event) {
    var newState;
    if (this.parent) {
      newState = this.parent.processEvent(currentState, event);
    }
    if (!newState) {
      newState = this.listener(currentState, event);
      if (newState) {
        newState.enterAll(currentState, newState);
      }
    }
    return newState;
  };

  RobotState.prototype.enterAll = function(oldState, currentState) {
    if (this.parent) {
      this.parent.enterAll(oldState, currentState);
    }
    if (this.entering) {
      return this.entering(oldState, currentState);
    }
  };

  RobotState.prototype.findHandler = function(goal) {
    return this.ancestor().findHandlerR(goal);
  };

  RobotState.prototype.findHandlerR = function(goal) {
    var behavior, found, _i, _len, _ref;
    if (__indexOf.call(this.goals, goal) >= 0) {
      return this;
    }
    _ref = this.behaviors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      behavior = _ref[_i];
      found = behavior.findHandlerR(goal);
      if (found) {
        return found;
      }
    }
    return null;
  };

  RobotState.prototype.ancestor = function() {
    if (!this.parent) {
      return this;
    }
    return this.parent.ancestor();
  };

  RobotState.prototype.contains = function(target) {
    var child, _i, _len, _ref;
    if (target === this) {
      return true;
    }
    _ref = this.behaviors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.contains(target)) {
        return true;
      }
    }
    return false;
  };

  return RobotState;

})();

RobotLoopState = (function(_super) {
  __extends(RobotLoopState, _super);

  function RobotLoopState(name, goals) {
    RobotLoopState.__super__.constructor.call(this, name, goals, function(currentState, event) {
      if (currentState !== this) {
        return null;
      }
      return this.behaviors[0] || this.parent;
    });
  }

  return RobotLoopState;

})(RobotState);

RobotSequentialState = (function(_super) {
  __extends(RobotSequentialState, _super);

  function RobotSequentialState(name, goals) {
    RobotSequentialState.__super__.constructor.call(this, name, goals, function(currentState, event) {
      if (currentState !== this) {
        return null;
      }
      return this.behaviors[this.counter] || this.parent;
    }, function(oldState, currentState) {
      if (currentState !== this) {
        return;
      }
      return this.counter = this.contains(oldState) ? (this.counter || -1) + 1 : 0;
    });
  }

  return RobotSequentialState;

})(RobotState);

RobotTimeLimit = (function(_super) {
  __extends(RobotTimeLimit, _super);

  function RobotTimeLimit(name, goals, duration) {
    this.duration = duration;
    RobotTimeLimit.__super__.constructor.call(this, name, goals, function(currentState, event) {
      this.passed = 0;
      if (event.timer) {
        this.passed += event.timer;
        if (this.passed > this.duration) {
          this.passed = 0;
          return this.parent;
        }
      }
      if (currentState === this) {
        return this.parent;
      }
      return null;
    }, function(oldState, currentState) {
      if (!this.contains(oldState)) {
        return this.passed = 0;
      }
    });
  }

  return RobotTimeLimit;

})(RobotState);

RobotFlaggingState = (function(_super) {
  __extends(RobotFlaggingState, _super);

  function RobotFlaggingState(name, goals, target) {
    this.target = target;
    RobotFlaggingState.__super__.constructor.call(this, name, goals, function(currentState, event) {
      if (event.location) {
        this.target.addChild(new RobotFindingState("flag: " + name, [], event.location.coords));
        return this.parent;
      }
      return null;
    });
  }

  return RobotFlaggingState;

})(RobotState);

RobotPhotographingState = (function(_super) {
  __extends(RobotPhotographingState, _super);

  function RobotPhotographingState(name, goals, filename) {
    RobotPhotographingState.__super__.constructor.call(this, name, goals, function(currentState, event) {
      return this.parent;
    }, function(oldState, currentState) {
      var options;
      if (currentState !== this) {
        return;
      }
      options = {
        camera: navigator.mozCameras.getListOfCameras()[0]
      };
      return naigator.mozCameras.getCamera(options, function(camera) {
        var poptions;
        poptions = {
          rotation: 90,
          pictureSize: camera.capabilities.pictureSizes[0],
          fileFormat: camera.capabilities.fileFormats[0]
        };
        return camera.takePicture(poptions, function(blob) {
          return navigator.getDeviceStorage('pictures').addNamed(blob, filename);
        });
      });
    });
  }

  return RobotPhotographingState;

})(RobotState);

RobotFindingState = (function(_super) {
  __extends(RobotFindingState, _super);

  function RobotFindingState(name, goals, location, perimeter, compass_variance) {
    this.location = location;
    this.perimeter = perimeter != null ? perimeter : 1;
    this.compass_variance = compass_variance != null ? compass_variance : 20;
    RobotFindingState.__super__.constructor.call(this, name, goals, function(currentState, event) {
      var d, newState;
      if (event.location) {
        this.current_location = event.location.coords;
        if (this.distance(this.current_location, this.location) < this.perimeter) {
          return this.parent;
        }
      }
      if (event.orientation) {
        this.compass_reading = event.orientation.alpha;
      }
      newState = this;
      d = this.correction();
      if (d > this.compass_variance) {
        newState = this.left_turning;
      }
      if (d < -this.compass_variance) {
        newState = this.right_turning;
      }
      if (currentState === newState) {
        return null;
      }
      return newState;
    }, function(oldState, currentState) {
      if (currentState !== this) {
        return;
      }
      return drive(1);
    });
    this.left_turning = this.addChild(new RobotState("" + this.name + ": left-turn", ["left-turn"], function(currentState, event) {
      return null;
    }, function(oldState, currentState) {
      if (currentState !== this) {
        return;
      }
      return drive(5);
    }));
    this.right_turning = this.addChild(new RobotState("" + this.name + ": right-turn", ["right-turn"], function(currentState, event) {
      return null;
    }, function(oldState, currentState) {
      if (currentState !== this) {
        return;
      }
      return drive(6);
    }));
  }

  RobotFindingState.prototype.toRadians = function(r) {
    return r * Math.PI / 180.0;
  };

  RobotFindingState.prototype.toDegrees = function(d) {
    return 180.0 * d / Math.PI;
  };

  RobotFindingState.prototype.correction = function() {
    var bearing;
    if (!this.compass_reading) {
      return 0;
    }
    if (!this.current_location) {
      return 0;
    }
    bearing = this.bearing(this.location, this.current_location);
    return ((360 + this.compass_reading - bearing) % 360) - 180;
  };

  RobotFindingState.prototype.bearing = function(a, b) {
    var lat1, lat2, lon1, lon2, x, y;
    lat1 = this.toRadians(a.latitude);
    lat2 = this.toRadians(b.latitude);
    lon1 = this.toRadians(a.longitude);
    lon2 = this.toRadians(b.longitude);
    y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return this.toDegrees(Math.atan2(y, x));
  };

  RobotFindingState.prototype.distance = function(a, b, r) {
    var d, lat1, lat2, lon1, lon2, n;
    if (r == null) {
      r = 6371000;
    }
    lat1 = this.toRadians(a.latitude);
    lat2 = this.toRadians(b.latitude);
    lon1 = this.toRadians(a.longitude);
    lon2 = this.toRadians(b.longitude);
    n = (Math.pow(Math.sin((lat2 - lat1) / 2), 2)) + Math.cos(lat1) * Math.cos(lat2) * (Math.pow(Math.sin((lon2 - lon1) / 2), 2));
    d = 2 * r * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n));
    return d;
  };

  return RobotFindingState;

})(RobotState);

RobotBatteryLimit = (function(_super) {
  __extends(RobotBatteryLimit, _super);

  function RobotBatteryLimit(name, goals, threshold) {
    this.threshold = threshold;
    RobotBatteryLimit.__super__.constructor.call(this, name, goals, function(currentState, event) {
      if (event.battery && event.battery < this.threshold) {
        return this.parent;
      }
      return null;
    });
  }

  return RobotBatteryLimit;

})(RobotState);

RobotTestMachine = (function(_super) {
  __extends(RobotTestMachine, _super);

  function RobotTestMachine() {
    RobotTestMachine.__super__.constructor.call(this, "waiting", ["stop"], function(currentState, event) {
      if (event.button) {
        return currentState.findHandler(event.button);
      }
      return null;
    }, function(oldState, currentState) {
      if (currentState !== this) {
        return;
      }
      return drive(0);
    });
    this.limited = this.addChild(new RobotTimeLimit("limiting", ["go"], 180));
    this.sequence = this.limited.addChild(new RobotSequentialState("stepping", ["stepping"]));
    this.sequence.addForward = false;
    this.addChild(new RobotFlaggingState("storing", ["store"], this.sequence));
    this.addChild(new RobotState("resetting", ["reset"], function(currentState, event) {
      return new RobotTestMachine();
    }));
  }

  return RobotTestMachine;

})(RobotState);

finderBotState = new RobotTestMachine();

announceBotEvent = function(event) {
  var newState;
  newState = finderBotState.processEvent(finderBotState, event);
  if (newState) {
    finderBotState = newState;
    return console.log(finderBotState.name);
  }
};

$.ajaxSetup({
  xhr: function() {
    return new window.XMLHttpRequest({
      mozSystem: true
    });
  }
});

driveLittleCar = function(code, speed) {
  if (speed == null) {
    speed = 8;
  }
  return $.ajax('http://localhost:8080/' + code + speed.toString(16), {
    type: 'GET',
    dataType: 'html',
    success: function(data) {
      return announceBotEvent({
        battery: data
      });
    }
  });
};

drive2command = function(code) {
  var newCode;
  newCode = "05893476"[code - 1];
  if (newCode) {
    return "$" + newCode + "9476$?";
  }
  return "$?";
};

carSocket = null;

car2connect = function() {
  carSocket = navigator.mozTCPSocket.open("192.168.2.3", 9000);
  carSocket.ondata = function(event) {
    var level;
    level = (parseInt(event.data.slice(2), 16) - 2655) * 0.21;
    if (level >= 0) {
      announceBotEvent({
        battery: level
      });
    }
    return console.log("battery at " + level);
  };
  return carSocket;
};

driveBigCar = function(code) {
  var command;
  command = drive2command(code);
  if (carSocket && carSocket.readyState === "open") {
    return carSocket.send(command);
  } else {
    car2connect();
    return carSocket.onopen = function() {
      return carSocket.send(command);
    };
  }
};

BigCar = (function() {
  function BigCar(pace, address, port) {
    this.pace = pace != null ? pace : 250;
    this.address = address != null ? address : "192.168.2.3";
    this.port = port != null ? port : 9000;
    this.connecting = false;
    this.connectSocket();
    this.commands = [];
    window.setInterval(((function(_this) {
      return function() {
        return _this.nextCode();
      };
    })(this)), this.pace);
  }

  BigCar.prototype.connectSocket = function() {
    if (this.connecting) {
      return;
    }
    this.connecting = true;
    this.socket = navigator.mozTCPSocket.open(this.address, this.port);
    this.socket.onopen = (function(_this) {
      return function() {
        return _this.connecting = false;
      };
    })(this);
    return this.socket.ondata = function(event) {
      var level;
      level = (parseInt(event.data.slice(2), 16) - 2655) / 4;
      announceBotEvent({
        battery: level
      });
      return console.log("battery at " + level);
    };
  };

  BigCar.prototype.drive = function(code) {
    return this.commands.push(code);
  };

  BigCar.prototype.code2command = function(code) {
    var newCode;
    newCode = "05893476"[code - 1];
    if (newCode) {
      return "$" + newCode + "9476$?";
    }
    return "$?";
  };

  BigCar.prototype.nextCode = function() {
    if (this.socket.readyState === "open") {
      if (this.commands.length > 0) {
        return this.socket.send(this.code2command(this.commands.shift()));
      }
    } else {
      return this.connectSocket();
    }
  };

  return BigCar;

})();

car = new BigCar();

drive = function(code) {
  return car.drive(code);
};

$(function() {
  var action, crash_id, interval_id, minInterval, motionTimeStamp, motionVector, orientation_id, watch_id, _fn, _i, _len, _ref;
  _ref = ["go", "stop", "store", "reset"];
  _fn = function(action) {
    return $("#" + action + "-button").click(function() {
      return announceBotEvent({
        button: action
      });
    });
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    action = _ref[_i];
    _fn(action);
  }
  motionTimeStamp = 0;
  motionVector = {
    x: 0,
    y: 0,
    z: 0
  };
  minInterval = 1000000;
  crash_id = window.addEventListener('devicemotion', function(event) {
    var a, interval, m, v;
    a = event.accelerationIncludingGravity;
    m = motionVector;
    v = Math.pow(a.x - m.x, 2) + Math.pow(a.y - m.y, 2) + Math.pow(a.z - m.z, 2);
    interval = event.timeStamp - motionTimeStamp;
    motionVector = {
      x: a.x,
      y: a.y,
      z: a.z
    };
    if (v > 25 && interval > minInterval) {
      console.log("motion event magnitude " + v + " after " + (interval / minInterval) + " intervals");
      announceBotEvent({
        crash: event
      });
      return motionTimeStamp = event.timeStamp;
    }
  });
  orientation_id = window.addEventListener('deviceorientation', function(event) {
    var e;
    e = event;
    return announceBotEvent({
      orientation: event
    });
  }, true);
  watch_id = navigator.geolocation.watchPosition(function(position) {
    return announceBotEvent({
      location: position
    });
  });
  return interval_id = window.setInterval((function() {
    return announceBotEvent({
      timer: 1
    });
  }), 1000);
});

console.log(finderBotState.name);
