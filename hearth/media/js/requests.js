define(['jquery'], function($) {
    /*
    Methods:

    - get(url, [successCallback, [errorCallback]])
      Makes a GET request to the specified URL.

      Returns a promise object similar to the one returned by jQuery AJAX
      methods. If the response to the request is cached, the returned
      promise will have a property `__cached` set to `true`.

      If you do not want your request intentionally cached, use `_get`
      (which has an identical prototype) instead.

    - post(url, body, [successCallback, [errorCallback]])
      Makes a POST request to the specified URL with the given body.

      Returns a promise object similar to the one returned by jQuery AJAX
      methods. POST requests are never intentionally cached.

    - pool()
      Creates a new request pool and returns the request pool.

      Returns a request pool object. All request pool objects are promises
      which complete when all requests in the pool have completed.


    Request Pool Methods:

    - get(url, [successCallback, [errorCallback]])
      Functionally similar to the root `get()` method.

      If a GET request to that URL has already been made, that request's
      promise is returned instead.

      The initiated request is added to the pool. The request will block the
      pool's promise from resolving or rejecting.

    - post(url, body, [successCallback, [errorCallback]])
      Functionally similar to the root `post()` method.

      The initiated request is added to the pool. The request will block the
      pool's promise from resolving or rejecting.

    - finish()
      Closes the pool (prevents new requests). If no requests have been made
      at this point, the pool's promise will resolve.

    - abort()
      Aborts all requests in the pool. Rejects the pool's promise.

    */

    // Hax because Firefox OS is super balls.
    $.ajaxSetup({dataType: 'json'});

    function _error(jqXHR, textStatus, error, errorCallback) {
        if (errorCallback) {
            errorCallback(jqXHR, textStatus, error);
        } else {
            $('#page').trigger('notify', {msg: jqXHR.responseText});
        }
    }

    var cache = {};

    function get(url, success, errorCallback) {
        if (url in cache) {
            if (success) {
                success(cache[url]);
            }
            return $.Deferred()
                    .resolve(cache[url])
                    .promise({__cached: true});
        }
        return _get.apply(this, arguments);
    }

    function _get(url, success, errorCallback) {
        console.log('[req] GETing', url);
        return $.get(url, success)
         .done(function(data) {
            console.log('[req] GOT', url);
            cache[url] = data;
        }).fail(function (jqXHR, textStatus, error) {
            _error(jqXHR, textStatus, error, errorCallback);
        });
    }

    function post(url, data, success, errorCallback) {
        console.log('[req] POSTing', url);
        return $.post(url, data, success)
         .done(function() {
            console.log('[req] POSTed', url);
        }).fail(function (jqXHR, textStatus, error) {
            _error(jqXHR, textStatus, error, errorCallback);
        });
    }

    function Pool() {
        console.log('[req] Opening pool');
        var requests = [];
        var req_map = {};

        var def = $.Deferred();
        var initiated = 0;
        var closed = false;

        var finish = this.finish = function() {
            if (closed) {
                return;
            }
            if (!initiated) {
                console.log('[req] Closing pool');
                closed = true;
                // Don't allow new requests.
                this.get = null;
                this.post = null;

                // Resolve the deferred whenevs.
                if (window.setImmediate) {
                    setImmediate(def.resolve);
                } else {
                    setTimeout(def.resolve, 0);
                }
            }
        }

        function make(func, args) {
            var req = func.apply(this, args);
            initiated++;
            requests.push(req);
            req.then(function() {
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
        this.post = function() {return make(post, arguments);};

        this.abort = function() {
            for (var i = 0, request; request = requests[i++];) {
                if (request.abort === undefined || request.isSuccess !== false) {
                    return;
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
        pool: function() {return new Pool();}
    };
});
