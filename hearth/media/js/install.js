// Hey there! I know how to install apps. Buttons are dumb now.

define(
    ['apps', 'capabilities', 'payments/payments', 'requests', 'user', 'z'],
    function(apps, caps, payments, requests, user, z) {
    'use strict';

    function launchHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        var product = $(this).closest('[data-product]').data('product');
        z.apps[product.manifest_url].launch();
    }

    function installHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        var product = $(this).closest('[data-product]').data('product');
        startInstall(product);
    }

    function startInstall(product) {
        if (product.price != '0.00' && !user.logged_in()) {
            localStorage.setItem('toInstall', product.manifest_url);
            z.win.trigger('login', true);
            console.log('Install suspended; user needs to log in');
            return;
        }

        if (product.price != '0.00') {
            purchase(product);
        } else {
            install(product);
        }
    }

    function purchase(product) {
        z.win.trigger('app_purchase_start', product);
        $.when(payments.purchase(product))
         .done(purchaseSuccess)
         .fail(purchaseError);
    }

    function purchaseSuccess(product, receipt) {
        // Firefox doesn't successfully fetch the manifest unless I do this.
        z.win.trigger('app_purchase_success', [product]);
        setTimeout(function() {
            install(product);
        }, 0);
    }

    function purchaseError(product, msg) {
        z.win.trigger('app_purchase_error', [product, msg]);
    }

    function install(product, receipt) {
        var data = {};
        var post_data = {
            src: product.src,
            device_type: caps.getDeviceType()
        };
        if (caps.chromeless) {
            post_data.chromeless = 1;
        }

        z.win.trigger('app_install_start', product);

        function do_install() {
            $.when(apps.install(product, data))
                 .done(installSuccess)
                 .fail(installError);
        }

        if (!product.recordUrl) {
            do_install();
        } else {
            requests.post(product.recordUrl, post_data).done(function(response) {
                if (response.error) {
                    $('#pay-error').show().find('div').text(response.error);
                    installError(product);
                    return;
                }
                if (response.receipt) {
                    data.data = {'receipts': [response.receipt]};
                }
                do_install();
            }).fail(function() {
                // Could not record/generate receipt!
                installError(null, product);
            });
        }
    }

    function installSuccess(installer, product) {
        z.win.trigger('app_install_success', [installer, product, true]);
    }

    function installError(installer, product, msg) {
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
