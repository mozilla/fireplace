define('views/partners', ['l10n'], function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        var partner = args[0];
        var promotion = args[1];
        var region = args[2];

        var partners = {
            napster: 'Napster'
        };

        if (!(partner in partners)) {
            partner = '';
        }

        var partnerTitle = partners[partner] || '';

        builder.start('partners.html', {
            partner: partner,
            promotion: promotion,
            region: region
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Partners | {partner}', {partner: partnerTitle}));
    };
});
