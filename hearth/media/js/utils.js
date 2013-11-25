define('utils', ['jquery', 'l10n', 'underscore'], function($, l10n, _) {

    var ngettext = l10n.ngettext;

    _.extend(String.prototype, {
        strip: function(str) {
            // Strip all whitespace.
            return this.replace(/\s/g, '');
        }
    });

    function _pd(func) {
        return function(e) {
            e.preventDefault();
            if (func) {
                func.apply(this, arguments);
            }
        };
    }

    // Initializes character counters for textareas.
    function initCharCount() {
        var countChars = function(el, cc) {
            var $el = $(el);
            var max = parseInt($el.attr('maxlength'), 10);
            var left = max - $el.val().length;
            // L10n: {n} is the number of characters left.
            cc.html(ngettext('<b>{n}</b> character left.',
                             '<b>{n}</b> characters left.', {n: left}))
              .toggleClass('error', left < 0);
        };
        $('.char-count').each(function() {
            var $cc = $(this);
            $cc.closest('form')
               .find('#' + $cc.data('for'))
               .on('keyup blur', _.throttle(function() {countChars(this, $cc);}, 250))
               .trigger('blur');
        });
    }

    function escape_(s) {
        if (s === undefined) {
            return;
        }
        return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
                .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
    }

    function slugify(s, limit) {
        if (typeof s !== 'string') {
            return s;
        }
        var value = s.toLowerCase().trim()
                     .replace(/[ _]/g, '-')
                     .replace(/[^-\w]/g, '')
                     .replace(/-+/g, '-');
        if (limit) {
            value = value.substr(0, limit);  // Cap the slug length.
        }
        return value;
    }

    var tags = /input|keygen|meter|option|output|progress|select|textarea/i;
    function fieldFocused(e) {
        return tags.test(e.target.nodeName);
    }

    function querystring(url) {
        var qpos = url.indexOf('?');
        if (qpos === -1) {
            return {};
        } else {
            return getVars(url.substr(qpos + 1));
        }
    }

    function baseurl(url) {
        return url.split('?')[0];
    }

    function encodeURIComponent(uri) {
        return window.encodeURIComponent(uri).replace(/%20/g, '+');
    }

    function decodeURIComponent(uri) {
        return window.decodeURIComponent(uri.replace(/\+/g, ' '));
    }

    function urlencode(kwargs) {
        if (typeof kwargs === 'string') {
            return encodeURIComponent(kwargs);
        }
        var params = [];
        if ('__keywords' in kwargs) {
            delete kwargs.__keywords;
        }
        var keys = _.keys(kwargs).sort();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = kwargs[key];
            if (value === undefined) {
                params.push(encodeURIComponent(key));
            } else {
                params.push(encodeURIComponent(key) + '=' +
                            encodeURIComponent(value));
            }
        }
        return params.join('&');
    }

    function urlparams(url, kwargs) {
        return baseurl(url) + '?' + urlencode(_.defaults(kwargs, querystring(url)));
    }

    function urlunparam(url, params) {
        var qs = querystring(url);
        for (var i = 0, p; p = params[i++];) {
            if (!(p in qs)) {
                continue;
            }
            delete qs[p];
        }
        var base = baseurl(url);
        if (_.isEmpty(qs)) {
            return base;
        }
        return base + '?' + urlencode(qs);
    }

    function getVars(qs, excl_undefined) {
        if (!qs) qs = location.search;
        if (!qs || qs === '?') return {};
        if (qs && qs[0] == '?') {
            qs = qs.substr(1);  // Filter off the leading ? if it's there.
        }

        return _.chain(qs.split('&'))  // ['a=b', 'c=d']
                .map(function(c) {return c.split('=').map(decodeURIComponent);}) //  [['a', 'b'], ['c', 'd']]
                .filter(function(p) {  // [['a', 'b'], ['c', undefined]] -> [['a', 'b']]
                    return !!p[0] && (!excl_undefined || !_.isUndefined(p[1]));
                }).object()  // {'a': 'b', 'c': 'd'}
                .value();
    }

    function translate(data, default_language, lang) {
        if (typeof data === 'string') {
            return data;
        }
        // TODO: Make this a setting somewhere.
        default_language = default_language || 'en-US';
        lang = lang || (window.navigator.l10n ? window.navigator.l10n.language : 'en-US');
        if (lang in data) {
            return data[lang];
        }
        var short_lang = lang.split('-')[0];
        if (short_lang in data) {
            return data[short_lang];
        }
        if (typeof default_language === 'string') {
            return data[default_language];
        } else if (typeof default_language === 'object' &&
                   'default_language' in default_language &&
                   default_language.default_language in data) {
            return data[default_language.default_language];
        }
        for (var x in data) { return data[x]; }
        return '';
    }

    var osStrings = {
        'windows': 'Windows',
        'mac': 'Mac',
        'linux': 'Linux',
        'android': 'Android'
    };
    function browser() {
        var os = {};
        var platform = '';
        for (var i in osStrings) {
            if (navigator.userAgent.indexOf(osStrings[i]) !== -1) {
                return i;
            }
        }
        return 'other';
    }

    return {
        '_pd': _pd,
        'baseurl': baseurl,
        'browser': browser,
        'encodeURIComponent': encodeURIComponent,
        'decodeURIComponent': decodeURIComponent,
        'escape_': escape_,
        'fieldFocused': fieldFocused,
        'getVars': getVars,
        'initCharCount': initCharCount,
        'querystring': querystring,
        'slugify': slugify,
        'urlencode': urlencode,
        'urlparams': urlparams,
        'urlunparam': urlunparam,
        'translate': translate
    };

});
