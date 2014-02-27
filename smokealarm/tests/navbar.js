var suite = require('./kasperle').suite();

suite.run('/', function(test, waitFor) {

    waitFor(function() {
        return suite.exists('.navbar');
    });

    test('Check Marketplace navbar initialized', function(assert) {
        assert.selectorExists('.nav-mkt[data-tab="homepage"].active');
        assert.selectorExists('.nav-mkt li[data-tab="homepage"].active');
    });

    test('Check Settings navbar initialized but hidden', function(assert) {
        assert.selectorExists('.nav-settings[data-tab="settings"]:not(.active)');
        assert.selectorExists('.nav-settings li[data-tab="settings"].active');
    });

    test('Click on Categories tab', function(assert) {
        suite.press('.nav-mkt li[data-tab="categories"]');
    });

    waitFor(function() {
        return suite.exists('.nav-mkt li[data-tab="categories"].active');
    });

    test('Check Categories tab clicked', function(assert) {
        assert.selectorExists('.nav-mkt[data-tab="categories"]');
    });

    test('Click on Settings tray', function(assert) {
        suite.press('.act-tray.mobile');
    });

    waitFor(function() {
        return suite.exists('#account-settings');
    });

    test('Check Settings navbar shown', function(assert) {
        assert.selectorExists('.nav-settings.active');
    });

    test('Click on Feedback tab', function(assert) {
        suite.press('.nav-settings li[data-tab="feedback"]');
    });

    waitFor(function() {
        return suite.exists('.feedback.main');
    });

    test('Check Feedback tab clicked', function(assert) {
        assert.selectorExists('.nav-settings[data-tab="feedback"]');

    });

    test('Click on Marketplace tray', function(assert) {
        suite.press('.mkt-tray');
    });

    waitFor(function() {
        return suite.exists('.nav-mkt');
    });

    test('Check back on Categories tab', function(assert) {
        assert.selectorExists('.nav-mkt[data-tab="categories"]');
        assert.selectorExists('.nav-mkt li[data-tab="categories"].active');
    });
});
