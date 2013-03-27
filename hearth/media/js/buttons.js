define('buttons', ['browser', 'format', 'l10n', 'z'], function(browser, format, l10n, z) {
    var gettext = l10n.gettext;

    function getButton(product) {
        // Look up button by its manifest URL.
        return $(format.format('.button[data-manifest_url="{0}"]', product.manifest_url));
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
        }
        z.apps[product.manifest_url] = z.state.mozApps[product.manifest_url] = installer;
        setButton($button, gettext('Launch'), 'launch install');
    }).on('app_purchase_error app_install_error', function(e, installer, product, msg) {
        revertButton($('button.installing'));
    }).on('buttons.overlay_dismissed', function() {
        // Dismissed error. Roll back.
        revertButton($('.button.error'));
    }).on('app_install_disabled', function(e, product) {
        // You're not using a compatible browser.
        var $button = $('.button.product'),
            $noApps = $('.no-apps'); // Reviewers page.

        setButton($button, $button.html(), 'disabled');

        if ($noApps.length) {
            $noApps.show();
        } else {
            $button.parent().append($('#noApps').html());
        }
    });
});
