var assert = require('assert');
var Promise = require('es6-promise').Promise;
var proxyquire = require('proxyquire').noCallThru();


describe('messages', function() {
    var MockNavigator = function() {

    };

    it('installs correctly', function(done) {
        var messages = proxyquire('../js/messages', {});
        var MockWindow = function() {
            this.addEventListener = function(eventname, func) {
                assert.equal(eventname, 'message');
                done();
            };
        };
        messages.install(new MockWindow(), new MockNavigator());
    });

    it('sends queued messages when loaded', function(done) {
        var messages = proxyquire('../js/messages', {});
        var MockWindow = function() {
            this.addEventListener = function(eventname, func) {
                this._event_callback = func;
            };
        };
        var window = new MockWindow();
        window.document = {
            querySelector: function() {
                return {
                    contentWindow: {
                        postMessage: function(msg, origin) {
                            assert.deepEqual(msg, {foo: 'bar'});
                            assert.equal(origin, process.env.MKT_URL);
                            done();
                        }
                    }
                };
            }
        };
        messages.install(window, new MockNavigator());
        messages.queueMessage({foo: 'bar'});
        window._event_callback({data: 'loaded', origin: process.env.MKT_URL});
    });

    it('sends messages directly instead of queuing once loaded', function(done) {
        var messages = proxyquire('../js/messages', {});
        var MockWindow = function() {
            this.addEventListener = function(eventname, func) {
                this._event_callback = func;
            };
        };
        var window = new MockWindow();
        window.document = {
            querySelector: function() {
                return {
                    contentWindow: {
                        postMessage: function(msg, origin) {
                            assert.deepEqual(msg, {foo: 'bar'});
                            assert.equal(origin, process.env.MKT_URL);
                            done();
                        }
                    }
                };
            }
        };
        messages.install(window, new MockNavigator());
        window._event_callback({data: 'loaded', origin: process.env.MKT_URL});
        messages.queueMessage({foo: 'bar'});
    });
});
