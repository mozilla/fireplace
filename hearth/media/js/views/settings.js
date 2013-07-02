define('views/settings',
    ['common/linefit', 'defer', 'jquery', 'l10n', 'log', 'notification', 'requests', 'urls', 'user', 'utils', 'z'],
    function(linefit, defer, $, l10n, log, notification, requests, urls, user, utils, z) {

    var persistent_console = log.persistent('mobilenetwork', 'change');

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
        z.page.trigger('reload_chrome');
    }

    z.page.on('submit', 'form.account-settings', _pd(function(e) {
        e.stopPropagation();
        var completion = defer.Deferred();
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
        delete data.email;

        var current_region = user.get_setting('region');
        if (current_region !== data.region) {
            persistent_console.log('Manual region change:', current_region, '→', data.region);
        }

        user.update_settings(data);
        requests.patch(urls.api.url('settings'), data)
                .done(completion.resolve)
                .fail(completion.reject);
    })).on('logged_in', update_settings);

    return function(builder) {
        builder.start('settings/main.html');

        $('.linefit').linefit(2);

        builder.z('type', 'root settings');
        builder.z('reload_on_logout', true);
        builder.z('title', gettext('Account Settings'));
    };
});
