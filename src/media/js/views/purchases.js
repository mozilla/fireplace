define('views/purchases', ['l10n', 'common/linefit', 'urls'],
    function(l10n, linefit, urls) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.start('user/purchases.html');

        var $linefit = $('.linefit');
        if ($linefit.length) {
            $('.linefit').linefit(2);
        }

        builder.z('type', 'root settings purchases');
        builder.z('title', gettext('My Apps'));
        builder.z('parent', urls.reverse('homepage'));
    };
});
