define('views/fxa_authorize', ['log'], function(log) {
    'use strict';
    var console = log('view', 'fxa-login');
    return function(builder) {
      window.opener.postMessage({auth_code: window.location.toString()},
                                window.location.origin);
      // This code will execute from a hosted origin, since the FxA login
      // process redirects there. Nevertheless, this might be a window opened by
      // the marketplace packaged app. So, let's send this info to it, if so.
      var packaged_origin = "app://packaged." + window.location.host;
      console.log("posting oauth code to " + packaged_origin);
      window.opener.postMessage({auth_code: window.location.toString()},
                                packaged_origin);

      window.close();
    };
});
