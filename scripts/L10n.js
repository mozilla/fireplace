var fs = require('fs');

var nodes = require('../nunjucks/src/nodes');

var uglify = require('uglify-js');

module.exports = (function() {
    var localizable_strings = [];
    var localizable_string_map = {};

    function LocalString(string) {
        this.str = string;
        this.plural = null;
        this.locations = [];
        this.escaped = function(str) {
            return JSON.stringify(str || this.str);
        };
        this.toString = function() {
            var out = [
                this.locations.map(function(L) {return '#: ' + L;}).join('\n'),
                'msgid ' + this.escaped()
            ];
            if (this.plural) {
                out.push('msgid_plural ' + this.escaped(this.plural));
                out.push('msgstr[0] ""');
                out.push('msgstr[1] ""');
            } else {
                out.push('msgstr ""');
            }

            return out.join('\n');
        };
    }

    function normalize_string(string) {
        string = string.replace(/\n/g, '');
        string = string.replace(/\t/g, ' ');
        string = string.replace(/\s\s+/g, ' ');
        string = string.replace(/^\s+/, '');
        string = string.replace(/\s+$/, '');
        return string;
    }

    function save_singular(normalized, location) {
        normalized = normalize_string(normalized);
        var ls;
        if (normalized in localizable_string_map) {
            ls = localizable_string_map[normalized];
        } else {
            ls = new LocalString(normalized);
            localizable_string_map[normalized] = ls;
            localizable_strings.push(ls);
        }
        ls.locations.push(location);
    }

    function extract_singular(node, filename) {
        if (!node.args.children.length) {
            throw new Error(
                'No string supplied for localization (line ' + node.lineno + ')');
        }
        var string_node = node.args.children[0];
        if (!(string_node instanceof nodes.Literal)) {
            throw new Error(
                'Cannot localize string (line ' + node.lineno + ')');
        }

        save_singular(string_node.value, filename + ':' + node.lineno);
    }

    function save_plural(norm_singular, norm_plural, location) {
        norm_singular = normalize_string(norm_singular);
        norm_plural = normalize_string(norm_plural);
        var ls;
        if (norm_singular in localizable_string_map &&
            localizable_string_map[norm_singular].plural === norm_plural) {
            ls = localizable_string_map[norm_singular];
        } else {
            ls = new LocalString(norm_singular);
            ls.plural = norm_plural;
            localizable_string_map[norm_singular] = ls;
            localizable_strings.push(ls);
        }
        ls.locations.push(location);
    }

    function extract_plural(node, filename) {
        if (node.args.children.length < 3) {
            throw new Error(
                'Invalid plural localization. Must have singular, plural, and parameters. (line ' + string_node.lineno + ')');
        }
        if (!(node.args.children[0] instanceof nodes.Literal)) {
            throw new Error(
                'Cannot localize singular string (line ' + node.lineno + ')');
        }
        if (!(node.args.children[1] instanceof nodes.Literal)) {
            throw new Error(
                'Cannot localize plural string (line ' + node.lineno + ')');
        }

        save_plural(node.args.children[0].value,
                    node.args.children[1].value,
                    filename + ':' + node.lineno);
    }

    function extract_template(parseTree, filename) {
        var calls = parseTree.findAll(nodes.FunCall);
        for (var i = 0, node; node = calls[i++];) {
            // Exclude function calls that aren't to gettext.
            var node_name = node.name;
            if (!node_name ||
                !(node_name instanceof nodes.Symbol) ||
                !(node_name.value === '_' || node_name.value === '_plural')) {
                continue;
            }

            switch (node_name.value) {
                case '_':
                    extract_singular(node, filename);
                    break;
                case '_plural':
                    extract_plural(node, filename);
                    break;
            }
        }
    }

    function extract_js(data, filename) {
        var ast = uglify.parse(
            data,
            {filename: filename, toplevel: null}
        );
        var tw = new uglify.TreeWalker(function(node) {
            if (node instanceof uglify.AST_Call &&
                (node.start.value === 'gettext' || node.start.value === 'ngettext')) {
                var args = node.args;
                var raw_location = node.start.file + ':' + node.start.line;
                var location = '[' + raw_location + ']';

                if (!args.length) {
                    console.error(node.start.value + ' with no arguments ');
                    return;
                }
                if (typeof args[0].value !== 'string') {
                    console.error('Invalid ' + node.start.value + ' call: Not a string ' + location);
                    return;
                }

                if (node.start.value === 'gettext') {
                    save_singular(args[0].value, raw_location);
                } else if (node.start.value === 'ngettext') {
                    if (args.length < 3) {
                        console.error('Invalid ngettext call: not enough parameters ' + location);
                        return;
                    }
                    if (typeof args[1].value !== 'string') {
                        console.error('Invlid ngettext call: plural form not string ' + location);
                        return;
                    }
                    save_plural(args[0].value, args[1].value,
                                raw_location);
                }
            }
        });
        ast.walk(tw);
    }

    function get_po() {
        return [
            '#, fuzzy',
            'msgid ""',
            'msgstr ""',
            '"Project-Id-Version: PACKAGE VERSION\\n"',
            '"Report-Msgid-Bugs-To: \\n"',
            '"POT-Creation-Date: ' + (new Date()).toISOString() + '\\n"',
            '"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"',
            '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"',
            '"Language-Team: LANGUAGE <LL@li.org>\\n"',
            '"MIME-Version: 1.0\\n"',
            '"Content-Type: text/plain; charset=utf-8\\n"',
            '"Content-Transfer-Encoding: 8bit\\n"',
            '"X-Generator: Fireplace L10n Tools 1.0\\n"',
            '',
            ''
        ].join('\n') + localizable_strings.join('\n\n');

    }

    function save_po(path) {
        fs.writeFile(path, get_po());
    }

    return {
        localizable_strings: localizable_strings,
        extract_template: extract_template,
        extract_js: extract_js,
        get_po: get_po,
        save_po: save_po
    };

})();
