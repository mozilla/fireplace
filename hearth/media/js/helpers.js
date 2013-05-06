define('helpers',
       ['l10n', 'templates', 'underscore', 'utils', 'format', 'settings', 'urls', 'user'],
       function(l10n, nunjucks, _, utils) {

    var SafeString = nunjucks.require('runtime').SafeString;
    var env = nunjucks.env;

    function make_safe(func) {
        return function() {
            return new SafeString(func.apply(this, arguments));
        };
    }

    function safe_filter(name, func) {
        env.addFilter(name, make_safe(func));
    }

    env.addFilter('urlparams', utils.urlparams);
    env.addFilter('urlunparam', utils.urlunparam);

    safe_filter('nl2br', function(obj) {
        return obj.replace(/\n/g, '<br>');
    });

    safe_filter('make_data_attrs', function(obj) {
        return _.pairs(obj).map(function(pair) {
                return 'data-' + utils.escape_(pair[0]) + '="' + utils.escape_(pair[1]) + '"';
            }
        ).join(' ');
    });

    safe_filter('external_href', function(obj) {
        return 'href="' + utils.escape_(obj) + '" target="_blank"';
    });

    env.addFilter('numberfmt', function(obj) {
        // TODO: Provide number formatting
        return obj;
    });

    safe_filter('stringify', JSON.stringify);

    safe_filter('dataproduct', function(obj) {
        var product = _.extend({}, obj);

        if ('this' in product) {
            delete product.this;
        }
        if ('window' in product) {
            delete product.window;
        }
        return 'data-product="' + utils.escape_(JSON.stringify(product)) + '"';
    });

    env.addFilter('format', format.format);

    env.addFilter('sum', function(obj) {
        return obj.reduce(function(mem, num) {return mem + num;}, 0);
    });

    // Functions provided in the default context.
    return {
        api: require('urls').api.url,
        apiParams: require('urls').api.params,
        url: require('urls').reverse,

        _: make_safe(l10n.gettext),
        _plural: make_safe(l10n.ngettext),
        format: require('format').format,
        settings: require('settings'),
        user: require('user'),

        range: _.range,
        escape: utils.escape_,

        REGIONS: require('settings').REGION_CHOICES_SLUG,

        navigator: window.navigator
    };
});
