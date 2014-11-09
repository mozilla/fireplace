define('views/fxa_authorize', ['capabilities', 'log', 'login', 'utils', 'z'],
       function(capabilities, log, login, utils, z) {
    'use strict';
    var console = log('view', 'fxa-login');
    return function(builder) {
        var auth_code = window.location.href;
        var isPopup;
        try {
            // Accessing things on window.opener might raise a permission-denied
            // exception, in which case we aren't executing in the login popup.
            if (window.opener.location.protocol == window.location.protocol &&
                window.opener.location.host == window.location.host) {
                isPopup = true;
            }
        } catch (e) {
            isPopup = false;
        }
        if (isPopup) {
            window.opener.postMessage({auth_code: auth_code},
                                      window.location.origin);
            // This code will execute from a hosted origin, since the FxA login
            // process redirects there. Nevertheless, this might be a window
            // opened by the Marketplace packaged app. So, let's send this info
            // to it, if so. (Note that this does not apply for yulelog.)
            var packaged_origin = 'app://packaged.' + window.location.host;
            console.log('Sending OAuth code to parent window ' +
                        packaged_origin);
            window.opener.postMessage({auth_code: auth_code}, packaged_origin);

            window.close();
        } else {
            // No popup, login was likely initiated via email.
            var state = utils.getVars().state;
            if (capabilities.firefoxOS) {
                console.log("Starting login webactivity");
                // Kick off the Marketplace app rather than doing this in the browser.

                new MozActivity({name: 'marketplace-app', data: {
                    type: 'login',
                    auth_code: auth_code,
                    state: state}})
                window.close();
            } else {
                login.handle_fxa_login(auth_code, state);
                // Let's make this window Marketplace.
                console.log('Reusing window as Marketplace app');
                z.page.trigger('navigate', '/');
            }
        }
    };
});
