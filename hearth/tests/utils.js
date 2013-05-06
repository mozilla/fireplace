(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var feq_ = a.feq_;

var utils = require('utils');

test('String strip', function(done) {
    eq_(('  a s d  f   ').strip(), 'asdf');
    done();
});

test('_pd', function(done) {
    var ev = {preventDefault: done};
    utils._pd(function() {})(ev);
});

test('escape_', function(done) {
    eq_(utils.escape_('<b> & "\'<'), '&lt;b&gt; &amp; &#34;&#39;&lt;');
    done();
});

test('fieldFocused', function(done) {
    eq_(utils.fieldFocused({target: {nodeName: 'input'}}), true);
    eq_(utils.fieldFocused({target: {nodeName: 'bgsound'}}), false);
    done();
});

test('querystring', function(done) {
    feq_(utils.querystring('?a=b&c=d'), {a: 'b', c: 'd'});
    feq_(utils.querystring('asdfoobar?a=b&c=d'), {a: 'b', c: 'd'});
    feq_(utils.querystring('?a=b&a=d'), utils.getVars('a=b&a=d'));
    done();
});

test('baseurl', function(done) {
    eq_(utils.baseurl('http://foo/bar'), 'http://foo/bar');
    eq_(utils.baseurl('http://foo/bar?asdf/asdf'), 'http://foo/bar');
    eq_(utils.baseurl('http://foo/bar/?asdf/asdf'), 'http://foo/bar/');
    done();
});

test('urlencode', function(done) {
    eq_(utils.urlencode({a: 'b'}), 'a=b');
    eq_(utils.urlencode({a: 'b', c: 'd'}), 'a=b&c=d');
    eq_(utils.urlencode({c: 'b', a: 'd'}), 'a=d&c=b');  // Must be alphabetized.
    eq_(utils.urlencode({__keywords: 'poop', test: 'crap'}), 'test=crap');
    eq_(utils.urlencode({test: 'cr ap'}), 'test=cr+ap');
    eq_(utils.urlencode({foo: void 0, zap: 0}), 'foo&zap=0');
    done();
});

test('urlparams', function(done) {
    eq_(utils.urlparams('', {a: 'b'}), '?a=b');
    eq_(utils.urlparams('?', {a: 'b'}), '?a=b');
    eq_(utils.urlparams('?', {a: ' '}), '?a=+');
    eq_(utils.urlparams('?a=d', {a: 'b'}), '?a=b');
    done();
});

test('urlunparam', function(done) {
    eq_(utils.urlunparam('foo/bar?a=1&b=2&c=3', ['']), 'foo/bar?a=1&b=2&c=3');
    eq_(utils.urlunparam('foo/bar?a=1&b=2&c=3', ['d']), 'foo/bar?a=1&b=2&c=3');
    eq_(utils.urlunparam('foo/bar?a=1&b=2&c=3', ['b']), 'foo/bar?a=1&c=3');
    eq_(utils.urlunparam('foo/bar?a&b&c=3', ['b']), 'foo/bar?a&c=3');
    eq_(utils.urlunparam('foo/bar?b=1', ['b']), 'foo/bar');
    done();
});

test('getVars', function(done) {
    feq_(utils.getVars('a=b'), {a: 'b'});
    feq_(utils.getVars('a=b+c'), {a: 'b c'});
    feq_(utils.getVars('a%20z=b%20c'), {'a z': 'b c'});
    feq_(utils.getVars('a+z=b+c'), {'a z': 'b c'});
    feq_(utils.getVars('?a=b'), {a: 'b'});
    feq_(utils.getVars('?'), {});
    feq_(utils.getVars('?a=b&c=d'), {a: 'b', c: 'd'});
    // Test that there's not weird HTML encoding going on.
    feq_(utils.getVars('%3C%3E%22\'%26=%3C%3E%22\'%26'),
         {'<>"\'&': '<>"\'&'});
    done();
});

})();
