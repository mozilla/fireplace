/*
    Marketplace Header element.

    <mkt-header>
        The header itself. Currently, only one is expected to be in the DOM.

        createdCallback - moves <mkt-header-child>ren out to be its siblings
                          so that the z-index can hide children being parent.
        toggleChildren - toggle one visible child at a time, updates body class
                         to let nav know that a child is being shown.

    <mkt-header-child>
        Like subheaders, can be toggled from under the nav.

        [data-header-child--input] - if set, then the child will expect an
        input element. When the header child is toggled, the input will be
        focused. When the input is blurred, then the header child will toggle
        closed.

    <mkt-header-child-toggle>
        Toggles the visibility of a <mkt-header-child>.

        for - specifies the ID of the child it will toggle.

    z.page.navigate
        - Toggle all header children closed.
*/
define('elements/header',
    ['core/z', 'document-register-element', 'jquery', 'underscore'],
    function(z, dre, $, _) {
    'use strict';

    var el = {};
    var cl = {
         // Set on <mkt-header-child> saying that it is visible.
        CHILD_VISIBLE: 'mkt-header-child--visible',
        // Data attribute for whether the header child contains an input.
        CHILD_INPUT: 'data-header-child--input',
        LINK_ACTIVE: 'mkt-header-nav--link-active',
        SHOWING_CHILD: 'mkt-header--showing-child'
    };

    el.MktHeaderElement = document.registerElement('mkt-header', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    // Move <mkt-header-child>ren out since we need to z-index
                    // them below <mkt-header>.
                    var headerChildren = root.querySelectorAll(
                        'mkt-header-child');
                    for (var i = 0; i < headerChildren.length; i++) {
                        if (root.nextSibling) {
                            root.parentNode.insertBefore(headerChildren[i],
                                                         root.nextSibling);
                        } else {
                            root.parentNode.appendChild(headerChildren[i]);
                        }
                    }
                }
            },
            headerChildren: {
                get: function() {
                    return this.parentNode.querySelectorAll(
                        'mkt-header-child');
                }
            },
            statusElement: {
                get: function() {
                    return this.parentNode;
                }
            },
            toggleChildren: {
                value: function(arg, bool) {
                    // If arg is false, toggle all children off.
                    // Else arg is an ID, toggle only that child on.
                    var root = this;
                    var headerChildren = root.headerChildren;

                    var showingChild = false;
                    for (var i = 0; i < headerChildren.length; i++) {
                        var child = headerChildren[i];

                        if (child.id === arg) {
                            child.toggle(bool);
                            showingChild = child.visible;
                        } else {
                            headerChildren[i].toggle(false);
                        }
                    }

                    root.statusElement.classList.toggle(cl.SHOWING_CHILD,
                                                        showingChild);
                }
            }
        })
    });

    el.MktHeaderChildElement = document.registerElement('mkt-header-child', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    if (root.isInput) {
                        // If main element is input, then hide child on blur.
                        var input = root.input;
                        input.onblur = function(e) {
                            if (e) {
                                var target = e.explicitOriginalTarget ||
                                             document.activeElement;
                                if (target.getAttribute('for') == root.id) {
                                    // Don't trigger if blurring on toggle.
                                    return;
                                }
                            }

                            document.querySelector('mkt-header')
                                    .toggleChildren(root.id, false);
                        };
                        // Clear input on submit.
                        $(root.querySelector('form')).submit(function(e) {
                            e.preventDefault();
                            setTimeout(function() {
                                input.value = '';
                                return false;
                            }, 50);
                        });
                    }
                }
            },
            toggle: {
                value: function(bool) {
                    // Toggle visibility.
                    var root = this;

                    if (bool !== undefined) {
                        if (bool) {
                            root.classList.add(cl.CHILD_VISIBLE);
                        } else {
                            root.classList.remove(cl.CHILD_VISIBLE);
                        }
                    } else {
                        root.classList.toggle(cl.CHILD_VISIBLE);
                    }

                    // TODO: use events.
                    var toggleButton = document.querySelector(
                        'mkt-header-child-toggle[for="' + root.id + '"]');
                    if (toggleButton) {
                        toggleButton.toggle(root.visible);
                    }

                    if (root.visible && root.isInput) {
                        // Auto-focus the input.
                        root.input.focus();
                    }

                    return root;
                }
            },
            visible: {
                get: function() {
                    return this.classList.contains(cl.CHILD_VISIBLE);
                }
            },
            input: {
                get: function() {
                    var root = this;
                    if (root.isInput) {
                        return root.querySelector('input');
                    }
                }
            },
            isInput: {
                get: function() {
                    return this.hasAttribute(cl.CHILD_INPUT);
                }
            }
        })
    });

    el.MktHeaderChildToggleElement = document.registerElement('mkt-header-child-toggle', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    root.addEventListener('click', function() {
                        // On click, toggle headerChild.
                        var id = root.getAttribute('for');
                        document.querySelector('mkt-header')
                                .toggleChildren(id);
                    });
                }
            },
            toggle: {
                value: function(bool) {
                    // Toggle visibility.
                    var root = this;
                    if (bool !== undefined) {
                        if (bool) {
                            root.classList.add(cl.CHILD_VISIBLE);
                        } else {
                            root.classList.remove(cl.CHILD_VISIBLE);
                        }
                    } else {
                        root.classList.toggle(cl.CHILD_VISIBLE);
                    }
                    return root;
                }
            }
        })
    });

    el.MktHeaderNavElement = document.registerElement('mkt-header-nav', {
        prototype: Object.create(HTMLUListElement.prototype, {
            updateActiveNode: {
                value: function(path) {
                    var root = this;

                    // Remove highlights from formerly-active nodes.
                    var links = root.querySelectorAll('a.' + cl.LINK_ACTIVE);
                    for (var i = 0; links && (i < links.length); i++) {
                        links[i].classList.remove(cl.LINK_ACTIVE);
                    }

                    // Highlight new active nodes based on current page.
                    var activeLinks = root.querySelectorAll(
                        'a[href="' + (path || window.location.pathname) + '"]');
                    for (i = 0; activeLinks && (i < activeLinks.length); i++) {
                        activeLinks[i].classList.add(cl.LINK_ACTIVE);
                    }
                }
            }
        })
    });

    z.page.on('navigate logged_out', function() {
        var header = document.querySelector('mkt-header');
        if (header) {
            try {
                // Catch in case header hasn't yet been initialized.
                setTimeout(function() {
                    header.toggleChildren(false);
                }, 50);
            } catch(e) {}
        }
    })

    .on('navigate loaded', function() {
        var headerNav = document.querySelector('mkt-header-nav');
        if (headerNav && headerNav.updateActiveNode) {
            headerNav.updateActiveNode();
        }
    });

    return {
        classes: cl,
        elements: el
    };
});
