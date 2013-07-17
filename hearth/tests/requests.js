(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var feq_ = a.feq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');


function mock_xhr(args) {
    var def = defer.Deferred();
    def.args = arguments;
    return def;
}

test('requests.get', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var def = requests.get('foo/bar');
            // Test that the URL isn't mangled before being sent to jQuery.
            feq_(Array.prototype.slice.call(def.args, 0),
                 ['GET', 'foo/bar']);
            def.done(function(data) {
                eq_(data, 'sample data');
                done();
            }).fail(fail);
            def.resolve('sample data');
        }
    );
});

test('requests.get cached', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var uncached = requests.get('foo/bar');
            assert(!('__cached' in uncached));
            uncached.resolve('data to cache');

            var def = requests.get('foo/bar');
            assert('__cached' in def);
            def.done(function(data) {
                eq_(data, 'data to cache');
                done();
            }).fail(fail);
        }, fail
    );
});

test('requests.get nocache', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var uncached = requests.get('foo/bar', true);
            assert(!('__cached' in uncached));
            uncached.resolve('data to cache');

            var def = requests.get('foo/bar', true);
            assert(!('__cached' in uncached));
            done();
        }, fail
    );
});

test('requests.get hook', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);

            requests.on('success', function(data) {
                eq_(data, 'sample data');
                done();
            }).on('failure', fail);

            var def = requests.get('foo/bar');
            def.resolve('sample data');
        },
        fail
    );
});

test('requests.get fail hook', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);

            requests.on('failure', function(data) {
                eq_(data, 'bad data');
                done();
            }).on('success', fail);

            var def = requests.get('foo/bar');
            def.reject('bad data');
        },
        fail
    );
});

var data = {foo: 'bar'};
var methods_to_test = ['post', 'del', 'put', 'patch'];
var test_output = {
    post: ['POST', 'foo/bar', data],
    del: ['DELETE', 'foo/bar'],
    put: ['PUT', 'foo/bar', data],
    patch: ['PATCH', 'foo/bar', data]
};

methods_to_test.forEach(function(v) {
    test('requests.' + v, function(done, fail) {
        mock(
            'requests', {},
            function(requests) {
                requests._set_xhr(mock_xhr);
                var def = requests[v]('foo/bar', data);
                feq_(Array.prototype.slice.call(def.args, 0), test_output[v]);
                def.done(function(data) {
                    eq_(data, 'sample data');
                    done();
                }).fail(fail);
                def.resolve('sample data');
            }, fail
        );
    });

    test('requests.' + v + ' never cached', function(done, fail) {
        mock(
            'requests', {},
            function(requests) {
                requests._set_xhr(mock_xhr);
                var uncached = requests.get('foo/bar');
                assert(!('__cached' in uncached));
                uncached.resolve('data to cache');

                requests[v]('foo/bar', {foo: 'bar'});
                assert(!('__cached' in uncached));
                uncached.resolve('data to cache');

                var def = requests[v]('foo/bar', {foo: 'bar'});
                assert(!('__cached' in def));

                def.done(function(data) {
                    eq_(data, 'boop');
                    done();
                }).fail(fail);
                def.resolve('boop');
            }, fail
        );
    });
});


// Pool tests //////////////////////////////////

test('requests.pool methods', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var pool = requests.pool();

            var orig_req = pool.get('test/foo');
            var second_req = pool.get('test/foo');
            eq_(orig_req, second_req);  // Pools should coalesce GET requests.

            var orig_post_req = pool.post('test/foo', {abc: 'def'});
            var second_post_req = pool.post('test/foo', {abc: 'def'});
            assert(orig_post_req != second_post_req);  // Pools should never coalesce POSTs.

            var orig_del_req = pool.del('test/foo');
            var second_del_req = pool.del('test/foo');
            assert(orig_del_req != second_del_req);  // Pools should never coalesce DELETEs.

            var orig_put_req = pool.put('test/foo');
            var second_put_req = pool.put('test/foo');
            assert(orig_put_req != second_put_req);  // Pools should never coalesce PUTs.

            var orig_patch_req = pool.patch('test/foo');
            var second_patch_req = pool.patch('test/foo');
            assert(orig_patch_req != second_patch_req);  // Pools should never coalesce PATCHs.

            // Test that it's actually the same request.
            second_req.done(done);
            orig_req.resolve('sample data');
        }
    );
});

test('requests.pool abort', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var pool = requests.pool();

            var orig_req = pool.get('test/foo');
            orig_req.abort = done;
            orig_req.done(fail);
            orig_req.isSuccess = false;

            pool.abort();
        }, fail
    );
});

test('requests.pool abort resolution', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var pool = requests.pool();
            pool.fail(done);
            pool.abort();
        }, fail
    );
});

test('requests.pool finish', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var timing = fail;
            var timing_closure = function() {
                timing();
            }

            var pool = requests.pool();
            pool.done(timing_closure);

            // It shouldn't have resolved up until now. Now it should resolve.
            timing = done;
            pool.finish();
        }, fail
    );
});

test('requests.pool finish resolution', function(done, fail) {
    mock(
        'requests', {},
        function(requests) {
            requests._set_xhr(mock_xhr);
            var timing = fail;
            var timing_closure = function() {
                timing();
            }

            var pool = requests.pool();
            pool.done(timing_closure);

            pool.get('foo/bar').resolve('it finished');
            pool.post('foo/bar', {some: 'data'}).resolve('it finished also');
            pool.del('foo/bar').resolve('it finished also');

            // It shouldn't have resolved up until now. Now it should resolve.
            timing = done;
            pool.finish();
        }, fail
    );
});

})();
