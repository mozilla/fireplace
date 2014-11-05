define('utils_local', [
    'defer',
    'jquery',
    'log',
    'settings',
    'urls',
    'z'
], function(defer, $, log, settings, urls, z) {

    var console = log('utils_local');
    var check_interval;

    function isSystemDateRecent() {
        var rval = new Date().getFullYear() >= 2010;
        if (!rval) {
            console.log('System date appears to be incorrect!');
        }
        return rval;
    }

    var build_localized_field = function(name) {
        var data = {};
        $('.localized[data-name="' + name + '"]').each(function(i, field) {
            data[this.getAttribute('data-lang')] = this.value;
        });
        return data;
    };

    var items = function(obj) {
        // Like Python's dict.items().
        var items = [];
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var item = [];
            item.push(keys[i]);
            item.push(obj[keys[i]]);
            items.push(item);
        }
        return items;
    };

    function offline(def, socket) {
        if (z.onLine) {
            // Fire event for going offline.
            console.log('Offline detected.');
            z.win.trigger('offline_detected');
            z.onLine = false;
        }
        if (socket) {
            reset_socket(socket);
        }
        def.reject();
    }

    function online(def, socket) {
        if (!z.onLine) {
            // Fire event for going online.
            // Fire event to start loading images.
            console.log('Online detected.');
            z.win.trigger('online_detected');
            z.onLine = true;
        }
        if (socket) {
            reset_socket(socket);
        }
        def.resolve();
    }

    function reset_socket(socket) {
        socket.onopen = null;
        socket.onerror = null;
        socket.close();
    }

    function checkOnline() {
        // `navigator.onLine` is unreliable (see bugs 654579 and 756364)
        // so we need to test an actual connection.
        var def = defer.Deferred();
        if (window.__mockOffLine === true) {
            offline(def);
            return def.promise();
        }
        try {
            if (navigator.mozTCPSocket === null) {
                return checkOnlineDesktop();
            }
            console.log('Checking online state with socket');
            var host = (new URL(settings.cdn_url)).host;
            var port = 80;
            var socket = navigator.mozTCPSocket.open(host, port);
            socket.onerror = function(e) {
                offline(def, socket);
            };
            socket.onopen = function(e) {
                online(def, socket);
            };
        } catch (e) {
            return checkOnlineDesktop();
        }

        return def.promise();
    }

    function checkOnlineDesktop() {
        var def = defer.Deferred();

        var i = new Image();
        i.src = 'https://marketplace.cdn.mozilla.net/media/fireplace/img/online-status-beacon.gif?' + (+new Date());
        i.onload = function() {
            online(def);
        };
        i.onerror = function(e) {
            offline(def);
        };

        return def.promise();
    }

    function pollOnlineState() {
        if (check_interval) {
            clearInterval(check_interval);
        }
        check_interval = setInterval(checkOnline, 10000);
    }

    return {
        build_localized_field: build_localized_field,
        checkOnline: checkOnline,
        isSystemDateRecent: isSystemDateRecent,
        items: items,
        pollOnlineState: pollOnlineState,
    };

});
