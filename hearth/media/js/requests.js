define('requests',
    ['cache', 'defer', 'log', 'user', 'utils'],
    function(cache, defer, log, user, utils) {

    var console = log('req');

    /*
    Methods:

    - get(url)
      Makes a GET request to the specified URL.

      Returns a promise object similar to the one returned by jQuery AJAX
      methods. If the response to the request is cached, the returned
      promise will have a property `__cached` set to `true`.

      If you do not want your request intentionally cached, use `_get`
      (which has an identical prototype) instead.

    - post|put|patch(url, body)
      Makes a POST/PUT/PATCH request to the specified URL with the given body.

      Returns a promise object similar to the one returned by jQuery AJAX
      methods. These requests are never intentionally cached.

    - del(url)
      Makes a DELETE request to the specified URL.

      Returns a promise object similar to the one returned by jQuery AJAX
      methods. These requests are never intentionally cached.

    - pool()
      Creates a new request pool and returns the request pool.

      Returns a request pool object. All request pool objects are promises
      which complete when all requests in the pool have completed.


    Request Pool Methods:

    - get(url)
      Functionally similar to the root `get()` method.

      If a GET request to that URL has already been made, that request's
      promise is returned instead.

      The initiated request is added to the pool. The request will block the
      pool's promise from resolving or rejecting.

    - post|put|patch(url, body)
      Functionally similar to the root counterparts with pool support.

    - del(url)
      Functionally similar to the root `del()` method with pool support.

    - finish()
      Closes the pool. If no requests have been made
      at this point, the pool's promise will resolve.

    - abort()
      Aborts all requests in the pool. Rejects the pool's promise.

    */

    function _ajax(args) {
        var xhr = new XMLHttpRequest();
        var def = defer.Deferred();

        function statusText() {
            if (xhr.status === 204) {
                return 'nocontent';
            } else if (xhr.status === 304) {
                return 'notmodified';
            } else if (xhr.status >= 200 && xhr.status < 300) {
                return 'success';
            } else {
                return 'error';
            }
        }

        xhr.addEventListener('load', function() {
            var data = xhr.responseText;
            if (xhr.getResponseHeader('Content-Type').split(';', 1)[0] === 'application/json') {
                data = JSON.parse(data);
            }

            def.resolve(data, statusText(), xhr);
        }, false);

        xhr.addEventListener('error', function() {
            var error = xhr.statusText;
            if (error) {
                // This cuts off the response code so we can return just the
                // response code text.
                error = error.substr(4);
            }
            def.reject(xhr, statusText(), error);
        }, false);

        xhr.open(
            args.type || 'GET',
            args.url,
            true
            // Auth would go here, but let's not.
        );
        var data = args.data;
        if (typeof data === 'object') {
            data = utils.urlencode(data);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.send(data || undefined);

        return def.promise(xhr);
    }

    function get(url) {
        if (cache.has(url)) {
            console.log('GETing from cache', url);
            return defer.Deferred()
                        .resolve(cache.get(url))
                        .promise({__cached: true});
        }
        return _get.apply(this, arguments);
    }

    function _get(url) {
        console.log('GETing', url);
        return _ajax({
            url: url,
            type: 'GET'
        }).done(function(data, status, xhr) {
            console.log('GOT', url);
            cache.set(url, data);

            if (!xhr) {
                return;
            }
            var filter_header;
            if ((!user.get_setting('region') || user.get_setting('region') == 'internet') &&
                (filter_header = xhr.getResponseHeader('API-Filter'))) {
                var region = utils.getVars(filter_header).region;
                user.update_settings({region: region});
            }
        });
    }

    function handle_errors(xhr, status) {
        console.log('Request failed: ', status);
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

    function del(url) {
        console.log('DELETing', url);
        return _ajax({
            url: url,
            type: 'DELETE'
        }).fail(handle_errors);
    }

    function patch(url, data) {
        console.log('PATCHing', url);
        return _ajax({
            url: url,
            type: 'PATCH',
            data: data
        }).fail(handle_errors);
    }

    function post(url, data) {
        console.log('POSTing', url);
        return _ajax({
            url: url,
            type: 'POST',
            data: data
        }).done(function(data) {
            console.log('POSTed', url);
        }).fail(handle_errors);
    }

    function put(url, data) {
        console.log('PUTing', url);
        return _ajax({
            url: url,
            type: 'PUT',
            data: data
        }).fail(handle_errors);
    }

    function Pool() {
        console.log('Opening pool');
        var requests = [];
        var req_map = {};

        var def = defer.Deferred();
        var initiated = 0;
        var marked_to_finish = false;
        var closed = false;

        function finish() {
            if (closed) {
                return;
            }
            if (!initiated && marked_to_finish) {
                console.log('Closing pool');
                closed = true;

                // Resolve the deferred whenevs.
                if (window.setImmediate) {
                    setImmediate(def.resolve);
                } else {
                    setTimeout(def.resolve, 0);
                }
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

    return {
        get: get,
        post: post,
        del: del,
        put: put,
        patch: patch,
        pool: function() {return new Pool();},
        // This is for testing purposes.
        _set_xhr: function(func) {_ajax = func;}
    };
});
