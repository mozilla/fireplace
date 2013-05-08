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
        if (id) {
            // Don't save a copy of the headers in the langpack.
            output[id] = current_obj;
        }
        id = '';
        current_obj = {body: ''};
    }

    for (var i = 0; i < po_content.length; i++) {
        var line = po_content[i];

        if (!line.length || line[0] === '#') {
            continue;
        }

        function got_id(new_id) {
            console.log('Found ID: ', new_id);
            if (new_id === '') {
                console.log(' > Ignoring blank id');
                id = '';
                return;
            }
            id += new_id;
            if (id !== new_id) {
                console.log(' > ID now: ', id);
            }
        }

        if (sw(line, S_ID)) {
            console.log(' > Storing existing id: ', id);
            store_current();

            var new_id = JSON.parse(line.substr(S_ID.length));
            got_id(new_id);
            last = 'id';
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
            last = 'body';
            var body = JSON.parse(line.substr(S_STR.length));
            console.log(' > Storing body: ', body);
            current_obj.body += body;
            continue;
        }
        if (sw(line, S_PLURAL)) {
            last = 'plural';
            var plural = JSON.parse(line.substr(S_PLURAL.length));
            console.log(' > Plural form: ', plural);
            if (!('plural' in current_obj)) {
                current_obj.plural = '';
            }
            current_obj.plural += plural;
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
            console.log(' >> Appending plural: ', line_val);
            current_obj.plurals[last_plural] += line_val;
        } else if (last === 'id') {
            got_id(line_val);
        } else {
            console.log(' >> (' + last + ':' + id + ') Appending : ', line_val);
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
