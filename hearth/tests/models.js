(function() {
var a = require('assert');
var _ = require('underscore');
var assert = a.assert;
var eq_ = a.eq_;
var eeq_ = a.eeq_;
var mock = a.mock;

var models = require('models');

test('model cast/lookup/purge', function(done) {
    mock(
        'models', {},
        function(models) {
            var d1 = models('dummy');
            var d2 = models('dummy2');

            d1.cast({
                id: 1,
                val: 'foo'
            });
            d2.cast({
                id: 1,
                val: 'bar'
            });
            d2.cast({
                id: 2,
                val: 'abc'
            });

            eq_(d1.lookup(1).val, 'foo');
            eq_(d2.lookup(1).val, 'bar');
            eq_(d2.lookup(2).val, 'abc');

            d1.purge()
            d2.purge()

            eeq_(d1.lookup(1), undefined);
            eeq_(d2.lookup(1), undefined);
            eeq_(d2.lookup(2), undefined);

            done();
        }
    );
});

test('model get hit', function(done) {
    mock(
        'models',
        {requests: {get: function(x) {return 'surprise! ' + x;}}},
        function(models) {
            var d1 = models('dummy');

            d1.cast({
                id: 1,
                val: 'foo'
            });

            var promise = d1.get('zip', 1);
            promise.done(function(data) {
                eq_(data.val, 'foo');
                eeq_(promise.__cached, true);
                done();
            });
        }
    );
});

test('model get miss', function(done) {
    mock(
        'models',
        {requests: {get: function(x) {return 'surprise! ' + x;}}},
        function(models) {
            var d1 = models('dummy');

            eq_(d1.get('zip', 1), 'surprise! zip');

            done();
        }
    );
});

test('model get getter', function(done) {
    mock(
        'models',
        {requests: {get: function(x) {return "not the droids you're looking for";}}},
        function(models) {
            var d1 = models('dummy');

            eq_(d1.get('zip', 1, function(x) {
                return 'hooray! ' + x;
            }), 'hooray! zip');

            done();
        }
    );
});

test('model lookup by', function(done) {
    mock(
        'models', {},
        function(models) {
            var d1 = models('dummy');

            d1.cast({
                id: 'zip',
                val: 'foo'
            });

            d1.cast({
                id: 'foo',
                val: 'bar'
            });

            var value = d1.lookup('bar', 'val');
            eq_(value.id, 'foo');
            eq_(value.val, 'bar');

            done();
        }
    );
});

test('model lookup miss', function(done) {
    mock(
        'models', {},
        function(models) {
            var d1 = models('dummy');

            // Just a decoy
            d1.cast({
                id: 'zip',
                val: 'foo'
            });

            eeq_(d1.lookup('not an id'), undefined);

            done();
        }
    );
});

test('model cast list', function(done) {
    mock(
        'models', {},
        function(models) {
            var d1 = models('dummy');

            // Just a decoy
            d1.cast([
                {id: 'zip', val: 1},
                {id: 'abc', val: 2},
                {id: 'def', val: 3}
            ]);

            eq_(d1.lookup('abc').val, 2);

            done();
        }
    );
});

})();
