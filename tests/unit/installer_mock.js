define('tests/unit/installer_mock',
    ['installer_mock'],
    function(InstallerMock) {

    describe('installer_mock.checkForUpdate', function() {
        var manifestURL = 'http://someurl.com/manifest.webapp';

        this.beforeEach(function() {
            this.installer = new InstallerMock();
        });

        it('is false by default', function(done) {
            this.installer
                .checkForUpdate(manifestURL)
                .done(function(updatable) {
                    assert(!updatable);
                    done();
                });
        });

        it('can be set with _setDownloadAvailable', function(done) {
            var installer = this.installer;
            installer._setDownloadAvailable(manifestURL, true);
            installer
                .checkForUpdate(manifestURL)
                .done(function(updatable) {
                    assert(updatable);
                    installer._setDownloadAvailable(manifestURL, false);
                    installer
                        .checkForUpdate(manifestURL)
                        .done(function(updatable) {
                            assert(!updatable);
                            done();
                        });
                });
        });

        it('can be set to false', function(done) {
            this.installer._setDownloadAvailable(manifestURL, true);
            this.installer
                .checkForUpdate(manifestURL)
                .done(function(updatable) {
                    assert(updatable);
                    done();
                });
            this.installer
                .checkForUpdate(manifestURL)
                .done(function(updatable) {
                    assert(updatable);
                    done();
                });
        });
    });
});
