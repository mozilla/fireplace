define('builder',
    ['log', 'templates', 'models', 'requests', 'settings', 'z', 'nunjucks.compat'],
    function(log, nunjucks, models, requests, settings, z) {

    var console = log('builder');
    var SafeString = nunjucks.require('runtime').SafeString;

    var counter = 0;

    var page = document.getElementById('page');
    if (!page) {
        // We can't run without a <div id="page">
        console.error('Could not start the builder; #page not found!');
        return;
    }

    function render(template, context, env) {
        return (env || nunjucks.env).getTemplate(template).render(context || {});
    }

    var error_template = render(settings.fragment_error_template);

    function parse_and_find(snippet, selector) {
        var dom = document.implementation.createHTMLDocument('');
        dom.body.innerHTML = snippet;
        return dom.body.querySelector(selector);
    }

    function parse_and_replace(snippet, to_replace) {
        var dom = document.implementation.createHTMLDocument('');
        dom.body.innerHTML = snippet;
        var parent = to_replace.parentNode;
        while (dom.body.childNodes.length) {
            var child = dom.body.childNodes[0];
            dom.body.removeChild(child);
            parent.insertBefore(child, to_replace);
        }
        parent.removeChild(to_replace);
    }

    function fire(el, event_name) {
        var args = Array.prototype.slice.call(arguments, 2);
        var e = document.createEvent('Event');
        e.initEvent.apply(e, [event_name, true, false].concat(args));
        el.dispatchEvent(e);
        return e;
    }

    function extend(base, extension, defaults) {
        for (var i in extension) {
            if (!(defaults && i in base) && extension.hasOwnProperty(i)) {
                base[i] = extension[i];
            }
        }
        return base;
    }

    function Builder() {
        var env = this.env = new nunjucks.Environment([], {autoescape: true});
        env.dev = nunjucks.env.dev;
        env.registerPrecompiled(nunjucks.templates);

        // For retrieving AJAX results from the view.
        var result_map = this.results = {};
        var result_handlers = {};

        var has_cached_elements = false;

        var pool = requests.pool();

        function make_paginatable(injector, placeholder, target) {
            if (!placeholder) {
                console.log('No element to paginate');
                return;
            }

            var el = placeholder.querySelector('.loadmore button');
            if (!el) {
                return;
            }

            el.addEventListener('click', function(e) {
                el.classList.add('hide');
                el.parentNode.classList.remove('pagination-error');
                // Call the injector to load the next page's URL into the
                // more button's parent. `target` is the selector to extract
                // from the newly built HTML to inject into the currently
                // visible page.
                var url = el.dataset.url;
                injector(url, el.parentNode, target).done(function() {
                    console.log('Pagination completed');
                    fire(page, 'loaded_more');
                }).fail(function() {
                    url += (url.indexOf('?') + 1 ? '&' : '?') + '_bust=' + (new Date()).getTime();
                    parse_and_replace(render(settings.pagination_error_template, {more_url: url}), el.parentNode);
                    make_paginatable(injector, placeholder, target);
                });
            }, false);
        }

        function trigger_fragment_loaded(id) {
            fire(page, 'fragment_loaded', id || null);
        }

        // This pretends to be the nunjucks extension that does the magic.
        this.env.addExtension('defer', {
            run: function(context, signature, body, placeholder, empty, except) {
                var uid = 'ph_' + counter++;
                var out;

                var injector = function(url, replace, extract) {
                    var request;
                    if ('as' in signature && 'key' in signature) {
                        request = models(signature.as).get(url, signature.key, pool.get);
                    } else {
                        request = pool.get(url);
                    }

                    if ('id' in signature) {
                        result_handlers[signature.id] = request;
                        request.done(function(data) {
                            result_map[signature.id] = data;
                        });
                    }

                    function get_result(data, dont_cast) {
                        // `pluck` pulls the value out of the response.
                        // Equivalent to `this = this[pluck]`
                        if ('pluck' in signature) {
                            data = data[signature.pluck];
                        }
                        // `as` passes the data to the models for caching.
                        if (data && !dont_cast && 'as' in signature) {
                            console.groupCollapsed('Casting ' + signature.as + 's to model cache...');
                            models(signature.as).cast(data);
                            console.groupEnd();
                        }
                        var content = '';
                        if (empty && (!data || Array.isArray(data) && data.length === 0)) {
                            content = empty();
                        } else {
                            context.ctx.this = data;
                            content = body();
                        }
                        if (extract) {
                            try {
                                content = parse_and_find(content, extract).innerHTML;
                            } catch (e) {
                                console.error('There was an error extracting the result from the rendered response.');
                                content = error_template;
                            }
                        }
                        return content;
                    }

                    if (request.__cached) {
                        has_cached_elements = true;

                        var rendered;
                        // This will run synchronously.
                        request.done(function(data) {
                            context.ctx['response'] = data;
                            rendered = get_result(data, true);

                            // Now update the response with the values from the model cache
                            // For details, see bug 870447
                            if (data && 'as' in signature) {
                                var resp = data;
                                var plucked = 'pluck' in signature;
                                var uncaster = models(signature.as).uncast;

                                if (plucked) {
                                    resp = resp[signature.pluck];
                                }
                                if (!resp) {
                                    return;
                                }
                                if (Array.isArray(resp)) {
                                    for (var i = 0; i < resp.length; i++) {
                                        resp[i] = uncaster(resp[i]);
                                    }
                                } else if (plucked) {
                                    data[signature.pluck] = uncaster(resp[i]);
                                }
                                // We can't do this for requests which have no pluck
                                // and aren't an array. :(
                            }
                        });

                        if (replace) {
                            parse_and_replace(rendered, replace);
                        } else {
                            out = rendered;
                        }

                        if (signature.paginate) {
                            pool.done(function() {
                                make_paginatable(injector, document.getElementById(uid), signature.paginate);
                            });
                        }
                        return request;
                    }

                    request.done(function(data) {
                        var el = document.getElementById(uid);
                        if (!el) return;
                        context.ctx['response'] = data;
                        var content = get_result(data);
                        if (replace) {
                            parse_and_replace(content, replace);
                        } else {
                            el.innerHTML = content;
                        }
                        if (signature.paginate) {
                            make_paginatable(injector, el, signature.paginate);
                        }

                        trigger_fragment_loaded(signature.id || null);

                    }).fail(function(xhr, text, code) {
                        if (!replace) {
                            var el = document.getElementById(uid);
                            if (!el) return;
                            context.ctx['error'] = code;
                            el.innerHTML = except ? except() : error_template;
                        }
                    });
                    return request;
                };
                injector(signature.url);
                if (!out) {
                    out = '<div class="loading">' + (placeholder ? placeholder() : '') + '</div>';
                }

                return new SafeString('<div id="' + uid + '" class="placeholder">' + out + '</div>');
            }
        });

        this.env.addExtension('fetch', {
            run: function(context, signature, body) {
                var url = signature.url;

                var request = pool.get(url);
                var uid = 'f_' + counter++;
                var out = '';

                if (request.__cached) {
                    has_cached_elements = true;
                    // This will run synchronously.
                    request.done(function(data) {
                        out = data;
                    });
                } else {
                    var done = function(data) {
                        document.getElementById(uid).innerHTML = data;
                    };
                    request.done(done).fail(function() {
                        var fallback = signature.fallback;
                        if (fallback && fallback !== url) {
                            request = pool.get(fallback).done(done).fail(function() {
                                done(error_template);
                            });
                        }
                    });
                }
                if (!out) {
                    out = body();
                }

                return new SafeString('<div id="' + uid + '" class="placeholder fetchblock">' + out + '</div>');
            }
        });

        this.start = function(template, defaults) {
            fire(page, 'build_start');
            page.innerHTML = render(template, defaults, env);
            if (has_cached_elements) {
                trigger_fragment_loaded();
            }

            return this;
        };

        this.onload = function(id, callback) {
            result_handlers[id].done(callback);
            return this;
        };

        pool.promise(this);
        this.terminate = pool.abort;

        this.finish = function() {
            pool.always(function() {
                fire(page, 'loaded');
            });
            pool.finish();
        };

        // Create a closure that constructs a new context only when it's needed.
        var context = (function () {
            var context;
            return function() {
                return context || (context = z.context = {});
            };
        })();
        this.z = function(key, val) {
            context()[key] = val;
            switch (key) {
                case 'title':
                    if (!val) {
                        val = settings.title_suffix;
                    } else if (val !== settings.title_suffix) {
                        val += ' | ' + settings.title_suffix;
                    }
                    document.title = val;
                    break;
                case 'type':
                    document.body.setAttribute('data-page-type', val);
                    break;
            }
        };
    }

    var last_builder;
    return {
        getBuilder: function() {
            if (last_builder) {
                fire(page, 'unloading');
                last_builder.terminate();
            }
            return last_builder = new Builder();
        },
        getLastBuilder: function() {return last_builder;}
    };

});
