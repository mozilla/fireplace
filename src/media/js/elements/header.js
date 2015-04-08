/*
    Marketplace Header element.

    <mkt-header>
        The header itself. Currently, only one is expected to be in the DOM.

        createdCallback - moves <mkt-header-child>ren out to be its siblings
                          so that the z-index can hide children being parent.

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
    ['core/z', 'jquery', 'underscore'],
    function(z, $, _) {
    'use strict';

    // Set on <mkt-header-child> saying that it is visible.
    var CHILD_VISIBLE = 'mkt-header-child--visible';
    // Data attribute for whether the header child contains an input.
    var CHILD_INPUT = 'data-header-child--input';

    var MktHeaderElement = document.registerElement('mkt-header', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    // Move <mkt-header-child>ren out since we need to z-index
                    // them below <mkt-header>.
                    var headerChildren = root.querySelectorAll(
                        'mkt-header-child');
                    for (var i = 0; i < headerChildren.length; i++) {
                        headerChildren[i].header = root;
                        root.parentNode.insertBefore(headerChildren[i],
                                                     root.nextSibling);
                    }
                }
            },
            headerChildren: {
                get: function() {
                    return document.querySelectorAll('mkt-header-child');
                }
            },
            hideHeaderChildren: {
                value: function() {
                    var headerChildren = this.headerChildren;
                    for (var i = 0; i < headerChildren.length; i++) {
                        headerChildren[i].toggle(false);
                    }
                }
            }
        })
    });

    var MktHeaderChildElement = document.registerElement('mkt-header-child', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    if (root.isInput) {
                        // If main element is input, then hide child on blur.
                        var input = root.input;
                        input.onblur = function() {
                            setTimeout(function() {
                                // setTimeout to queue behind toggle button.
                                root.toggle(false);
                            }, 50);
                        };
                        // Clear input on submit;
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
                            root.classList.add(CHILD_VISIBLE);
                        } else {
                            root.classList.remove(CHILD_VISIBLE);
                        }
                    } else {
                        root.classList.toggle(CHILD_VISIBLE);
                    }

                    // TODO: use events.
                    var toggleButton = document.querySelector(
                        'mkt-header-child-toggle[for="' + root.id + '"]');
                    if (toggleButton) {
                        toggleButton.toggle(root.visible);
                    }

                    if (root.visible) {
                        var nav = document.querySelector('mkt-nav');
                        if (nav) {
                            nav.hideSubnavs();
                        }

                        if (root.isInput) {
                            root.input.focus();
                        }
                    }

                    return root;
                }
            },
            header: {
                set: function(header) {
                    this._header = header;
                },
                get: function() {
                    return this._header;
                }
            },
            visible: {
                get: function() {
                    return this.classList.contains(CHILD_VISIBLE);
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
                    return this.hasAttribute(CHILD_INPUT);
                }
            }
        })
    });

    var MktHeaderChildToggleElement = document.registerElement('mkt-header-child-toggle', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    root.addEventListener('click', function() {
                        // On click, find headerChild to toggle.
                        var headerChild = root.headerChild;
                        if (headerChild.isInput) {
                            // If child is input, and it is already visible,
                            // don't do anything. The input already has an
                            // onblur attached which will toggle the child.
                            // Else this click event and the onblur event will
                            // conflict.
                            if (!headerChild.visible) {
                                headerChild.toggle(true);
                            }
                        } else {
                            headerChild.toggle();
                        }
                    });
                }
            },
            toggle: {
                value: function(bool) {
                    // Toggle visibility.
                    var root = this;
                    if (bool !== undefined) {
                        if (bool) {
                            root.classList.add(CHILD_VISIBLE);
                        } else {
                            root.classList.remove(CHILD_VISIBLE);
                        }
                    } else {
                        root.classList.toggle(CHILD_VISIBLE);
                    }
                    return root;
                }
            },
            headerChild: {
                get: function() {
                    return document.getElementById(this.getAttribute('for'));
                }
            },
        })
    });

    z.page.on('navigate logged_out', function() {
        var header = document.querySelector('mkt-header');
        if (header) {
            try {
                // Catch in case header hasn't yet been initialized.
                setTimeout(function() {
                    header.hideHeaderChildren();
                }, 50);
            } catch(e) {}
        }
    });

    return {
        classes: {
            CHILD_INPUT: CHILD_INPUT,
            CHILD_VISIBLE: CHILD_VISIBLE
        }
    };
});
