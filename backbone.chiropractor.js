
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

        var _trackingRecords = [];
        var _source;

        function _start() {

            var _self = this;

            _source = _.extend({}, Backbone.Events);

            Events = Backbone.Events = {
                on: function (name, callback, context) {
                    _source.on.apply(this, arguments);

                    var self = this;
                    var stack = Error().stack;

                    if(_.isObject(name)) {
                        _.each(_.keys(name), function (event) {
                            _addTracker(context, self, event, callback, stack);
                        });
                    } else {
                        var eventSplitter = /\s+/;

                        var names = name.split(eventSplitter);

                        for(var i = 0; i < names.length; i++) {
                            _addTracker(context,  self, names[i], callback, stack)
                        }
                    }


                },
                off: function (name, callback, context) {
                    _source.off.apply(this, arguments);
                    var self = this;

                    if(_.isObject(name)) {
                        _.each(_.keys(name), function (event) {
                            _removeTracker(context, self, event, callback);
                        });
                    } else if(name) {
                        var eventSplitter = /\s+/;

                        var names = name.split(eventSplitter);

                        for(var i = 0; i < names.length; i++) {
                            _removeTracker(context, self, names[i], callback)
                        }
                    } else {
                        _removeTracker(self, listenee)
                    }


                },
                trigger: function() {
                    _source.trigger.apply(this, arguments);
                    _self.trigger("trigger", arguments);
                },
                listenTo: function (obj, name, callback) {
                    var self = this;
                    var stack = Error().stack;
                    _source.listenTo.apply(this, arguments);

                    if(_.isObject(name)) {
                        _.each(_.keys(name), function (event) {
                            _addTracker(_self, obj, event, callback, stack);
                        });
                    } else {
                        var eventSplitter = /\s+/;

                        var names = name.split(eventSplitter);

                        for(var i = 0; i < names.length; i++) {
                            _addTracker(self, obj, names[i], callback, stack)
                        }
                    }
                },
                once: function () {
                    //console.log("in once");
                    source.once.apply(this, arguments);
                },

                listenToOnce: function () {
                    //console.log("in listenToOnce");
                    _source.listenToOnce.apply(this, arguments);
                },

                stopListening: function (obj, name, callback) {
                    //console.log("in stopListening", this._listenId);
                    var self = this;

                    _source.stopListening.apply(this, arguments);

                    if(_.isObject(name)) {
                        _.each(_.keys(name), function (event) {
                            _removeTracker(self, obj, event, callback);
                        });
                    } else if(name) {
                        var eventSplitter = /\s+/;

                        var names = name.split(eventSplitter);

                        for(var i = 0; i < names.length; i++) {
                            _removeTracker(self, obj, names[i], callback)
                        }
                    } else {
                        _removeTracker(self, listenee, name, callback)
                    }

                }

            };

            _.extend(Backbone.Model.prototype, Events);
        }

        function _stop() {
            Events = Backbone.Events = _source;
            _.extend(Backbone.Model.prototype, Events);

            _trackingRecords = [];
        }

        function _getListeners(obj) {
            return _trackingRecords.filter(function(element) {
                return element.listenee == obj;
            });
        }

        function _dumpListeners() {
            console.log("Listeners");
            console.log(_trackingRecords);
        }

        function _addTracker(listener, listenee, event, callback, stackOnCreation) {
            console.log("listener", listener, "listenee", listenee);

            _trackingRecords.push({
                listener: listener,
                listenee: listenee,
                event: event,
                callback: callback,
                stack: stackOnCreation
            });
        }

        function _removeTracker(listener, listenee, event, callback) {
            _trackingRecords = _.reject(_trackingRecords, function(element) {

                var stat = true;


                if(listener) {
                    console.log("listener", element.listener === listener);
                    stat = stat && element.listener === listener;
                }

                if(stat && listenee) {
                    console.log("listenee", element.listenee === listenee);
                    stat = stat && element.listenee === listenee;
                }

                if(stat && event) {
                    console.log("event", element.event === event);
                    stat = stat && element.event === event;
                }

                if(stat && callback) {
                    console.log("event", element.callback === callback);
                    stat = stat && element.callback === callback;
                }

                console.log("stat =", stat);

                return stat;
            });
        }

        function init() {
            return {
                id: 1,
                start: _start,
                stop: _stop,
                dumpListeners: _dumpListeners,
                getListeners: _getListeners
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

    return BackboneOrphanDetector.getInstance();

}));