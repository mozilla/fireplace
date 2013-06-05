define('buttons',
    ['browser', 'capabilities', 'format', 'l10n', 'tracking', 'utils', 'z'],
    function(browser, capabilities, format, l10n, tracking, utils, z) {

    var gettext = l10n.gettext;

    function getButton(product) {
        // Look up button by its manifest URL, excluding the feature profile.
        var manifest_url = utils.urlunparam(product.manifest_url, ['feature_profile']);
        return $(format.format('.button[data-manifest_url="{0}"]', manifest_url));
    }

    function setButton($button, text, cls) {
        if (cls == 'purchasing' || cls == 'installing') {
            // Save the old text of the button if we know we may revert later.
            $button.data('old-text', $button.html());
        }
        $button.html(text);
        if (!(cls == 'purchasing' || cls == 'installing')) {
            $button.removeClass('purchasing installing');
        }
        $button.addClass(cls);
    }

    function revertButton($button) {
        // Cancelled install/purchase. Roll back button to its previous state.
        $button.removeClass('purchasing installing error');
        if ($button.data('old-text')) {
            $button.html($button.data('old-text'));
        }
    }

    z.win.on('app_purchase_start', function(e, product) {
        setButton(getButton(product), gettext('Purchasing'), 'purchasing');
    }).on('app_purchase_success', function(e, product) {
        var $button = getButton(product);

        product['isPurchased'] = true;

        setButton($button, gettext('Purchased'), 'purchased');
    }).on('app_install_start', function(e, product) {
        var $button = getButton(product);
        setButton($button, '<span class="spin"></span>',
                  'installing');

        tracking.trackEvent(
            'Click to install app',
            product.price ? 'paid' : 'free',
            product.name + ':' + product.id,
            $('.button.product').index($button)
        );

        // Reset button if it's been 30 seconds without user action.
        setTimeout(function() {
            if ($button.hasClass('installing')) {
                revertButton($button);
            }
        }, 30000);
    }).on('app_install_success', function(e, installer, product, installedNow) {
        var $button = getButton(product);
        if (installedNow) {
            var $installed = $('#installed'),
                $how = $installed.find('.' + browser.platform);
            // Supported: Mac, Windows, or Linux.
            if ($how.length) {
                $installed.show();
                $how.show();
            }

            tracking.trackEvent(
                'Successful app install',
                product.price ? 'paid' : 'free',
                product.name + ':' + product.id,
                $('.button.product').index($button)
            );
        }
        z.apps[product.manifest_url] = z.state.mozApps[product.manifest_url] = installer;
        setButton($button, gettext('Launch'), 'launch install');
    }).on('app_purchase_error app_install_error', function(e, installer, product, msg) {
        revertButton($('button.installing, button.purchasing'));
    }).on('fragment_loaded loaded_more', function() {
        if (!capabilities.webApps) {
            $('.button.product').attr('disabled', true);
        }
        if (!capabilities.navPay) {
            $('.button.product.paid').attr('disabled', true);
        }

        var device = capabilities.device_type();
        $('.button.product:not([disabled])').each(function() {
            var $this = $(this);
            if (!$this.hasClass(device)) {
                $this.attr('disabled', true).addClass('incompatible');
            }
        });
    });
});
