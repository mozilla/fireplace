define('payments/payments',
    ['capabilities', 'defer', 'l10n', 'log', 'notification', 'requests', 'settings', 'urls', 'z'],
    function(caps, defer, l10n, log, notification, requests, settings, urls, z) {

    var console = log('payments');

    var notify = notification.notification;
    var gettext = l10n.gettext;

    function waitForPayment($def, product, webpayJWT, contribStatusURL) {
        console.log('Waiting for payment confirmation for ', product.name);
        var checkFunc = function() {
            console.log('Fetching payment status of ' + product.name + ' from API...');
            // The `true` passed to `requests.get` disables caching.
            requests.get(settings.api_url + urls.api.sign(contribStatusURL), true).done(function(result) {
                console.log('Got payment status: ', product.name, ':', result.status);
                if (result.status == 'complete' || settings.simulate_nav_pay) {
                    console.log('Payment complete. Resolving deferreds...');
                    $def.resolve(product);
                }
            }).fail(function(xhr, status, error) {
                console.error('Error fetching payment status: ', product.name, status, error);
                $def.reject(null, product, 'MKT_SERVER_ERROR');
            });
        };
        var checker = setInterval(checkFunc, 3000);
        var giveUp = setTimeout(function() {
            console.error('Payment took too long to complete. Rejecting: ', product.name);
            $def.reject(null, product, 'MKT_INSTALL_ERROR');
        }, 60000);

        checkFunc();

        $def.always(function() {
            console.log('Clearing payment timers for: ', product.name);
            clearInterval(checker);
            clearTimeout(giveUp);
        });
    }

    navigator.fakeMozPay = function(jwts) {
        var console_mock = console.tagged('mock');
        var request = {
            onsuccess: function() {
                console_mock.warning('handler did not define request.onsuccess');
            },
            onerror: function() {
                console_mock.warning('handler did not define request.onerror');
            }
        };
        console_mock.log('STUB navigator.mozPay received', jwts);
        console_mock.log('calling onsuccess() in 3 seconds...');
        setTimeout(function() {
            console_mock.log('calling onsuccess()');
            request.onsuccess();
            //request.onerror.call({error: {name: 'DIALOG_CLOSED_BY_USER'}});
        }, 3000);
        return request;
    };

    function beginPurchase(product) {
        var $def = defer.Deferred();

        if (!product || !product.payment_required) {
            return $def.resolve(product).promise();
        }

        console.log('Initiating transaction');

        if (caps.navPay || settings.simulate_nav_pay) {
            requests.post(urls.api.url('prepare_nav_pay'), {app: product.slug}).done(function(result) {
                console.log('Calling mozPay with JWT: ', result.webpayJWT);
                var request;
                if (caps.navPay && !settings.simulate_nav_pay) {
                    request = navigator.mozPay([result.webpayJWT]);
                } else {
                    request = navigator.fakeMozPay([result.webpayJWT]);
                }
                request.onsuccess = function() {
                    console.log('navigator.mozPay success');
                    waitForPayment($def, product, result.webpayJWT, result.contribStatusURL);
                };
                request.onerror = function(errorMsg) {
                    var msg;
                    console.error('`navigator.mozPay` error:', this.error.name);
                    switch (this.error.name) {
                        // Sent from webpay.
                        case 'USER_CANCELLED':
                        // Sent from the trusted-ui on cancellation.
                        case 'DIALOG_CLOSED_BY_USER':
                            msg = gettext('Payment cancelled.');
                            break;
                        default:
                            msg = gettext('Payment failed. Try again later.');
                            break;
                    }

                    notify({
                        classes: 'error',
                        message: msg,
                        timeout: 5000
                    });

                    $def.reject(null, product, 'MKT_CANCELLED');
                };
            }).fail(function(xhr, status, error) {
                if (error === 409) {
                    console.warn('App already purchased (409 from API)');
                    // This error code means the user has already purchased the app.
                    $def.resolve(product);
                    return;
                }
                console.error('Error fetching JWT from API: ', status, error);
                // L10n: This error is raised when we are unable to fetch a JWT from the payments API.
                notify({message: gettext('Error while communicating with server. Try again later.')});
                $def.reject(null, product, 'MKT_SERVER_ERROR');
            });

        } else {
            console.error('`navigator.mozPay` unavailable and mocking disabled. Cancelling.');
            // L10n: When a user tries to make a purchase from a device that does not support payments, this is the error.
            notify({message: gettext('Your device does not support purchases.')});
            $def.reject(null, product, 'MKT_CANCELLED');
        }

        return $def.promise();
    }

    return {
        'purchase': beginPurchase
    };
});
