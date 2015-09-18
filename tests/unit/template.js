define('tests/unit/template', ['helpers_local'], function(helpers) {

    var fileSize = helpers.fileSize;

    describe('helpers', function() {

        it('Correctly makes file sizes readable', function(done) {
          assert.equal(fileSize(0), '0');
          assert.equal(fileSize(512), '0.5 KB');
          assert.equal(fileSize(768), '0.75 KB');
          assert.equal(fileSize(1024), '1 KB');
          assert.equal(fileSize(524288), '512 KB');
          assert.equal(fileSize(1048576), '1 MB');
          assert.equal(fileSize(1572864), '1.5 MB');
          assert.equal(fileSize(1835008), '1.75 MB');
          assert.equal(fileSize(536870912), '512 MB');
          assert.equal(fileSize(1073741824), '1 GB');
          assert.equal(fileSize(1610612736), '1.5 GB');
          assert.equal(fileSize(1879048192), '1.75 GB');
          assert.equal(fileSize(549755813888), '512 GB');
          assert.equal(fileSize(1099511627776), '1024 GB')
          done();
        });

    });
});
