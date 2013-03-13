#!/usr/bin/env node
var fs = require('fs');
var util = require('util');

var args = process.argv;
args.shift();
args.shift();


function sw(x, y) {return x.substr(0, y.length) === y;}
var S_ID = 'msgid ';
var S_STR = 'msgstr ';
var S_PLURAL = 'msgid_plural ';
var S_PLURAL_STR = 'msgstr[';
var RE_PLURAL = /^msgstr\[([0-9]+)\] (\".*\")/;
var RE_PLURALIZER = /^Plural\-Forms: nplurals=[0-9]+; plural=(.+);/;

function parse(po_content) {
    var output = {};
    var pluralizer = '0';

    var state = null;

    var id = null;
    var last = null;
    var last_plural = null;
    var current_obj = {};

    function store_current() {
        output[id] = current_obj;
        id = null;
        current_obj = {};
    }

    for (var i = 0; i < po_content.length; i++) {
        var line = po_content[i];

        if (!line.length || line[0] === '#') {
            continue;
        }

        if (sw(line, S_ID)) {
            var new_id = JSON.parse(line.substr(S_ID.length));
            if (new_id === '') {
                continue;
            }
            if (id) {
                store_current();
            }
            id = new_id;
            continue;
        }
        if (sw(line, S_PLURAL_STR)) {
            var pl_match = RE_PLURAL.exec(line);
            if (!('plurals' in current_obj)) {
                current_obj.plurals = [];
            }
            current_obj.plurals[pl_match[1]] = JSON.parse(pl_match[2]);
            last = 'plurals';
            last_plural = pl_match[1];
            continue;
        }
        if (sw(line, S_STR)) {
            current_obj.body = JSON.parse(line.substr(S_STR.length));
            last = 'body';
            continue;
        }
        if (sw(line, S_PLURAL)) {
            last = 'plural';
            current_obj.plural = JSON.parse(line.substr(S_PLURAL.length));
            continue;
        }

        var line_val = JSON.parse(line);
        if (id === null && last !== 'plurals') {
            var plex_match = RE_PLURALIZER.exec(line_val);
            if (!plex_match) {
                continue;
            }
            pluralizer = plex_match[1];
        } else if (last === 'plurals') {
            current_obj.plurals[last_plural] += line_val;
        } else {
            current_obj[last] += line_val;
        }
    }

    return {
        output: output,
        pluralizer: pluralizer
    };
}

function gen_pack(data) {
    var parsed = parse(String(data).split('\n'));

    return [
    '(function() {',
    'navigator.l10n = {};',
    'navigator.l10n.strings = ' + JSON.stringify(parsed.output) + ';',
    'navigator.l10n.pluralize = function(n) {',
    'return ' + parsed.pluralizer + ';',
    '};',
    '})();',
    ].join('\n');
}

function process_file(path) {
    var data = fs.readFileSync(path);
    var compiled = gen_pack(data);
    fs.writeFileSync(path + '.js', compiled);
}

process_file(args[0]);
