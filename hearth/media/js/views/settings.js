define('views/settings',
    ['l10n', 'requests', 'urls', 'user', 'utils', 'z'],
    function(l10n, requests, urls, user, utils, z) {

    var _pd = utils._pd;
    var gettext = l10n.gettext;

    function update_settings() {
        var acc_sett = $('.account-settings');
        if (!acc_sett.length) {
            return;
        }
        acc_sett.find('[name=display_name]').val(user.get_setting('display_name'));
        acc_sett.find('[name=email]').val(user.get_setting('email'));
        acc_sett.find('[name=region]').val(user.get_setting('region'));
    }

    z.page.on('submit', 'form.account-settings', _pd(function(e) {
        e.stopPropagation();
        var completion = $.Deferred();
        completion.done(function() {
            update_settings();
            z.page.trigger('notify', [{msg: gettext('Settings saved.')}]);
        }).fail(function() {
            z.page.trigger('notify', [{msg: gettext('Settings could not be saved.')}]);
        });

        if (!user.logged_in()) {
            user.update_settings({region: $('[name=region]').val()});
            completion.resolve();
            return;
        }
        var data = $(this).serialize();
        user.update_settings(data);
        requests.post(urls.api.url('settings'), data, function() {
            // Re-save settings because we cray and the user cray.
            user.update_settings(data);

            completion.resolve();
        }, function() {
            z.page.trigger('notify', [gettext('Settings could not be saved.')]);
            completion.reject();
        });
    })).on('logged_in', update_settings);

    return function(builder) {
        builder.start('settings/main.html');

        builder.z('type', 'leaf');
        builder.z('title', 'Account Settings');  // No L10n for you!
    };
});
