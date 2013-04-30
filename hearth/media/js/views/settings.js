define('views/settings',
    ['l10n', 'notification', 'requests', 'urls', 'user', 'utils', 'z'],
    function(l10n, notification, requests, urls, user, utils, z) {

    var _pd = utils._pd;
    var gettext = l10n.gettext;
    var notify = notification.notification;

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
            notify({message: gettext('Settings saved')});
        }).fail(function() {
            notify({message: gettext('Settings could not be saved')});
        });

        if (!user.logged_in()) {
            user.update_settings({region: $('[name=region]').val()});
            completion.resolve();
            return;
        }
        var data = utils.getVars($(this).serialize());
        user.update_settings(data);
        requests.patch(urls.api.url('settings'), data)
                .done(completion.resolve)
                .fail(completion.reject);
    })).on('logged_in', update_settings);

    return function(builder) {
        builder.start('settings/main.html');

        builder.z('type', 'root settings');
        builder.z('title', gettext('Account Settings'));
        builder.done();
    };
});
