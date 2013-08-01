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
    var current_obj = {body: ''};

    function store_current() {
        if (id) {
            // Don't save a copy of the headers in the langpack.
            output[id] = current_obj;
        } else {
            // If there's no IDs, it's probably the headers. If there's a
            // pluralizer up there, use it.
            var parsed_headers = current_obj.body.split('\n');
            parsed_headers.forEach(function(v) {
                var plex_match = RE_PLURALIZER.exec(v);
                if (!plex_match) return;
                pluralizer = plex_match[1];
            });
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
            console.log('...Storing existing id: ', id);
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
        if (last === 'plurals') {
            console.log(' >> Appending plural: ', line_val);
            current_obj.plurals[last_plural] += line_val;
        } else if (last === 'id') {
            console.log(' >> Last was ID');
            got_id(line_val);
        } else {
            console.log(' >> (' + last + ':' + id + ') Appending : ', line_val);
            current_obj[last] += line_val;
        }
    }

    store_current();

    return {
        output: output,
        pluralizer: pluralizer
    };
}

function gen_pack(data, lang) {
    var parsed = parse(String(data).split('\n'));

    return [
    '(function() {',
    'if (!navigator.l10n) {navigator.l10n = {};}',
    'navigator.l10n.language = "' + lang + '";',
    'navigator.l10n.strings = ' + JSON.stringify(parsed.output) + ';',
    'navigator.l10n.pluralize = function(n) {',
    '  return ' + parsed.pluralizer + ';',
    '};',
    '})();',
    ].join('\n');
}

function process_file(path, lang) {
    var data = fs.readFileSync(path);
    var compiled = gen_pack(data, lang);
    fs.writeFileSync(path + '.js', compiled);
}

process_file(args[0], args[1]);
