define('helpers',
       ['l10n', 'templates', 'require', 'utils', 'format', 'settings', 'urls', 'user'],
       function(l10n, nunjucks, require, utils) {

    var env = nunjucks.env;

    env.addFilter('urlparams', utils.urlparams);

    env.addFilter('nl2br', function(obj) {
        return obj.replace(/\n/g, '<br>');
    });

    env.addFilter('make_data_attrs', function(obj) {
        return _.pairs(obj).map(function(pair) {
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
        return obj.reduce(function(mem, num) {return mem + num;}, 0);
    });

    // Functions provided in the default context.
    return {
        api: require('urls').api.url,
        apiParams: require('urls').api.params,
        url: require('urls').reverse,

        _: l10n.gettext,
        _plural: l10n.ngettext,
        format: require('format').format,
        settings: require('settings'),
        user: require('user')
    };
});
