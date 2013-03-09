define(['z'], function(z) {

    function _error(jqXHR, textStatus, error, errorCallback) {
        if (errorCallback) {
            errorCallback(jqXHR, textStatus, error, errorCallback);

        } else {
            z.page.trigger('notify', {msg: jqXHR.responseText});
        }
    }

    function get(url, success, errorCallback) {
        $.get(url, success)
         .fail(function (jqXHR, textStatus, error) {
            _error(jqXHR, textStatus, error, errorCallback);
        });
    }

    function post(url, data, success, errorCallback) {
        var $this = this;

        $.post(url, data, success)
         .fail(function (jqXHR, textStatus, error) {
            _error(jqXHR, textStatus, error, errorCallback);
        });
    }

    return {
        'get': get,
        'post': post
    };
});
