define('apps_buttons',
    ['apps', 'core/cache', 'core/capabilities', 'core/defer', 'core/l10n',
     'core/log', 'core/login', 'core/models', 'core/notification', 'payments',
     'core/requests', 'core/settings', 'tracking_events', 'core/urls',
     'core/user', 'core/utils', 'core/views', 'core/z'],
    function(apps, cache, caps, defer, l10n,
             log, login, models, notification, payments,
             requests, settings, trackingEvents, urls, user, utils,
             views, z) {
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

    function setInstallBtnState($button, text, cls) {
        // Sets install button state (its text and its classes, which
        // currently determines its click handler).
        revertButton($button, text);
        $button.addClass(cls);
    }

    function revertButton($button, text) {
        // Revert button from a state of installing or a state of being
        // installed.
        $button.removeClass('purchasing installing error spinning');
        text = text || $button.data('old-text');
        $button.find('em').text(text);
    }

    function _handler(func) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Fetch the product from either model cache or data attr.
            var $btn = $(this);
            var product = appModel.lookup($btn.closest('[data-slug]').data('slug')) ||
                          $btn.data('product');
            func.call(this, product);
        };
    }

    var launchHandler = _handler(function(product) {
        apps.launch(product.manifest_url);
        trackingEvents.trackAppLaunch(product);
    });

    function install(product, $button, loginPopup) {
        logger.log('Install requested for', product.name);

        // TODO: Have the API possibly return this (bug 889501).
        product.receipt_required = (product.premium_type !== 'free' &&
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
            $this.data('old-text', $this.find('em').text());
            setInstallBtnState($button, gettext('Purchasing'), 'purchasing');

            var purchaseOpts = {
                // This will be undefined unless a window was created
                paymentWindow: loginPopup,
            };

            payments.purchase(product, purchaseOpts).then(function() {
                logger.log('Purchase flow completed for', product.name);

                // Update the button to say Install.
                setInstallBtnState($button, gettext('Install'), 'purchased');
                // Save the old text of the button.
                $this.data('old-text', $button.find('em').text());

                // Update the cache to show that the app was purchased.
                user.update_purchased(product.id);

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
            $button.data('old-text', $button.find('em').text())
                 .addClass('spinning');

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
                    if (product.role !== 'langpack') {
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

    z.page.on('click', '.product.launch', launchHandler)
          .on('click', '.button.product:not(.launch):not(.incompatible)',
              _handler(install));

    function get_button(manifest_url) {
        return $('.button[data-manifest_url="' + manifest_url.replace(/"/, '\\"') + '"]');
    }

    function mark_installed(manifest_url, $button) {
        var text;
        if (manifest_url) {
            logger.log('Marking as installed', manifest_url);
            $button = get_button(manifest_url);
        }
        if ($button.data('price-only')) {
            // Feed only want to show price and not install status.
            return;
        }
        if ($button.data('product').role === 'langpack') {
            // Never show the 'Open' text for installed langpacks. Instead, say
            // "Installed" and disable it.
            text = gettext('Installed');
            $button.prop('disabled', true);
        } else {
            // L10n: "Open" as in "Open the app".
            text = gettext('Open');
        }
        setInstallBtnState($button, text, 'launch install');
    }

    function markBtnsAsInstalled() {
        /* For each installed app, look for respective buttons and mark as
           ready to launch ("Open"). */
        if (!caps.webApps) {
            return;
        }
        apps.getInstalled().done(function(installedApps) {
            setTimeout(function() {
                for (var i = 0; i < installedApps.length; i++) {
                    $button = get_button(installedApps[i]);
                    if ($button.length) {
                        mark_installed(null, $button);
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
                        revertButton($button, gettext('Install'));
                    }
                    $button.removeClass('launch');
                }
            });
        });
    }

    return {
        install: install,
        markBtnsAsInstalled: markBtnsAsInstalled,
        markBtnsAsUninstalled: markBtnsAsUninstalled,
    };
});
