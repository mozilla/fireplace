define('tests/unit/payments',
    ['fxpay', 'core/defer', 'core/log', 'tests/unit/helpers'],
    function(realFxPay, defer, log, h) {

    var logger = log('tests/payments');

    function FakeRequests() {
        this.webpayJWT = this._makeJWT({typ: 'mozilla/payments/pay/v1'});
        this.promiseToPost = null;
    }

    FakeRequests.prototype._makeJWT = function(payRequest) {
        if (!payRequest) {
            payRequest = {typ: 'mozilla/payments/pay/v1'};
        }
        return '<algo>.' + btoa(JSON.stringify(payRequest)) + '.<sig>';
    };

    FakeRequests.prototype.post = function() {
        // When the Fireplace adapter posts to the API it is generating a
        // JWT to begin the purchase.
        var response = {
            webpayJWT: this.webpayJWT,
            productId: '<productId>',
            contribStatusURL: '/transaction/status',
        };
        if (!this.promiseToPost) {
            this.promiseToPost = defer.Deferred().resolve(response).promise();
        }
        return this.promiseToPost;
    };

    FakeRequests.prototype.get = function() {
        // When the Fireplace adapter makes a get request it is checking the
        // status of the transaction.
        var response = {
            // The transaction has been verified and has completed successfully.
            status: 'complete',
        };
        return defer.Deferred().resolve(response).promise();
    };


    function setupMocks(opts) {
        opts = opts || {};
        var requests = new FakeRequests();
        if (opts.requests) {
            if (opts.requests.postStatus) {
                requests.promiseToPost = defer.Deferred()
                                            .reject({}, null,
                                                    opts.requests.postStatus)
                                            .promise();
            }
            if (opts.requests.get === null) {
                requests.get = function() {
                    throw new Error('no need to GET transaction status ' +
                                    'because the app has already been ' +
                                    'purchased');
                };
            }
            if (opts.requests.jwtTyp) {
                requests.webpayJWT = requests._makeJWT({
                    typ: opts.requests.jwtTyp
                });
            }
        }
        return h.injector(
            h.mockSettings(opts.settings)
        ).mock({
            'core/requests': requests,
            'core/notification': {notification: function() {}},
        });
    }


    function PaymentWindow() {
        this.location = '';
        this.closed = false;
        this.close = function() {};
    }


    function FakeFireplaceWindow() {
        this.origin = 'https://marketplace.firefox.com';
        this.open = function() {
            this.paymentWindow = new PaymentWindow();
            return this.paymentWindow;
        };
        this.addEventListener = function(eventType, handler) {
            logger.log('calling handler for:', eventType);
            // Simulate Webpay's postMessage back to fxpay.
            handler({
                origin: this.origin,
                data: {
                    // Indicate that the user payment flow is
                    // finished. Next fxpay will verify the transaction.
                    status: 'ok',
                }
            });
        };
        this.removeEventListener = function() {};
    }

    function FakeProduct() {
        this.slug = 'some-slug';
        this.payment_required = true;
    }


    function purchaseOptions(opt) {
        opt = opt || {};
        return {
            fxpaySettings: {
                mozApps: null,
                mozPay: null,
                window: opt.fakeWindow || new FakeFireplaceWindow(),
            }
        };
    }


    describe('payments', function() {

        it('completes payment successfully', function(done) {
            setupMocks().require(['payments'], function(payments) {
                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions()).done(function() {
                    logger.log('payment.purchase() is done');
                    done();
                }).fail(function(_, product, reason) {
                    logger.error('payment.purchase() failed:', reason);
                    done(new Error(reason));
                });
            });
        });

        it('handles double purchase', function(done) {
            setupMocks({
                requests: {
                    postStatus: 409,
                    get: null,
                }
            }).require(['payments'], function(payments) {
                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions()).done(function() {
                    logger.log('payment.purchase() is done');
                    done();
                }).fail(function(_, product, reason) {
                    logger.error('payment.purchase() failed:', reason);
                    done(new Error(reason));
                });
            });
        });

        it('defines a configurable adapter', function(done) {
            var adapterConfigured = false;

            setupMocks().mock('fxpay', {
                configure: function(opt) {
                    // This simulates how fxpay will configure
                    // the Marketplace adapter.
                    opt.adapter.configure({});
                    adapterConfigured = true;
                },
            }).require(['payments'], function(payments) {
                assert.equal(adapterConfigured, true);
                done();
            });
        });

        it('handles server error', function(done) {
            setupMocks({
                requests: {postStatus: 500}
            }).require(['payments'], function(payments) {
                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions()).done(function() {
                    logger.log('payment.purchase() is done');
                    done(new Error('unexpected success'));
                }).fail(function(_, product, reason) {
                    logger.log('payment.purchase() failed:', reason);
                    assert.equal(reason, 'MKT_CANCELLED');
                    done();
                });
            });
        });

        it('handles unpurchasable products', function(done) {
            setupMocks().mock('fxpay', {
                configure: function() {},
                purchase: function() {
                    throw new Error('fxpay.purchase() should not be called');
                }
            }).require(['payments'], function(payments) {
                var product = new FakeProduct();
                product.payment_required = false;

                payments.purchase(product, purchaseOptions()).done(function() {
                    logger.log('payment.purchase() is done');
                    done();
                }).fail(function(_, product, reason) {
                    logger.error('payment.purchase() failed:', reason);
                    done(new Error(reason));
                });
            });
        });

        it('can add development pay providers', function(done) {
            setupMocks({
                requests: {
                    jwtTyp: 'mozilla-dev',
                },
                settings: {
                    dev_pay_providers: {
                        'mozilla-dev': 'http://mozilla-dev/pay?req={jwt}',
                    }
                }
            }).require(['payments'], function(payments) {
                var fakeWindow = new FakeFireplaceWindow();
                fakeWindow.origin = 'http://mozilla-dev';

                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions({fakeWindow: fakeWindow})).done(function() {
                    logger.log('payment.purchase() is done');
                    // Make sure that our new setting caused fxpay to start a payment
                    // at the configured URL.
                    assert.include(fakeWindow.paymentWindow.location, fakeWindow.origin);
                    done();
                }).fail(function(_, product, reason) {
                    logger.error('payment.purchase() failed:', reason);
                    done(new Error(reason));
                });
            });
        });

        it('can add local pay providers', function(done) {
            setupMocks({
                requests: {jwtTyp: 'mozilla-local'},
                settings: {
                    local_pay_providers: {
                        'mozilla-local': 'http://mozilla-local/pay?req={jwt}',
                    }
                }
            }).require(['payments'], function(payments) {
                var fakeWindow = new FakeFireplaceWindow();
                fakeWindow.origin = 'http://mozilla-local';

                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions({fakeWindow: fakeWindow})).done(function() {
                    logger.log('payment.purchase() is done');
                    // Make sure that our new setting caused fxpay to start a payment
                    // at the configured URL.
                    assert.include(fakeWindow.paymentWindow.location, fakeWindow.origin);
                    done();
                }).fail(function(_, product, reason) {
                    logger.error('payment.purchase() failed:', reason);
                    done(new Error(reason));
                });
            });
        });

        it('handles an unknown fxpay error', function(done) {
            setupMocks().mock('fxpay', {
                configure: function() {},
                purchase: function(productId, callback) {
                    return new Promise(function(resolve, reject) {
                        // Simulate an arbitrary fxpay error.
                        reject(realFxPay.errors.FxPayError());
                    });
                }
            }).require(['payments'], function(payments) {
                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions()).done(function() {
                    logger.log('payment.purchase() is done');
                    done(new Error('unexpected success'));
                }).fail(function(_, product, reason) {
                    logger.log('payment.purchase() failed:', reason);
                    assert.equal(reason, 'MKT_CANCELLED');
                    done();
                });
            });
        });

        it('handles dialog closed by user', function(done) {
            var notifyArgs = {};

            setupMocks().mock('fxpay', {
                configure: function() {},
                purchase: function(productId, callback) {
                    return new Promise(function(resolve, reject) {
                        reject(realFxPay.errors.PayWindowClosedByUser());
                    });
                }
            }).mock('core/notification', {
                notification: function(callArgs) {
                    notifyArgs = callArgs;
                }
            }).require(['payments'], function(payments) {
                var product = new FakeProduct();
                payments.purchase(product, purchaseOptions()).done(function() {
                    done(new Error('unexpected success'));
                }).fail(function(_, product, reason) {
                    assert.equal(reason, 'MKT_CANCELLED');
                    assert.equal(notifyArgs.message, 'Payment cancelled.');
                    done();
                });
            });
        });
    });
});
