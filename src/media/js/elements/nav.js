/*
    Marketplace Nav element.

    - Nav state is kept as classes on mktNav.$statusElement, the body.
    - Keeps state of currently-selected nav item.
    - Clicking an element with [data-toggle-nav="X"] will toggle the nav
      element with ID "X".

    On mobile:
        - Activated by clicking the hamburger icon
        - Slide-out hamburger menu nav
        - Slide-out subnavs within the main nav

    On desktop:
        - Header bar at the top
        - Slide-down subnavs
*/
define('elements/nav',
    ['core/log', 'core/settings', 'core/z', 'jquery', 'underscore'],
    function(log, settings, z, $) {

    // Active link / nav item. Set on <a class="mkt-nav--item">.
    var ACTIVE = 'mkt-nav--active';
    // Showing subnav.
    var SHOWING = 'mkt-nav--showing-child';
    // Displaying the nav on mobile. Set on <body>.
    var VISIBLE = 'mkt-nav--visible';
    // Showing subnav.
    var SUBNAV_VISIBLE = 'mkt-nav--subnav-visible';
    // Hide when not VISIBLE. Set on <mkt-nav> itself.
    var BACKGROUND_HIDDEN = 'mkt-nav--background-hidden';

    var logger = log('elements/nav');

    var MktNavElement = document.registerElement('mkt-nav', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    this.classList.add(BACKGROUND_HIDDEN);
                }
            },
            toggle: {
                /*
                Toggle the class specified by this.statusVisibleClass on
                this.statusElement. If an optional argument is passed, it will
                force the class to be added or removed based on the truthiness
                of that value.
                */
                value: function(bool) {
                    var root = this;
                    if (this.$statusElement.hasClass(VISIBLE)) {
                        // Have to hide since Android/Flame will flicker the
                        // Nav when scrolling despite it being z-indexed
                        // behind main content. But don't want to hide it
                        // right away, so we set a timeout.
                        setTimeout(function() {
                            root.classList.add(BACKGROUND_HIDDEN);
                        }, 500);
                    } else {
                        root.classList.remove(BACKGROUND_HIDDEN);
                    }
                    root.$statusElement.toggleClass(VISIBLE, bool);
                    return root;
                },
            },
            toggleSubnav: {
                /*
                    Toggle the class specified by this.statusSubnavVisibleClass
                    on this.statusElement. If an optional argument is passed,
                    it will force the class to be added or removed based on the
                    truthiness of that value.
                */
                value: function(bool) {
                    this.$statusElement.toggleClass(SUBNAV_VISIBLE, bool);
                    if (!bool) {
                        for (var i = 0; i < this.subnavs.length; i++) {
                            this.subnavs[i].hide();
                        }
                    }
                    return this;
                },
            },
            $statusElement: {
                // Return the element on which status classes are stored.
                value: $(document.body),
            },
            root: {
                // Return the child <mkt-nav-root> element.
                get: function() {
                    return this.querySelectorAll('mkt-nav-root');
                },
            },
            subnavs: {
                // Return all child <mkt-nav-child> elements.
                get: function() {
                    return this.querySelectorAll('mkt-nav-child');
                },
            },
        }),
    });

    var MktNavRootElement = document.registerElement('mkt-nav-root', {
        prototype: Object.create(HTMLUListElement.prototype, {}),
    });

    var MktNavChildElement = document.registerElement('mkt-nav-child', {
        prototype: Object.create(MktNavRootElement.prototype, {
            hide: {
                // Show this subnav and hide all sibling <mkt-nav-child>
                // elements.
                value: function() {
                    this.classList.remove(VISIBLE);
                    return this;
                },
            },
            show: {
                value: function() {
                    var $this = $(this);
                    $this.siblings('.' + VISIBLE).removeClass(VISIBLE);
                    $this.addClass(VISIBLE);
                    return this;
                },
            }
        }),
    });

    z.body.on('click', '[data-toggle-nav]', function(evt) {
        // Toggle the <mkt-nav> element with the specified id when elements
        // with the // data-toggle-nav attribute are clicked.
        evt.preventDefault();
        evt.stopPropagation();
        var navId = $(this).data('toggle-nav');
        $('#' + navId).get(0).toggle();
    })

    .on('click', '[data-toggle-subnav]', function(evt) {
        /*
            Toggle the <mkt-nav-child> element with the specified id when
            elements with the data-toggle-nav attribute are clicked. If the
            value of that attribute is empty, attempt to toggle the parent's
            subnav if it is an <mkt-nav> element.
        */
        evt.preventDefault();
        evt.stopPropagation();
        var $this = $(this);
        var id = $this.data('toggle-subnav');
        if (id) {
            var $subnav = $('#' + id);
            if ($this.is('.' + SHOWING)) {
                $subnav.get(0).hide();
                $subnav.parent().get(0).toggleSubnav();
                this.classList.remove(SHOWING);
            } else {
                $subnav.get(0).show();
                $subnav.parent().get(0).toggle(true).toggleSubnav(true);
                this.classList.add(SHOWING);
            }
        } else {
            var $parent = $this.parent();
            if ($parent.is('mkt-nav')){
                $parent.get(0).toggleSubnav();
            }
        }
    })

    .on('click', function(e) {
        if (this.classList.contains(VISIBLE) &&
            e.target == document.querySelector('main') &&
            $('main').offset().left >= $('mkt-nav').width()) {
            document.querySelector('mkt-nav').toggle();
        }
    });

    z.page.on('navigate', function() {
        // Remove highlights from formerly-active nodes.
        $('mkt-nav a.' + ACTIVE).each(function(index, element) {
            element.classList.remove(ACTIVE);
        });

        // Highlight new active nodes.
        $('mkt-nav a[href="' + window.location.pathname + '"]').each(function(index, element) {
            element.classList.add(ACTIVE);
        });

        // Close all menus. The try/catch block is necessary because navigate
        // gets triggered before the custom element is registered with the DOM.
        $('mkt-nav').each(function(index, element) {
            try {
                element.toggle(false);
                setTimeout(function() {
                    element.toggleSubnav(false);
                }, 250);
            } catch(e) {}
        });

        $('.' + SHOWING).removeClass(SHOWING);
    });

    function setMainMinHeight() {
        // So the nav doesn't appear when the page isn't tall enough.
        // CSS solutions wouldn't work since min-height with a percentage
        // wouldn't apply unless <html>/<body> had heights, and setting to
        // 100% height would mess up the page since our <footer> isn't part of
        // <main>. Could be resolved if we made <footer> a part of <main>.
        if (settings.mktNavEnabled) {
            var main = document.querySelector('main');
            if (main) {
                main.style.minHeight = screen.height + 'px';
            }
        }
    }

    z.win.on('resize', _.debounce(setMainMinHeight, 250));
    setMainMinHeight();

    return {
        'MktNavElement': MktNavElement,
        'MktNavRootElement': MktNavRootElement,
        'MktNavChildElement': MktNavChildElement,
    };
});
