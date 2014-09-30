(function () {
    var assert = require('assert');
    var ok_ = assert.ok_;
    var mock = assert.mock;
    var Storage = function (defaults) {
        var store = defaults || {};

        this.setItem = function (key, value) {
            store[key] = value;
        };

        this.getItem = function (key) {
            return store[key];
        };
    };
    var migrationEnabledSettings = {
        switches: ['fx-accounts-migration'],
    };


    test('a new user cannot migrate',
         function (done, fail) {
        mock(
            'fxa_migration',
            {
                settings: migrationEnabledSettings,
                storage: new Storage(),
            },
            function (fxa_migration) {
                ok_(!fxa_migration.canMigrate());
                done();
            }, fail);
    });

    test('a non migrated user that has signed in before can migrate',
         function (done, fail) {
        mock(
            'fxa_migration',
            {
                settings: migrationEnabledSettings,
                storage: new Storage({permissions: {}}),
            },
            function (fxa_migration) {
                ok_(fxa_migration.canMigrate());
                done();
            }, fail);
    });

    test('a migrated user cannot migrate',
         function (done, fail) {
        mock(
            'fxa_migration',
            {
                settings: migrationEnabledSettings,
                storage: new Storage({'fxa-migrated': true}),
            },
            function (fxa_migration) {
                ok_(!fxa_migration.canMigrate());
                done();
            }, fail);
    });

    test('canMigrate will set fxa-migrated if migrated',
         function (done, fail) {
        var fakeStorage = new Storage();
        mock(
            'fxa_migration',
            {
                settings: migrationEnabledSettings,
                storage: fakeStorage,
                user: {
                    get_setting: function (key) {
                        if (key === 'source') {
                            return 'firefox-accounts';
                        }
                    },
                },
            },
            function (fxa_migration) {
                ok_(!fakeStorage.getItem('fxa-migrated'));
                ok_(!fxa_migration.canMigrate());
                ok_(fakeStorage.getItem('fxa-migrated'));
                done();
            }, fail);
    });

    test('canMigrate is false on nativeFxA',
         function (done, fail) {
        mock(
            'fxa_migration',
            {
                settings: migrationEnabledSettings,
                storage: new Storage({permissions: {}}),
                capabilities: {
                    nativeFxA: function () {
                        return true;
                    },
                },
            },
            function (fxa_migration) {
                ok_(!fxa_migration.canMigrate());
                done();
            }, fail);

    });
})();
