define('helpers', ['lib/format', 'l10n', 'templates', 'urls'], function(format, gettext, nunjucks) {

    var env = nunjucks.env;

    function escape_(s) {
        if (typeof s === 'undefined') {
            return;
        }
        return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
                .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
    }

    env.addFilter('urlparams', function(obj, kwargs) {
        if (obj.indexOf('?') === -1) {
            obj += '?';
        } else {
            obj += '&';
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

        return obj + params.join('&');

    });

    env.addFilter('nl2br', function(obj) {
        return obj.replace('\n', '<br>');
    });

    env.addFilter('make_data_attrs', function(obj) {
        return _.map(
            _.pairs(obj),
            function(pair) {
                return 'data-' + escape_(pair[0]) + '="' + escape_(pair[1]) + '"';
            }
        ).join(' ');
    });

    env.addFilter('external_href', function(obj) {
        return 'href="' + escape_(obj) + '" target="_blank"';
    });

    env.addFilter('numberfmt', function(obj) {
        // TODO: Provide number formatting
        return obj;
    });

    env.addFilter('join', function(obj, delim) {
        return _.isArray(obj) ? obj.join(delim) : '';
    });

    env.addFilter('safe', function(obj) {
        // TODO: When jlongster's autoescaping patch lands, this won't be needed.
        return obj;
    });

    env.addFilter('round', Math.round);
    env.addFilter('float', parseFloat);  // TODO: remove when nunjucks is updated
    env.addFilter('format', format.format);

    env.addFilter('sum', function(obj) {
        return _.reduce(obj, function(mem, num) {
            return mem + num;
        }, 0);
    });

    function _gettext(str, kwargs) {
        // TODO: When webL10n.get fails, do a format. Note that webL10n uses
        // double curly braces.
        return document.webL10n.get(str, kwargs) || str;
    }

    // Functions provided in the default context.
    return {
        window: window,
        _: _gettext,
        format: format.format,
        randint: function(min, max) {
            return Math.round(min + Math.random() * (max - min));
        },
        url: function(view_name, args) {
            return require('urls').reverse(view_name, args);
        }
    };
});
