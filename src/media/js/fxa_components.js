define('fxa_components', ['document-register-element'], function () {
    function makeElement(type, attributes) {
        var el = document.createElement(type);
        Object.keys(attributes).forEach(function (attr) {
            el.setAttribute(attr, attributes[attr]);
        });
        return el;
    }

    var FxaBox = document.registerElement('fxa-box', {
        prototype: Object.create(HTMLElement.prototype, {
            createdCallback: {
                value: function () {
                    this.classList.add('fxa-box');
                },
            },
        }),
    });
});
