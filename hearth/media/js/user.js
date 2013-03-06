define(['lib/jquery.cookie'], function() {

    var token = $.cookie('user');
    var settings = JSON.parse(localStorage.getItem('settings') || '{}');

    function clear_token() {
        $.cookie('user', token = null);
    }

    function get_setting(setting) {
        if (!token) {
            return undefined;
        }
        return settings[setting];
    }

    function set_token(new_token, new_settings) {
        if (!new_token) {
            return;
        }
        $.cookie('user', token = new_token);
        update_settings(new_settings);
    }

    function update_settings(data) {
        if (!data) {
            return;
        }
        _.extend(settings, data);
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    return {
        clear_token: clear_token,
        get_setting: get_setting,
        get_token: function() {return token;},
        logged_in: function() {return !!token;},
        set_token: set_token,
        update_settings: update_settings
    };
});
