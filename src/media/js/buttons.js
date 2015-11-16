define('buttons',
    ['apps', 'core/cache', 'core/capabilities', 'core/defer', 'core/format',
     'core/l10n', 'core/log', 'core/login', 'core/models', 'core/notification',
     'payments', 'core/requests', 'core/settings', 'tracking_events',
     'core/urls', 'core/user', 'core/utils', 'core/views', 'core/z'],
    function(apps, cache, caps, defer, format, l10n,
             log, login, models, notification,
             payments, requests, settings, trackingEvents,
             urls, user, utils, views, z) {
    var logger = log('buttons');
    var gettext = l10n.gettext;
    var appModel = models('app');

    z.page.one('iframe-install-loaded', function() {
        markBtnsAsInstalled();
    })

    .on('loaded loaded_more', function() {
        markBtnsAsInstalled();
    });

    z.doc.on('visibilitychange', function() {
        markBtnsAsUninstalled();
    });

    function _isAddon(product) {
      return (product.mini_manifest_url &&
              product.mini_manifest_url.indexOf('/extension/') !== -1);
    }

    function setInstallBtnState($button, css_class) {
        // Sets install button state (its text and its classes, which
        // currently determines its click handler).
        revertButton($button);
        $button.addClass(css_class);
    }

    function revertButton($button) {
        // Revert button from a state of installing or a state of being
        // installed.
        $button.removeClass('purchasing installing error spinning');
        $button.find('em').text(getBtnText(getAppFromBtn($button)));
    }

    function spinButton($button) {
        $button.data('old-text', $button.find('em').text())
               .addClass('spinning');
    }

    function getAppFromBtn($btn) {
        return appModel.lookup($btn.closest('[data-slug]').data('slug')) ||
               $btn.data('product');
    }

    function _handler(func) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();
            func.call(this, getAppFromBtn($(this)));
        };
    }

    var launchHandler = _handler(function(product) {
        apps.launch(product.manifest_url);
        trackingEvents.trackAppLaunch(product);
    });

    function install(product, $button, loginPopup) {
        logger.log('Install requested for', product.name);

        // TODO: Have the API possibly return this (bug 889501).
        product.receipt_required = (!!product.premium_type &&
                                    product.premium_type !== 'free' &&
                                    product.premium_type !== 'free-inapp');

        // If it's a paid app, ask the user to sign in first.
        if (product.receipt_required && !user.logged_in()) {
            logger.log('Purchase suspended; user needs to log in');

            // Create a blank window here so we can pass it to the login func;
            loginPopup = (!caps.navPay) ? utils.openWindow() : undefined;

            return login.login({popupWindow: loginPopup}).done(function() {
                // Once login completes, just call this function again with
                // the same parameters, but re-fetch the button (since the
                // button instance is not the same).
                var new_button = get_button(product.manifest_url);
                install(product, new_button, loginPopup);
            }).fail(function(){
                logger.log('Purchase cancelled; login aborted');
                notification.notification({message: gettext('Payment cancelled.')});
                if (loginPopup) {
                    loginPopup.close();
                }
            });
        }

        // If there isn't a user object on the app, add one.
        if (!product.user) {
            console.warn('User data not available for', product.name);
            product.user = {
                purchased: false,
                installed: false,
                developed: false
            };
        }

        // Create a master deferred for the button action.
        var def = defer.Deferred();

        // Create a reference to the button.
        $button = $button || $(this);
        var _timeout;

        // If the user has already purchased the app, we do need to generate
        // another receipt but we don't need to go through the purchase flow again.
        if (product.id && user.has_purchased(product.id)) {
            product.payment_required = false;
        }

        if (product.payment_required) {
            // The app requires a payment.
            logger.log('Starting payment flow for', product.name);

            // Save the old text of the button.
            $button.data('old-text', $button.find('em').text());
            setInstallBtnState($button, 'purchasing');

            var purchaseOpts = {
                // This will be undefined unless a window was created
                paymentWindow: loginPopup,
            };

            payments.purchase(product, purchaseOpts).then(function() {
                logger.log('Purchase flow completed for', product.name);

                // Update the cache to show that the app was purchased.
                user.update_purchased(product.id);

                // Update the button to say Install.
                setInstallBtnState($button, 'purchased');
                // Save the old text of the button.
                $button.data('old-text', $button.find('em').text());

                // Bust the cache for the My Apps page.
                cache.bust(urls.api.url('installed'));
                // Rewrite the cache to allow the user to review the app.
                cache.attemptRewrite(function(key) {
                    return key === urls.api.params('reviews', {app: product.slug});
                }, function(data) {
                    data.user.can_rate = true;
                    return data;
                });

                def.always(function() {
                    // Reload to show reviews privilege changes (bug 838848).
                    views.reload();
                });

                // Start the app's installation.
                start_install();
            }, function() {
                notification.notification({message: gettext('Payment cancelled.')});
                logger.log('Purchase flow rejected for', product.name);
                def.reject();
            }).always(function() {
                if (loginPopup) {
                    // If we created popup for login and re-used it for payment
                    // we now need to close it.
                    logger.log('Closing the popup window');
                    loginPopup.close();
                }
            });
        } else {
            // If a popup was kept open for payments we don't need it
            // now we're starting the install.
            if (loginPopup) {
                logger.log('Closing the popup');
                loginPopup.close();
            }
            // There's no payment required, just start install.
            logger.log('Starting app installation for', product.name);
            // Start the app's installation.
            start_install();
        }

        function start_install() {
            trackingEvents.trackAppInstallBegin($button);

            // Make the button a spinner.
            spinButton($button);

            // Temporary timeout for hosted apps until we catch the appropriate
            // download error event for hosted apps (in iframe).
            if (!product.is_packaged && !product.payment_required) {
                _timeout = setTimeout(function() {
                    if ($button.hasClass('spinning')) {
                        logger.log('Spinner timeout for ', product.name);
                        revertButton($button);
                        notification.notification({
                            message: gettext('Sorry, we had trouble fetching this app\'s data. Please try again later.')
                        });
                    }
                }, 25000);
            }

            // If the app has already been installed by the user and we don't
            // need a receipt, just start the app install.
            if (product.id && user.has_installed(product.id) && !product.receipt_required) {
                logger.log('Receipt not required (skipping record step) for', product.name);
                return do_install();
            }

            // This is the data needed to record the app's install.
            var api_endpoint = urls.api.url('record_' + (product.receipt_required ? 'paid' : 'free'));
            var post_data = {app: product.id, chromeless: +caps.chromeless};

            // If we don't need a receipt to perform the installation...
            if (!product.receipt_required) {
                // Do the install immediately.
                do_install().done(function() {
                    // ...then record the installation if necessary.
                    if (product.role !== 'langpack' && !_isAddon(product)) {
                        requests.post(api_endpoint, post_data);
                        // We don't care if it fails or not because the user
                        // has already installed the app.
                    }
                });
                return;
            }

            // Let the API know we're installing.
            requests.post(api_endpoint, post_data).done(function(response) {
                // If the server returned an error, log it and reject the deferred.
                if (response.error) {
                    logger.log('Server returned error: ' + response.error);
                    def.reject();
                    return;
                }

                do_install({data: {'receipts': [response.receipt]}});

            }).fail(function() {
                // L10n: App's install failed, but problem is temporary.
                notification.notification({
                    message: gettext('Install failed. Please try again later.')
                });

                // Could not record/generate receipt!
                console.error('Could not generate receipt or record install for', product.name);
                def.reject();
            });
        }

        function do_install(data) {
            return apps.install(product, data || {}).done(function(installer) {
                if (product.id) {
                    // Update the cache to show that the user installed the app.
                    user.update_install(product.id);
                    // Bust the cache for the My Apps page.
                    cache.bust(urls.api.url('installed'));
                }

                def.resolve(installer, product, $button);
            }).fail(function(error) {
                if (error) {
                    notification.notification({message: error});
                }
                logger.log('App install deferred was rejected for ',
                           product.name);
                def.reject();
            });
        }

        // After everything has completed, carry out post-install logic.
        def.then(function(installer) {
            // Clear the spinner timeout if one was set.
            if (_timeout) {
                clearTimeout(_timeout);
            }

            // Show the box on how to run the app.
            var $postInstallMsg = $('.post-install-message').show();
            var $postInstallMsgPlat = $postInstallMsg.find(
                '.post-install-message-' + caps.os.slug);
            if ($postInstallMsgPlat.length) {
                $postInstallMsg.show();
                $postInstallMsgPlat.show();
            }

            setTimeout(function() {
                // Pass the manifest_url and not the button in case there are
                // multiple instances of the same button on the page.
                mark_installed(product.manifest_url);
            });
            trackingEvents.trackAppInstallSuccess($button);
            logger.log('Successful install for', product.name);
        }, function() {
            revertButton($button);
            trackingEvents.trackAppInstallFail($button);
            logger.log('Unsuccessful install for', product.name);
        });

        return def.promise();
    }

    z.page.on('click', '.mkt-app-button.launch', launchHandler)
    .on('click', '.mkt-app-button--install:not(.launch):not(.incompatible)',
        _handler(install))
    .on('click', '.mkt-app-button--install[disabled]', function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
    .on('click', '.mkt-app-button[href], .mkt-website-link[href]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.open(this.getAttribute('href'), '_blank');
    });

    function get_button(manifest_url) {
        return $('.mkt-app-button[data-manifest_url="' +
                 manifest_url.replace(/"/, '\\"') + '"]');
    }

    function mark_installed(manifest_url, $btn) {
        $btn = $btn || get_button(manifest_url);
        var app = getAppFromBtn($btn);

        if (app.role == 'langpack') {
            $btn.attr('disabled', true).find('em').text(gettext('Installed'));
        } else if (_isAddon(app)) {
            $btn.removeClass('spinning')
                .attr('disabled', true)
                .find('em')
                .text(gettext('Installed'));
        } else {
            setInstallBtnState($btn, 'launch install');
        }
    }

    function markBtnsAsInstalled() {
        /*
            For each install button, check if its manifest URL is installed
            according to mozApps. If so, mark it as installed to say Open.
            This is more scalable than looping through all installed apps,
            querying the DOM for each manifest URL, and checking if its
            installed.
        */
        if (!caps.webApps) {
            return;
        }
        apps.getInstalled().done(function(installedApps) {
            // Create a map to get O(1) lookup.
            var installedAppsMap = {};
            installedApps.forEach(function(installedApp) {
                installedAppsMap[installedApp.replace(/"/, '\\"')] = true;
            });
            setTimeout(function() {
                // Loop through every install button on page to see if
                // installed using the map.
                var btns = document.querySelectorAll('.install');
                for (var i = 0; i < btns.length; i++) {
                    if (installedAppsMap[btns[i].dataset.manifest_url]) {
                        mark_installed(null, $(btns[i]));
                    }
                }
            });
        });
    }

    function markBtnsAsUninstalled() {
        /* If an app was uninstalled, revert state of install buttons from
           "Launch" to "Install". */
        if (!caps.webApps) {
            return;
        }
        apps.getInstalled().done(function(installedApps) {
            $('.install').each(function(i, button) {
                var $button = $(button);
                // For each install button, check if respective app is installed.
                if (z.apps.indexOf($button.data('manifest_url')) === -1) {
                    // If it is no longer installed, revert button.
                    if ($button.hasClass('launch')) {
                        revertButton($button);
                    }
                    $button.removeClass('launch');
                }
            });
        });
    }

    function transform(product) {
        product = apps.transform(product);

        if (product.isWebsite) {
            // Return here, don't need extra information for websites.
            return product;
        }

        var manifest_url = (product.isAddon ? product.mini_manifest_url :
                            product.manifest_url);
        var incompatible = apps.incompat(product);
        var installed = z.apps.indexOf(manifest_url) !== -1;

        if (product.isLangpack) {
            return _.extend(product, {
                disabled: incompatible || installed,
            });
        }

        var free = settings.meowEnabled ? gettext('free') : gettext('Free');
        var isFree = !(product.price && product.price != '0.00');
        var priceText = isFree ? free : product.price_locale;

        if (product.payment_required && !product.price) {
            priceText = gettext('Unavailable');
        }

        return _.extend(product, {
            disabled: incompatible,
            incompatible: incompatible,
            installed: installed,
            installedBefore: user.has_installed(product.id) ||
                             user.has_purchased(product.id),
            isFree: isFree,
            priceText: priceText
        });
    }

    function getBtnText(app) {
        app = transform(app);

        if (app.isLangpack) {
            return app.installed ? gettext('Installed') : gettext('Install');
        }

        if (app.isAddon) {
          return (app.installed ? gettext('Installed') :
                  gettext('Install Add-on'));
        }

        if (settings.meowEnabled) {
            if (app.isWebsite) {
              return gettext('Open website');
            }
            if (app.installed) {
              return gettext('Open app');
            } else if (app.isFree) {
              return gettext('Install for free');
            } else if (user.has_purchased(app.id)) {
              return gettext('Install');
            } else {
                return format.format(gettext('Install for {price}'), {
                    price: app.priceText
                });
            }
        } else {
            if (app.installed) {
                return gettext('Open');
            } else if (user.has_installed(app.id)) {
                return gettext('Install');
            } else {
                return app.priceText;
            }
        }
    }

    return {
        getBtnText: getBtnText,
        install: install,
        markBtnsAsInstalled: markBtnsAsInstalled,
        markBtnsAsUninstalled: markBtnsAsUninstalled,
        revertButton: revertButton,
        spinButton: spinButton,
        transform: transform
    };
});
