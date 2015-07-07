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
    ['core/element_utils', 'core/z', 'document-register-element',
     'underscore'],
    function(eUtils, z, dre,
     _) {
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
                    eUtils.each(root.querySelectorAll('mkt-header-child'),
                                function(headerChild) {
                        if (root.nextSibling) {
                            root.parentNode.insertBefore(headerChild,
                                                         root.nextSibling);
                        } else {
                            root.parentNode.appendChild(headerChild);
                        }
                    });
                }
            },
            attributeChangedCallback: {
                value: function(attr, oldVal, newVal, namespace) {
                    if (attr === 'header-title') {
                        this.setTitle();
                    }
                },
            },
            headerChildren: {
                get: function() {
                    return this.parentNode.querySelectorAll(
                        'mkt-header-child');
                }
            },
            setTitle: {
                value: function() {
                    var titleText = this.getAttribute('header-title');
                    var title = this.querySelector('.mkt-header--title');
                    title.textContent = titleText;
                    title.setAttribute('title', titleText);
                },
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

                    var showingChild = false;
                    eUtils.each(root.headerChildren, function(child) {
                        if (child.id === arg) {
                            child.toggle(bool);
                            showingChild = child.visible;
                        } else {
                            child.toggle(false);
                        }
                    });

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
                    var input = this.input;
                    var label = this.querySelector('label');
                    if (this.isInput && label) {
                        var setInputWidth = function() {
                            input.style.width = input.value ?
                                null : label.clientWidth + 'px';
                        };
                        setInputWidth();
                        input.addEventListener('input', setInputWidth);
                        document.addEventListener('saferesize', setInputWidth);
                    }
                }
            },
            toggle: {
                value: function(bool) {
                    // Toggle visibility.
                    var root = this;

                    eUtils.toggleClass(root, cl.CHILD_VISIBLE, bool);

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

                    root.addEventListener('click', function(e) {
                        e.preventDefault();
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
                    return eUtils.toggleClass(this, cl.CHILD_VISIBLE, bool);
                }
            }
        })
    });

    el.MktHeaderNavElement = document.registerElement('mkt-header-nav', {
        prototype: Object.create(HTMLUListElement.prototype, {
            updateActiveNode: {
                value: function(path) {
                    return eUtils.updateActiveNode(this, cl.LINK_ACTIVE, path);
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

        // Clear inputs on submit.
        eUtils.each(document.querySelectorAll(
                    '[data-header-child--input] input'), function(input) {
            setTimeout(function() {
                input.value = '';
                input.dispatchEvent(eUtils.MktEvent('input'));
            }, 50);
        });
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
