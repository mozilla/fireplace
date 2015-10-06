/*
    Provides the apps module, a wrapper around navigator.mozApps
*/
define('apps',
    ['categories', 'core/capabilities', 'core/defer', 'installer_direct',
     'installer_iframe', 'installer_mock', 'core/l10n', 'core/nunjucks',
     'core/settings', 'underscore', 'core/urls', 'core/utils', 'core/z'],
    function(categories, capabilities, defer, installer_direct,
             installer_iframe, InstallerMock, l10n, nunjucks,
             settings, _, urls, utils, z) {
    'use strict';
    var gettext = l10n.gettext;
    var installer;
    var installer_def = defer.Deferred();

    /*
      Determine which installer to use.

      We *need* to use https://m.f.c. origin to install apps.
      - In the packaged app, protocol is app:, we need to use the iframe
        installer to get the right origin.
      - In the iframed app or browser, protocol is https:, we can use the
        direct installer as the origin should already be the right one.
      - When testing locally, the protocol is https: or http:, we also use the
        direct installer, it makes things simpler to test.
    */
    if (window.location.protocol === 'app:') {
        installer = installer_iframe;
        installer.initialize_iframe();
        z.page.one('iframe-install-loaded', function() {
            installer_def.resolve();
        });
    } else if (capabilities.phantom || settings.mockWebApps) {
        installer = new InstallerMock();
        installer_def.resolve();
    } else {
        installer = installer_direct;
        installer_def.resolve();
    }

    function install(product, opt) {
        /*
           apps.install(manifest_url, options)

           This requires at least one apps-error-msg div to be present.

           See also: https://developer.mozilla.org/docs/DOM/Apps.install

           data -- optional dict to pass as navigator.apps.install(url, data)
           success -- optional callback for when app installation was successful
           error -- optional callback for when app install resulted in error
           navigator -- something other than global navigator, for testing
        */
        var def = defer.Deferred();

        // Bug 996150 for packaged Marketplace installing packaged apps.
        installer.install(product, opt).done(function(result, product) {
            z.page.trigger('install-success', {slug: product.slug});
            def.resolve(result, product);
            if (z.apps.indexOf(product.manifest_url) === -1) {
                z.apps.push(product.manifest_url);
            }
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

    function checkForUpdate(manifestURL) {
        return installer.checkForUpdate(manifestURL);
    }

    function applyUpdate(manifestURL) {
        return installer.applyUpdate(manifestURL);
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
        if (product.payment_required && !product.price) {
            reasons.push(gettext('not available for your region'));
        }
        if (!product.isWebsite && !capabilities.webApps ||
            (!capabilities.packagedWebApps && product.is_packaged) ||
            !_.contains(product.device_types, device)) {
            reasons.push(gettext('not available for your platform'));
        }

        product[COMPAT_REASONS] = reasons.length ? reasons : undefined;
        return product[COMPAT_REASONS];
    }

    function transform(product) {
        if (product.__transformed) {
            return product;
        }
        if (product.categories) {
            // Transform categories to get a list of objects instead of a list
            // of slugs, to be able to display the translated category names
            // on the detail page.
            product.categories = categories.filter(function(category) {
                return product.categories.indexOf(category.slug) !== -1;
            }).map(function(category) {
                return _.extend({url: urls.reverse('category', [category.slug])},
                                category);
            });
        }

        // Normalize content types.
        if (product.url) {
            product.isWebsite = true;
            product.previews = [];
            product.contentType = 'website';
            product.key = product.id;
        } else {
            product.isApp = true;
            product.contentType = 'app';
            product.short_name = product.name;
            product.key = product.slug;
        }

        product.__transformed = true;
        return product;
    }

    return {
        applyUpdate: applyUpdate,
        checkForUpdate: checkForUpdate,
        getInstalled: getInstalled,
        incompat: incompat,
        install: install,
        launch: launch,
        promise: installer_def.promise(),
        installer: installer,
        transform: transform,
        _use_compat_cache: function(val) {
            use_compat_cache = val;
        }
    };
});
