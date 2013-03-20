(function() {

function defer_parser() {
    this.tags = ['defer'];
    this.parse = function(parser, nodes, tokens) {
        var begun = parser.peekToken();
        var tag = new nodes.CustomTag(begun.lineno, begun.colno, 'defer');
        tag.fields = ['body', 'placeholder', 'empty', 'except'];

        parser.nextToken();  // Skip the name symbol.
        parser.skip(tokens.TOKEN_WHITESPACE);

        tag.signature = parser.parseSignature();
        parser.expect(tokens.TOKEN_BLOCK_END);

        tag.body = parser.parseUntilBlocks('placeholder', 'empty', 'except', 'end');

        tag.placeholder = null;
        tag.except = null;

        if (parser.skipSymbol('placeholder')) {
            parser.skip(tokens.TOKEN_BLOCK_END);
            tag.placeholder = parser.parseUntilBlocks('empty', 'except', 'end');
        }

        if (parser.skipSymbol('empty')) {
            parser.skip(tokens.TOKEN_BLOCK_END);
            tag.empty = parser.parseUntilBlocks('except', 'end');
        }

        if (parser.skipSymbol('except')) {
            parser.skip(tokens.TOKEN_BLOCK_END);
            tag.except = parser.parseUntilBlocks('end');
        }

        parser.advanceAfterBlockEnd();

        return new nodes.Output(begun.lineno, begun.colno, [tag]);
    }

    this.compile = function(compiler, tag, frame) {
        var buffer = compiler.buffer;
        function node(contents) {
            if (contents) {
                compiler.emitLine(', function() {');
                compiler.emitLine('var ' + buffer + ' = "";');
                compiler.compile(contents, frame);
                compiler.emitLine('return ' + buffer + ';');
                compiler.emitLine('}');
            } else {
                compiler.emit(', null');
            }
        }
        compiler.emitLine('env.extensions["defer"]._run(');
        compiler.emitLine('context, ');
        compiler.compile(tag.signature, frame);

        node(tag.body);
        node(tag.placeholder);
        node(tag.empty);
        node(tag.except);

        compiler.emit(')');
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
    ['templates', 'helpers', 'models', 'requests', 'settings', 'underscore', 'z', 'nunjucks.compat'],
    function(nunjucks, helpers, models, requests, settings, _, z) {

    console.log('Loading nunjucks builder tags...');
    var counter = 0;

    function Builder() {
        var env = this.env = new nunjucks.Environment([]);
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
                injector(els.data('url'), els.parent(), target);
            });
        }

        // This pretends to be the nunjucks extension that does the magic.
        var defer_runner = {
            _run: function(context, signature, body, placeholder, empty, except) {
                var uid = 'ph_' + counter++;
                var out;

                var injector = function(url, replace, extract) {
                    var request;
                    if ('as' in signature && 'key' in signature) {
                        request = models(signature.as).get(url, signature.key, pool.get);
                    } else {
                        request = pool.get(url);
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
                                _.each(data, caster)
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
                            content = (parsed.filter(extract) || parsed.find(extract)).children();
                        }
                        return content;
                    }

                    if ('id' in signature) {
                        var id = signature.id;
                        result_handlers[id] = request;
                        request.done(function(data) {
                            result_map[id] = data;
                        });
                    }

                    if (request.__cached) {
                        request.done(function(data) {
                            context.ctx['response'] = data;
                            out = get_result(data, true);
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
                            [except ? except() : env.getTemplate(settings.fragment_error_template).render()]);
                    });
                };
                injector(signature.url);
                if (!out) {
                    out = '<div class="loading">' + (placeholder ? placeholder() : '') + '</div>';
                }

                out = '<div id="' + uid + '" class="placeholder">' + out + '</div>';
                return out;
            }
        };
        this.env.addExtension('defer', defer_runner);

        this.start = function(template, defaults) {
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
            pool.then(function() {z.page.trigger('loaded');});
            pool.finish();
        };

        var context = _.once(function() {return z.context = {};});
        this.z = function(key, val) {
            context()[key] = val;
            switch (key) {
                case 'title':
                    if (val !== settings.title_suffix) {
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
    }

});

})();
