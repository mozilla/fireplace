define('views/fxa_authorize', ['log'], function(log) {
    'use strict';
    var console = log('view', 'fxa-login');
    return function(builder) {
      window.opener.postMessage({auth_code: window.location.toString()},
                                window.location.origin);
      window.close();
    };
});
