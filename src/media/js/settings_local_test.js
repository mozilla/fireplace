define('settings_local',
    [],
    function() {

    return {
        allow_offline: true,
        api_url: 'http://localhost:5000',
        fxa_auth_url: 'http://localhost:5000',
        manifest_url: 'http://localhost:8675/manifest.webapp',
        media_url: 'http://localhost:5000',
        mockWebApps: true,
    };
});
