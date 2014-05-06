define('helpers_local', ['nunjucks', 'z'], function(nunjucks, z) {
    var filters = nunjucks.require('filters');
    var globals = nunjucks.require('globals');

   var rewriteCdnUrlMappings = [
        {
            name: 'Privacy Policy',
            pattern: /\/media\/docs\/privacy\/.+\.html/g,
            replacement: '/privacy-policy'
        },
        {
            name: 'Terms of Use',
            pattern: /\/media\/docs\/terms\/.+\.html/g,
            replacement: '/terms-of-use'
        }
    ];

    // When we get a page back from legal docs stored on the CDN, we
    // need to rewrite them to work locally within a packaged version
    // of Marketplace.
    filters.rewriteCdnUrls = function(text){
        rewriteCdnUrlMappings.forEach(function(mapping){
            text = text.replace(mapping.pattern, mapping.replacement);
        });
        return text;
    };

    // Functions provided in the default context.
    var helpers = {
    };

    // Put the helpers into the nunjucks global.
    for (var i in helpers) {
        if (helpers.hasOwnProperty(i)) {
            globals[i] = helpers[i];
        }
    }

    return helpers;
});
