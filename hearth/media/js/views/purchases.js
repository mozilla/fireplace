define('views/purchases', ['cache', 'l10n', 'common/linefit', 'urls', 'utils', 'z'],
    function(cache, l10n, linefit, urls, utils, z) {
    'use strict';

    var gettext = l10n.gettext;

    z.win.on('app_install_success', function(e, installer, product, installed_now) {
        if (!installed_now) {
            return;
        }

        var unsigned_url = urls.api.unsigned.url('installed');
        cache.attemptRewrite(
            function(key) {
                return utils.baseurl(key) !== unsigned_url;
            },
            function(data) {
                data.objects.push(product);  // TODO: convert this to use models
                return data;
            }
        );

    });

    return function(builder, args) {
        builder.start('user/purchases.html');

        $('.linefit').linefit(2);

        builder.z('type', 'root');
        builder.z('reload_on_login', true);
        builder.z('title', gettext('My Apps'));
    };
});
