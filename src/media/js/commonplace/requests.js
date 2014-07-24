define('requests',
    ['cache', 'defer', 'log', 'settings', 'utils'],
    function(cache, defer, log, settings, utils) {

    var console = log('req');

    var hooks = {};
    function callHooks(event, data) {
        if (!(event in hooks)) {
            return;
        }
        for (var i = 0, e; e = hooks[event][i++];) {
            e.apply(e, data);
        }
    }

    function _is_obj_or_array(obj) {
        return obj && obj.constructor === Object || Array.isArray(obj);
    }

    function _has_object_props(obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i) && _is_obj_or_array(obj[i])) {
                return true;
            }
        }
    }

    function _ajax(type, url, data) {
        var xhr = new XMLHttpRequest();
        var def = defer.Deferred();

        function response(xhr) {
            var data = xhr.responseText;
            if ((xhr.getResponseHeader('Content-Type') || '').split(';', 1)[0] === 'application/json') {
                try {
                    return JSON.parse(data);
                } catch(e) {
                    // Oh well.
                    return {};
                }
            }
            return data || null;
        }

        function error() {
            def.reject(xhr, xhr.statusText, xhr.status, response(xhr));
        }

        xhr.addEventListener('load', function() {
            try {
                if (xhr.getResponseHeader('API-Status') === 'Deprecated') {
                    callHooks('deprecated', [xhr]);
                }
            } catch(e) {}

            var statusCode = xhr.status / 100 | 0;
            if (statusCode < 2 || statusCode > 3) {
                return error();
            }

            def.resolve(response(xhr), xhr);
        }, false);

        xhr.addEventListener('error', error, false);

        xhr.open(type, url, true);

        var content_type = 'application/x-www-form-urlencoded';
        if (data) {
            if (_is_obj_or_array(data) && !_has_object_props(data)) {
                data = utils.urlencode(data);
            } else if (!(data instanceof RawData)) {
                data = JSON.stringify(data);
                content_type = 'application/json';
            } else {
                data = data.toString();
                content_type = 'text/plain';
            }
            xhr.setRequestHeader('Content-Type', content_type);
        }
        xhr.send(data || undefined);

        return def.promise(xhr);
    }

    function ajax(type, url, data) {
        var def = _ajax(type, url, data);
        // then() returns a new promise, so don't return that.
        def.then(function(resp, xhr) {
            callHooks('success', [resp, xhr, type, url, data]);
        }, function(xhr, error, status, resp) {
            callHooks('failure', [xhr, error, status, resp, type, url, data]);
            handle_errors(xhr, type, status);
        });
        return def;
    }

    // During a single session, we never want to fetch the same URL more than
    // once. Because our persistent offline cache does XHRs in the background
    // to keep the cache fresh, we want to do that only once per session. In
    // order to do all this magic, we have to keep an array of all of the URLs
    // we hit per session.
    var urls_fetched = {};

    function get(url, nocache) {
        var cache_offline = settings.offline_cache_enabled && settings.offline_cache_enabled();

        var cached;
        if (cache.has(url) && !nocache) {
            console.log('GETing from cache', url);
            cached = cache.get(url);
        }

        var def_cached;
        if (cached) {
            def_cached = defer.Deferred()
                              .resolve(cached)
                              .promise({__cached: true});
            if (!cache_offline || url in urls_fetched) {
                // If we don't need to make an XHR in the background to update
                // the cache, then let's bail now.
                return def_cached;
            }
        }

        console.log('GETing', url);
        urls_fetched[url] = null;

        var def_ajax = ajax('GET', url).done(function(data) {
            console.log('GOT', url);
            if (!nocache) {
                data.__time = +(new Date());
                cache.set(url, data);
            }
            if (cached && cache_offline) {
                console.log('Updating request cache', url);
            }
        });

        if (cached && cache_offline) {
            // If the response was cached, we still want to fire off the
            // AJAX request so the cache can get updated in the background,
            // but let's resolve this deferred with the cached response
            // so the request pool can get closed and the builder can render
            // the template for the `defer` block.
            return def_cached;
        }

        return def_ajax;
    }

    function handle_errors(xhr, type, status) {
        console.log('Request failed:', type, status);
        if (xhr.responseText) {
            try {
                var data = JSON.parse(xhr.responseText);
                if ('error_message' in data) {
                    console.log('Error message: ', data.error_message);
                } else {
                    console.log('Response data: ', xhr.responseText);
                }
            } catch(e) {}
        }
    }

    function del(url, data) {
        console.log('DELETing', url);
        return ajax('DELETE', url, data).done(function() {
            console.log('DELETEd', url);
        });
    }

    function patch(url, data) {
        console.log('PATCHing', url);
        return ajax('PATCH', url, data).done(function() {
            console.log('PATCHed', url);
        });
    }

    function post(url, data) {
        console.log('POSTing', url);
        return ajax('POST', url, data).done(function() {
            console.log('POSTed', url);
        });
    }

    function put(url, data) {
        console.log('PUTing', url);
        return ajax('PUT', url, data).done(function() {
            console.log('PUT', url);
        });
    }

    function Pool() {
        console.log('Opening pool');
        var requests = [];
        var req_map = {};

        var def = defer.Deferred();
        var initiated = 0;
        var marked_to_finish = false;
        var closed = false;
        var failed = false;

        function finish() {
            if (closed) {
                return;
            }
            if (!initiated && marked_to_finish) {
                console.log('Closing pool');
                closed = true;

                // Resolve the deferred whenevs.
                setTimeout(failed ? def.reject : def.resolve, 0);
            }
        }

        this.finish = function() {
            marked_to_finish = true;
            finish();
        };

        function make(func, args) {
            var req = func.apply(this, args);
            initiated++;
            requests.push(req);
            req.fail(function() {
                failed = true;
            });
            req.always(function() {
                initiated--;
                finish();
            });
            return req;
        }

        this.get = function(url) {
            if (url in req_map) {
                return req_map[url];
            }
            var req = make(get, arguments);
            req_map[url] = req;
            return req;
        };
        this.del = function() {return make(del, arguments);};
        this.patch = function() {return make(patch, arguments);};
        this.post = function() {return make(post, arguments);};
        this.put = function() {return make(put, arguments);};

        this.abort = function() {
            for (var i = 0, request; request = requests[i++];) {
                if (request.abort === undefined || request.readyState === 4) {
                    continue;
                }
                request.abort();
            }
            def.reject();
        };

        def.promise(this);
    }

    function on(event, callback) {
        (hooks[event] = hooks[event] || []).push(callback);
        return {'on': on};  // For great chaining.
    }

    function RawData(data) {
        this.data = data;
        this.toString = function() {
            return this.data;
        };
    }

    return {
        get: get,
        post: post,
        del: del,
        put: put,
        patch: patch,
        pool: function() {return new Pool();},
        on: on,
        RawData: RawData,
        // This is for testing purposes.
        _set_xhr: function(func) {_ajax = func;}
    };
});
