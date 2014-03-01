(function() {
var a = require('assert');
var _ = require('underscore');
var assert = a.assert;
var eq_ = a.eq_;
var eeq_ = a.eeq_;
var mock = a.mock;

var models = require('models');

test('model invalid type', function(done, fail) {
    try {
        var d1 = models('does not exist trololo');
        fail();
    } catch(e) {
        done();
    }
});

test('model cast/lookup/purge', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id', 'dummy2': 'id'}}},
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

            d1.purge();
            d2.purge();

            eeq_(d1.lookup(1), undefined);
            eeq_(d2.lookup(1), undefined);
            eeq_(d2.lookup(2), undefined);

            done();
        }, fail
    );
});

test('model cast/lookup/delete', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
        function(models) {
            var d1 = models('dummy');
            d1.cast({
                id: 1,
                val: 'foo'
            });

            eq_(d1.lookup(1).val, 'foo');
            d1.del(2);
            eq_(d1.lookup(1).val, 'foo');
            d1.del(1);
            eeq_(d1.lookup(1), undefined);

            done();
        }, fail
    );
});

test('model cast/lookup/delete val', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
        function(models) {
            var d1 = models('dummy');
            d1.cast({
                id: 1,
                val: 'foo'
            });

            eq_(d1.lookup(1).val, 'foo');
            d1.del('bar', 'val');
            eq_(d1.lookup(1).val, 'foo');
            d1.del('foo', 'val');
            eeq_(d1.lookup(1), undefined);

            done();
        }, fail
    );
});

test('model cast/uncast', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
        function(models) {
            var d1 = models('dummy');

            var obj1 = {
                id: 1,
                val: 'foo'
            };
            var obj2 = {
                id: 1,
                val: 'bar'
            };

            d1.cast(obj1);
            eq_(d1.uncast(obj2).val, 'foo');

            done();
        }, fail
    );
});

test('model cast/uncast lists', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
        function(models) {
            var d1 = models('dummy');

            var obj1 = {
                id: 1,
                val: 'foo'
            };
            var obj2 = {
                id: 2,
                val: 'bar'
            };
            var obj3 = {
                id: 1,
                val: 'zip'
            };
            var obj4 = {
                id: 2,
                val: 'zap'
            };

            d1.cast([obj1, obj2]);

            var output = d1.uncast([
                obj3,
                obj4
            ]);
            eq_(output[0].val, 'foo');
            eq_(output[1].val, 'bar');

            done();
        }, fail
    );
});

test('model get hit', function(done, fail) {
    mock(
        'models',
        {
            requests: {get: function(x) {return 'surprise! ' + x;}},
            settings: {model_prototypes: {'dummy': 'id'}}
        },
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
        }, fail
    );
});

test('model get miss', function(done, fail) {
    mock(
        'models',
        {
            requests: {get: function(x) {return 'surprise! ' + x;}},
            settings: {model_prototypes: {'dummy': 'id'}}
        },
        function(models) {
            var d1 = models('dummy');

            eq_(d1.get('zip', 1), 'surprise! zip');

            done();
        }, fail
    );
});

test('model get getter', function(done, fail) {
    mock(
        'models',
        {
            requests: {get: function(x) {return "not the droids you're looking for";}},
            settings: {model_prototypes: {'dummy': 'id'}}
        },
        function(models) {
            var d1 = models('dummy');

            eq_(d1.get('zip', 1, function(x) {
                return 'hooray! ' + x;
            }), 'hooray! zip');

            done();
        }, fail
    );
});

test('model lookup by', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
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
        }, fail
    );
});

test('model lookup miss', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
        function(models) {
            var d1 = models('dummy');

            // Just a decoy
            d1.cast({
                id: 'zip',
                val: 'foo'
            });

            eeq_(d1.lookup('not an id'), undefined);

            done();
        }, fail
    );
});

test('model cast list', function(done, fail) {
    mock(
        'models',
        {settings: {model_prototypes: {'dummy': 'id'}}},
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
        }, fail
    );
});

})();
