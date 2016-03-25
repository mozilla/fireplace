define('nav', ['core/capabilities', 'core/log', 'core/navigation', 'core/views', 'core/z'],
       function(caps, log, navigation, views, z) {
    'use strict';

    var logger = log('nav');

    // Search.
    z.page.on('showsearch', function(e, args) {
        args = args || {};
        var $header = $('.global-header');

        // Remember whether search was already active.
        var isSearchActive = $header.hasClass('searching');
        $header.addClass('searching');
        $('.global-nav-menu-desktop .mkt-search-btn').addClass('header-nav-link-active');

        if (args.isDesktop) {
            $('.desktop-search').addClass('searching').find('input').trigger('focus');
            z.page.trigger('clearsettings');
            $('.compat-filter').removeClass('mkt-select--visible');
            z.body.trigger('hideoverlay');
        } else {
            // Focus the search input for mobile users (only when the form needs to slide in).
            if (!isSearchActive) {
                setTimeout(function() {
                    $('#search-q').trigger('focus');
                }, 400);
            }
        }
    }).on('clearsearch', function() {
        $('#search-q, #search-q-desktop').val('').trigger('input').trigger('blur');
        $('.global-header').removeClass('searching');
        $('.global-nav-menu-desktop .mkt-search-btn').removeClass('header-nav-link-active');
        $('.desktop-search').removeClass('searching');
    })
    // Clear desktop settings menu.
    .on('clearsettings', function() {
        var $menu = $('.settings-menu-desktop');

        $('.global-nav-menu-desktop .mkt-settings-btn').removeClass('header-nav-link-active');
        $menu.removeClass('settings-menu-active');
    });

    z.body.on('click', '.header--search-form .mkt-search-btn', function() {
        z.page.trigger('showsearch');

        if ($('#search-q').val()) {
            $('.header--search-form').trigger('submit');
        }
    }).on('click', '.mkt-search-clear-btn', function() {
        z.page.trigger('clearsearch');
    }).on('click', '.header-back-btn', function() {
        logger.log('header back button pressed');
        resetMenuState();
        navigation.back();
    }).on('change input', '#search-q, #search-q-desktop', updateSearchPlaceholder);

    function updateSearchPlaceholder(evt) {
        var $this = $(evt.target);
        var isEmpty = $this.val() === '';
        $this.siblings('label').toggleClass('search-empty', isEmpty);
    }

    function resetMenuState() {
        $('.global-nav-menu').attr('data-nav-active', '');
        $('.global-nav-menu-desktop a').removeClass('header-nav-link-active');
    }

    function setMenuState(item) {
        if (item !== 'more') {
            resetMenuState();
        }
        $('.global-nav-menu').attr('data-nav-active', item);
    }

    // Main mobile nav.
    z.body.on('click', '.global-nav-menu', function(e) {
        var $this = $(e.target).closest('.global-nav-link');
        setMenuState($this.data('nav-type'));

        if ($this.data('nav-type') === 'more') {
            z.body.trigger('showoverlay', {selector: '.more-menu-overlay'});
        }
    })
    // Mobile header categories trigger.
    .on('click', '.header-categories-btn', function() {
        z.body.trigger('showoverlay', {selector: '.cat-menu-overlay'});
    }).on('showoverlay', function(e, overlay) {
        $(overlay.selector).addClass('overlay-visible');
        z.page.trigger('clearsearch');

        if (window.matchMedia('max-width: 1050px').matches) {
            z.body.addClass('overlayed');
        }

        // Inject overlay clear button.
        setTimeout(function() {
            z.body.append('<button class="overlay-close"></button>');
            $('.overlay-close').addClass('overlay-close-visible');
        }, 200);
    }).on('hideoverlay', function() {
        $('.overlay-close').remove();
        z.body.removeClass('overlayed');
        $('.full-screen-overlay').removeClass('overlay-visible');
        $('.nav-category-link.header-nav-link-active').removeClass('header-nav-link-active');
    })
    // Close mobile overlay button.
    .on('click', '.overlay-close, .full-screen-overlay a', function() {
        resetMenuState();
        z.body.trigger('hideoverlay');
    })
    // Desktop nav menu excluding search.
    .on('click', '.global-nav-menu-desktop a:not(.mkt-search-btn):not(.mkt-settings-btn)', function(e) {
        var $this = $(e.target);
        var isActive = $this.hasClass('header-nav-link-active');

        resetMenuState();
        z.page.trigger('clearsearch');
        z.page.trigger('clearsettings');
        $this.addClass('header-nav-link-active');

        if ($this.hasClass('nav-category-link')) {
            if (isActive) {
                resetMenuState();
                z.body.trigger('hideoverlay');
            } else {
                z.body.trigger('showoverlay', {selector: '.cat-menu-overlay'});
            }
        } else {
            z.body.trigger('hideoverlay');
        }
    })
    // Desktop search.
    .on('click', '.global-nav-menu-desktop .mkt-search-btn', function(e) {
        var $this = $(e.target);
        $this.addClass('header-nav-link-active');

        z.page.trigger('clearsettings');

        if ($('.desktop-search.searching').length) {
            z.page.trigger('clearsearch');
        } else {
            z.page.trigger('showsearch', {isDesktop: true});
        }
    })
    // Desktop settings menu trigger.
    .on('click', '.global-nav-menu-desktop .mkt-settings-btn', function() {
        var $menu = $('.settings-menu-desktop');
        z.page.trigger('clearsearch');

        if ($menu.hasClass('settings-menu-active')) {
            z.page.trigger('clearsettings');
        } else {
            $(this).addClass('header-nav-link-active');
            $menu.addClass('settings-menu-active');
        }
    })
    // Desktop settings menu.
    .on('click', '.settings-menu-desktop a', function() {
        z.page.trigger('clearsettings');
    });

    // Firefox OS 1.1 compatibility by https://github.com/jesobreira
    if (caps.firefoxOS || navigator.userAgent.match(/Firefox\/18\.1/)) {

        // we must recreate all the overlay events and animations with jQuery
        var initLegacyOverlays = function() {
            // loop until all the elements are ready
            if ($('.above,.below,.header-categories-btn,.global-nav-link,#navigation,.cat-menu-all a').length) {
                // hide it first
                var $above = $('.above');
                var $below = $('.below');
                var docHeight = $(document).height();
                var winWidth = $(window).width();

                $above.slideUp();
                $below.css({ // below is more complicated, since it comes from below
                    'top': docHeight + 'px',
                    'display': 'none'
                });

                // bug fix - removes "Categories" header link
                $('.cat-menu-all a').attr('href', 'javascript:void(0);');

                // sets width to 100% of the page
                $('.above,.below,.global-nav-menu').width(winWidth);
                // do it again if the user toggles portrait/landscape mode
                z.win.on('saferesize', function() {
                    $('.above,.below,.global-nav-menu').width(winWidth);
                });

                // open events
                $('.header-categories-btn').click(function() {
                    $above.slideDown();
                });

                $('.global-nav-link[data-nav-type=more]').click(function() {
                    $below.css('display', 'block').animate({top: 0}, 300); // make visible and animate
                });

                // close events
                z.doc.on('click', '.overlay-close, .cat-menu-all', function() {
                    $above.slideUp();
                    $below.animate({
                        top: $(window).height() + 'px' // animate it to below the page
                    }, 300, function() {
                        $below.css('display', 'none'); // hide it again
                    });
                });
                $('.app-categories li, .nav-more-menu li').click(function() {
                    $above.slideUp();
                    $below.animate({
                        top: $(window).height() + 'px'  // animate it to below the page
                    }, 300, function() {
                        $below.css('display', 'none'); // hide it again
                    });
                });
            } else {
                // repeat this condition as long as we dont find all the needed elements
                setTimeout(initLegacyOverlays, 500);
            }
        };
        initLegacyOverlays();
    }
});
