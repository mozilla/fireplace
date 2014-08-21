(function() {
var a = require('assert');
var assert = a.assert;
var eeq_ = a.eeq_;
var contains = a.contains;
var _ = require('underscore');

var storage = require('storage');

test('storage returns proper types', function(done){
    storage.setItem('number', 4);
    eeq_(storage.getItem('number'), 4);
    storage.removeItem('number');

    storage.setItem('string', 'abcde');
    eeq_(storage.getItem('string'), 'abcde');
    storage.removeItem('string');

    storage.setItem('boolean', true);
    eeq_(storage.getItem('boolean'), true);
    storage.removeItem('boolean');

    storage.setItem('array', [1, 2, 3, 4, 5]);
    assert(Array.isArray(storage.getItem('array')));
    assert(_.isEqual(storage.getItem('array'), [1,2,3,4,5]));
    storage.removeItem('array');

    storage.setItem('object', {a: 1, b: 2, c: 3});
    eeq_(typeof storage.getItem('object'), 'object');
    assert(_.isEqual(storage.getItem('object'), {a: 1, b: 2, c: 3}));
    storage.removeItem('object');

    done();
});

test('remove items from storage', function(done){
    var key = 'transient';
    var value = {
        unix: '30 definitions of regular expressions living under one roof',
        windows: 'has detected the mouse has moved. Please restart your system for changes to take effect',
        beos: 'These three are certain:/Death, taxes, and site not found./You, victim of one.'
    };
    eeq_(storage.getItem(key), null);
    storage.setItem(key, value);
    assert(_.isEqual(storage.getItem(key), value));
    storage.removeItem(key);
    eeq_(storage.getItem(key), null);
    done();
});

})();
