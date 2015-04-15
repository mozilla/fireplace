/*
    Marketplace Nav element.

    - Nav state is kept as classes on mktNav.statusElement, the body.
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

    <mkt-nav-top-child> is similar to <mkt-nav-child> except that when it
    is toggled, it will not toggle the whole nav. It is intended to just
    slide-down from underneath the nav rather than slide out the whole page
    (e.g., search bar that slides down).
*/
define('elements/nav',
    ['core/settings', 'core/z', 'document-register-element', 'jquery',
     'underscore'],
    function(settings, z, dre, $, _) {

    // Active link / nav item. Set on <a class="mkt-nav--item">.
    var ACTIVE = 'mkt-nav--active';
    // Showing subnav (set on <mkt-nav-child>).
    var SHOWING = 'mkt-nav--showing-child';
    // Displaying the nav on mobile.
    var VISIBLE = 'mkt-nav--visible';
    // Showing a subnav (set on the status element).
    var SUBNAV_VISIBLE = 'mkt-nav--subnav-visible';

    var MktNavElement = document.registerElement('mkt-nav', {
        prototype: Object.create(HTMLElement.prototype, {
            statusElement: {
                // Return the element on which status classes are stored.
                value: document.body
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
            toggle: {
                /*
                Toggle the class specified by this.statusVisibleClass on
                this.statusElement. If an optional argument is passed, it will
                force the class to be added or removed based on the truthiness
                of that value.
                */
                value: function(bool) {
                    var root = this;
                    if (bool !== undefined) {
                        if (bool) {
                            root.statusElement.classList.add(VISIBLE);
                        } else {
                            root.statusElement.classList.remove(VISIBLE);
                        }
                    } else {
                        root.statusElement.classList.toggle(VISIBLE);
                    }

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
                    var root = this;
                    if (bool !== undefined) {
                        if (bool) {
                            root.statusElement.classList.add(SUBNAV_VISIBLE);
                        } else {
                            root.statusElement.classList.remove(
                                SUBNAV_VISIBLE);
                        }
                    } else {
                        root.statusElement.classList.toggle(SUBNAV_VISIBLE);
                    }
                    if (!root.statusElement.classList
                                           .contains(SUBNAV_VISIBLE)) {
                        for (var i = 0; i < this.subnavs.length; i++) {
                            root.subnavs[i].hide();
                        }
                    }
                    return root;
                },
            },
            hideSubnavs: {
                value: function() {
                    var root = this;
                    var subnavs = root.querySelectorAll('.' + SHOWING);
                    root.toggleSubnav(false);
                    for (i = 0; subnavs && (i < subnavs.length); i++) {
                        subnavs[i].classList.remove(SHOWING);
                    }

                    // TODO: <mkt-nav-child-toggle> element.
                    var toggles = document.querySelectorAll('[data-toggle-subnavs]');
                    for (var i = 0; toggles && (i < toggles.length); i++) {
                        toggles.classList.remove(SHOWING);
                    }
                }
            },
            updateActiveNode: {
                value: function(path) {
                    var root = this;

                    // Remove highlights from formerly-active nodes.
                    var links = root.querySelectorAll('a.' + ACTIVE);
                    for (var i = 0; links && (i < links.length); i++) {
                        links[i].classList.remove(ACTIVE);
                    }

                    // Highlight new active nodes based on current page.
                    var activeLinks = root.querySelectorAll(
                        'a[href="' + (path || window.location.pathname) + '"]');
                    for (i = 0; activeLinks && (i < activeLinks.length); i++) {
                        if (!activeLinks[i].hasAttribute('data-nav-no-active-node')) {
                            activeLinks[i].classList.add(ACTIVE);
                        }
                    }
                }
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
                    var siblings = this.parentNode.querySelectorAll('.' + VISIBLE);
                    for (var i = 0 ; i < siblings.length; i++) {
                        siblings[i].classList.remove(VISIBLE);
                    }
                    this.classList.add(VISIBLE);
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
        document.getElementById(this.getAttribute('data-toggle-nav')).toggle();
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
        var id = this.getAttribute('data-toggle-subnav');
        if (id) {
            var subnav = document.getElementById(id);
            if (this.classList.contains(SHOWING)) {
                subnav.hide();
                subnav.parentNode.toggleSubnav(false);
                this.classList.remove(SHOWING);
            } else {
                subnav.show();
                subnav.parentNode.toggle(true).toggleSubnav(true);
                this.classList.add(SHOWING);
            }
        } else {
            var targetParent = this.parentNode;
            if (targetParent.tagName == 'MKT-NAV') {
                targetParent.toggleSubnav();
            }
        }
    })

    .on('click', VISIBLE + ' main', function(e) {
        // Toggle nav off when clicking in the main area when it's toggled.
        var nav = document.querySelector('mkt-nav');
        if (nav) {
            nav.toggle();
        }
    });

    z.page.on('navigate', function() {
        // Close all menus. The try/catch block is necessary because navigate
        // gets triggered before the custom element is registered with the DOM.
        var nav = document.querySelector('mkt-nav');
        if (nav) {
            try {
                nav.updateActiveNode();
                nav.toggle(false);
                setTimeout(function() {
                    // Timeout so that the subnav doesn't hide too soon.
                    nav.toggleSubnav(false);
                }, 250);
                nav.hideSubnavs();
            } catch(e) {}
        }
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
                // Hide the sidebar nav behind <main> by setting min-height on
                // <main>. Only do this if the sidebar nav is being used.
                if (window.matchMedia('(min-width: 800px)').matches) {
                    main.style.minHeight = null;
                } else {
                    main.style.minHeight = screen.height + 'px';
                }
            }
        }
    }

    z.win.on('resize', _.debounce(setMainMinHeight, 250));
    setMainMinHeight();

    return {
        classes: {
            ACTIVE: ACTIVE,
            SHOWING: SHOWING,
            VISIBLE: VISIBLE,
            SUBNAV_VISIBLE: SUBNAV_VISIBLE,
        },
        MktNavElement: MktNavElement,
        MktNavRootElement: MktNavRootElement,
        MktNavChildElement: MktNavChildElement,
    };
});
