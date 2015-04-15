/*
    Marketplace Select element. Truly extends the <select> element.

    <mkt-select>
        Acts exactly like a <select> element. Wraps optgroups, options,
        selecteds, selectedTexts.

        createdCallback - initializes everything.
            - Transforms <option>s in <mkt-options> and into <mkt-optgroup>.
            - Moves the original <option>s into an internal <select> element.
            - Copies all attributes from itself to the <select> element.
            - Initializes <mkt-selected-text>.
            - Visually aligns options to <mkt-selected-text> if on desktop.
            - Sets click handlers on the <mkt-options>.

        select - internal select element. One-way data-binding is set, and all
                 HTMLSelectElement interface is proxied to this element.

        toggle - toggle visibility of the options. Akin to clicking on a
                 <select> element and seeing the options.

        value - the value of the selected option. It is also settable, which is
                the required method for updating the value. When the value is
                changed, everything will be updated, and onchange's will fire.

        alignOptions - visually align options for desktop.

        updateOptionIndices - sets indices on all visible options to help
                              set colors.

    <mkt-option>
        Acts exactly like a <option> element. Although more stylizable.

        option - internal option element. All HTMLOptionElement interface is
                 proxied to this element.

        update - update attributes based on internal option element.

    <mkt-optgroup>
        Acts exactly like a <optgroup> element.

        optgroup - internal optgroup element.

    <mkt-selected>
        The visible portion of the <mkt-select> element when it is toggled off.
        Somewhat like a <label>.

    <mkt-selected-text>
        Shows the innerHTML of the currently selected option. Will
        automatically update on change.

    Additional notes:

    - Markup expects a <mkt-selected>, and <option>s within an <optgroup>. The
      <mkt-selected> element displays the current selection where
      <mkt-selected-text> displays the exact option label.
    - <mkt-select> proxies the HTMLSelectElement interface to a stored select
      element. <mkt-optgroup> and <mkt-option> respectively do the same.
    - Whenever a <mkt-option> is clicked, the <mkt-select>'s internal select
      element value is changed. Then we trigger a 'changed' event on the
      <select> which propagates to the <mkt-select>. Because we proxy to the
      internal <select>, interfaces like HTMLSelectElement.selectedIndex and
      HTMLSelectElement.value will automatically work.
    - <mkt-select> visibility is toggled on click (.mkt-select--visible).
    - <mkt-option> elements have their padding-left programmatically set to
      all align with the <mkt-selected-text>.
    - <mkt-option> elements keep their data-mkt-option--index up-to-date so
      that colors can be set appropriate on each while ignoring the selected
      option.
    - To change <mkt-select>'s value, do mktSelect.value = 'newValue';
*/
define('elements/select',
    ['core/log', 'core/z', 'document-register-element', 'jquery', 'underscore'],
    function(log, z, dre, $, _) {
    'use strict';
    var logger = log('elements/select');

    var el = {};
    var cl = {
        VISIBLE: 'mkt-select--visible'
    };

    el.MktSelectElement = document.registerElement('mkt-select', {
        prototype: Object.create(HTMLSelectElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    // Create a hidden <select> element.
                    var select = document.createElement('select');
                    select.style.display = 'none';
                    root.select = select;

                    // Create <mkt-option>/<mkt-optgroup> using <option>s.
                    var mktOptGroup = document.createElement('mkt-optgroup');
                    var optGroup = root.querySelector('optgroup');
                    var options = root.querySelectorAll('option');
                    for (var i = 0; i < options.length; i++) {
                        var option = options[i];

                        var mktOption = document.createElement('mkt-option');
                        mktOption.option = option;
                        mktOptGroup.appendChild(mktOption);
                    }

                    // Add the <optgroup>s.
                    root.appendChild(mktOptGroup);
                    mktOptGroup.optGroup = optGroup;
                    select.appendChild(optGroup);

                    // Add the hidden <select>
                    root.appendChild(select);

                    // Update indices (for colors).
                    root.updateOptionIndices();

                    // Set <mkt-selected-text>.
                    root.updateSelectedText();

                    // Align options with <mkt-selected-text>.
                    if (root.alignOptions() > 0) {
                        root.setAttribute('data-mkt-select--aligned', true);
                    }

                    // Set up click handlers.
                    root.addEventListener('click', function(e) {
                        root.toggle();
                        if (e.target.tagName == 'MKT-OPTION') {
                            // Change value if click on option.
                            root.value = e.target.getAttribute('value');
                        }
                    });
                }
            },
            select: {
                // Actual <select> element to proxy to, steal its interface.
                // Value set in the createdCallback.
                get: function() {
                    return this._select;
                },
                set: function(select) {
                    copyAttrs(select, this);
                    this._select = select;
                }
            },
            toggle: {
                // Toggles visibility of the <mkt-option>s.
                value: function() {
                    if (!this.getAttribute('data-mkt-select--aligned')) {
                        if (this.alignOptions() > 0) {
                            this.setAttribute('data-mkt-select--aligned', true);
                        }
                    }
                    this.classList.toggle(cl.VISIBLE);
                    return this;
                },
            },
            value: {
                get: function() {
                    return this.select.value;
                },
                set: function(value) {
                    // Change value of hidden select element.
                    var root = this;
                    var select = root.select;
                    select.value = value;

                    // Change [selected] of <option>s.
                    var selectedOption;
                    var options = select.querySelectorAll('option');
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].value === value) {
                            options[i].setAttribute('selected', '');
                            selectedOption = options[i];
                        } else {
                            options[i].removeAttribute('selected');
                        }
                    }

                    // Change text.
                    root.updateSelectedText(selectedOption);

                    // Change [selected] of <mkt-option>s.
                    var mktOptions = root.querySelectorAll('mkt-option');
                    for (i = 0; i < mktOptions.length; i++) {
                        mktOptions[i].update();
                    }

                    // Update [data-mkt-option--index]es.
                    this.updateOptionIndices();
                    $(root).trigger('change');
                }
            },
            alignOptions: {
                value: function() {
                    // Aligns options with the selected/visible top option.
                    var mediaSwitch = '(min-width: 799px)';

                    var offset;
                    if (window.matchMedia(mediaSwitch).matches) {
                        offset = $('mkt-selected-text', this).position().left;
                        $('mkt-option', this).css('padding-left', offset)
                                             .removeClass('mkt-option--center');
                    } else {
                        $('mkt-option', this).css('padding-left', 0)
                                             .addClass('mkt-option--center');
                    }
                    return offset;
                }
            },
            updateSelectedText: {
                value: function(selectedOption) {
                    // Updates the displayed selected option text.
                    var root = this;
                    selectedOption = selectedOption || root.querySelector(
                        'mkt-option[selected]');

                    // Change text.
                    root.querySelector('mkt-selected-text').innerHTML =
                        selectedOption.innerHTML;
                }
            },
            updateOptionIndices: {
                value: function() {
                    // Sets a data-index on each mkt-option that is not
                    // [selected]. Prominently used to set colors since we
                    // don't have CSS4 nth-match.
                    var mktOptions = this.querySelectorAll('mkt-option');
                    var visibleIndex = 0;
                    for (var i = 0; i < mktOptions.length; i++) {
                        var mktOption = mktOptions[i];
                        if (mktOption.hasAttribute('selected')) {
                            mktOption.removeAttribute(
                                'data-mkt-option--index');
                        } else {
                            mktOption.setAttribute('data-mkt-option--index',
                                                   visibleIndex++);
                        }
                    }
                }
            }
        }),
    });

    el.MktOptionElement = document.registerElement('mkt-option', {
        prototype: Object.create(HTMLOptionElement.prototype, {
            option: {
                // Actual <option> element to proxy to, steal its interface.
                // Value set in <mkt-select>'s createdCallback.
                get: function() {
                    return this._option;
                },
                set: function(option) {
                    this.innerHTML = option.innerHTML;
                    this._option = option;
                    this.update();
                }
            },
            update: {
                value: function() {
                    // Update attrs on self, notably [selected].
                    this.removeAttribute('selected');
                    copyAttrs(this, this._option);
                }
            }
        })
    });

    el.MktOptGroupElement = document.registerElement('mkt-optgroup', {
        prototype: Object.create(HTMLOptGroupElement.prototype, {
            optGroup: {
                // Actual <optgroup> element to proxy to, steal its interface.
                // Value set in <mkt-select>'s createdCallback.
                value: null,
                writable: true
            }
        })
    });

    el.MktSelectedElement = document.registerElement('mkt-selected', {
        prototype: Object.create(HTMLElement.prototype, {})
    });

    el.MktSelectedTextElement = document.registerElement('mkt-selected-text', {
        prototype: Object.create(HTMLElement.prototype, {})
    });

    function copyAttrs(dest, source) {
        // Copies attributes from one element to another.
        for (var i = 0; i < source.attributes.length; i++) {
            var attr = source.attributes[i];
            if (attr !== 'id') {
                dest.setAttribute(attr.name, attr.value);
            }
        }
        return dest;
    }

    function proxyElement(destObj, properties, methods, key) {
        properties.forEach(function(prop) {
            if (Object.getOwnPropertyDescriptor(destObj, prop)) {
                // Already defined.
                return;
            }
            // Set a property.
            Object.defineProperty(destObj, prop, {
                get: function() {
                    return this[key][prop];
                }
            });
        });

        methods.forEach(function(method) {
            // Set a method.
            Object.defineProperty(destObj, method, {
                value: function() {
                    return this[key][method].call(arguments);
                }
            });
        });
    }

    proxyElement(el.MktSelectElement.prototype, [
        'autofocus',
        'disabled',
        'form',
        'labels',
        'length',
        'multiple',
        'name',
        'onchange',
        'options',
        'required',
        'selectedIndex',
        'size',
        'type',
        'validationMessage',
        'validity',
        'willValidate',
    ], [
        'add',
        'blur',
        'checkValidity',
        'focus',
        'item',
        'namedItem',
        'remove',
        'setCustomValidity',
    ], 'select');
    proxyElement(el.MktOptGroupElement.prototype, [
        'disabled',
    ], [], 'optGroup');
    proxyElement(el.MktOptionElement.prototype, [
        'defaultSelected',
        'disabled',
        'form',
        'index',
        'label',
        'selected',
        'text',
        'value',
    ], [], 'option');

    z.win.on('resize', _.debounce(function() {
        // Re-align options on resize.
        var mktSelects = document.querySelectorAll('mkt-select');
        for (var i = 0; i < mktSelects.length; i++ ) {
            if (mktSelects[i].alignOptions) {
                mktSelects[i].alignOptions();
            }
        }
    }, 100));

    return {
        classes: cl,
        elements: el
    };
});
