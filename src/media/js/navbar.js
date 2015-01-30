define('navbar',
    ['categories', 'jquery', 'core/log', 'core/navigation', 'core/nunjucks', 'core/settings',
     'underscore', 'core/urls', 'core/user', 'core/z'],
    function(cats, $, log, navigation, nunjucks, settings, _, urls, user, z) {
    'use strict';
    var logger = log('navbar');

    var DESKTOP_WIDTH = 710;
    var NAV_MKT_BASE_OFFSET = -65;
    var NAV_SETTINGS_BASE_OFFSET = 0;
    var NAV_LINK_VISIBLE_WIDTH = 50;

    function initNavbarButtons() {
        // Navbar settings + Marketplace buttons.
        var $mktNav = $('.nav-mkt');
        var $settingsNav = $('.nav-settings');
        var $mktNavGroup = $mktNav.add('.act-tray');
        var $settingsNavGroup = $settingsNav.add('.mkt-tray');

        function toggleNavbar($on, $off) {
            $on.addClass('active');
            $off.removeClass('active');
        }

        function fitNavbarOnSwitch($navbar, $item) {
            // Switching between navbars makes it difficult to do initial
            // line-fitting since the navbar is in a transitioning state. So
            // we do a timeout. But for navbars that have already been fitted,
            // don't do a timeout delay.
            var waitForTransition = 500;
            if ($navbar.data('fitted')) {
                waitForTransition = 0;
            }

            setTimeout(function() {
                fitNavbarMobile($item);
            }, waitForTransition);
        }

        // Toggle between Settings page and Marketplace pages.
        z.body.on('click', '.act-tray', function(e) {
            // Activate Settings page navbar.
            e.preventDefault();
            $mktNav.css('right', '');  // Reset the offset for transition effect.
            toggleNavbar($settingsNavGroup, $mktNavGroup);

            var $firstLink = $settingsNavGroup.find('[data-tab]:first-child a');
            z.page.trigger('navigate', $firstLink.attr('href'));

            fitNavbarOnSwitch($firstLink.closest('.navbar'),
                              $firstLink.closest('li'));
        })
        .on('click', '.mkt-tray', function(e) {
            // Activate Marketplace pages navbar.
            e.preventDefault();
            $('.nav-settings').css('right', '');  // Reset the offset for transition effect.
            toggleNavbar($mktNavGroup, $settingsNavGroup);

            var $firstLink = $mktNavGroup.find('[data-tab]:first-child a');
            z.page.trigger('navigate', $firstLink.attr('href'));

            fitNavbarOnSwitch($firstLink.closest('.navbar'),
                              $firstLink.closest('li'));
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
        if (!$navbar.length) {
            return;
        }

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
            if ($next.length) {
                var nextLeftEdgeOffset = $next.offset().left;
                var nextRightEdgeOffset = nextLeftEdgeOffset + $next.width();
                if (nextRightEdgeOffset < windowWidth) {
                    right = (currentNavbarOffset -
                             (windowWidth + NAV_LINK_VISIBLE_WIDTH - nextRightEdgeOffset) +
                             padding);
                }
            }
        }

        if (right < baseOffset) {
            // Don't scroll past the base starting point.
            right = baseOffset;
        }

        $item.closest('.navbar').css('right', right + 'px');
        return right;
    }

    function linefitNavbarMobile($navbar) {
        // Linefits the navbar on mobile such that the nav element flowing
        // off the screen is clickable by 50px.
        if (!$navbar.length) {
            return;
        }

        var windowWidth = z.win.width();
        if ($navbar.hasClass('nav-settings')) {
            windowWidth -= $('.mkt-tray').width();
        }

        if ($navbar.width() < windowWidth || $navbar.attr('data-fitted')) {
            // No fitting needed.
            $navbar.attr('data-fitted', true);
            return;
        }
        $navbar.attr('data-fitted', true);

        // Check on the initial offset that the last link has 50px visible.
        var $item = $($navbar.find('li')[0]);
        var $next = $item.next();
        var rightEdgeOffset = $item.offset().left + $item.width();

        // Keep going until we get an item that cuts off the screen.
        var $el = $next;
        while ($next.length && rightEdgeOffset < windowWidth) {
            $next = $next.next();
            if ($next.length) {
                rightEdgeOffset = $next.offset().left + $next.width();
                $el = $next;
            }
        }

        // Check that the element before the one that goes off the screen is
        // clickable.
        var leftEdgeOffset = $el.offset().left;
        if (leftEdgeOffset > (windowWidth - NAV_LINK_VISIBLE_WIDTH)) {
            while (leftEdgeOffset > (windowWidth - NAV_LINK_VISIBLE_WIDTH)) {
                var fontSize = parseInt($el.css('font-size'), 10);
                $navbar.find('li').css('font-size', fontSize - 1 + 'px');
                leftEdgeOffset = $el.offset().left;
            }
        }
    }

    function fitNavbarMobile($item) {
        // Does both line-fitting and offset calculations for the navbar.
        // Note that line-fitting must be done first since the offset affects
        // its calculations.
        linefitNavbarMobile($item.closest('.navbar'));
        calcNavbarOffset($item);
    }

    function fitNavbarDesktop() {
        // Shrinks the font-size and padding of the nav elements until it
        // all fits within the window.
        var windowWidth = z.win.width();
        if (windowWidth < DESKTOP_WIDTH) {
            return;
        }
        var $navbar = $('.nav-mkt');
        var $navbarItems = $navbar.find('li');
        var navbarWidth = $navbar.width();
        while (navbarWidth > windowWidth) {
            var fontSize = parseInt($navbar.find('li').css('font-size'), 10);
            var padding = parseInt($navbar.find('li').css('padding-right'), 10);
            $navbarItems.css({
                'font-size': fontSize - 1 + 'px',
                'padding-left': padding - 10 + 'px',
                'padding-right': padding - 10 + 'px'
            });
            navbarWidth = $navbar.width();
        }
    }

    function initSettingsHoverDesktop() {
        $('.header-settings-wrap').on('mouseover', function() {
            this.classList.add('active');
        }).on('mouseout', function() {
            this.classList.remove('active');
        }).on('click', '.account-links a', function() {
            $('.account-links, .settings').removeClass('active');
        });
    }
    initSettingsHoverDesktop();

    z.page.on('loaded', function() {
        $('.account-links, .act-tray .settings').removeClass('active');
    });

    z.body.on('click', '.hovercats a', function() {
        // Since the category drop-down is shown with CSS on `:hover`, when a
        // category link is pressed, we add this class to hide the drop-down
        // with CSS. See https://bugzilla.mozilla.org/show_bug.cgi?id=1100688
        $('.tab-categories').addClass('link-clicked');
    }).on('mouseover', '.tab-categories', function() {
        // If the drop-down was hidden via the `link-clicked` class, then
        // we first remove the class to allow the drop-down to be shown with
        // CSS on `:hover`. Admittedly, this is only slightly better than
        // using JS to toggle visibility on `mouseover`/`mouseout`. You can
        // blame this: https://bugzilla.mozilla.org/show_bug.cgi?id=1100688
        $('.tab-categories.link-clicked').removeClass('link-clicked');
    }).on('reloaded_chrome', initSettingsHoverDesktop);

    function render() {
        // Build navbar.
        var stack = navigation.stack();
        $('#site-nav').html(
            nunjucks.env.render('nav.html', {
                is_settings: z.body.attr('data-page-type') &&
                             z.body.attr('data-page-type').indexOf('settings') !== -1,
                logged_in: user.logged_in(),
                path: stack.length ? stack[stack.length - 1].path : '',
                z: z
            })
        ).addClass('secondary-header');

        fitNavbarMobile($('.navbar.active .initial-active'));
        fitNavbarDesktop();

        // Desktop categories hover menu.
        $('.hovercats').html(
            nunjucks.env.render('cat_overlay.html', {categories: cats})
        );

        initNavbarButtons();
    }

    // Render navbar.
    z.page.one('loaded', render);
    z.win.on('resize', _.debounce(render, 100));

    return {
        'render': render,
    };
});
