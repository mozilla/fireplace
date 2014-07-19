/*
    Provides the apps module, a wrapper around navigator.mozApps
*/
define('apps',
    ['buckets', 'capabilities', 'defer', 'installer_direct', 'installer_iframe', 'l10n', 'log', 'nunjucks', 'settings', 'underscore', 'utils'],
    function(buckets, capabilities, defer, installer_direct, installer_iframe, l10n, log, nunjucks, settings, _, utils) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('apps');
    var iframed;
    var installer;

    /* Determine which installer to use.
       If we are in an iframe (yulelog), invoke direct installer.
       If we are packaged or directly in browser, invoke iframe installer that
       uses the m.f.c origin.
       The iframe installer does not work when we are in an iframe because
       mozApps doesn't seem to work when double nested in iframes.
    */
    try {
        iframed = window.self !== window.top;
    } catch (e) {
        iframed = true;
    }
    if (iframed) {
        installer = installer_direct;
    } else {
        installer = installer_iframe;
        installer.initialize_iframe();
    }

    function install(product, opt) {
        /*
           apps.install(manifest_url, options)

           This requires at least one apps-error-msg div to be present.

           See also: https://developer.mozilla.org/docs/DOM/Apps.install

           data -- optional dict to pass as navigator.apps.install(url, data, ...)
           success -- optional callback for when app installation was successful
           error -- optional callback for when app installation resulted in error
           navigator -- something other than the global navigator, useful for testing
        */
        var def = defer.Deferred();

        // Bug 996150 for packaged Marketplace installing packaged apps.
        installer.install(product, opt).done(function(result, product) {
            def.resolve(result, product);
        }).fail(function(message, error) {
            def.reject(message, error);
        });

        return def.promise();
    }

    function getInstalled() {
        return installer.getInstalled();
    }

    function launch(manifestURL) {
        return installer.launch(manifestURL);
    }

    var COMPAT_REASONS = '__compat_reasons';
    var use_compat_cache = true;
    function incompat(product) {
        /*
           apps.incompat(app_object)

           If the app is compatible, this function returns a falsey value.
           If the app is incompatible, a list of reasons why
           (plaintext strings) is returned.

           If you don't want to use the cached values, run the following
           command in your console:

           require('apps')._use_compat_cache(false);
        */
        // If the never_incompat setting is true, never disable the buttons.
        if (settings.never_incompat) {
            return;
        }

        // Cache incompatibility reasons.
        if (use_compat_cache && COMPAT_REASONS in product) {
            return product[COMPAT_REASONS];
        }

        var reasons = [];
        var device = capabilities.device_type();
        if (product.payment_required && !capabilities.navPay && !settings.simulate_nav_pay) {
            reasons.push(gettext('Your device does not support payments.'));
        } else if (product.payment_required && !product.price) {
            reasons.push(gettext('This app is unavailable for purchase in your region.'));
        }

        if (!capabilities.webApps || (!capabilities.packagedWebApps && product.is_packaged)) {
            reasons.push(gettext('Your browser or device is not web-app compatible.'));
        } else if (!_.contains(product.device_types, device)) {
            reasons.push(gettext('This app is unavailable for your platform.'));
        }

        product[COMPAT_REASONS] = reasons.length ? reasons : undefined;
        return product[COMPAT_REASONS];
    }
    nunjucks.require('globals').app_incompat = incompat;

    return {
        getInstalled: getInstalled,
        launch: launch,
        incompat: incompat,
        install: install,
        _use_compat_cache: function(val) {use_compat_cache = val;}
    };
});
