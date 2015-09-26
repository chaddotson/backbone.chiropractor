
// starter, initially based on backbone.

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
            (typeof global == 'object' && global.global == global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch(e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
      root.Backbone = root.Backbone || {};
      root.Backbone.Chiropractor = factory(root, {}, root.Backbone, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(function(root, Chiropractor, Backbone, _, $) {

    var BackboneOrphanDetector =  (function() {
        var instance;


        var _trackers = {};
        var _source;

        function _start() {

            _source = _.extend({}, Backbone.Events);
            Events = Backbone.Events = {
                on: function () {
                    console.log("in on");
                    _source.on.apply(this, arguments);
                },
                off: function () {
                    console.log("in off");
                    _source.off.apply(this, arguments);
                },
                trigger: function() {
                    console.log("in trigger",_self);
                    _source.trigger.apply(this, arguments);
                    _self.trigger("trigger", arguments);
                },
                listenTo: function (obj, name, callback) {
                    var self = this;
                    var stack = Error().stack;
                    _source.listenTo.apply(this, arguments);
                    console.log("in listenTo", arguments);
                    console.log("this", this._listenId);
                    console.log("name", name);

                    //console.log(this._listenId, name, Error().stack);

                    if(_.isObject(name)) {
                        //console.log("keys", _.keys(name));
                        _.each(_.keys(name), function (event) {
                            //console.log("tracker", self);
                            _addTracker(_self, obj, event, stack);
                        });
                    } else {
                        var eventSplitter = /\s+/;

                        var names = name.split(eventSplitter);

                        for(var i = 0; i < names.length; i++) {
                            _addTracker(self, obj, names[i], stack)
                        }
                    }
                },
                once: function () {
                    console.log("in once");
                    source.once.apply(this, arguments);
                },

                listenToOnce: function () {
                    console.log("in listenToOnce");
                    _source.listenToOnce.apply(this, arguments);
                },

                stopListening: function () {
                    console.log("in stopListening", this._listenId);
                    _removeTracker(this._listenId);
                    _source.stopListening.apply(this, arguments);
                }
            };
        }
    //
        function _stop() {
            Events = Backbone.Events = _source;
        }



        function _dumpListeners() {
            console.log("Dumping listeners");
            console.log(_trackers);
            //console.log(Object.keys(_trackers).length);

            for(var listenerId in _trackers) {
                for(var listeneeId in _trackers[listenerId]) {
                    for(var event in _trackers[listenerId][listeneeId]) {
                        console.log(listenerId, listeneeId, event, _trackers[listenerId][listeneeId][event].stack);
                    }
                }
            }
        }

        function _addTracker(listener, listenee, event, stackOnCreation) {
            console.log("listener", listener._listenId, "listenee", listenee._listenId);

            var listenerId = listener._listenId;
            var listeneeId = listenee._listenId;

            _trackers[listenerId] = _trackers[listenerId] || {};
            _trackers[listenerId][listeneeId] = _trackers[listenerId][listeneeId] || {};

            _trackers[listenerId][listeneeId][event] = {
                listener: listener,
                listenee: listenee,
                event: event,
                stack: stackOnCreation
            };

            console.log("trackers", _trackers);


        }

        function _removeTracker(id) {

            delete _trackers[id];
        }

        function init() {
            return {
                id: 1,
                start: _start,
                stop: _stop,
                dumpListeners: _dumpListeners,
            };
        }

        return {
            getInstance: function () {
                if(!instance) {
                    instance = init();
                }
                return instance;
            }
        }

    })();

    _.extend(BackboneOrphanDetector.getInstance(), Backbone.Events);

    console.log("Here:", BackboneOrphanDetector.getInstance());

    return BackboneOrphanDetector.getInstance();

}));


/*









// it should be able to cleanly replace backbone.events
// it should be able to cleanly reenable the regular backbone.events
// it should be able to listen to all events on an object
// it should be able to listen to specific events on an object
// it should be able to stop listening to all events on an object.
// it should be able to stop listening to specific events.



var BackboneOrphanDetector = (function() {
    var instance;
    
    var _trackers = {};
  	var _source;

    function _start() {
        _source = _.extend({}, Backbone.Events);
        Events = Backbone.Events = {
            on: function () {
    			console.log("in on");
        		_source.on.apply(this, arguments);
    		},
            off: function () {
                console.log("in off");
		        _source.off.apply(this, arguments);
            },
            trigger: function() {
                console.log("in trigger");
                _source.trigger.apply(this, arguments);
            },
            listenTo: function (obj, name, callback) {
                _source.listenTo.apply(this, arguments);
                console.log("in listenTo", arguments);
                console.log("this", this);
                console.log("name", name);
                var self = this;
                //console.log(this._listenId, name, Error().stack);

                if(_.isObject(name)) {
                    console.log("keys", _.keys(name));
                    _.each(_.keys(name), function (event) {
                        console.log("tracker", self);
                        _addTracker(self, obj, event, Error().stack);
                    });
                } else {
                    // todo: gotta split name.
                    console.log("Not implemented");
                    //_addTracker(this, obj, name, Error().stack);
                }
            },
            once: function () {
                console.log("in once");
                source.once.apply(this, arguments);
            },

            listenToOnce: function () {
                console.log("in listenToOnce");
                _source.listenToOnce.apply(this, arguments);
            },
            
            stopListening: function () {
                console.log("in stopListening", this._listenId);
                _removeTracker(this._listenId);
                _source.stopListening(this, arguments);
            }
        };
    };
    
    function _stop() {
        Events = Backbone.Events = _source;
    };    
    
    function _dumpListeners() {
        console.log("Dumping listeners");
//        console.log(_trackers);
        //console.log(Object.keys(_trackers).length);

        for(var listenerId in _trackers) {
            for(var listeneeId in _trackers[listenerId]) {
                for(var event in _trackers[listenerId][listeneeId]) {
                    console.log(listenerId, listeneeId, event, _trackers[listenerId][listeneeId][event].stack);
                }
            }
        }
    }
        
    function _addTracker(listener, listenee, event, stackOnCreation) {
        console.log("listener", listener._listenId, "listenee", listenee._listenId);

        var listenerId = listener._listenId;
        var listeneeId = listenee._listenId;
        
        _trackers[listenerId] = _trackers[listenerId] || {};
        _trackers[listenerId][listeneeId] = _trackers[listenerId][listeneeId] || {};
        
        _trackers[listenerId][listeneeId][event] = {
            listener: listener,
            listenee: listenee,
            event: event,
            stack: stackOnCreation
        };

        console.log("trackers", _trackers);


    }
        
    function _removeTracker(id) {
    	
        delete _trackers[id];
    }

    function init() {
        return {
            start: _start,
			stop: _stop,
            dumpListeners: _dumpListeners,
        };   
    };
    
    return {
        getInstance: function () {
            if(!instance) {
                instance = init();
            }
            return instance;
        }
    }
    
})();



var orphanDetector = BackboneOrphanDetector.getInstance();

orphanDetector.start();

var MyClass = function () {
	this.say = function(what) {
        console.log(what);
        this.trigger("MyClass:said", what);
    };
}

var MyClass2 = function () {
	this.say = function(what) {
        console.log(what);
        this.trigger("MyClass2:said", what);
    };
}

_.extend(MyClass.prototype, Backbone.Events);
_.extend(MyClass2.prototype, Backbone.Events);



var x = new MyClass();

function tester() {
    var y = new MyClass2();

    y.listenToOnce(x, "MyClass:said", function(what) {
        //console.log("you said " + what);
        y.say("you said: " + what);
        orphanDetector.stop();
    });
}

tester();

orphanDetector.dumpListeners();
//x.say("test");
setTimeout(function () {
    x.say("test");
    orphanDetector.dumpListeners();
}, 5000);

    */