define('tests/unit/mobilenetwork',
    ['core/user', 'core/utils', 'mobilenetwork'],
    function(user, utils, mobilenetwork) {

    // Region can be inferred from MCC.
    // Carrier can be inferred from MCC+MNC.

    describe('mobilenetwork', function() {
        it('no MCC, no MNC', function() {
            var network = mobilenetwork.getNetwork('', '');
            assert.equal(network.region, null);
            assert.equal(network.carrier, null);
        });

        it('yes MCC, no MNC', function() {
            var network = mobilenetwork.getNetwork('334', '');
            assert.equal(network.region, 'mx');
            assert.equal(network.carrier, null);
        });

        it('yes MCC, unknown MNC', function() {
            var network = mobilenetwork.getNetwork('310', '410');
            assert.equal(network.region, 'us');
            assert.equal(network.carrier, null);
        });

        it('no MCC, yes MNC', function() {
            var network = mobilenetwork.getNetwork('', '005');
            assert.equal(network.region, null);
            assert.equal(network.carrier, null);
        });

        it('yes MCC, yes MNC', function() {
            var network = mobilenetwork.getNetwork('214', '005');
            assert.equal(network.region, 'es');
            assert.equal(network.carrier, 'telefonica');
        });

        it('yes MCC, yes MNC, no SPN', function() {
            var network = mobilenetwork.getNetwork('262', '001');
            assert.equal(network.region, 'de');
            assert.equal(network.carrier, 'deutsche_telekom');
        });

        it('yes MCC, yes MNC, yes SPN', function() {
            var network = mobilenetwork.getNetwork('262', '001', 'congstar.de');
            assert.equal(network.region, 'de');
            assert.equal(network.carrier, 'congstar');
        });

        it('no carrier+region', function() {
            user.clear_settings();
            assert.equal(user.get_setting('carrier_sim'), null);
            assert.equal(user.get_setting('region_sim'), null);

            var navigator_ = {mozMobileConnection: null};
            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), null);
            assert.equal(user.get_setting('region_sim'), null);

        });

        it('carrier+region for Telefónica España SIM via querystring', function() {
            user.clear_settings();

            mobilenetwork.detectMobileNetwork({}, {
                getVars: function () {
                    return {mcc: '214', mnc: '005'};
                }
            });

            assert.equal(user.get_setting('carrier_sim'), 'telefonica');
            assert.equal(user.get_setting('region_sim'), 'es');

        });

        it('carrier+region for SIM via navigator.mozMobileConnection', function() {
            user.clear_settings();

            var navigator_ = {mozMobileConnection: {lastKnownNetwork: '214-005'}};

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'telefonica');
            assert.equal(user.get_setting('region_sim'), 'es');

        });

        it('carrier+region for SIM via navigator.mozMobileConnection lastKnownHomeNetwork', function() {
            user.clear_settings();

            var navigator_ = {mozMobileConnection: {lastKnownHomeNetwork: '262-001'}};

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'deutsche_telekom');
            assert.equal(user.get_setting('region_sim'), 'de');

        });

        it('carrier+region for SIM via navigator.mozMobileConnections', function() {
            user.clear_settings();

            var navigator_ = {
                mozMobileConnections: [
                    {lastKnownNetwork: '202-005'},
                    {lastKnownNetwork: '214-005'},
                ]
            };

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'deutsche_telekom');
            assert.equal(user.get_setting('region_sim'), 'gr');

        });

        it('carrier+region for SIM via navigator.mozMobileConnections with SPN', function() {
            user.clear_settings();

            var navigator_ = {
                mozMobileConnections: [{
                    // This should match what the device typically returns. In particular,
                    // note that the SPN is only included in `lastKnownHomeNetwork`.
                    lastKnownHomeNetwork: '262-001-congstar',
                    lastKnownNetwork: '262-001'
                }]
            };

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'congstar');
            assert.equal(user.get_setting('region_sim'), 'de');

        });

        it('carrier+region for SIM via navigator.mozMobileConnections with garbage', function() {
            user.clear_settings();

            var navigator_ = {
                mozMobileConnections: [
                    {lastKnownNetwork: '999-666'},
                    {lastKnownNetwork: '214-005'},
                ]
            };

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'telefonica');
            assert.equal(user.get_setting('region_sim'), 'es');

        });

        it('carrier+region for SIM via navigator.mozMobileConnections with weird lastKnownNetwork first', function() {
            user.clear_settings();

            var navigator_ = {
                mozMobileConnections: [
                    {lastKnownNetwork: 'weirdstring'},
                    {lastKnownNetwork: '214-005'},
                ]
            };

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'telefonica');
            assert.equal(user.get_setting('region_sim'), 'es');

        });

        it('carrier+region for SIM via navigator.mozMobileConnections lastKnownHomeNetwork', function() {
            user.clear_settings();

            var navigator_ = {
                mozMobileConnections: [
                    {lastKnownHomeNetwork: '202-005'},
                    {lastKnownNetwork: '214-005'},
                ]
            };

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), 'deutsche_telekom');
            assert.equal(user.get_setting('region_sim'), 'gr');

        });

        it('region with unknown carrier and previously stored carrier', function() {
            user.clear_settings();
            user.update_settings({'carrier_sim': 'deutsche_telekom'});
            assert.equal(user.get_setting('carrier_sim'), 'deutsche_telekom');

            var navigator_ = {
                mozMobileConnections: [
                    {lastKnownHomeNetwork: '310-410'},  // US with AT&T, unsupported carrier.
                    {lastKnownNetwork: '226-03'}  // Romania, unsupported region&carrier.
                ]
            };

            mobilenetwork.detectMobileNetwork(navigator_);

            assert.equal(user.get_setting('carrier_sim'), undefined);
            assert.equal(user.get_setting('region_sim'), 'us');

        });
    });
});
