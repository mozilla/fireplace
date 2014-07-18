define('views/fxa_authorize', [], function() {
    'use strict';

    return function(builder) {
      window.opener.postMessage({auth_code: window.location.toString()}, "*");
      window.close();
    };
});
