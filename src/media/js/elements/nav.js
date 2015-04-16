/*
    Marketplace Nav element. Only for mobile as a slide-out hamburger menu.

    <mkt-nav>
        Wrapper.

        statusElement - element on which status classes are set. Returns
                        document.body since <main> needs to know the status to
                        determine whether to translateX.
        root - returns <mkt-nav-root>.
        subnavs - returns <mkt-nav-child>ren.
        toggle - toggles the visibility of the nav, primary by setting classes
                 on statusElement.
        toggleChildren - toggles subnav given an ID. If ID is `false`, hide
                         all subnavs.
        updateActiveNode - sets the active link based on the current path.

    <mkt-nav-root>
        Contains the primary navigation links and toggles.

    <mkt-nav-child>
        Subnavs. Toggled by <mkt-nav-child-toggle>

        toggle - toggle visibility.
        visible - whether or not the child is visible.

    <mkt-nav-toggle>
        Toggles visibility of nav on click.

        createdCallback - sets click handler to toggle nav.

    <mkt-nav-child-toggle>
        Toggles visibility of nav child on click. Hides all nav children if
        [for] is not set.

        createdCallback - sets event listener that toggles respective nav child
                          on click. It is paired with the child by setting
                          [for] contains the child's [id].
        navChild - returns the paired nav child..

    z.win.resize
        Set <main>'s min-height so the overlay can cover the nav. And that the
        nav won't appear from underneath.

    z.body.click
        If nav is toggled on, and main is clicked, hide the nav.

    z.page.navigate
        Update active node. Hide children.
*/
define('elements/nav',
    ['core/settings', 'core/z', 'document-register-element', 'jquery',
     'underscore'],
    function(settings, z, dre, $, _) {
    'use strict';

    var el = {};
    var cl = {
        // Active link / nav item. Set on <a class="mkt-nav--item">.
        ACTIVE: 'mkt-nav--active',
        // Displaying the nav (set on body).
        VISIBLE: 'mkt-nav--visible',
        // Showing a subnav (set on body).
        SHOWING_CHILD: 'mkt-nav--subnav-visible'
    };

    el.MktNavElement = document.registerElement('mkt-nav', {
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
            navChildren: {
                // Return all child <mkt-nav-child> elements.
                get: function() {
                    return this.querySelectorAll('mkt-nav-child');
                },
            },
            toggle: {
                value: function(bool) {
                    var root = this;
                    if (bool !== undefined) {
                        if (bool) {
                            root.statusElement.classList.add(cl.VISIBLE);
                        } else {
                            root.statusElement.classList.remove(cl.VISIBLE);
                        }
                    } else {
                        root.statusElement.classList.toggle(cl.VISIBLE);
                    }

                    return root;
                },
            },
            toggleChildren: {
                value: function(arg) {
                    // If arg is false, toggle all children off.
                    // Else arg is an ID, toggle only that child on.
                    var root = this;
                    var navChildren = root.navChildren;

                    var showingChild = false;
                    for (var i = 0; i < navChildren.length; i++) {
                        var child = navChildren[i];

                        if (child.id === arg) {
                            child.toggle();
                            showingChild = child.visible;
                        } else {
                            navChildren[i].toggle(false);
                        }
                    }

                    root.statusElement.classList.toggle(cl.SHOWING_CHILD,
                                                        showingChild);
                }
            },
            updateActiveNode: {
                value: function(path) {
                    var root = this;

                    // Remove highlights from formerly-active nodes.
                    var links = root.querySelectorAll('a.' + cl.ACTIVE);
                    for (var i = 0; links && (i < links.length); i++) {
                        links[i].classList.remove(cl.ACTIVE);
                    }

                    // Highlight new active nodes based on current page.
                    var activeLinks = root.querySelectorAll(
                        'a[href="' + (path || window.location.pathname) + '"]');
                    for (i = 0; activeLinks && (i < activeLinks.length); i++) {
                        if (!activeLinks[i].hasAttribute(
                            'data-nav-no-active-node')) {
                            activeLinks[i].classList.add(cl.ACTIVE);
                        }
                    }
                }
            },
        }),
    });

    el.MktNavRootElement = document.registerElement('mkt-nav-root', {
        prototype: Object.create(HTMLUListElement.prototype, {}),
    });

    el.MktNavChildElement = document.registerElement('mkt-nav-child', {
        prototype: Object.create(el.MktNavRootElement.prototype, {
            toggle: {
                value: function(bool) {
                    var root = this;

                    if (bool !== undefined) {
                        if (bool) {
                            root.classList.add(cl.VISIBLE);
                        } else {
                            root.classList.remove(cl.VISIBLE);
                        }
                    } else {
                        root.classList.toggle(cl.VISIBLE);
                    }

                    return root;
                }
            },
            visible: {
                get: function() {
                    return this.classList.contains(cl.VISIBLE);
                }
            }
        })
    });

    el.MktNavToggleElement = document.registerElement('mkt-nav-toggle', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;
                    root.addEventListener('click', function() {
                        document.querySelector('mkt-nav').toggle();
                    });
                }
            }
        })
    });

    el.MktNavChildToggleElement = document.registerElement('mkt-nav-child-toggle', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    /*
                        Toggle the <mkt-nav-child> element with the specified
                        id when elements with the data-toggle-nav attribute are
                        clicked.
                    */
                    var root = this;
                    root.addEventListener('click', function(e) {
                        e.preventDefault();

                        // On click, toggle navChild.
                        var navChild = root.navChild;

                        if (!navChild) {
                            // If [for] not specified, just hide all.
                            return document.querySelector('mkt-nav')
                                           .toggleChildren(false);
                        }

                        navChild.parentNode.toggleChildren(navChild.id);
                    });
                }
            },
            navChild: {
                get: function() {
                    return document.getElementById(this.getAttribute('for'));
                }
            }
        })
    });

    z.doc.on('click', '.' + cl.VISIBLE + ' main', function(e) {
        // Toggle nav off when clicking in the main area when it's toggled.
        var nav = document.querySelector('mkt-nav');
        if (nav && nav.toggle) {
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
                    // Timeout so that the child doesn't hide too soon.
                    nav.toggleChildren(false);
                }, 250);
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
        classes: cl,
        elements: el
    };
});
