define('navbar',
    ['categories', 'jquery', 'jquery.hammer', 'log', 'navigation', 'nunjucks',
     'settings', 'underscore', 'urls', 'z'],
    function(cats, $, hammer, log, navigation, nunjucks,
             settings, _, urls, z) {
    'use strict';

    var console = log('navbar');

    // Tab name must match route/view name to match window.location.pathname.
    var tabsMkt = ['homepage', 'new', 'popular', 'recommended', 'categories'];
    var tabsSettings = ['settings', 'purchases', 'feedback'];

    function initNavbarButtons() {
        // Navbar settings + Marketplace buttons.
        var $mktNavGroup = $('.nav-mkt , .act-tray.mobile');
        var $settingsNavGroup = $('.nav-settings, .mkt-tray');

        function toggleNavbar($on, $off) {
            $on.addClass('active');
            $off.removeClass('active');
        }

        // Toggle between Settings page and Marketplace pages.
        z.body.on('click', '.act-tray.mobile', function(e) {
            // Activate Settings page navbar.
            e.preventDefault();
            toggleNavbar($settingsNavGroup, $mktNavGroup);
            z.page.trigger('navigate',
                           $settingsNavGroup.find('[data-tab]:first-child a').attr('href'));
        })
        .on('click', '.mkt-tray', function() {
            // Activate Marketplace pages navbar.
            toggleNavbar($mktNavGroup, $settingsNavGroup);
            z.page.trigger('navigate',
                           $mktNavGroup.find('[data-tab]:first-child a').attr('href'));
        })
        .on('click', '.site a', function() {
            // Activate Marketplace pages navbar.
            toggleNavbar($mktNavGroup, $settingsNavGroup);
        });
    }
    z.body.one('loaded', initNavbarButtons);

    // Swipe handler.
    z.body.hammer({'swipe_velocity': 0.3}).on('swipe', function(e) {
        var $target = $(e.gesture.startEvent.target);
        if (['left', 'right'].indexOf(e.gesture.direction) === -1 ||
            z.body.attr('data-page-type').indexOf('root') === -1 ||
            $target.closest('.slider').length ||
            $target.closest('input').length) {
            return;
        }
        var $navbar = $('.navbar.active');
        var tabs = tabsMkt;
        if ($navbar.hasClass('nav-settings')) {
            tabs = tabsSettings;
        }

        // Calculate next tab.
        var currentTab;
        var page_type = $('body').attr('data-page-type').split(' ');
        $navbar.find('[data-tab]').each(function(i, tab) {
            if (page_type.indexOf(tab.dataset.tab) !== -1) {
                currentTab = tab.dataset.tab;
            }
        });
        var tabPos = tabs.indexOf(currentTab);

        if (e.gesture.direction == 'left') {
            // Next tab (unless we're at the end of the array).
            tabPos = tabPos === tabs.length - 1 ? tabPos : tabPos + 1;
        } else if (e.gesture.direction == 'right') {
            // Prev tab (unless we're at the beginning of the array).
            tabPos = tabPos === 0 ? tabPos : tabPos - 1;
        }

        var newTab = tabs[tabPos];
        if (newTab == currentTab) {
            // Reached the end.
            return;
        }

        var href = $navbar.find('li').eq(tabPos).find('.tab-link').attr('href');
        z.page.trigger('navigate', href);
    });

    z.body.on('click', '.navbar li > a', function() {
        var $this = $(this);
        if ($this.hasClass('desktop-cat-link')) {
            // Don't allow click of category tab on desktop.
            return;
        }
    });

    // Desktop.
    function initActTray() {
        $('.act-tray:not(.mobile)').on('mouseover', function() {
            $(this).addClass('active');
        }).on('mouseout', function() {
            $(this).removeClass('active');
        }).on('click', '.account-links a', function() {
            $('.account-links, .settings, .act-tray').removeClass('active');
        });
    }
    initActTray();
    z.page.on('loaded', function() {
        $('.account-links, .act-tray .settings').removeClass('active');
    });
    z.body.on('reloaded_chrome', initActTray);

    function render() {
        // Build navbar.
        // Set class and data attribute of navbar to name of active tab.
        var tabsMktRouteMap = {};
        var tabName;
        for (i = 0; i < tabsMkt.length; i++) {
            tabName = tabsMkt[i];
            try {
                tabsMktRouteMap[urls.reverse(tabName)] = tabName;
            } catch(e) {
                continue;
            }
        }
        var tabsSettingsRouteMap = {};
        for (var i = 0; i < tabsSettings.length; i++) {
            tabName = tabsSettings[i];
            try {
                tabsSettingsRouteMap[urls.reverse(tabName)] = tabName;
            } catch(e) {
                continue;
            }
        }

        $('#site-nav').html(
            nunjucks.env.render('nav.html', {
                is_settings: z.body.attr('data-page-type').indexOf('settings') !== -1,
                z: z
            })
        ).addClass('secondary-header');

        // Desktop categories hover menu.
        var catsTrigger = '.navbar > .categories';
        var $menu = $('.hovercats');

        $menu.html(
            nunjucks.env.render('cat_overlay.html', {categories: cats})
        );

        z.body.on('mouseenter', catsTrigger, function() {
            $menu.addClass('active');
        }).on('mouseleave', catsTrigger, function() {
            $menu.removeClass('active');
        }).on('click', catsTrigger + ' li a', function(e) {
            e.stopPropagation();
            $menu.removeClass('active');
        }).on('mouseenter', catsTrigger + ' li a', function() {
            $(this).removeClass('cur-cat');
        }).on('mouseleave', catsTrigger + ' li a', function() {
            $(this).addClass('cur-cat');
        });

        initNavbarButtons();
    }

    // Render navbar.
    z.page.one('loaded', render);
    z.win.on('resize', _.debounce(render, 100));
});
