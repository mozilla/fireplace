var assert = require('assert');
var Promise = require('es6-promise').Promise;
var proxyquire = require('proxyquire').noCallThru();
// Node does not have btoa, and we are running the tests outside a
// browser. We need to specify binary encoding, utf-8 would give us
// wrong results!
var nodeBtoa = function(s) { return new Buffer(s, 'binary').toString('base64'); };

describe('features', function() {
    function MockNavigator() {
        this.hasFeature = function(name) {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        };
        this.getFeature = function(name) {
            return new Promise(function(resolve, reject) {
                resolve('fakegetfeature_' + name);
            });
        };
    }

    before(function () {
        global.btoa = nodeBtoa;
    });

    after(function() {
        global.btoa = undefined;
    });

    it('buildFeaturesPromises with empty array works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        features.buildFeaturesPromises([], navigator).then(function(values) {
            assert.deepEqual(values, []);
            done();
        });
    });

    it('buildFeaturesPromises with hardcoded booleans works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        features.buildFeaturesPromises([true, false, false, true], navigator).then(function(values) {
            assert.deepEqual(values, [true, false, false, true]);
            done();
        });
    });

    it('buildFeaturesPromises with hasFeature works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        navigator.hasFeature = function(name) {
            return new Promise(function(resolve, reject) {
                resolve(name.substr(0, 3) == 'ok_');
            });
        };
        features.buildFeaturesPromises(['ok_1', 'ok_2', 'ko_1', 'ok_3'], navigator).then(function(values) {
            assert.deepEqual(values, [true, true, false, true]);
            done();
        });
    });

    it('buildFeaturesPromises that uses getFeature works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        var features_list = [
            ['foobar', 256],
            ['foobar', 512],
            ['foobar', 1024]
        ];
        var getFeatureCallCount = 0;
        navigator.getFeature = function(name) {
            return new Promise(function(resolve, reject) {
                getFeatureCallCount++;
                resolve(512);
            });
        };
        features.buildFeaturesPromises(features_list, navigator).then(function(values) {
            assert.deepEqual(values, [true, true, false]);
            assert.equal(getFeatureCallCount, 4);  // 4 and not 3, because one is always made for hardware.memory
            done();
        });
    });

    it('buildFeaturesPromises that uses getFeature("hardware.memory") works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        var features_list = [
            ['hardware.memory', 512],
            ['hardware.memory', 1024]
        ];
        var getFeatureCallCount = 0;
        navigator.getFeature = function(name) {
            return new Promise(function(resolve, reject) {
                getFeatureCallCount++;
                resolve(1024);
            });
        };
        features.buildFeaturesPromises(features_list, navigator).then(function(values) {
            assert.deepEqual(values, [true, true]);
            assert.equal(getFeatureCallCount, 1);  // hardware.memory promise is cached.
            done();
        });
    });

    it('generateFeatureProfile with empty array works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();

        features.generateFeatureProfile([], navigator).then(function(profile) {
            // First 47 bits are currently hardcoded to true.
            assert.equal(profile, '=//////9/.47.9');
            done();
        });
    });

    it('generateFeatureProfile with array full of truth works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        var values = [true, true, true, true, true, true];

        features.generateFeatureProfile(values, navigator).then(function(profile) {
            // First 47 bits are currently hardcoded to true.
            assert.equal(profile, '=////////Hw==.53.9');
            done();
        });
    });

    it('generateFeatureProfile with array full of lies works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        var values = [false, false, false, false, false, false];

        features.generateFeatureProfile(values, navigator).then(function(profile) {
            // First 47 bits are currently hardcoded to true.
            assert.equal(profile, '=//////9/AA==.53.9');
            done();
        });
    });

    it('checkForExtraFeatures works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        navigator.hasFeature = function(name) {
            return new Promise(function(resolve, reject) {
                // arbitrarily resolve web-extensions feature to true,
                // others to false.
                resolve(name === 'web-extensions' ? true : false);
            });
        };
        features.checkForExtraFeatures(navigator).then(function(features) {
            assert.deepEqual(features, {addonsEnabled: true, homescreensEnabled: false, lateCustomizationEnabled: false});
            done();
        });
    });

    it('checkForExtraFeatures with all features enabled works', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        navigator.hasFeature = function(name) {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        };
        features.checkForExtraFeatures(navigator).then(function(features) {
            assert.deepEqual(features, {addonsEnabled: true, homescreensEnabled: true, lateCustomizationEnabled: true});
            done();
        });
    });

    it('checkForExtraFeatures returns empty object without hasFeature()', function(done) {
        var features = proxyquire('../js/features', {});
        var navigator = new MockNavigator();
        navigator.hasFeature = undefined;
        features.checkForExtraFeatures(navigator).then(function(features) {
            assert.deepEqual(features, {});
            done();
        });
    });
});

