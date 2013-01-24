var truncate = (function() {
    function text(node, trim) {
        var cn = node.childNodes;
        var t='';
        if (cn.length) {
            for (var i=0; i<cn.length; i++) {
                t += text(cn[i]);
            }
        } else {
            t = node.textContent;
        }
        if (trim) {
            return t.replace(/^\s+|\s+$/g, "");
        }
        return t;
    }

    var hasTruncation = (function() {
        var shim = document.createElement('div');
        shim.innerHTML = '<div style="text-overflow: ellipsis"></div>';
        var s = shim.firstChild.style;
        return 'textOverflow' in s || 'OTextOverflow' in s;
    })();

    function truncate(el, opts) {
        opts = opts || {};
        if (hasTruncation && (!opts.dir || opts.dir != 'v')) return this;
        var showTitle = opts.showTitle || false;
        var dir = (opts.dir && opts.dir[0]) || 'h';
        var scrollProp = dir == "h" ? "scrollWidth" : "scrollHeight";
        var offsetProp = dir == "h" ? "offsetWidth" : "offsetHeight";
        var truncText = opts.truncText || "&hellip;";
        var trim = opts.trim || false;
        var textEl = opts.textEl || el;
        var split = [" ",""], counter, success;
        var txt, cutoff, delim;
        var oldtext = textEl.getAttribute("data-oldtext") || text(textEl, trim);
        textEl.setAttribute("data-oldtext", oldtext);
        for (var i=0; i<split.length; i++) {
            delim = split[i];
            txt = oldtext.split(delim);
            cutoff = txt.length;
            success = false;
            if (textEl.getAttribute("data-oldtext")) {
                textEl.innerHTML = oldtext;
            }
            if ((el[scrollProp] - el[offsetProp]) < 1) {
                el.removeAttribute("data-truncated", null);
                break;
            }
            var chunk = Math.ceil(txt.length/2), oc=0, wid;
            for (counter = 0; counter < 15; counter++) {
                textEl.innerHTML = txt.slice(0,cutoff).join(delim) + truncText;
                wid = (el[scrollProp] - el[offsetProp]);
                if (cutoff < 1) {
                    break;
                } else if (wid < 2 && chunk == oc) {
                    if (dir === 'h' || (delim === '' && el.scrollWidth < el.offsetWidth)) {
                        success = true;
                        el.setAttribute("data-truncated", true);
                        break;
                    }
                } else if (wid > 1) {
                    cutoff -= chunk;
                } else {
                    cutoff += chunk;
                }
                oc = chunk;
                chunk = Math.ceil(chunk/2);
            }
            if (success) break;
        }
        if (showTitle && oldtext != text(textEl, trim)) {
            textEl.setAttribute("title", oldtext);
        }
    }

    return truncate;
})();

$.fn.truncate = function(opts) {
    this.each(function() {
        truncate(this, opts);
    });
    return this;
};
$.fn.untruncate = function() {
    this.each(function() {
        var $el = $(this),
            oTxt = $el.attr("oldtext");
        if (oTxt) {
            $el.text(oTxt);
        }
    });
    return this;
};
$.fn.lineclamp = function(lines) {
    // This function limits the number of visible `lines` of text. Overflown
    // text is gracefully ellipsed: http://en.wiktionary.org/wiki/ellipse#Verb.
    if (!lines) {
        return this;
    }
    return this.each(function() {
        var $this = $(this),
            lh = $this.css('line-height');
        if (typeof lh == 'string' && lh.substr(-2) == 'px') {
            lh = parseFloat(lh.replace('px', ''));
            var maxHeight = Math.ceil(lh) * lines,
                truncated;
            if ((this.scrollHeight - maxHeight) > 2) {
                $this.css({'height': maxHeight + 2, 'overflow': 'hidden',
                           'text-overflow': 'ellipsis'});
                // Add an ellipsis.
                $this.truncate({dir: 'v'});
            } else {
                $this.css({'max-height': maxHeight, 'overflow': 'hidden',
                           'text-overflow': 'ellipsis'});
            }
        }
    });
};
$.fn.linefit = function(lines) {
    // This function shrinks text to fit on one line.
    var min_font_size = 7;
    lines = lines || 1;
    return this.each(function() {
        var $this = $(this),
            fs = parseFloat($this.css('font-size').replace('px', '')),
            max_height = Math.ceil(parseFloat($this.css('line-height').replace('px', ''))) * lines,
            height = $this.height();
        while (height > max_height && fs > min_font_size) {
            // Repeatedly shrink the text by 0.5px until all the text fits.
            fs -= .5;
            $this.css('font-size', fs);
            height = $this.height();
        }
    });
};
