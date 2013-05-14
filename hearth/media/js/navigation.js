define('navigation',
    ['capabilities', 'l10n', 'notification', 'underscore', 'urls', 'utils', 'views', 'z'],
    function(capabilities, l10n, notification, _, urls, utils, views, z) {
    'use strict';

    var gettext = l10n.gettext;
    var stack = [
        {path: '/', type: 'root'}
    ];
    var param_whitelist = ['q', 'sort', 'cat'];
    var last_bobj = null;

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

        var used_params = _.pick(utils.getVars(url_parts[1]), param_whitelist);
        // If there are no query params after we filter, just return the path.
        if (!_.keys(used_params).length) {  // If there are no elements in the object...
            return url_parts[0];  // ...just return the path.
        }

        return url_parts[0] + '?' + (
            _.pairs(used_params)
            .sort(function(a, b) {return a[0] < b[0];})
            .map(function(pair) {
                if (typeof pair[1] === 'undefined')
                    return encodeURIComponent(pair[0]);
                else
                    return encodeURIComponent(pair[0]) + '=' +
                           encodeURIComponent(pair[1]);
            }).join('&'));
    }

    function canNavigate() {
        if (!navigator.onLine && !capabilities.phantom) {
            notification.notification({message: gettext('No internet connection')});
            return false;
        }
        return true;
    }

    function navigate(href, popped, state) {
        if (!state) return;

        console.log('[nav] Navigation started: ', href);
        var view = views.match(href);
        if (view === null) {
            return;
        }

        if (last_bobj) {
            z.win.trigger('unloading');  // Tell the world that we're cleaning stuff up.
        }
        last_bobj = views.build(view[0], view[1], state.params);
        z.win.trigger('navigating', [popped]);
        state.type = z.context.type;
        state.title = z.context.title;

        if ((state.preserveScroll || popped) && state.scrollTop) {
            console.log('[nav] Setting scroll: ', state.scrollTop);
            if (state.docHeight) {
                // Preserve document min-height for scroll restoration.
                z.body.css('min-height', state.docHeight);
                z.page.one('loaded', function() {
                    // Remove specified min-height.
                    z.body.css('min-height', '');
                });
            }
            window.scrollTo(0, state.scrollTop);
        } else {
            console.log('[nav] Resetting scroll');
            window.scrollTo(0, 0);
        }

        // Clean the path's parameters.
        // /foo/bar?foo=bar&q=blah -> /foo/bar?q=blah
        state.path = extract_nav_url(state.path);

        // Truncate any closed navigational loops.
        for (var i = 0; i < stack.length; i++) {
            if (stack[i].path === state.path ||
                (state.type === 'search' && stack[i].type === state.type)) {
                console.log('[nav] Navigation loop truncated:', stack.slice(0, i));
                stack = stack.slice(i + 1);
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
                console.log('[nav] Shifting stack (used → or ← button)');
                stack.shift();
            } else {
                console.log('[nav] Pushed state onto stack: ', state.path);
                stack.unshift(state);
            }

            // TODO(fireplace): Make this work with views
            // Does the page have a parent? If so, handle the parent logic.
            if (z.context.parent) {
                var parent = _.indexOf(_.pluck(stack, 'path'), z.context.parent);

                if (parent > 1) {
                    // The parent is in the stack and it's not immediately
                    // behind the current page in the stack.
                    stack.splice(1, parent - 1);
                    console.log('[nav] Closing navigation loop to parent (1 to ' + (parent - 1) + ')');
                } else if (parent == -1) {
                    // The parent isn't in the stack. Splice it in just below
                    // where the value we just pushed in is.
                    stack.splice(1, 0, {path: z.context.parent});
                    console.log('[nav] Injecting parent into nav stack at 1');
                }
                console.log('[nav] New stack size: ' + stack.length);
            }
        }

    }

    z.body.on('click', '.site-header .back', utils._pd(function() {
        console.log('[nav] ← button pressed');
        if (!canNavigate()) {
            console.log('[nav] ← button aborted; canNavigate is falsey.');
            return;
        }

        if (stack.length > 1) {
            stack.shift();
            history.replaceState(stack[0], false, stack[0].path);
            navigate(stack[0].path, true, stack[0]);
        } else {
            console.log('[nav] attempted nav.back at root!');
        }
    }));

    z.page.on('search', function(e, params) {
        e.preventDefault();
        return z.page.trigger(
            'navigate', utils.urlparams(urls.reverse('search'), params));
    }).on('navigate divert', function(e, url, params, preserveScroll) {
        console.log('[nav] Received ' + e.type + ' event:', url);
        if (!url) return;

        var divert = e.type === 'divert';
        var newState = {
            params: params,
            path: url
        };
        var scrollTop = z.doc.scrollTop();
        var state_method = history.pushState;

        if (preserveScroll) {
            newState.preserveScroll = preserveScroll;
            newState.scrollTop = scrollTop;
            newState.docHeight = z.doc.height();
        }

        if (!canNavigate()) {
            console.log('[nav] Navigation aborted; canNavigate is falsey.');
            return;
        }

        // Terminate any outstanding requests.
        if (last_bobj) {
            last_bobj.terminate();
        }

        // Update scrollTop for current history state.
        if (stack.length && scrollTop !== stack[0].scrollTop) {
            stack[0].scrollTop = scrollTop;
            console.log('[nav] Updating scrollTop');
            history.replaceState(stack[0], false, stack[0].path);
        }

        if (!last_bobj || divert) {
            // If we're redirecting or we've never loaded a page before,
            // use replaceState instead of pushState.
            state_method = history.replaceState;
        }
        if (divert) {
            stack.shift();
        }
        state_method.apply(history, [newState, false, url]);
        navigate(url, false, newState);
    });

    function navigationFilter(el) {
        var href = el.getAttribute('href') || el.getAttribute('action'),
            $el = $(el);
        return !href || href.substr(0, 4) == 'http' ||
                href.substr(0, 7) === 'mailto:' ||
                href.substr(0, 11) === 'javascript:' ||
                href[0] === '#' ||
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
        var $elm = $(this);
        var preserveScrollData = $elm.data('preserveScroll');
        // Handle both data-preserve-scroll and data-preserve-scroll="true"
        var preserveScroll = typeof preserveScrollData !== 'undefined' && preserveScrollData !== false;
        if (e.metaKey || e.ctrlKey || e.button !== 0) return;
        if (navigationFilter(this)) return;

        // We don't use _pd because we don't want to prevent default for the
        // above situations.
        e.preventDefault();
        e.stopPropagation();
        z.page.trigger('navigate', [href, $elm.data('params') || {path: href}, preserveScroll]);

    }).on('submit', 'form#search', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $q = $('#search-q');
        var query = $q.val();
        if (query == 'do a barrel roll') {
            z.body.toggleClass('roll');
        }
        $q.blur();
        z.page.trigger('search', {q: query});

    });
    z.win.on('popstate', function(e) {
        var state = e.originalEvent.state;
        if (state) {
            console.log('[nav] popstate navigate');
            navigate(state.path, true, state);
        }
    }).on('submit', 'form', function(e) {
        console.error("We don't allow form submissions.");
        return false;
    });

    return {
        stack: function() {return stack;},
        navigationFilter: navigationFilter
    };

});