describe('features bitfield', function() {
    before(function () {
        global.btoa = nodeBtoa;
    });

    after(function() {
        global.btoa = undefined;
    });

    it('FeaturesBitField constructor works', function(done) {
        var features = proxyquire('../js/features', {});
        var FeaturesBitField = features.FeaturesBitField;

        var bitfield = new FeaturesBitField(8);
        assert.equal(bitfield.values.length, 1);
        assert.equal(bitfield.values.get(0), 0);

        bitfield = new FeaturesBitField(9);
        assert.equal(bitfield.values.length, 2);
        assert.equal(bitfield.values.get(0), 0);
        assert.equal(bitfield.values.get(1), 0);

        bitfield = new FeaturesBitField(16);
        assert.equal(bitfield.values.length, 2);
        assert.equal(bitfield.values.get(0), 0);
        assert.equal(bitfield.values.get(1), 0);

        bitfield = new FeaturesBitField(53);
        assert.equal(bitfield.values.length, 7);
        for (var i = 0; i < 7; i++) {
            assert.equal(bitfield.values.get(i), 0);
        }

        done();
    });

    it('FeaturesBitField.set() works', function(done) {
        var features = proxyquire('../js/features', {});
        var FeaturesBitField = features.FeaturesBitField;

        var bitfield = new FeaturesBitField(9);
        bitfield.set(0, true);
        assert.equal(bitfield.values.get(0), 1);
        assert.equal(bitfield.values.get(1), 0);

        bitfield.set(1, true);
        assert.equal(bitfield.values.get(0), 3);
        assert.equal(bitfield.values.get(1), 0);

        bitfield.set(8, true);
        assert.equal(bitfield.values.get(0), 3);
        assert.equal(bitfield.values.get(1), 1);

        bitfield.set(8, false);
        assert.equal(bitfield.values.get(0), 3);
        assert.equal(bitfield.values.get(1), 0);
        done();
    });

    it('FeaturesBitField.get() works', function(done) {
        var features = proxyquire('../js/features', {});
        var FeaturesBitField = features.FeaturesBitField;

        var bitfield = new FeaturesBitField(9);
        assert.equal(bitfield.get(0), false);
        bitfield.set(0, true);
        assert.equal(bitfield.get(0), true);

        assert.equal(bitfield.get(4), false);
        bitfield.set(4, true);
        assert.equal(bitfield.get(4), true);

        assert.equal(bitfield.get(8), false);
        bitfield.set(8, true);
        assert.equal(bitfield.get(8), true);
        done();
    });

    it('FeaturesBitField.toBase64() works', function(done) {
        var features = proxyquire('../js/features', {});
        var FeaturesBitField = features.FeaturesBitField;
        var data = [true, false, false, false, false, false, false, true,
                    true];
        var bitfield = new FeaturesBitField(9);
        for (var i = 0; i < data.length; i++) {
            bitfield.set(i, data[i]);
        }
        assert.equal(bitfield.values.get(0), 129);
        assert.equal(bitfield.values.get(1), 1);
        assert.equal(bitfield.toBase64(), 'gQE=');
        done();
    });

    it('FeaturesBitField.toBase64() works array full of truth', function(done) {
        var features = proxyquire('../js/features', {});
        var FeaturesBitField = features.FeaturesBitField;
        var data = [true, true, true, true, true, true, true, true,
                    true];
        var bitfield = new FeaturesBitField(9);
        for (var i = 0; i < data.length; i++) {
            bitfield.set(i, data[i]);
        }
        assert.equal(bitfield.values.get(0), 255);
        assert.equal(bitfield.values.get(1), 1);
        assert.equal(bitfield.toBase64(), '/wE=');
        done();
    });

    it('FeaturesBitField.toBase64() works array full of lies', function(done) {
        var features = proxyquire('../js/features', {});
        var FeaturesBitField = features.FeaturesBitField;
        var data = [false, false, false, false, false, false, false, false,
                    false];
        var bitfield = new FeaturesBitField(9);
        for (var i = 0; i < data.length; i++) {
            bitfield.set(i, data[i]);
        }
        assert.equal(bitfield.values.get(0), 0);
        assert.equal(bitfield.values.get(1), 0);
        assert.equal(bitfield.toBase64(), 'AAA=');
        done();
    });
});
