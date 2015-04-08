/*
    Render non-content templates such as header and footer.
    Set up event handlers related to components in the header and footer.
*/
define('header_footer',
    ['categories', 'compat_filter', 'core/nunjucks', 'core/settings', 'core/z',
     'newsletter'],
    function(categories, compatFilter, nunjucks, settings, z,
             newsletter) {

    function renderHeader() {
        if (settings.mktNavEnabled) {
            $('#site-header').remove();

            $(nunjucks.env.render('header.html')).insertBefore('main');

            $(nunjucks.env.render('mkt_nav.html', {
                categories: categories
            })).insertAfter('#site-header');

            z.body.attr('data-mkt-nav--enabled', true);

            $('main #site-nav').remove();
        } else {
            $('#site-header').html(nunjucks.env.render('header.html'));
        }
    }

    function renderFooter() {
        $('#site-footer').html(nunjucks.env.render('footer.html',
            newsletter.context()
        ));
    }

    function renderPlatformSelector() {
        if (settings.mktNavEnabled) {
            $(nunjucks.env.render('_includes/platform_selector.html'))
                .insertBefore('#page');
        }
    }

    z.page.on('reload_chrome', function() {
        renderHeader();
        renderFooter();
        renderPlatformSelector();
    });

    return {
        renderHeader: renderHeader,
        renderFooter: renderFooter,
        renderPlatformSelector: renderPlatformSelector
    };
});
