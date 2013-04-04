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
            capabilities: {firefoxOS: true, widescreen: false, touch: 'foo'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var hp_url = urls.api.url('homepage');
            eq_(hp_url.substr(0, 22), 'api:/api/v1/home/page/');
            contains(hp_url, 'dev=firefoxos');
            contains(hp_url, 'scr=mobile');
            contains(hp_url, 'tch=foo');
            disincludes(hp_url, 'carrier=');
            done();
        }
    );
});

test('api carrier', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: false, touch: 'foo'},
            settings: {api_url: 'api:', carrier: {slug: 'bastacom'}}
        }, function(urls) {
            contains(urls.api.url('homepage'), 'carrier=bastacom');
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
            var hp_url = urls.api.params('homepage', {cvan: 'poop'});
            eq_(hp_url.substr(0, 22), 'api:/api/v1/home/page/');
            contains(hp_url, 'cvan=poop');
            done();
        }
    );
});

})();
