/*
    Render non-content templates such as header and footer.
    Set up event handlers related to components in the header and footer.
*/
define('header_footer',
    ['categories', 'compat_filter', 'core/nunjucks', 'core/settings',
     'core/storage', 'core/z', 'newsletter'],
    function(cats, compatFilter, nunjucks, settings,
             storage, z, newsletter) {

    settings.addonsEnabled = settings.addonsEnabled || !!storage.getItem('always_show_extensions');

    function renderHeader() {
        if (document.getElementById('global-header')) {
            return;
        }

        $('#site-header, main #site-nav').remove();

        $('main').before(nunjucks.env.render('header.html', {categories: cats}));
        $('main').after(nunjucks.env.render('nav.html'));

        z.body.attr('data-mkt-nav--enabled', true);
    }

    function renderFooter() {
        $('#site-footer').html(nunjucks.env.render('footer.html',
            newsletter.context()
        ));
    }

    function renderPlatformSelector() {
        if (document.querySelector('mkt-select.compat-filter')) {
            return;
        }

        $(nunjucks.env.render('_includes/platform_selector.html'))
            .insertBefore('#page');
    }

    function renderBanners() {
        var bannerDiv = $('.banners');
        if (!bannerDiv.length) {
            bannerDiv = '<div class="banners"></div>';
        }
        // Always show banners banners before anything else.
        // TODO: Desktop fix for this also.
        $('#global-header').before(bannerDiv);
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
