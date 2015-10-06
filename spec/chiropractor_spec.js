

function createBackboneEventsSpy() {
    return jasmine.createSpyObj('Backbone.Events', ['listenTo', 'listenToOnce', 'trigger', 'stopListening', 'on', 'off', 'once']);
}

describe("Backbone Chiropractor startup and shutdown", function () {

    it("should wrap the original Backbone.Events on start.", function () {
        var wrapped = createBackboneEventsSpy();
        Backbone.Events =  wrapped;
        Backbone.Chiropractor.start();
        expect(Backbone.Events).not.toEqual(wrapped);
        Backbone.Chiropractor.stop();
    });

    it("should restore the original Backbone.Events on stop.", function () {
        var wrapped = createBackboneEventsSpy();
        Backbone.Events =  wrapped;
        Backbone.Chiropractor.start();
        Backbone.Chiropractor.stop();
        expect(Backbone.Events).toEqual(wrapped);
    });
});


describe("Backbone Chiropractor Events", function () {
    var wrapped;

    beforeEach(function () {
        wrapped = jasmine.createSpyObj('Backbone.Events', ['listenTo', 'listenToOnce', 'trigger', 'stopListening', 'on', 'off', 'once']);
        Backbone.Events =  wrapped;
        Backbone.Chiropractor.start();

    });

    afterEach(function () {
        Backbone.Chiropractor.stop();
    });


    it("should add itself to the backbone namespace.", function() {
        expect(Backbone.Chiropractor).toBeDefined();
    });

    it("should wrap Backbone.Events trigger.", function () {

        var listener = _.extend({}, Backbone.Events);
            triggerer = _.extend({}, Backbone.Events);

        triggerer.trigger("test", "payload");

        expect(wrapped.trigger).toHaveBeenCalledWith("test", "payload");

    });

    it("should wrap Backbone.Events listenTo.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.listenTo(listenee, "test", callback);

        expect(wrapped.listenTo).toHaveBeenCalledWith(listenee, "test", callback);

    });

    it("should wrap Backbone.Events on.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.on(listenee, "test", callback);

        expect(wrapped.on).toHaveBeenCalledWith(listenee, "test", callback);

    });

    it("should wrap Backbone.Events off.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.on(listenee, "test", callback);
        listener.off( "test", callback);

        expect(wrapped.off).toHaveBeenCalledWith("test", callback);

    });


    it("should wrap Backbone.Events listenTo with several events.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.listenTo(listenee, "test test1", callback);

        expect(wrapped.listenTo).toHaveBeenCalledWith(listenee, "test test1", callback);

    });

    // test can track events with callback.
    // can stop listening to events given a callback.

    it("should wrap Backbone.Events on with several events.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.on(listenee, "test test1", callback);

        expect(wrapped.on).toHaveBeenCalledWith(listenee, "test test1", callback);

    });


    it("should wrap Backbone.Events listenToOnce.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.listenToOnce(listenee, "test", callback);

        expect(wrapped.listenToOnce).toHaveBeenCalledWith(listenee, "test", callback);

    });

    it("should wrap Backbone.Events stopListening with no arguments.", function () {

        var listener = _.extend({}, Backbone.Events);

        listener.stopListening();

        expect(wrapped.stopListening).toHaveBeenCalledWith();

    });


    it("should wrap Backbone.Events stopListening with arguments.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = jasmine.createSpy('callback');

        listener.stopListening(listenee, "test", callback);

        expect(wrapped.stopListening).toHaveBeenCalledWith(listenee, "test", callback);

    });


    it("should fire a trigger event if an object's trigger method is called.", function () {

        var triggerer = _.extend({}, Backbone.Events);

        triggerer.trigger("test", "payload");

        expect(wrapped.trigger).toHaveBeenCalledWith("test", "payload");

    });

});


describe("Backbone Chiropractor", function () {

    beforeEach(function () {
        Backbone.Chiropractor.start();
    });

    afterEach(function () {
        Backbone.Chiropractor.stop();
    });


    it("should not return any listeners for an object/event with no listeners.", function () {
        var listenee = _.extend({}, Backbone.Events);

        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(0);
    });


    it("should be able to track listeners for a single event using listenTo.", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = jasmine.createSpy('callback');

        listener.listenTo(listenee, "test", callback);

        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(1);

        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test",
            callback: callback
        }));

        listener.stopListening();
    });

    it("should be able to track  multiple callbacks on a single event using using listenTo.", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = jasmine.createSpy('callback');
        var callback2 = jasmine.createSpy('callback');

        listener.listenTo(listenee, "test", callback);
        listener.listenTo(listenee, "test", callback2);

        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(2);

        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test",
            callback: callback
        }));

        expect(listeners[1]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test",
            callback: callback2
        }));

        listener.stopListening();
    });

    it("should be able to track listeners for a multiple events using listenTo.", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.listenTo(listenee, "test test1", callback);

        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(2);
        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test"
        }));

        expect(listeners[1]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test1"
        }));

        listener.stopListening();
    });


    it("should remove trackers on stopListening().", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        listener.listenTo(listener, "test", function () {});

        listener.stopListening();


        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(0);

    });

    it("should remove trackers on stopListening(listenee).", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        listener.listenTo(listenee, "test test2", function () {});

        listener.stopListening(listenee);


        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(0);

    });


    it("should remove trackers on stopListening(listenee, 'event').", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = function () {};
        listener.listenTo(listenee, "test test2", callback);

        listener.stopListening(listenee, "test");


        var listeners = Backbone.Chiropractor.getListeners(listenee);


        expect(listeners.length).toEqual(1);

        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test2",
            callback: callback
        }));


    });

    it("should remove trackers on stopListening(undefined, 'event').", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = function () {};
        listener.listenTo(listenee, "test test2", callback);

        listener.stopListening(undefined, "test");


        var listeners = Backbone.Chiropractor.getListeners(listenee);


        expect(listeners.length).toEqual(1);

        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test2",
            callback: callback
        }));


    });



    it("should remove trackers on stopListening(listenee, 'event', callback).", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = function () {};
        var callback2 = function () {};

        listener.listenTo(listenee, "test", callback);
        listener.listenTo(listenee, "test", callback2);

        listener.stopListening(listenee, "test", callback2);

        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(1);

        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test",
            callback: callback
        }));


    });


    it("should remove trackers on stopListening(undefined, undefined, callback).", function () {
        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = function () {};
        var callback2 = function () {};

        listener.listenTo(listenee, "test", callback);
        listener.listenTo(listenee, "test", callback2);

        listener.stopListening(undefined, undefined, callback2);

        var listeners = Backbone.Chiropractor.getListeners(listenee);

        expect(listeners.length).toEqual(1);

        expect(listeners[0]).toEqual(jasmine.objectContaining({
            listener: listener,
            listenee: listenee,
            event: "test",
            callback: callback
        }));
    });


    // on/listenTo should track multiple events.



});
