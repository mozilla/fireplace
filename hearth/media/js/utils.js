// TODO: AMD-ize.
function getVars(qs, excl_undefined) {
    if (typeof qs === 'undefined') {
        qs = location.search;
    }
    if (qs && qs[0] == '?') {
        qs = qs.substr(1);  // Filter off the leading ? if it's there.
    }
    if (!qs) return {};

    return _.chain(qs.split('&'))  // ['a=b', 'c=d']
            .map(function(c) {return _.map(c.split('='), escape_);}) //  [['a', 'b'], ['c', 'd']]
            .filter(function(p) {  // [['a', 'b'], ['c', undefined]] -> [['a', 'b']]
                return !!p[0] && (!excl_undefined || !_.isUndefined(p[1]));
            }).object()  // {'a': 'b', 'c': 'd'}
            .value();
}

function _pd(func) {
    return function(e) {
        e.preventDefault();
        func.apply(this, arguments);
    };
}


function fieldFocused(e) {
    var tags = /input|keygen|meter|option|output|progress|select|textarea/i;
    return tags.test(e.target.nodeName);
}


var escape_ = function(s) {
    if (s === undefined) {
        return;
    }
    return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
            .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
};


_.extend(String.prototype, {
    trim: function(str) {
        // Trim leading and trailing whitespace (like lstrip + rstrip).
        return this.replace(/^\s*/, '').replace(/\s*$/, '');
    },
    strip: function(str) {
        // Strip all whitespace.
        return this.replace(/\s/g, '');
    }
});


function makeOrGetOverlay(id) {
    var el = document.getElementById(id);
    if (!el) {
        el = $('<div class="overlay" id="' + id +'">');
        z.body.append(el);
    }
    return $(el);
}


function getTemplate($el) {
    // If the element exists, return the template.
    if ($el.length) {
        return template($el.html());
    }
    // Otherwise, return undefined.
}


function successNotification(msg) {
    var success = $('.success h2');
    if (success.length) {
        success.text(msg);
    } else {
        $('#page').prepend($('<section class="full notification-box">' +
                             '<div class="success"><h2>' + msg +
                             '</h2></div></section>'));
    }
}
