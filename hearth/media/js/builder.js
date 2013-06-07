(function() {

function defer_parser() {
    this._name = 'defer';
    this.tags = ['defer'];
    this.parse = function(parser, nodes, tokens) {
        var begun = parser.peekToken();
        parser.skipSymbol('defer');
        parser.skip(tokens.TOKEN_WHITESPACE);
        var args = parser.parseSignature();
        parser.advanceAfterBlockEnd(begun.value);

        var body, placeholder, empty, except;
        body = parser.parseUntilBlocks('placeholder', 'empty', 'except', 'end');

        if (parser.skipSymbol('placeholder')) {
            parser.skip(tokens.TOKEN_BLOCK_END);
            placeholder = parser.parseUntilBlocks('empty', 'except', 'end');
        }

        if (parser.skipSymbol('empty')) {
            parser.skip(tokens.TOKEN_BLOCK_END);
            empty = parser.parseUntilBlocks('except', 'end');
        }

        if (parser.skipSymbol('except')) {
            parser.skip(tokens.TOKEN_BLOCK_END);
            except = parser.parseUntilBlocks('end');
        }

        parser.advanceAfterBlockEnd();

        return new nodes.CallExtension(this, 'run', args, [body, placeholder, empty, except]);
    };

}
// If we're running in node, export the extensions.
if (typeof module !== 'undefined' && module.exports) {
    module.exports.extensions = [new defer_parser()];
}

// No need to install the extensions if AMD isn't around.
if (typeof define !== 'function') {
    return;
}

define('builder',
    ['templates', 'helpers', 'l10n', 'models', 'requests', 'settings', 'z', 'nunjucks.compat'],
    function(nunjucks, helpers, l10n, models, requests, settings, z) {

    var SafeString = nunjucks.require('runtime').SafeString;

    var counter = 0;

    var gettext = l10n.gettext;

    var page = document.getElementById('page');
    if (!page) {
        // We can't run without a <div id="page">
        console.error('Could not start the builder; #page not found!');
        return;
    }

    var error_template = nunjucks.env.getTemplate(settings.fragment_error_template).render(helpers);

    function parse_and_find(snippet, selector) {
        var dom = document.implementation.createHTMLDocument();
        dom.body.innerHTML = snippet;
        return dom.body.querySelector(selector);
    }

    function parse_and_replace(snippet, to_replace) {
        var dom = document.implementation.createHTMLDocument();
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
                return;
            }

            var el = placeholder.querySelector('.loadmore button');
            if (!el) {
                return;
            }

            el.addEventListener('click', function(e) {
                // Call the injector to load the next page's URL into the
                // more button's parent. `target` is the selector to extract
                // from the newly built HTML to inject into the currently
                // visible page.
                injector(el.getAttribute('data-url'), el.parentNode, target).done(function() {
                    fire(page, 'loaded_more');
                }).fail(function() {
                    // TODO: Move this into the content rather than showing a notification.
                    // TODO: Provide an option to retry
                    fire(document.body, 'notification', gettext('Failed to load the next page.'));
                });
            }, false);
        }

        function trigger_fragment_loaded(id) {
            fire(page, 'fragment_loaded', id || null);
        }

        // This pretends to be the nunjucks extension that does the magic.
        var defer_runner = {
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
                        if (!dont_cast && 'as' in signature) {
                            console.groupCollapsed('Casting ' + signature.as + 's to model cache...');
                            models(signature.as).cast(data);
                            console.groupEnd();
                        }
                        var content = '';
                        if (empty && Array.isArray(data) && data.length === 0) {
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

                        request.done(function(data) {
                            context.ctx['response'] = data;
                            out = get_result(data, true);

                            // Now update the response with the values from the model cache
                            // For details, see bug 870447
                            if ('as' in signature) {
                                var resp = data;
                                var plucked = 'pluck' in signature;
                                var uncaster = models(signature.as).uncast;

                                if (plucked) {
                                    resp = resp[signature.pluck];
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
                        if (signature.paginate) {
                            pool.done(function() {
                                make_paginatable(injector, document.getElementById(uid), signature.paginate);
                            });
                        }
                        return;
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

                    }).fail(function() {
                        var content = except ? except() : error_template;
                        if (replace) {
                            parse_and_replace(content, replace);
                        } else {
                            var el = document.getElementById(uid);
                            if (!el) return;
                            el.innerHTML = content;
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
        };
        this.env.addExtension('defer', defer_runner);

        this.start = function(template, defaults) {
            fire(page, 'build_start');

            var context = helpers;
            if (defaults) {
                context = defaults;
                for (var h in helpers) {
                    if (!(h in context)) {
                        context[h] = helpers[h];
                    }
                }
            }

            page.innerHTML = env.getTemplate(template).render(context);
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

})();
