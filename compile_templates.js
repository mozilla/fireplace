#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var util = require('util');
var lib = require('./nunjucks/src/lib');
var compiler = require('./nunjucks/src/compiler');
var args = process.argv;

// Remove the "node compile_templates.js" arguments
args.shift();
args.shift();

var folder = args[0];
var templates = [];

var extensions = require('./hearth/media/js/builder').extensions || [];

function addTemplates(dir) {
    var files = fs.readdirSync(dir);

    for(var i=0; i<files.length; i++) {
        var filepath = path.join(dir, files[i]);
        var stat = fs.statSync(filepath);

        if(stat && stat.isDirectory()) {
            addTemplates(filepath);
        }
        else if(path.extname(filepath) == '.html') {
            templates.push(filepath);
        }
    }
}

addTemplates(folder);

util.puts('(function() {');
util.puts('var templates = {};');

for(var i=0; i<templates.length; i++) {
    var doCompile = function() {
        var src = lib.withPrettyErrors(
            templates[i],
            false,
            function() {
                return compiler.compile(
                    fs.readFileSync(templates[i], 'utf-8'),
                    extensions);
            }
        );
        var name = templates[i].replace(path.join(folder, '/'), '');

        util.puts('templates["' + name + '"] = (function() {');
        util.puts(src);
        util.puts('})();');
    };

    try {
        doCompile();
    } catch(e) {
        console.error(e);
    }
}

util.puts(
    'if(typeof define === "function" && define.amd) {\n' +
    '    define(["nunjucks"], function(nunjucks) {\n' +
    '        nunjucks.env = new nunjucks.Environment([]);\n' +
    '        nunjucks.env.registerPrecompiled(templates);\n' +
    '        nunjucks.templates = templates;\n' +
    '        return nunjucks;\n' +
    '    });\n' +
    '}\n' +
    'else if(typeof nunjucks === "object") {\n' +
    '    nunjucks.env = new nunjucks.Environment([]);\n' +
    '    nunjucks.env.registerPrecompiled(templates);\n' +
    '}\n' +
    'else {\n' +
    '    console.error("ERROR: You must load nunjucks before the precompiled templates");\n' +
    '}\n' +
    '})();'
);
