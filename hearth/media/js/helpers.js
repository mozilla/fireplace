define('helpers',
       ['format', 'l10n', 'settings', 'templates', 'urls', 'utils'],
       function(format, gettext, settings, nunjucks, urls, utils) {

    var env = nunjucks.env;

    env.addFilter('urlparams', utils.urlparams);

    env.addFilter('nl2br', function(obj) {
        return obj.replace(/\n/g, '<br>');
    });

    env.addFilter('make_data_attrs', function(obj) {
        return _.map(
            _.pairs(obj),
            function(pair) {
                return 'data-' + utils.escape_(pair[0]) + '="' + utils.escape_(pair[1]) + '"';
            }
        ).join(' ');
    });

    env.addFilter('external_href', function(obj) {
        return 'href="' + utils.escape_(obj) + '" target="_blank"';
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

    env.addFilter('dataproduct', function(obj) {
        var product = _.extend({}, obj);

        if ('this' in product) {
            delete product.this;
        }
        if ('window' in product) {
            delete product.window;
        }
        return 'data-product="' + utils.escape_(JSON.stringify(product)) + '"';
    });

    env.addFilter('round', Math.round);
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
        settings: settings,
        url: function(view_name, args) {
            return require('urls').reverse(view_name, args);
        }
    };
});
