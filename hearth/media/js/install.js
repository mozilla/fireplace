// Hey there! I know how to install apps. Buttons are dumb now.

define('install',
    ['apps', 'cache', 'capabilities', 'jquery', 'login', 'notification', 'payments/payments', 'requests', 'urls', 'user', 'z'],
    function(apps, cache, caps, $, login, notification, payments, requests, urls, user, z) {
    'use strict';

    function _handler(func) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();
            func($(this).closest('[data-product]').data('product'));
        }
    }

    var launchHandler = _handler(function(product) {
        z.apps[product.manifest_url].launch();
    });

    var installHandler = _handler(startInstall);

    function startInstall(product) {
        if (product.price && !user.logged_in()) {
            console.log('Install suspended; user needs to log in');
            return login.login().done(function() {
                startInstall(product);
            });
            return;
        }

        if (product.price) {
            return purchase(product);
        } else {
            return install(product);
        }
    }

    function purchase(product) {
        z.win.trigger('app_purchase_start', product);
        return $.when(payments.purchase(product))
                .done(purchaseSuccess)
                .fail(purchaseError);
    }

    function purchaseSuccess(product, receipt) {
        // Firefox doesn't successfully fetch the manifest unless I do this.
        z.win.trigger('app_purchase_success', [product]);
        setTimeout(function() {
            install(product);
        }, 0);

        // Bust the cache
        cache.bust(urls.api.url('purchases'));
    }

    function purchaseError(product, msg) {
        z.win.trigger('app_purchase_error', [product, msg]);
    }

    function install(product, receipt) {
        var data = {};
        var post_data = {
            app: product.id,
            chromeless: caps.chromeless ? 1 : 0
        };

        z.win.trigger('app_install_start', product);

        function do_install() {
            return $.when(apps.install(product, data))
                    .done(installSuccess)
                    .fail(installError);
        }

        if (!product.recordUrl) {
            return do_install();
        } else {
            var def = $.Deferred();
            requests.post(urls.api.url('record'), post_data).done(function(response) {
                if (response.error) {
                    $('#pay-error').show().find('div').text(response.error);
                    installError(product);
                    def.reject();
                    return;
                }
                if (response.receipt) {
                    data.data = {'receipts': [response.receipt]};
                }
                do_install().done(def.resolve).fail(def.reject);
            }).fail(function() {
                // Could not record/generate receipt!
                installError(null, product);
                def.reject();
            });
            return def;
        }
    }

    function installSuccess(installer, product) {
        z.win.trigger('app_install_success', [installer, product, true]);

        // Bust the cache
        cache.bust(urls.api.url('purchases'));
    }

    function installError(installer, product, msg) {
        console.log('error: ' + msg);

        switch (msg) {
            // mozApps error codes, defined in
            // https://developer.mozilla.org/en-US/docs/Apps/Apps_JavaScript_API/Error_object
            case 'MKT_CANCELLED':
            case 'DENIED':
            case 'MANIFEST_URL_ERROR':
            case 'NETWORK_ERROR':
            case 'MANIFEST_PARSE_ERROR':
            case 'INVALID_MANIFEST':
                break;
            // Marketplace specific error codes.
            default:
                notification.notification({
                    message: gettext('Install failed. Please try again later.')
                });
                break;
        }

        z.win.trigger('app_install_error', [installer, product, msg]);
    }

    z.page.on('click', '.product.launch', launchHandler)
          .on('click', '.button.product:not(.launch):not(.incompatible)', installHandler);
    z.body.on('logged_in', function() {
        if (localStorage.getItem('toInstall')) {
            var lsVal = localStorage.getItem('toInstall');
            localStorage.removeItem('toInstall');
            var product = $(format('.product[data-manifest_url="{0}"]',
                                   lsVal)).data('product');
            if (product) {
                startInstall(product);
            }
        }
    });
});
