define('requests',
    ['cache', 'jquery', 'log', 'user', 'utils'],
    function(cache, $, log, user, utils) {

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

    function get(url) {
        if (cache.has(url)) {
            console.log('GETing from cache', url);
            return $.Deferred()
                    .resolve(cache.get(url))
                    .promise({__cached: true});
        }
        return _get.apply(this, arguments);
    }

    function _get(url) {
        console.log('GETing', url);
        return $.get(url).done(function(data, status, xhr) {
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

    function handle_errors(jqxhr, status) {
        console.log('Request failed: ', status);
        if (jqxhr.responseText) {
            try {
                var data = JSON.parse(jqxhr.responseText);
                if ('error_message' in data) {
                    console.log('Error message: ', data.error_message);
                } else {
                    console.log('Response data: ', jqxhr.responseText);
                }
            } catch(e) {}
        }
    }

    function del(url) {
        console.log('DELETing', url);
        return $.ajax({
            url: url,
            type: 'DELETE'
            // type: 'POST',
            // headers: {'X-HTTP-METHOD-OVERRIDE': 'DELETE'}
        }).fail(handle_errors);
    }

    function patch(url, data) {
        console.log('PATCHing', url);
        return $.ajax({
            url: url,
            type: 'PATCH',
            // type: 'POST',
            // headers: {'X-HTTP-METHOD-OVERRIDE': 'PATCH'},
            data: data
        }).fail(handle_errors);
    }

    function post(url, data) {
        console.log('POSTing', url);
        return $.post(url, data).done(function(data) {
            console.log('POSTed', url);
        }).fail(handle_errors);
    }

    function put(url, data) {
        console.log('PUTing', url);
        return $.ajax({
            url: url,
            type: 'PUT',
            // type: 'POST',
            // headers: {'X-HTTP-METHOD-OVERRIDE': 'PUT'},
            data: data
        }).fail(handle_errors);
    }

    function Pool() {
        console.log('Opening pool');
        var requests = [];
        var req_map = {};

        var def = $.Deferred();
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
                if (request.abort === undefined || request.isSuccess !== false) {
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
        pool: function() {return new Pool();}
    };
});
