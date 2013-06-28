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

function fetch_parser() {
    this._name = 'fetch';
    this.tags = ['fetch'];
    this.parse = function(parser, nodes, tokens) {
        var begun = parser.peekToken();
        parser.skipSymbol('fetch');
        parser.skip(tokens.TOKEN_WHITESPACE);
        var args = parser.parseSignature();
        parser.skip(tokens.TOKEN_WHITESPACE);
        parser.advanceAfterBlockEnd(begun.value);

        var body = parser.parseUntilBlocks('endfetch');

        parser.advanceAfterBlockEnd();

        return new nodes.CallExtension(this, 'run', args, [body]);
    };

}

module.exports.extensions = [new defer_parser(), new fetch_parser()];
