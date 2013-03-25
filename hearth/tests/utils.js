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

test('urlparams', function(done) {
    eq_(utils.urlparams('', {a: 'b'}), '?a=b');
    eq_(utils.urlparams('?', {a: 'b'}), '?a=b');
    eq_(utils.urlparams('?', {a: ' '}), '?a=%20');
    eq_(utils.urlparams('?a=d', {a: 'b'}), '?a=b');
    eq_(utils.urlparams('?', {__keywords: true}), '?');
    done();
});

test('getVars', function(done) {
    feq_(utils.getVars('a=b'), {a: 'b'});
    feq_(utils.getVars('?a=b'), {a: 'b'});
    feq_(utils.getVars('?'), {});
    feq_(utils.getVars('?a=b&c=d'), {a: 'b', c: 'd'});
    done();
});

})();
