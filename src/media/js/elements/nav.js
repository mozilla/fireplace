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
    ['core/log', 'core/z', 'jquery'],
    function(log, z, $) {

    // TODO: come up with better names for these, and explain them with comments.
    var ACTIVE = 'mkt-nav--active';
    var SHOWING = 'mkt-nav--showing-child';
    var VISIBLE = 'mkt-nav--visible';
    var SUBNAV_VISIBLE = 'mkt-nav--subnav-visible';

    var logger = log('elements/nav');

    var MktNavElement = document.registerElement('mkt-nav', {
        prototype: Object.create(HTMLElement.prototype, {
            /*
            Toggle the class specified by this.statusVisibleClass on
            this.statusElement. If an optional argument is passed, it will
            force the class to be added or removed based on the truthiness of
            that value.

            Return `this`, for chaining.
            */
            toggle: {
                value: function(bool) {
                    this.$statusElement.toggleClass(VISIBLE, bool);
                    return this;
                },
            },

            /*
            Toggle the class specified by this.statusSubnavVisibleClass on
            this.statusElement. If an optional argument is passed, it will
            force the class to be added or removed based on the truthiness of
            that value.

            Return `this`, for chaining.
            */
            toggleSubnav: {
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

            // Return the element on which status classes are stored.
            $statusElement: {
                value: $(document.body),
            },

            // Return the child <mkt-nav-root> element.
            root: {
                get: function() {
                    return this.querySelectorAll('mkt-nav-root');
                },
            },

            // Return all child <mkt-nav-child> elements.
            subnavs: {
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
            // Show this subnav and hide all sibling <mkt-nav-child> elements.
            hide: {
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

    // Toggle the <mkt-nav> element with the specified id when elements with the
    // data-toggle-nav attribute are clicked.
    z.body.on('click', '[data-toggle-nav]', function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var navId = $(this).data('toggle-nav');
        $('#' + navId).get(0).toggle();
    })

    // Toggle the <mkt-nav-child> element with the specified id when elements
    // with the data-toggle-nav attribute are clicked. If the value of that
    // attribute is empty, attempt to toggle the parent's subnav if it is an
    // <mkt-nav> element.
    .on('click', '[data-toggle-subnav]', function(evt) {
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
            e.target == document.querySelector('#page') &&
            $('#page').offset().left >= $('mkt-nav').width()) {
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

    return {
        'MktNavElement': MktNavElement,
        'MktNavRootElement': MktNavRootElement,
        'MktNavChildElement': MktNavChildElement,
    };

});
