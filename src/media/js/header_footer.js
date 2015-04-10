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
            $('#mkt-nav--site-header, #site-header, main #site-nav').remove();

            $('<div id="mkt-nav--site-header" class="mkt-nav--wrapper"></div>')
                .append(nunjucks.env.render('header.html'))
                .append(nunjucks.env.render('mkt_nav.html', {
                    categories: categories
                }))
                .insertBefore('main');

            z.body.attr('data-mkt-nav--enabled', true);
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
            $('mkt-select.compat-filter').remove();
            $(nunjucks.env.render('_includes/platform_selector.html'))
                .insertBefore('#page');
        }
    }

    function renderBanners() {
        var bannerDiv = $('#banners');

        if (bannerDiv.length === 0) {
            bannerDiv = '<div id="banners"></div>';
        }

        if (settings.mktNavEnabled) {
            if (window.matchMedia('(min-width: 800px)').matches) {
                $('#mkt-nav--site-header').before(bannerDiv);
            } else {
                $('#page').before(bannerDiv);
            }
        } else {
            $('#page').before(bannerDiv);
        }
    }

    z.page.on('reload_chrome', function() {
        renderHeader();
        renderFooter();
        renderPlatformSelector();
        renderBanners();
    });

    return {
        renderHeader: renderHeader,
        renderFooter: renderFooter,
        renderPlatformSelector: renderPlatformSelector
    };
});
