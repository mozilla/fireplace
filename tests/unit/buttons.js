define('tests/unit/buttons',
    ['tests/unit/helpers'],
    function(h) {

    describe('install button text', function() {
        it('is "Install for {price}" when free', h.injector(
                h.mockSettings({
                    meowEnabled: true,
                    model_prototypes: {app: 'slug'},
                })
            ).run(['buttons'], function(buttons) {
                h.setL10nStrings({'Install for {price}': 'yo'}, function() {
                    var app = {};
                    assert.equal(buttons.getBtnText(app), 'yo');
                });
            }));

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
            }));

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
            }));
    });
});
