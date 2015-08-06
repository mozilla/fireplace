var assert = require('assert');
var Promise = require('es6-promise').Promise;
var proxyquire = require('proxyquire').noCallThru();


describe('activities', function() {
    function MockNavigator() {
        this.mozSetMessageHandler = function(name, func) {
            if (name == 'activity' && typeof func == 'function') {
                this._activity_callback = func;
            }
        };
        this.getFeature = function(name) {
            return new Promise(function(resolve, reject) {
                resolve('fakegetfeature_' + name);
            });
        };
    }

    it('installs correctly', function(done) {
        function MockNavigator() {
            this.mozSetMessageHandler = function(name, func) {
                assert.equal(name, 'activity');
                assert(typeof func === 'function');
                done();
            };
        }
        var activities = proxyquire('../js/activities', {});
        var navigator = new MockNavigator();
        activities.install(navigator);
    });

    it('queues a message for each incoming activity request', function(done) {
        var stubs = {
            './messages': {
                queueMessage: function(msg) {
                    assert.equal(msg.name, 'foo');
                    assert(msg.data);
                    done();
                }
            },
        };
        var activities = proxyquire('../js/activities', stubs);
        var navigator = new MockNavigator();
        activities.install(navigator);
        navigator._activity_callback({source: {name: 'foo'}});
    });

    it('queues a message for each incoming activity request w/ data', function(done) {
        var stubs = {
            './messages': {
                queueMessage: function(msg) {
                    assert.equal(msg.name, 'foo');
                    assert.deepEqual(msg.data, {'bar': 'blah'});
                    done();
                }
            },
        };
        var activities = proxyquire('../js/activities', stubs);
        var navigator = new MockNavigator();
        activities.install(navigator);
        navigator._activity_callback({source: {name: 'foo', data: {'bar': 'blah'}}});
    });

    it('queues a message w/ acl_version for marketplace-openmobile-acl activity', function(done) {
        var stubs = {
            './messages': {
                queueMessage: function(msg) {
                    assert.equal(msg.name, 'marketplace-openmobile-acl');
                    assert.deepEqual(msg.data, {'acl_version': 'fakegetfeature_acl.version'});
                    done();
                },
                activitiesInProgress: {},
            },
        };
        var activities = proxyquire('../js/activities', stubs);
        var navigator = new MockNavigator();
        activities.install(navigator);
        navigator._activity_callback({source: {name: 'marketplace-openmobile-acl'}});
    });
});
