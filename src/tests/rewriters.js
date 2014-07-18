(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var feq_ = a.feq_;
var mock = a.mock;


var rewriters = require('rewriters');


test('rewriter pagination cache', function(done) {

    var cache = {};
    var first_result = cache[require('urls').api.params('search', {q: 'foo'})] = {
        objects: ['first', 'second', 'third'],
        meta: {
            total_count: 6,
            limit: 3,
            next: 'second page'
        }
    };

    var key = require('urls').api.params('search', {q: 'foo', offset: 3, limit: 3});
    var value = {
        objects: ['fourth', 'fifth', 'sixth'],
        meta: {
            total_count: 6,
            limit: 3,
            next: 'third page'
        }
    };
    for (var i = 0, rw; rw = rewriters[i++];) {
        rw(key, value, cache);
    }

    feq_(first_result.objects,
         ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']);
    eq_(first_result.meta.total_count, 6);
    eq_(first_result.meta.limit, 6);
    eq_(first_result.meta.next, 'third page');

    done();
});

})();
