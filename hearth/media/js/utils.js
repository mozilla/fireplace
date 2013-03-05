define(['jquery', 'underscore', 'z'], function($, _, z) {
    _.extend(String.prototype, {
        trim: function(str) {
            // Trim leading and trailing whitespace (like lstrip + rstrip).
            return this.replace(/^\s*/, '').replace(/\s*$/, '');
        },
        strip: function(str) {
            // Strip all whitespace.
            return this.replace(/\s/g, '');
        }
    });

    function _pd(func) {
        return function(e) {
            e.preventDefault();
            func.apply(this, arguments);
        };
    }

    function escape_(s) {
        if (s === undefined) {
            return;
        }
        return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
                .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
    }

    function fieldFocused(e) {
        var tags = /input|keygen|meter|option|output|progress|select|textarea/i;
        return tags.test(e.target.nodeName);
    }

    function urlparams(url, kwargs) {
        var qpos = url.indexOf('?');
        if (qpos === -1) {
            url += '?';
        } else {
            kwargs = _.defaults(kwargs, getVars(url.substr(qpos)));
            url = url.substr(0, qpos + 1);
        }

        var params = [];
        for (var key in kwargs) {
            // Skip over nunjucks keywords.
            if (key == '__keywords') {
                continue;
            }
            params.push(encodeURIComponent(key) + '=' +
                        encodeURIComponent(kwargs[key]));
        }

        return url + params.join('&');

    };

    function getTemplate($el) {
        // If the element exists, return the template.
        if ($el.length) {
            return template($el.html());
        }
        // Otherwise, return undefined.
    }

    function getVars(qs, excl_undefined) {
        if (typeof qs === 'undefined') {
            qs = location.search;
        }
        if (qs && qs[0] == '?') {
            qs = qs.substr(1);  // Filter off the leading ? if it's there.
        }
        if (!qs) return {};

        return _.chain(qs.split('&'))  // ['a=b', 'c=d']
                .map(function(c) {return _.map(c.split('='), escape_);}) //  [['a', 'b'], ['c', 'd']]
                .filter(function(p) {  // [['a', 'b'], ['c', undefined]] -> [['a', 'b']]
                    return !!p[0] && (!excl_undefined || !_.isUndefined(p[1]));
                }).object()  // {'a': 'b', 'c': 'd'}
                .value();
    }

    function makeOrGetOverlay(id) {
        var el = document.getElementById(id);
        if (!el) {
            el = $('<div class="overlay" id="' + id +'">');
            $(document.body).append(el);
        }
        return $(el);
    }

    return {
        '_pd': _pd,
        'escape_': escape_,
        'fieldFocused': fieldFocused,
        'getTemplate': getTemplate,
        'getVars': getVars,
        'makeOrGetOverlay': makeOrGetOverlay,
        'urlparams': urlparams
    };

});
