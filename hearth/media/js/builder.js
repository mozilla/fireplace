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

// No need to install the extensions if require.js isn't around.
if (typeof define !== 'function') {
    return;
}

define(
    'builder',
    ['templates', 'helpers', 'l10n', 'models', 'notification', 'requests', 'settings', 'underscore', 'z', 'nunjucks.compat'],
    function(nunjucks, helpers, l10n, models, notification, requests, settings, _, z) {

    var SafeString = nunjucks.require('runtime').SafeString;

    var counter = 0;

    var gettext = l10n.gettext;

    function Builder() {
        var env = this.env = new nunjucks.Environment([], {autoescape: true});
        env.dev = nunjucks.env.dev;
        env.registerPrecompiled(nunjucks.templates);

        // For retrieving AJAX results from the view.
        var result_map = this.results = {};
        var result_handlers = {};

        var pool = requests.pool();

        function make_paginatable(injector, placeholder, target) {
            var els = placeholder.find('.loadmore button');
            if (!els.length) {
                return;
            }

            els.on('click', function() {
                // Call the injector to load the next page's URL into the
                // more button's parent. `target` is the selector to extract
                // from the newly built HTML to inject into the currently
                // visible page.
                injector(els.data('url'), els.parent(), target).done(function() {
                    z.page.trigger('loaded_more');
                }).fail(function() {
                    notification.notification({message: gettext('Failed to load the next page.')});
                });
            });
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
                            var caster = models(signature.as).cast;
                            if (_.isArray(data)) {
                                _.each(data, caster);
                            } else {
                                caster(data);
                            }
                        }
                        var content = '';
                        if (empty && _.isArray(data) && data.length === 0) {
                            content = empty();
                        } else {
                            context.ctx.this = data;
                            content = body();
                        }
                        if (extract) {
                            var parsed = $($.parseHTML(content));
                            content = $(parsed.filter(extract).get().concat(parsed.find(extract).get())).children();
                        }
                        return content;
                    }

                    if (request.__cached) {
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
                                if (_.isArray(resp)) {
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
                                make_paginatable(injector, $('#' + uid), signature.paginate);
                            });
                        }
                        return;
                    }

                    request.done(function(data) {
                        var el = $('#' + uid);
                        context.ctx['response'] = data;
                        var content = get_result(data);
                        (replace ? replace.replaceWith : el.html).apply(replace || el, [content]);
                        if (signature.paginate) {
                            make_paginatable(injector, el, signature.paginate);
                        }
                    }).fail(function() {
                        var el = $('#' + uid);
                        (replace ? replace.replaceWith : el.html).apply(
                            replace || el,
                            [except ? except() : env.getTemplate(settings.fragment_error_template).render(helpers)]);
                    });
                    return request;
                };
                injector(signature.url);
                if (!out) {
                    out = '<div class="loading">' + (placeholder ? placeholder() : '') + '</div>';
                }

                out = '<div id="' + uid + '" class="placeholder">' + out + '</div>';
                var safestring = new SafeString(out);
                return safestring;
            }
        };
        this.env.addExtension('defer', defer_runner);

        this.start = function(template, defaults) {
            z.page.trigger('build_start');
            z.page.html(env.getTemplate(template).render(_.defaults(defaults || {}, helpers)));
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
                z.page.trigger('loaded');
            });
            pool.finish();
        };

        var context = _.once(function() {return z.context = {};});
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
                    z.body.attr('data-page-type', val);
                    break;
            }
        };
    }

    return {
        getBuilder: function() {return new Builder();}
    };

});

})();
