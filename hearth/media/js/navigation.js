var nav = (function() {
    var stack = [
        {
            path: '/',
            type: 'root'
        }
    ];
    var param_whitelist = ['q', 'sort', 'cat'];

    function extract_nav_url(url) {
        // This function returns the URL that we should use for navigation.
        // It filters and orders the parameters to make sure that they pass
        // equality tests down the road.

        // If there's no URL params, return the original URL.
        if (url.indexOf('?') < 0) {
            return url;
        }

        var url_parts = url.split('?');
        // If there's nothing after the `?`, return the original URL.
        if (!url_parts[1]) {
            return url;
        }

        var used_params = _.pick(z.getVars(url_parts[1]), param_whitelist);
        // If there are no query params after we filter, just return the path.
        if (!_.keys(used_params).length) {  // If there are no elements in the object...
            return url_parts[0];  // ...just return the path.
        }

        var param_pairs = _.sortBy(_.pairs(used_params), function(x) {return x[0];});
        return url_parts[0] + '?' + _.map(
            param_pairs,
            function(pair) {
                if (typeof pair[1] === 'undefined')
                    return encodeURIComponent(pair[1]);
                else
                    return encodeURIComponent(pair[0]) + '=' +
                           encodeURIComponent(pair[1]);
            }
        ).join('&');
    }

    z.page.on('navigate', function(e, href, popped, state) {

        if (!state) return;

        // Clean the path's parameters.
        // /foo/bar?foo=bar&q=blah -> /foo/bar?q=blah
        state.path = extract_nav_url(state.path);

        // Truncate any closed navigational loops.
        for (var i=0; i<stack.length; i++) {
            if (stack[i].path === state.path) {
                stack = stack.slice(i+1);
                break;
            }
        }

        // Are we home? clear any history.
        if (state.type == 'root') {
            stack = [state];

            // Also clear any search queries living in the search box.
            // Bug 790009
            $('#search-q').val('');
        } else {
            // handle the back and forward buttons.
            if (popped && stack[0].path === state.path) {
                stack.shift();
            } else {
                stack.unshift(state);
            }

            // Does the page have a parent? If so, handle the parent logic.
            if (z.context.parent) {
                var parent = _.indexOf(_.pluck(stack, 'path'), z.context.parent);

                if (parent > 1) {
                    // The parent is in the stack and it's not immediately
                    // behind the current page in the stack.
                    stack.splice(1, parent - 1);
                    console.log('Closing navigation loop to parent (1 to ' + (parent - 1) + ')');
                } else if (parent == -1) {
                    // The parent isn't in the stack. Splice it in just below
                    // where the value we just pushed in is.
                    stack.splice(1, 0, {path: z.context.parent});
                    console.log('Injecting parent into nav stack at 1');
                }
                console.log('New stack size: ' + stack.length);
            }
        }

        z.page.trigger('page_setup');

    }).on('page_setup', function() {

        setClass();
        setTitle();
        setType();

    });

    var $body = $('body');

    var oldClass = '';
    function setClass() {
        // We so classy.
        var newClass = z.context.bodyclass;
        $body.removeClass(oldClass).addClass(newClass);
        oldClass = newClass;
    }

    function setType() {
        // We so type-y.
        var type = z.context.type;
        z.body.attr('data-page-type', type || 'leaf');
    }

    function setTitle() {
        // Something something title joke.
        var title = z.context.headertitle || '';
        $('#site-header h1.page').text(title);
    }

    function back() {
        // Something something back joke.
        if (stack.length > 1) {
            stack.shift();
            navigate(stack[0].path, stack[0].params);
        } else {
            console.log('attempted nav.back at root!');
        }
    }

    $('#nav-back').on('click', _pd(back));

    var builder = require('builder');
    var views = require('views');

    var last_bobj = null;
    function navigate(url, params, popped, replaceState) {
        if (!url) return;

        // Terminate any outstanding requests.
        if (last_bobj) {
            last_bobj.terminate();
        }

        var view_url = url;

        // If we're navigating from a hash, just pretend it's a plain old URL.
        if (url.substr(0, 2) == '#!') {
            view_url = url.substr(2);
        }

        console.log('Navigating', view_url);
        var view = views.match(view_url);
        if (view === null) {
            return;
        }

        var bobj = last_bobj = builder.getBuilder();
        view[0](bobj, view[1], params);

        var newState = {
            path: url,
            type: z.context.type,
            title: z.context.title,
            scrollTop: z.doc.scrollTop()
        };
        if (replaceState) {
            history.replaceState(newState, false, url);
        } else {
            history.pushState(newState, false, url);
        }

        z.page.trigger('navigate', [view_url, popped, newState]);
    }

    function navigateState(state, popped) {
        navigate(state.path, state.params, popped)
    }

    function navigationFilter(el) {
        var href = el.getAttribute('href') || el.getAttribute('action'),
            $el = $(el);
        return !href || href.substr(0,4) == 'http' ||
                href.substr(0,7) === 'mailto:' ||
                href.substr(0,11) === 'javascript:' ||
                href.substr(0,1) === '#' ||
                href.indexOf('/developers/') !== -1 ||
                href.indexOf('/ecosystem/') !== -1 ||
                href.indexOf('/statistics/') !== -1 ||
                href.indexOf('?modified=') !== -1 ||
                el.getAttribute('target') === '_blank' ||
                el.getAttribute('rel') === 'external' ||
                $el.hasClass('post') || $el.hasClass('sync');
    }

    z.body.on('click', 'a', function(e) {
        var href = this.getAttribute('href');
        if (e.metaKey || e.ctrlKey || e.button !== 0) return;
        if (navigationFilter(this)) return;

        // We don't use _pd because we don't want to prevent default for the
        // above situations.
        e.preventDefault();
        navigate(href, $(this).data('params') || {});
    });
    z.win.on('popstate', function(e) {
        var state = e.originalEvent.state;
        if (state) {
            navigateState(state, true);
        }
    });

    return {
        back: back,
        navigate: navigate,
        oldClass: function() {return oldClass;},
        stack: function() {return stack;},
        navigationFilter: navigationFilter
    };

})();
