(function() {

function defer_parser() {
    this.tags = ['defer'];
    this.parse = function(parser, nodes, tokens) {
        var begun = parser.peekToken();
        var tag = new nodes.CustomTag(begun.lineno, begun.colno, 'defer');

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
    ['templates', 'helpers', 'settings', 'underscore', 'z', 'nunjucks.compat'],
    function(nunjucks, helpers, settings, _, z) {

    console.log('Loading nunjucks builder tags...');
    var counter = 0;

    function Builder() {
        var env = this.env = new nunjucks.Environment([]);
        env.dev = nunjucks.env.dev;
        env.registerPrecompiled(nunjucks.templates);

        var requests = {};
        var initiated_requests = 0;
        var completed_requests = 0;

        var completion_def = $.Deferred();

        function decrRequests() {
            completed_requests++;
            if (completed_requests >= initiated_requests) {
                completion_def.resolve();
                z.page.trigger('loaded');
            }
        }

        function start_request(url) {
            if (url in requests) {
                return requests[url];
            }
            var req = $.get(url);
            requests[url] = req;
            initiated_requests++;
            return req;
        }

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
                console.log(context);
                var out = '<div class="loading">' + (placeholder ? placeholder() : '') + '</div>';
                var uid = 'ph_' + counter++;
                out = '<div id="' + uid + '" class="placeholder">' + out + '</div>';

                var injector = function(url, replace, extract) {
                    start_request(url).done(function(data) {
                        context.ctx['response'] = data;
                        if ('pluck' in signature) {
                            data = data[signature.pluck];
                        }
                        var el = $('#' + uid);
                        var apply = replace ? replace.replaceWith : el.html;
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
                        apply.apply(replace || el, [content]);
                        decrRequests();
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

                return out;
            }
        };
        this.env.addExtension('defer', defer_runner);

        this.start = function(template, defaults) {
            z.page.html(env.getTemplate(template).render(_.defaults(defaults || {}, helpers)));
            return completion_def;
        };

        this.done = completion_def.done;

        this.terminate = function() {
            // Abort all ongoing AJAX requests that been flagged as forced.
            _.each(requests, function(request) {
                console.log(request);
                if (request.abort === undefined || request.isSuccess !== false) {
                    return;
                }
                request.abort();
            });
        };
        completion_def.fail(this.terminate);

        this.finish = function() {
            if (!initiated_requests) {
                z.page.trigger('loaded');
                completion_def.resolve();
                return;
            }
            completion_def.done(function() {
                z.page.trigger('loaded');
            });
        };

        var context = _.once(function() {return z.context = {};});
        this.z = function(key, val) {context()[key] = val;};
    }

    return {
        getBuilder: function() {return new Builder();}
    }

});

})();
