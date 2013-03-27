#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

// nunjucks
var compiler = require('nunjucks').compiler;
var parser = require('nunjucks').parser;

// Compilation dependencies
var L10n = require('./L10n.js');
var opts = require('./utils.js').opts;
var glob = require('./utils.js').globSync;

var args = process.argv;

if (args) {
    // Remove the "node compile_templates.js" arguments
    args.shift();
    args.shift();
}

function process(folder, output_file, locale_file, opts) {
    var extensions = require('../hearth/media/js/builder').extensions || [];

    glob(folder, '.html', function(err, templates) {
        var template_strings = (
            '(function() {' +
            'var templates = {};\n'
        );

        for(var i=0; i<templates.length; i++) {
            var name = templates[i].replace(path.join(folder, '/'), '');
            template_strings += 'templates["' + name + '"] = (function() {';

            var doCompile = function() {
                var src = fs.readFileSync(templates[i], 'utf-8');
                var cinst = new compiler.Compiler(extensions);
                // TODO: We probably won't need it, but preprocessing should
                // be added here.
                var parseTree = parser.parse(src, extensions);
                if (opts.l10n) {
                    L10n.extract_template(parseTree, name);
                }
                cinst.compile(parseTree)
                template_strings += cinst.getCode();
            };

            try {
                doCompile();
            } catch(e) {
                template_strings += [
                    'return {root: function() {',
                    'throw new Error("' + name + ' failed to compile. Check the damper for details.");',
                    '}}'
                ].join('\n');

                console.error(e);
            }

            template_strings += '})();\n';
        }

        template_strings += (
            'define(["nunjucks"], function(nunjucks) {\n' +
            '    nunjucks.env = new nunjucks.Environment([]);\n' +
            '    nunjucks.env.registerPrecompiled(templates);\n' +
            '    nunjucks.templates = templates;\n' +
            '    console.log("Templates loaded");\n' +
            '    return nunjucks;\n' +
            '});\n' +
            '})();'
        );

        fs.writeFile(output_file, template_strings);

    });

    if (opts.compile || opts.l10n) {
        glob(__dirname + '/../hearth/media/js', '.js', function(err, js_files) {
            var fireplace_root = path.normalize(__dirname + '/../');
            js_files.forEach(function(file) {
                var js_data = fs.readFileSync(file) + '';
                L10n.extract_js(js_data, file.replace(fireplace_root, ''));
            });
        });
        L10n.save_po(locale_file);
    }
}

if (args && args.length >= 3) {
    var folder = args[0];
    var output_file = args[1];
    var locale_file = args[2];

    var opts = opts(args.slice(3), {l10n: false});
    process(folder, output_file, locale_file, opts);

} else {
    module.exports.process = process;
}

