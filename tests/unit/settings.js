define('tests/unit/settings',
    ['tests/unit/helpers'],
    function(h) {

    describe('settings', function() {
        it('loads them from body[data-settings] as JSON', function(done) {
            var oldSettings = document.body.getAttribute('data-settings');
            document.body.setAttribute('data-settings',
                                       '{"foo":"my-setting"}');
            h.injector()
            .require(
                ['core/settings', 'settings_app'],
                function(settings, appSettings) {
                    assert.equal(settings.foo, 'my-setting');
                    document.body.setAttribute('data-settings', oldSettings);
                    done();
                });
        });
    });
});
