var fs = require('fs');
var http = require('http');
var path = require('path');
var stylus = require('stylus');

var fs_exists;
if (!('exists' in fs)) {
    fs_exists = fs.exists;
} else {
    fs_exists = require('path').exists;
}

var opts = require('./scripts/utils.js').opts;
var glob = require('./scripts/utils.js').glob;

var mimes = {
    'css': 'text/css',
    'js': 'application/javascript',
    'woff': 'application/font-woff'
};

var opts = opts(process.argv.slice(2),
                {host: '0.0.0.0', port: '8675', l10n: false, compile: false});

if (!opts.compile) {
    // Here's the local server.
    http.createServer(function(request, response) {

        var now = new Date();

        console.log(
            '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '] ' +
            request.url);

        function writeIndex() {
            fs.readFile('./hearth/index.html', function(error, content) {
                // We'll assume that you don't delete index.html.
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(content, 'utf-8');
            });
        }

        if(request.url == '/')
            return writeIndex();

        var filePath = './hearth' + request.url;
        fs.exists(filePath, function(exists) {
            if (exists) {
                fs.readFile(filePath, function(error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                        console.error(error);
                    } else {
                        var dot = request.url.lastIndexOf('.');
                        if (dot > -1) {
                            var extension = request.url.substr(dot + 1);
                            response.writeHead(200, {'Content-Type': mimes[extension]});
                        }

                        response.end(content, 'utf-8');
                    }
                });
            } else {
                writeIndex();
            }
        });

    }).listen(opts.port, opts.host);

    console.log('Server running at http://' + opts.host + ':' + opts.port);
} else {
    console.log('Starting compilation...');
}

var child_process = require('child_process'),
    watched_filepaths = [];


function reload() {
    watched_filepaths.forEach(fs.unwatchFile);
    watched_filepaths = [];

    // "restart" is a special action keyword
    watch('./damper.js', null, 'restart');
    watch('./compile_templates.js', null, 'nunjucks');
    watch('./scripts', 'js', 'nunjucks');

    watch('./hearth/media/css', 'styl', 'stylus');
    watch('./hearth/templates', 'html', 'nunjucks');

    // When the builder is updated, recompile the templates.
    watch('./hearth/js/builder.js', null, 'nunjucks');
}

var _nunjucks_command = './scripts/compile.js hearth/templates hearth/templates.js strings.po';
if (opts.l10n || opts.compile) {
    _nunjucks_command += ' --l10n';
}
function runCommand(command, filepath) {
    switch (command) {
        case 'restart':
            console.log('Restarting...');
            return reload();
        case 'stylus':
            var filepathDir = filepath.split('/').slice(0, -1).join('/');
            fs.readFile(filepath, function (err, data) {
                data = data.toString();
                if (err) {
                    console.error(filepath + ' not found!');
                    return;
                }
                stylus(data)
                    .set('filename', filepath + '.css')
                    .set('include css', true)
                    .include(filepathDir)
                    .render(function(err, css) {
                        fs.writeFileSync(filepath + '.css', css);
                        if (err) console.error(err);
                    });
            });
            break;
        case 'nunjucks':
            console.log('Recompiling templates...');
            child_process.exec(_nunjucks_command, function(e, so, se) {
                console.log(se);  // stderr
                if (e !== null) {
                    console.error(e);
                }
            });
            break;
    }
}

function watch(globpath, ext, command) {
    var cb = function(err, filepaths) {
        filepaths.forEach(function(filepath) {
            watched_filepaths.push(filepath);
            if (command == 'stylus') {
                fs.exists(filepath, function(exists) {
                    if (exists) {
                        runCommand(command, filepath);
                    }
                });
            }

            // If we're compiling, we don't want to watch the files.
            if (opts.compile) {
                return;
            }

            fs.watchFile(filepath, {interval: 250}, function(curr, prev) {
                if (curr.mtime.valueOf() != prev.mtime.valueOf() ||
                    curr.ctime.valueOf() != prev.ctime.valueOf()) {
                    console.warn('> ' + filepath + ' changed.');
                    runCommand(command, filepath);
                }
            });

        });
        if (filepaths.length > 1 && !opts.compile) {
            console.log('Watching ' + filepaths.length + ' ' + ext + ' files.');
        }
    };
    if (globpath.substr(1).indexOf('.') > -1) {
        cb(null, [globpath]);
    } else {
        glob(globpath, ext, cb);
    }
}

runCommand('nunjucks');
reload();
