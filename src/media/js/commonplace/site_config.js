/*
    Get Zamboni site configuration data, including waffle switches and FXA
    info.
*/
define('site_config', ['defer', 'requests', 'settings', 'urls'],
    function(defer, requests, settings, urls) {

    function fetch() {
        var def = defer.Deferred();
        requests.get(urls.api.url('site-config')).done(function(data) {
            settings.fxa_auth_url = data.fxa.fxa_auth_url;
            settings.fxa_auth_state = data.fxa.fxa_auth_state;
            settings.switches = data.waffle.switches || [];
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
