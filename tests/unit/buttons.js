define('tests/unit/buttons',
    ['tests/unit/helpers'],
    function(h) {

    describe('install button text', function() {
        it('is "Install for free" when free', h.injector(
                h.mockSettings({
                    meowEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                h.setL10nStrings({'Install for free': 'yo'}, function() {
                    var app = {};
                    assert.equal(buttons.getBtnText(app), 'yo');
                });
            }
        ));

        it('is "Install for <amount>" when paid', h.injector(
                h.mockSettings({
                    meowEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                h.setL10nStrings({'Install for {price}': 'pay me {price}'},
                                 function() {
                    var app = {price: '10.25', price_locale: '$10.25'};
                    assert.equal(buttons.getBtnText(app), 'pay me $10.25');
                });
            }
        ));

        it('is "Install" when paid and purchased', h.injector(
                h.mockSettings({
                    meowEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons', 'core/user'], function(buttons, user) {
                var app = {id: 123, price: '10.25', price_locale: '$10.25'};
                assert.equal(buttons.getBtnText(app), 'Install for $10.25');
                user.update_purchased(app.id);
                assert.equal(buttons.getBtnText(app), 'Install');
            }
        ));

        it('is "Install Add-on" for Add-ons', h.injector(
                h.mockSettings({
                    addonsEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                h.setL10nStrings({'Install Add-on': 'yo dawg'}, function() {
                    var app = {
                        // For now transform() needs a mini_manifest_url to
                        // properly detect add-ons as such.
                        mini_manifest_url: '/extension/lol.webapp',
                    };
                    assert.equal(buttons.getBtnText(app), 'yo dawg');
                });
            }
        ));
    });

    describe('install button', function() {

        it('is enabled for add-ons depending on device_type', h.injector(
                h.mockSettings({
                    addonsEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                var product = {
                    // Tests are running on a desktop browser.
                    device_types: ['desktop'],
                    // For now transform() needs a mini_manifest_url to
                    // properly detect add-ons as such.
                    mini_manifest_url: '/extension/lol.webapp',
                };
                result = buttons.transform(product);
                console.log(result);
                assert.equal(result.disabled, undefined);
                assert.equal(result.isAddon, true);
                assert.equal(result.isLangpack, false);
                assert.equal(result.incompatible, undefined);
                assert.equal(result.installed, false);
            }
        ));

        it('is disabled for add-ons depending on device_type', h.injector(
                h.mockSettings({
                    addonsEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                var product = {
                    // Tests are running on a desktop browser.
                    device_types: ['foooooobar'],
                    // For now transform() needs a mini_manifest_url to
                    // properly detect add-ons as such.
                    mini_manifest_url: '/extension/lol.webapp',
                };
                result = buttons.transform(product);
                assert.deepEqual(result.disabled,
                                 ['not available for your platform']);
                assert.equal(result.isAddon, true);
                assert.equal(result.isLangpack, false);
                assert.deepEqual(result.incompatible,
                                 ['not available for your platform']);
                assert.equal(result.installed, false);
            }
        ));

        it('is disabled for add-ons if setting is set to false', h.injector(
                h.mockSettings({
                    addonsEnabled: false,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                var product = {
                    // Tests are running on a desktop browser.
                    device_types: ['desktop'],
                    // For now transform() needs a mini_manifest_url to
                    // properly detect add-ons as such.
                    mini_manifest_url: '/extension/lol.webapp',
                };
                result = buttons.transform(product);
                assert.deepEqual(result.disabled,
                                 ['not compatible with your device']);
                assert.equal(result.isAddon, true);
                assert.equal(result.isLangpack, false);
                assert.deepEqual(result.incompatible,
                                 ['not compatible with your device']);
                assert.equal(result.installed, false);
            }
        ));
    });

});
