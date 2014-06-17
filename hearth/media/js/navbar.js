define('navbar', ['jquery', 'jquery.hammer', 'log', 'navigation', 'nunjucks', 'settings', 'underscore', 'urls', 'z'],
    function($, hammer, log, navigation, nunjucks, settings, _, urls, z) {
    'use strict';

    var console = log('navbar');

    // Tab name must match route/view name to match window.location.pathname.
    var tabsMkt = ['homepage', 'new', 'popular', 'categories'];
    var tabsSettings = ['settings', 'purchases', /*'help',*/ 'feedback'];

    // Navbar settings + Marketplace buttons.
    function initNavbarButtons() {
        var $mktNavGroup = $('.nav-mkt , .act-tray.mobile');
        var $settingsNavGroup = $('.nav-settings, .mkt-tray');

        function toggleNavbar($on, $off) {
            $on.addClass('active');
            $off.removeClass('active');
            // Highlight first child if haven't visited this nav yet.
            if (!$on.find('li.active').length) {
                $('li:first-child', $on).addClass('active');
            }
        }

        // Toggle between Settings page and Marketplace pages.
        z.body.on('click', '.act-tray.mobile', function(e) {
            // Activate Settings page navbar.
            e.preventDefault();
            toggleNavbar($settingsNavGroup, $mktNavGroup);
            z.page.trigger('navigate', $settingsNavGroup.find('li.active a').attr('href'));
        })
        .on('click', '.mkt-tray, .site', function() {
            // Activate Marketplace pages navbar.
            toggleNavbar($mktNavGroup, $settingsNavGroup);
            navigation.back();
        });
    }
    z.body.one('loaded', initNavbarButtons);

    // Swipe handler.
    z.body.hammer({'swipe_velocity': 0.3}).on('swipe', function(e) {
        if (['left', 'right'].indexOf(e.gesture.direction) === -1) {
            return;
        }
        var $navbar = $('.navbar.active');
        var tabs = tabsMkt;
        if ($navbar.hasClass('nav-settings')) {
            tabs = tabsSettings;
        }

        // Calculate next tab.
        var currentTab = $navbar.attr('data-tab');
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

        $navbar.find('li').eq(tabPos).trigger('click');
    })
    // Tap handler.
    .on('click', '.navbar li', function() {
        var $this = $(this);
        var $navbar = $this.closest('.navbar.active');
        var tabs = tabsMkt;
        if ($navbar.hasClass('nav-settings')) {
            tabs = tabsSettings;
        }

        var targetTab = $this.attr('data-tab');
        var tabPos = tabs.indexOf(targetTab);

        // Visually change tab by sliding navbar.
        $navbar.attr('data-tab', targetTab)
               .find('li').removeClass('active')
               .eq(tabPos).addClass('active');

        z.page.trigger('navigate', $this.find('a').attr('href'));
    })
    .on('click', '.navbar li a', function() {
        // Event wasn't propagating to parent :(.
        $(this).parent().trigger('click');
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
        $('.account-links, .settings').removeClass('active');
    });
    z.body.on('reloaded_chrome', initActTray);

    // Build navbar.
    function render() {
        // Set class and data attribute of navbar to name of active tab.
        var tabsMktRouteMap = {};
        for (i = 0; i < tabsMkt.length; i++) {
            var tabName = tabsMkt[i];
            try {
                tabsMktRouteMap[urls.reverse(tabName)] = tabName;
            } catch(e) {
                continue;
            }
        }
        var tabsSettingsRouteMap = {};
        for (var i = 0; i < tabsSettings.length; i++) {
            var tabName = tabsSettings[i];
            try {
                tabsSettingsRouteMap[urls.reverse(tabName)] = tabName;
            } catch(e) {
                continue;
            }
        }

        $('#site-nav').html(
            nunjucks.env.render('nav.html', {
                active_tab_mkt: tabsMktRouteMap[window.location.pathname] || 'home',
                active_tab_settings: tabsSettingsRouteMap[window.location.pathname] || 'settings',
                is_settings: z.body.attr('data-page-type').indexOf('settings') !== -1,
                z: z,
            })
        ).addClass('secondary-header');
    }

    // Render navbar.
    z.page.one('loaded', render);
});
