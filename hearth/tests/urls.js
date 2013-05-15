(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var disincludes = a.disincludes;
var mock = a.mock;

var urls = require('urls');

test('reverse', function(done) {
    var reverse = urls.reverse;
    eq_(reverse('homepage'), '/');
    eq_(reverse('app', ['slug']), '/app/slug');
    done();
});

test('reverse missing args', function(done, fail) {
    var reverse = urls.reverse;
    try {
        reverse('app', []);
    } catch(e) {
        return done();
    }
    fail('reverse() did not throw exception');
});

test('reverse too many args', function(done, fail) {
    var reverse = urls.reverse;
    try {
        reverse('app', ['foo', 'bar']);
    } catch(e) {
        return done();
    }
    fail('reverse() did not throw exception');
});

test('api url', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var search_url = urls.api.url('search');
            eq_(search_url.substr(0, 24), 'api:/api/v1/apps/search/');
            contains(search_url, 'dev=firefoxos');
            // contains(search_url, 'scr=mobile');
            // contains(search_url, 'tch=foo');
            disincludes(search_url, 'carrier=');
            done();
        }
    );
});

test('api url signage', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var search_url = urls.api.unsigned.url('search');
            eq_(search_url, 'api:/api/v1/apps/search/');
            eq_(urls.api.sign(search_url), urls.api.url('search'));
            done();
        }
    );
});

test('api carrier', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: function() { return false; }, touch: 'foo'},
            settings: {api_url: 'api:', carrier: {slug: 'bastacom'}}
        }, function(urls) {
            contains(urls.api.url('search'), 'carrier=bastacom');
            done();
        }
    );
});

test('api url params', function(done) {
    mock(
        'urls',
        {
            settings: {api_url: 'api:'}
        }, function(urls) {
            var search_url = urls.api.params('search', {q: 'poop'});
            eq_(search_url.substr(0, 24), 'api:/api/v1/apps/search/');
            contains(search_url, 'q=poop');
            done();
        }
    );
});

})();
