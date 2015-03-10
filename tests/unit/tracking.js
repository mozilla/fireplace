define('tests/unit/tracking',
    ['tests/unit/helpers'],
    function(helpers) {

    function settingsTracking(injector) {
        return injector.mock('core/settings', {
            ua_tracking_id: 'UA-8675',
        });
    }

    function storageWithClientId(injector) {
        return injector.mock('core/storage', {
            getItem: function() {
                return '123456789';
            }
        });
    }

    function filterUALogs(trackLog, filter) {
        // Given an array, filter UA log that matches the array.
        trackLog = trackLog.reverse();

        return trackLog.filter(function(log) {
            return _.isEqual(log.slice(0, filter.length), filter);
        });
    }

    describe.only('tracking', function() {
        it('initializes with client ID',
            helpers
            .injector(settingsTracking, storageWithClientId)
            .run(['tracking'], function(tracking) {
                var expected = [
                    'create', 'UA-8675', {
                        storage: 'none',
                        clientId: '123456789'
                    }
                ];
                assert.deepEqual(
                    filterUALogs(tracking.trackLog, ['create'])[0],
                    expected
                );
        }));

        it('ignores checkProtocolTask',
            helpers
            .injector(settingsTracking)
            .run(['tracking'], function(tracking) {
                assert.ok(
                    filterUALogs(tracking.trackLog,
                                 ['set', 'checkProtocolTask'])[0]);
        }));

        it('can push a sendEvent to UA',
            helpers
            .injector()
            .run(['tracking'], function(tracking) {
                var testUAEvent = [
                    'eCategory',
                    'e-action',
                    'e:Label',
                    {
                        'dimension1': 5,
                        'dimension2': 'awesome',
                    }
                ];

                var retVal = tracking.sendEvent.apply(this, testUAEvent);

                var expectedUAPush = testUAEvent.slice();
                expectedUAPush.unshift('event');
                expectedUAPush.unshift('send');

                assert.deepEqual(
                    filterUALogs(tracking.trackLog, ['send', 'event'])[0],
                    expectedUAPush);
                assert.deepEqual(retVal, expectedUAPush);
            }));

        it('can push a set (dimension) to UA',
            helpers
            .injector()
            .run(['tracking'], function(tracking) {
                var testUAEvent = [
                    'dimension4',
                    'ngokevin.com'
                ];

                var retVal = tracking.setSessionVar.apply(this, testUAEvent);

                var expectedUAPush = testUAEvent.slice();
                expectedUAPush.unshift('set');

                assert.deepEqual(
                    filterUALogs(tracking.trackLog, ['set', 'dimension4'])[0],
                    expectedUAPush);
                assert.deepEqual(retVal, expectedUAPush);
            }));

        it('can set a page variable',
            helpers
            .injector()
            .run(['tracking'], function(tracking) {
                assert.deepEqual(tracking.pageVars, {});
                tracking.setPageVar('dimension5', 'oxenfree');
                assert.deepEqual(tracking.pageVars, {dimension5: 'oxenfree'});
            }));
    });
});
