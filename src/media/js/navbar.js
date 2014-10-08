define('navbar',
    ['categories', 'jquery', 'log', 'navigation', 'nunjucks', 'settings',
     'underscore', 'urls', 'user', 'z'],
    function(cats, $, log, navigation, nunjucks, settings, _, urls, user, z) {
    'use strict';
    var console = log('navbar');

    var NAV_MKT_BASE_OFFSET = -65;
    var NAV_SETTINGS_BASE_OFFSET = 0;
    var NAV_LINK_VISIBLE_WIDTH = 50;

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
            var $firstLink = $settingsNavGroup.find('[data-tab]:first-child a');
            z.page.trigger('navigate', $firstLink.attr('href'));
            calcNavbarOffset($firstLink.closest('li'));
        })
        .on('click', '.mkt-tray', function() {
            // Activate Marketplace pages navbar.
            toggleNavbar($mktNavGroup, $settingsNavGroup);
            var $firstLink = $mktNavGroup.find('[data-tab]:first-child a');
            z.page.trigger('navigate', $firstLink.attr('href'));
            calcNavbarOffset($firstLink.closest('li'));
        })
        .on('click', '.site a', function() {
            // Activate Marketplace pages navbar.
            toggleNavbar($mktNavGroup, $settingsNavGroup);
        });
    }
    z.body.one('loaded', initNavbarButtons);

    z.body.on('click', '.navbar li > a', function() {
        var $this = $(this);
        if ($this.hasClass('desktop-cat-link')) {
            // Don't allow click of category tab on desktop.
            return;
        }

        calcNavbarOffset($this.closest('li'));
    });

    function calcNavbarOffset($item) {
        // Calculate appropriate offsets for the navbar so that it slides well
        // for any language. Good luck understanding what's going on.
        var $navbar = $item.closest('.navbar');
        var currentNavbarOffset = $navbar.offset().left * -1;
        var padding = 10;
        var right = currentNavbarOffset;
        var rightEdgeOffset = $item.offset().left + $item.width();

        var baseOffset = NAV_MKT_BASE_OFFSET;
        var windowWidth = z.win.width();
        if ($navbar.hasClass('nav-settings')) {
            baseOffset = NAV_SETTINGS_BASE_OFFSET;
            windowWidth -= $('.mkt-tray').width();
        }
        console.log(baseOffset);

        if (rightEdgeOffset > windowWidth) {
            // Sliding forwards.
            // If the link is overflowing off the right edge of the page,
            // slide the navbar enough so the link is fully visible.
            right = (currentNavbarOffset +
                     (rightEdgeOffset - windowWidth) + padding);

            // If there is another link after the current link, move the navbar
            // some more such that the next link is clickable (50px target).
            if ($item.next().length) {
                right += NAV_LINK_VISIBLE_WIDTH;
            }
        } else if (currentNavbarOffset !== NAV_MKT_BASE_OFFSET) {
            // Sliding backwards.
            // If the next link to the one clicked is in full view, slide it
            // so it becomes visible by only 50px and thus clickable.
            var $next = $item.next();
            var nextLeftEdgeOffset = $next.offset().left;
            var nextRightEdgeOffset = nextLeftEdgeOffset + $next.width();
            if (nextRightEdgeOffset < windowWidth) {
                right = (currentNavbarOffset -
                         (windowWidth + NAV_LINK_VISIBLE_WIDTH - nextRightEdgeOffset) +
                         padding);
            }
        }

        if (right < baseOffset) {
            // Don't scroll past the base starting point.
            right = baseOffset;
        }

        $item.closest('.navbar').css('right', right + 'px');
    }

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
        var stack = navigation.stack();
        $('#site-nav').html(
            nunjucks.env.render('nav.html', {
                is_settings: z.body.attr('data-page-type').indexOf('settings') !== -1,
                logged_in: user.logged_in(),
                recommendations: settings.switches.indexOf('recommendations') !== -1,
                path: stack[stack.length - 1].path,
                z: z
            })
        ).addClass('secondary-header');

        calcNavbarOffset($('.navbar.active .initial-active'));

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
