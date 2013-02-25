define('common/suggestions', ['capabilities', 'keys', 'utils', 'z'], function(capabilities, keys, utils, z) {
    z._AjaxCache = {};
    z.AjaxCache = (function() {
        return function(namespace) {
            if (z._AjaxCache[namespace] === undefined) {
                z._AjaxCache[namespace] = {
                    'previous': {'args': '', 'data': ''},
                    'items': {}
                };
            }
            return z._AjaxCache[namespace];
        };
    })();

    $.ajaxCache = function(o) {
        o = $.extend({
            url: '',
            type: 'get',
            data: {},                 // Key/value pairs of form data.
            newItems: $.noop,         // Callback upon success of items fetched.
            cacheSuccess: $.noop,     // Callback upon success of items fetched
                                      // in cache.
            ajaxSuccess: $.noop,      // Callback upon success of Ajax request.
            ajaxFailure: $.noop       // Callback upon failure of Ajax request.
        }, o);

        if (!capabilities.JSON || parseFloat(jQuery.fn.jquery) < 1.5) {
            // jqXHR objects allow Deferred methods as of jQuery 1.5. Some of our
            // old pages are stuck on jQuery 1.4, so hopefully this'll disappear
            // sooner than later.
            return $.ajax({
                url: o.url,
                type: o.method,
                data: o.data,
                success: function(data) {
                    o.newItems(data, data);
                    o.ajaxSuccess(data, items);
                },
                errors: function(data) {
                    o.ajaxFailure(data);
                }
            });
        }

        var cache = z.AjaxCache(o.url + ':' + o.type),
            args = JSON.stringify(o.data),
            previous_args = JSON.stringify(cache.previous.args),
            items,
            request;

        if (args != previous_args) {
            if (!!cache.items[args]) {
                items = cache.items[args];
                if (o.newItems) {
                    o.newItems(null, items);
                }
                if (o.cacheSuccess) {
                    o.cacheSuccess(null, items);
                }
            } else {
                // Make a request to fetch new items.
                request = $.ajax({url: o.url, type: o.method, data: o.data});

                request.done(function(data) {
                    var items;
                    if (!_.isEqual(data, cache.previous.data)) {
                        items = data;
                    }
                    o.newItems(data, items);
                    o.ajaxSuccess(data, items);

                    // Store items returned from this request.
                    cache.items[args] = data;

                    // Store current list of items and form data (arguments).
                    cache.previous.data = data;
                    cache.previous.args = args;
                });

                // Optional failure callback.
                if (o.failure) {
                    request.fail(function(data) {
                        o.ajaxFailure(data);
                    });
                }
            }
        }
        return request;
    };

    $.fn.highlightTerm = function(val) {
        // If an item starts with `val`, wrap the matched text with boldness.
        val = val.replace(/[^\w\s]/gi, '');
        var pat = new RegExp(val, 'gi');
        this.each(function() {
            var $this = $(this),
                txt = $this.html(),
                matchedTxt = txt.replace(pat, '<b>$&</b>');
            if (txt != matchedTxt) {
                $this.html(matchedTxt);
            }
        });
    };

    /*
     * searchSuggestions
     * Grants search suggestions to an input of type text/search.
     * Required:
     * $results - a container for the search suggestions, typically UL.
     * processCallback - callback function that deals with the XHR call & populates
                       - the $results element.
     * Optional:
    */
    $.fn.searchSuggestions = function($results, processCallback) {
        var $self = this,
            $form = $self.closest('form');

        if (!$results.length) {
            return;
        }

        var cat = $results.attr('data-cat');
        $results.html('<div class="wrap"><ul></ul></div>');

        // Control keys that shouldn't trigger new requests.
        var ignoreKeys = [
            keys.SHIFT, keys.CONTROL, keys.ALT, keys.PAUSE,
            keys.CAPS_LOCK, keys.ESCAPE, keys.ENTER,
            keys.PAGE_UP, keys.PAGE_DOWN,
            keys.LEFT, keys.UP, keys.RIGHT, keys.DOWN,
            keys.HOME, keys.END,
            keys.COMMAND, keys.WINDOWS_RIGHT, keys.COMMAND_RIGHT,
            keys.WINDOWS_LEFT_OPERA, keys.WINDOWS_RIGHT_OPERA, keys.APPLE
        ];

        var gestureKeys = [keys.ESCAPE, keys.UP, keys.DOWN];

        function pageUp() {
            // Select the first element.
            $results.find('.sel').removeClass('sel');
            $results.removeClass('sel');
            $results.find('a:first').addClass('sel');
        }
        function pageDown() {
            // Select the last element.
            $results.find('.sel').removeClass('sel');
            $results.removeClass('sel');
            $results.find('a:last').addClass('sel');
        }

        function dismissHandler() {
            $results.removeClass('visible sel');
            $('#site-header').removeClass('suggestions');
            if (capabilities.mobile) {
                z.body.removeClass('show-search');
            }
        }

        function gestureHandler(e) {
            // Bail if the results are hidden or if we have a non-gesture key
            // or if we have a alt/ctrl/meta/shift keybinding.
            if (!$results.hasClass('visible') ||
                $.inArray(e.which, gestureKeys) < 0 ||
                e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
                $results.trigger('keyIgnored');
                return;
            }
            e.preventDefault();
            if (e.which == keys.ESCAPE) {
                dismissHandler();
            } else if (e.which == keys.UP || e.which == keys.DOWN) {
                var $sel = $results.find('.sel'),
                    $elems = $results.find('a'),
                    i = $elems.index($sel.get(0));
                if ($sel.length && i >= 0) {
                    if (e.which == keys.UP) {
                        // Clamp the value so it goes to the previous row
                        // but never goes beyond the first row.
                        i = Math.max(0, i - 1);
                    } else {
                        // Clamp the value so it goes to the next row
                        // but never goes beyond the last row.
                        i = Math.min(i + 1, $elems.length - 1);
                    }
                } else {
                    i = 0;
                }
                $sel.removeClass('sel');
                $elems.eq(i).addClass('sel');
                $results.addClass('sel').trigger('selectedRowUpdate', [i]);
            }
        }

        function inputHandler(e) {
            var val = utils.escape_($self.val());
            if (val.length < 3) {
                $results.filter('.visible').removeClass('visible');
                return;
            }

            // Required data to send to the callback.
            var settings = {
                '$results': $results,
                '$form': $form,
                'searchTerm': val
            };

            // Optional data for callback.
            settings['category'] = cat;

            if ((e.type === 'keyup' && typeof e.which === 'undefined') ||
                $.inArray(e.which, ignoreKeys) >= 0) {
                $results.trigger('inputIgnored');
            } else {
                // XHR call and populate suggestions.
                processCallback(settings);
            }
        }

        var pollVal = 0;

        if (capabilities.touch) {
            $self.focus(function() {
                // If we've already got a timer, clear it.
                if (pollVal !== 0) {
                    clearInterval(pollVal);
                }
                pollVal = setInterval(function() {
                    gestureHandler($self);
                    inputHandler($self);
                    return;
                }, 150);
            });
        } else {
            $self.keydown(gestureHandler).bind('keyup paste',
                                               _.throttle(inputHandler, 250));
        }

        function clearCurrentSuggestions(e) {
            clearInterval(pollVal);
            // Delay dismissal to allow for click events to happen on
            // results. If we call it immediately, results get hidden
            // before the click events can happen.
            _.delay(dismissHandler, 250);
            $self.trigger('dismissed');
        }

        $self.blur(clearCurrentSuggestions);
        $form.submit(function(e) {
            var $sel = $results.find('.sel');
            if ($sel.length && $sel.eq(0).attr('href') != '#') {
                e.stopPropagation();
                e.preventDefault();
                $self.val('');
                $sel[0].click();
            }
            $self.blur();
            clearCurrentSuggestions(e);
        });

        $results.delegate('li, p', 'hover', function() {
            $results.find('.sel').removeClass('sel');
            $results.addClass('sel');
            $(this).find('a').addClass('sel');
        }).delegate('a', 'click', function() {
            clearCurrentSuggestions();
            $self.val('');
        });

        $results.bind('highlight', function(e, val) {
            // If an item starts with `val`, wrap the matched text with boldness.
            $results.find('ul a span').highlightTerm(val);
            $results.addClass('visible');
            if (!$results.find('.sel').length) {
                pageUp();
            }
        });

        $results.bind('dismiss', clearCurrentSuggestions);

        z.doc.keyup(function(e) {
            if (utils.fieldFocused(e)) {
                return;
            }
            if (e.which == 83) {
                $self.focus();
            }
        });

        return this;
    };

    function processResults(settings) {
        if (!settings || !settings.category) {
            return;
        }

        // Update the 'Search add-ons for <b>"{addon}"</b>' text.
        settings['$results'].find('p b').html(format('"{0}"',
                                                     settings.searchTerm));

        var li_item = template(
            '<li><a href="{url}"><span {cls} {icon}>{name}</span>{subtitle}</a></li>'
        );

        $.ajaxCache({
            url: settings['$results'].attr('data-src'),
            data: settings['$form'].serialize() + '&cat=' + settings.category,
            newItems: function(formdata, items) {
                var eventName;
                if (items !== undefined) {
                    var ul = '';
                    $.each(items, function(i, item) {
                        var d = {
                            url: utils.escape_(item.url) || '#',
                            icon: '',
                            cls: '',
                            subtitle: ''
                        };
                        if (item.icon) {
                            d.icon = format(
                                'style="background-image:url({0})"',
                                utils.escape_(item.icon)
                            );
                        }
                        if (item.cls) {
                            d.cls = format('class="{0}"',
                                           utils.escape_(item.cls));
                            if (item.cls == 'cat') {
                                d.subtitle = format(
                                    ' <em class="subtitle">{0}</em>',
                                    gettext('Category')
                                );
                            }
                        }
                        if (item.name) {
                            d.name = utils.escape_(item.name);
                            // Append the item only if it has a name.
                            ul += li_item(d);
                        }
                    });
                    settings['$results'].find('ul').html(ul);
                }
                settings['$results'].trigger('highlight', [settings.searchTerm])
                                    .trigger('resultsUpdated', [items]);
            }
        });
    }

    var suggestions = $('#search #search-q').searchSuggestions(
            $('#site-search-suggestions'), processResults, 'MKT');

        suggestions.on('dismissed', abortRequest);

    var current_search = null;
    var previous_request = null;

    function processResults(settings) {
        // Remember the previous search term so that only one of consecutive
        // duplicate queries makes the request to ajaxCache. This prevents the
        // duplicate requests from aborting themselves in the middle of
        // ajaxCache request.
        // Further reading: https://gist.github.com/4273860
        var search_term = settings['$form'].serialize().slice(2);
        if (!settings || current_search == search_term) {
            return;
        }

        var li_item = template(
            '<li><a href="{url}"><span>{name}</span></a></li>'
        );

        var new_request = $.ajaxCache({
            url: settings['$results'].attr('data-src'),
            data: settings['$form'].serialize() + '&cat=' + settings.category,
            newItems: function(formdata, items) {
                var eventName,
                    listitems = '';

                if (items !== undefined) {
                    $.each(items, function(i, item) {
                        var d = {
                            url: utils.escape_(item.url) || '#'
                        };
                        if (item.name) {
                            d.name = utils.escape_(item.name);
                            // Append the item only if it has a name.
                            listitems += li_item(d);
                        }
                    });
                }

                // Populate suggestions and make them visible.
                if (listitems) {
                    settings['$results'].find('ul').html(listitems);
                    settings['$results'].addClass('visible')
                                        .trigger('resultsUpdated', [items]);
                    $('#site-header').addClass('suggestions');
                    if (capabilities.mobile) {
                        z.body.removeClass('show-search');
                    }
                }
            }
        });

        current_search = search_term;
        abortRequest();
        previous_request = new_request;
    }

    function abortRequest() {
        if (previous_request) {
            previous_request.abort();
            previous_request = null;
        }
    }

    // Clear search suggestions at start and end of loaded.
    z.page.on('loaded', function() {
        abortRequest();
        $('#site-search-suggestions').trigger('dismiss').find('ul').empty();
    });
});
