/*
    Mock window.navigator.mozApps.
    mozApps API return request objects. For our mock, in most cases we will
    call the requests' callbacks instantly via setIntervals.
*/
function initialize() {
    var readyInterval = setInterval(function() {
        // Interval to make sure we initialize only after the window is ready.
        // If we do it too soon, then the window will override our mock with
        // the standard window.navigator.
        if (casper.evaluate(_initialize)) {
            clearInterval(readyInterval);
        }
    }, 50);

    function _initialize() {
        // Keep track of installed apps.
        var manifests = [];

        window.navigator.mozApps = {
            // Mock app installs.
            getInstalled: function() {
                var request = {
                    result: manifests.map(function(manifest) {
                        return {
                            manifestURL: manifest,
                            launch: function() {
                                console.log('[mozApps] Launching ' + manifest);
                            }
                        };
                    })
                };

                setTimeout(function() {
                    if (request.onsuccess && request.onsuccess.constructor === Function) {
                        request.onsuccess();
                    }
                });

                return request;
            },
            getSelf: function() {
                var request = {};

                setTimeout(function() {
                    if (request.onsuccess && request.onsuccess.constructor === Function) {
                        request.onsuccess();
                    }
                });

                return request;
            },
            install: function(manifest) {
                var request = {
                    result: {
                        installState: 'installed',
                        ondownloaderror: function() {
                            // If you want to mock a download error.
                        }
                    },
                    onerror: function() {
                        // If you want to mock a request error.
                    }
                };

                setTimeout(function() {
                    if (request.onsuccess && request.onsuccess.constructor === Function) {
                        request.onsuccess();
                    }
                });

                manifests.push(manifest);

                return request;
            },
            _resetInstalled: function() {
                // Helper to clear installed apps. Not a part of the API.
                manifests = [];
            },
            _populateInstalledApps: function(n) {
                // Helper to populate installed app list with random apps.
                // Not a part of the API.
                for (var i = 0; i < (n || 200); i++) {
                    manifests.push('http://randommanifest' + i + '.com');
                }
            }
        };

        window.navigator.mozApps.installPackage = window.navigator.mozApps.install;
        console.log('[mozApps] Mock mozApps initialized');

        // Keep mocking it until it won't get overriden.
        if (document.readyState !== 'complete') {
            return false;
        } else {
            return true;
        }
    }
}

module.exports = {
    initialize: initialize
};
