(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;

var urls = require('urls');

test('reverse', function(done) {
    var reverse = urls.reverse;
    eq_(reverse('homepage'), '/');
    eq_(reverse('app', ['slug']), '/app/slug');
    done();
});

test('reverse missing args', function(done) {
    var reverse = urls.reverse;
    try {
        reverse('app', []);
        throw new Error('reverse() did not throw exception');
    } catch(e) {
        done();
    }
});

test('reverse too many args', function(done) {
    var reverse = urls.reverse;
    try {
        reverse('app', ['foo', 'bar']);
        throw new Error('reverse() did not throw exception');
    } catch(e) {
        done();
    }
});

test('api url', function(done) {
    mock(
        'urls',
        {
            capabilities: {firefoxOS: true, widescreen: false, touch: 'foo'},
            settings: {api_url: 'api:'}
        }, function(urls) {
            var hp_url = urls.api.url('homepage');
            eq_(hp_url.substr(0, 13), 'api:/homepage');
            contains(hp_url, 'dev=fxos');
            contains(hp_url, 'scr=mobile');
            contains(hp_url, 'tch=foo');
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
            eq_(hp_url.substr(0, 13), 'api:/homepage');
            contains(hp_url, 'cvan=poop');
            done();
        }
    );
});

})();
