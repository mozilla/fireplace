/*
    Get Zamboni site configuration data, including waffle switches and FXA
    info.
*/
define('site_config', ['defer', 'requests', 'settings', 'underscore', 'urls'],
    function(defer, requests, settings, _, urls) {

    function fetch() {
        var def = defer.Deferred();
        requests.get(urls.api.unsigned.url('site-config')).done(function(data) {
            if (data.hasOwnProperty('fxa')) {
                settings.fxa_auth_url = data.fxa.fxa_auth_url;
                settings.fxa_auth_state = data.fxa.fxa_auth_state;
            }
            if (data.waffle.switches && _.isArray(data.waffle.switches)) {
                settings.switches = data.waffle.switches;
            }
            def.resolve(data);
        }).always(function() {
            def.resolve();
        });

        return def.promise();
    }

    return {
        'fetch': fetch,
        'promise': fetch(),
    };
});
