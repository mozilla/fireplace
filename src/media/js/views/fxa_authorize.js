define('views/fxa_authorize', [], function() {
    'use strict';

    return function(builder) {
      window.opener.postMessage({auth_code: window.location.toString()},
                                window.location.origin);
      // This code will execute from a hosted origin, since the FxA login
      // process redirects there. Nevertheless, this might be a window opened by
      // the marketplace packaged app. So, let's send this info to it, if so.
      window.opener.postMessage({auth_code: window.location.toString()},
                                "app://packaged." + window.location.host);

      window.close();
    };
});
