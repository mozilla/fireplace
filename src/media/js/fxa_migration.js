define('fxa_migration', ['settings', 'storage', 'user', 'z'],
       function (settings, storage, user, z) {

    function canMigrate() {
        return migrationEnabled() && !doneMigration() && hasLoggedIn();
    }

    function hasLoggedIn() {
        // We set `permissions` on login and reset it to `{}` on logout so we
        // can use that to tell if this device has ever logged in.
        return !!storage.getItem('permissions');
    }

    function doneMigration() {
        if (user.get_setting('source') === 'firefox-accounts') {
            storage.setItem('fxa-migrated', true);
        }
        return storage.getItem('fxa-migrated');
    }

    function migrationEnabled() {
        return settings.switches.indexOf('fx-accounts-migration') !== -1;
    }

    return {
        canMigrate: canMigrate,
        migrationEnabled: migrationEnabled,
    };
});
