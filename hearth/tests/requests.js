(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;

function MockJQuery() {
    this.Deferred = $.Deferred;
    this.ajaxSetup = function() {};
    this.get = this.post = function() {
        var def = $.Deferred();
        def.args = arguments;
        return def;
    };
}

test('requests.get', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var def = requests.get('foo/bar');
            // Test that the URL isn't mangled before being sent to jQuery.
            eq_(def.args[0], 'foo/bar');
            def.done(function(data) {
                eq_(data, 'sample data');
                done();
            }).fail(fail);
            def.resolve('sample data');
        }
    );
});

test('requests.get callback', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var def = requests.get('foo/bar', function(data) {
                eq_(data, 'sample data');
                done();
            }, fail);
            // Test that the URL isn't mangled before being sent to jQuery.
            eq_(def.args[0], 'foo/bar');
            def.resolve('sample data');
        }
    );
});

test('requests.get cached', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var uncached = requests.get('foo/bar');
            assert(!('__cached' in uncached));
            uncached.resolve('data to cache');

            var def = requests.get('foo/bar');
            assert('__cached' in def);
            def.done(function(data) {
                eq_(data, 'data to cache');
                done();
            }).fail(fail);
        }
    );
});

test('requests.get cached callback', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var uncached = requests.get('foo/bar');
            assert(!('__cached' in uncached));
            uncached.resolve('data to cache');

            requests.get('foo/bar', function(data) {
                eq_(data, 'data to cache');
                done();
            });
        }
    );
});

test('requests.post', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var data = {foo: 'bar'};
            var def = requests.post('foo/bar', data);
            eq_(def.args[0], 'foo/bar');
            eq_(def.args[1], data);
            def.done(function(data) {
                eq_(data, 'sample data');
                done();
            }).fail(fail);
            def.resolve('sample data');
        }
    );
});

test('requests.post callback', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var data = {foo: 'bar'};
            var def = requests.post('foo/bar', data, function(data) {
                eq_(data, 'sample data');
                done();
            }, fail);
            eq_(def.args[0], 'foo/bar');
            eq_(def.args[1], data);
            def.resolve('sample data');
        }
    );
});

test('requests.get never cached', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var uncached = requests.get('foo/bar');
            assert(!('__cached' in uncached));
            uncached.resolve('data to cache');

            requests.post('foo/bar', {foo: 'bar'});
            assert(!('__cached' in uncached));
            uncached.resolve('data to cache');

            var def = requests.post('foo/bar', {foo: 'bar'});
            assert(!('__cached' in def));
            def.done(function(data) {
                eq_(data, 'boop');
                done();
            }).fail(fail);
            def.resolve('boop');
        }
    );
});


// Pool tests //////////////////////////////////

test('requests.pool get post', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var pool = requests.pool();

            var orig_req = pool.get('test/foo');
            var second_req = pool.get('test/foo');
            eq_(orig_req, second_req);  // Pools should coalesce GET requests.

            var orig_post_req = pool.post('test/foo', {abc: 'def'});
            var second_post_req = pool.post('test/foo', {abc: 'def'});
            assert(orig_post_req != second_post_req);  // Pools should never coalesce POSTs.

            // Test that it's actually the same request.
            second_req.done(done);
            orig_req.resolve('sample data');
        }
    );
});

test('requests.pool abort', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var pool = requests.pool();

            var orig_req = pool.get('test/foo');
            orig_req.abort = done;
            orig_req.done(fail);
            orig_req.isSuccess = false;

            pool.abort();
        }
    );
});

test('requests.pool abort resolution', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var pool = requests.pool();
            pool.fail(done);
            pool.abort();
        }
    );
});

test('requests.pool finish', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var timing = fail;
            var timing_closure = function() {
                timing();
            }

            var pool = requests.pool();
            pool.done(timing_closure);

            // It shouldn't have resolved up until now. Now it should resolve.
            timing = done;
            pool.finish();
        }
    );
});

test('requests.pool finish resolution', function(done, fail) {
    mock(
        'requests',
        {jquery: new MockJQuery()},
        function(requests) {
            var timing = fail;
            var timing_closure = function() {
                timing();
            }

            var pool = requests.pool();
            pool.done(timing_closure);

            pool.get('foo/bar').resolve('it finished');
            pool.post('foo/bar', {some: 'data'}).resolve('it finished also');

            // It shouldn't have resolved up until now. Now it should resolve.
            timing = done;
            pool.finish();
        }
    );
});

})();
