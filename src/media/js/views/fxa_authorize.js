define('views/fxa_authorize', ['log', 'login', 'utils', 'z'],
       function(log, login, utils, z) {
    'use strict';
    var console = log('view', 'fxa-login');
    return function(builder) {
        var auth_code = window.location.href;
        if (window.opener) {
            window.opener.postMessage({auth_code: auth_code},
                                      window.location.origin);
            // This code will execute from a hosted origin, since the FxA login
            // process redirects there. Nevertheless, this might be a window
            // opened by the Marketplace packaged app. So, let's send this info
            // to it, if so.
            var packaged_origin = 'app://packaged.' + window.location.host;
            console.log('Sending OAuth code to parent window ' +
                        packaged_origin);
            window.opener.postMessage({auth_code: auth_code}, packaged_origin);

            window.close();
        } else {
            // No popup, login was likely initiated via email. Let's make this
            // window Marketplace.
            console.log('Reusing window as Marketplace app');
            var state = utils.getVars().state;
            login.handle_fxa_login(auth_code, state);
            z.page.trigger('navigate', '/');
        }
    };
});
