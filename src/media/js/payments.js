define('payments',
    ['core/capabilities', 'core/defer', 'fxpay', 'core/l10n', 'core/log', 'core/notification', 'core/requests', 'core/settings', 'underscore', 'core/urls', 'core/z'],
    function(caps, defer, fxpay, l10n, log, notification, requests, settings, _, urls, z) {

    var logger = log('payments');
    var notify = notification.notification;
    var gettext = l10n.gettext;
    var fxpayLog = log('fxpay');


    function MarketplaceAdapter() {
        //
        // fxpay adapter for making app purchases.
        //
    }

    MarketplaceAdapter.prototype.configure = function(/* fxpaySettings */) {
        //
        // A hook to make changes to the adapter when fxpay settings are changed.
        //
        logger.log('configuring Firefox Marketplace app adapter');
    };

    MarketplaceAdapter.prototype.toString = function() {
      return '[MarketplaceAdapter from payments.js]';
    };

    MarketplaceAdapter.prototype.startTransaction = function(opt, callback) {
        //
        // Start a transaction.
        //
        opt = _.defaults({}, opt, {
            productId: null,
        });
        logger.log('adapter: starting transaction for product', opt.productId);

        requests.post(urls.api.url('prepare_nav_pay'), {app: opt.productId}).done(function(result) {
            logger.log('Calling fxpay with JWT: ', result.webpayJWT);
            callback(null, {productJWT: result.webpayJWT,
                            productId: opt.productId,
                            productData: result});
        }).fail(function(xhr, status, error) {
            if (error === 409) {
                logger.warn('App already purchased (409 from API)');
                // This error code means the user has already purchased the app.
                return callback('APP_ALREADY_PURCHASED');
            }
            logger.error('Error fetching JWT from API: ', status, error);
            callback('MKT_SERVER_ERROR');
        });
    };

    MarketplaceAdapter.prototype.transactionStatus = function(transData, callback) {
        //
        // Get the status of a transaction.
        //
        var productInfo = {
            productId: transData.productId,
        };

        logger.log('Fetching payment status of ' + transData.productId + ' from API...');
        var urlPath = urls.api.sign(transData.productData.contribStatusURL);
        // The `true` passed to `requests.get` disables caching.
        requests.get(settings.api_url + urlPath, true).done(function(result) {
            logger.log('Got payment status: ', transData.productId, ':', result.status);
            if (result.status == 'complete') {
                logger.log('Payment complete.');
                callback(null, true, productInfo);
            } else {
                callback(null, false);
            }
        }).fail(function(xhr, status, error) {
            logger.error('Error fetching payment status: ', transData.productId, status, error);
            callback('MKT_SERVER_ERROR');
        });
    };

    var extraProviderUrls = {};
    if (settings.dev_pay_providers) {
        // This is typically populated by Zamboni's commonplace view.
        extraProviderUrls = settings.dev_pay_providers;
    }
    // This is a chance for a local JS-only config to allow arbitrary providers.
    extraProviderUrls = _.defaults(extraProviderUrls,
                                   settings.local_pay_providers || {});

    fxpay.configure({
        adapter: new MarketplaceAdapter(),
        log: {
            error: fxpayLog.error,
            log: fxpayLog.log,
            warn: fxpayLog.warn,
            // D'oh. These aren't implemented.
            info: fxpayLog.log,
            debug: fxpayLog.log,
        },
        extraProviderUrls: extraProviderUrls,
    });


    function beginPurchase(product, opt) {
        opt = _.defaults({}, opt, {
            fxpaySettings: null,
        });
        var purchase = defer.Deferred();

        if (!product || !product.payment_required) {
            return purchase.resolve(product).promise();
        }

        logger.log('Initiating transaction');

        if (opt.fxpaySettings) {
            fxpay.configure(opt.fxpaySettings);
        }

        fxpay.purchase(product.slug, {
            paymentWindow: opt.paymentWindow,
        }).then(function(purchasedProduct) {
            logger.log('payment completed successfully for', purchasedProduct.productId);
            purchase.resolve(product);
        }).catch(function(error) {
            var msg;
            logger.error('fxpay error:', error.toString());
            var errorCode = error.code || error;
            if (errorCode === 'APP_ALREADY_PURCHASED') {
                return purchase.resolve(product);
            }
            switch (errorCode) {
                // Sent from webpay.
                case 'USER_CANCELLED':
                // Sent from the trusted-ui on cancellation.
                case 'DIALOG_CLOSED_BY_USER':
                    msg = gettext('Payment cancelled.');
                    break;
                case 'MKT_SERVER_ERROR':
                    // L10n: This error is raised when we are unable to fetch a JWT from the payments API.
                    msg = gettext('Error while communicating with server. Try again later.');
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

            purchase.reject(null, product, 'MKT_CANCELLED');
        }).catch(function(error) {
            logger.error('uncaught exception:', error.toString());
            purchase.reject(null, product, 'MKT_CANCELLED');
        });

        return purchase.promise();
    }

    return {
        'purchase': beginPurchase,
        'utils': fxpay.utils
    };
});
