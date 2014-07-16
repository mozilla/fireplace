(function() {
  var a = require('assert');
  var assert = a.assert;
  var eq_ = a.eq_;

  var navigation = require('navigation');
  test('navigation url extraction', function(done) {
      eq_(navigation.extract_nav_url('/foo/bar?src=all-popular'), '/foo/bar');
      eq_(navigation.extract_nav_url('/foo/bar?src=all-popular&q=bar'), '/foo/bar?q=bar');
      done();
  });
})();
