

describe("Backbone Chiropractor startup and shutdown", function () {

    it("should wrap the original Backbone.Events on start.", function () {
        var wrapped = jasmine.createSpyObj('Backbone.Events', ['listenTo', 'listenToOnce', 'trigger', 'stopListening']);
        Backbone.Events =  wrapped;
        Backbone.Chiropractor.start();
        expect(Backbone.Events).not.toEqual(wrapped);
        Backbone.Chiropractor.stop();
    });

    it("should restore the original Backbone.Events on stop.", function () {
        var wrapped = jasmine.createSpyObj('Backbone.Events', ['listenTo', 'listenToOnce', 'trigger', 'stopListening']);
        Backbone.Events =  wrapped;
        Backbone.Chiropractor.start();
        Backbone.Chiropractor.stop();
        expect(Backbone.Events).toEqual(wrapped);
    });
});


describe("Backbone Chiropractor", function () {
    var wrapped;

    beforeEach(function () {
        wrapped = jasmine.createSpyObj('Backbone.Events', ['listenTo', 'listenToOnce', 'trigger', 'stopListening']);
        Backbone.Events =  wrapped;
        Backbone.Chiropractor.start();

    });

    afterEach(function () {
        Backbone.Chiropractor.stop();
    });


    it("should add itself to the backbone namespace.", function() {
        expect(Backbone.Chiropractor).toBeDefined();
    });

    it("it should wrap Backbone.Events trigger.", function () {

        var listener = _.extend({}, Backbone.Events);
            triggerer = _.extend({}, Backbone.Events);

        triggerer.trigger("test", "payload");

        expect(wrapped.trigger).toHaveBeenCalledWith("test", "payload");

    });

    it("it should wrap Backbone.Events listenTo.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.listenTo(listenee, "test", callback);

        expect(wrapped.listenTo).toHaveBeenCalledWith(listenee, "test", callback);

    });

    it("it should wrap Backbone.Events listenToOnce.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);


        var callback = jasmine.createSpy('callback');

        listener.listenToOnce(listenee, "test", callback);

        expect(wrapped.listenToOnce).toHaveBeenCalledWith(listenee, "test", callback);

    });

    it("it should wrap Backbone.Events stopListening with no arguments.", function () {

        var listener = _.extend({}, Backbone.Events);

        listener.stopListening();

        expect(wrapped.stopListening).toHaveBeenCalledWith();

    });


    it("it should wrap Backbone.Events stopListening with arguments.", function () {

        var listener = _.extend({}, Backbone.Events);
            listenee = _.extend({}, Backbone.Events);

        var callback = jasmine.createSpy('callback');

        listener.stopListening(listenee, "test", callback);

        expect(wrapped.stopListening).toHaveBeenCalledWith(listenee, "test", callback);

    });


});