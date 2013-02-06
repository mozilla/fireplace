var fs = require('fs');
var http = require('http');
var path = require('path');



// Here's the local server.

var indexdata = 'Still loading...';
fs.readFile('./hearth/index.html', function(err, data) {
    indexdata = data;
});

var mimes = {
    'css': 'text/css',
    'js': 'application/javascript'
}

http.createServer(function(request, response) {

    var now = new Date();

    console.log(
        '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '] ' +
        request.url);

    function writeIndex() {
        fs.readFile('./hearth/index.html', function(error, content) {
            // We'll assume that you don't delete index.html.
            response.writeHead(200, { 'Content-Type': 'text/html' });
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
                }
                else {
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

}).listen(8675);

console.log('Server running at http://127.0.0.1:8675/');

var child_process = require('child_process'),
    watched_filepaths = [];

function glob(path, ext, done) {
    var results = [];
    fs.readdir(path, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    glob(file, ext, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    // If it's got the right extension, add it to the list.
                    if(file.substr(file.length - ext.length) == ext)
                        results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};


function reload() {
    watched_filepaths.forEach(function(filepath) {
        fs.unwatchFile(filepath);
    });
    watched_filepaths = [];

    // "restart" is a special action keyword
    watch('./damper.js', null, 'restart');
    watch('./hearth/media/css', 'less', 'less');
    watch('./hearth/templates', 'html', 'nunjucks');
}

function compileNunjucks() {
    child_process.exec('./nunjucks/bin/precompile ./hearth/templates -f --amd > hearth/templates.js', function(e, so, se) {
        console.log(se);  // stderr
        if (e !== null) {
            console.error(e);
        }
    });
}

function runCommand(command, filepath) {
    switch (command) {
        case 'restart':
            return reload();
        case 'less':
            child_process.exec('lessc ' + filepath + ' ' + filepath + '.css', function(e, so, se) {
                if (e !== null) {
                    console.error(e);
                }
            });
            break;
        case 'nunjucks':
            compileNunjucks();
            break;
    }
}

function watch(globpath, ext, command) {
    var cb = function(err, filepaths) {
        // for single files, filepaths will just be one file: the exact match
        filepaths.forEach(function(filepath) {
            // save the filepath so that we can unwatch it easily when reloading, and start the watch
            watched_filepaths.push(filepath);
            if (command == 'less') {
                fs.exists(filepath, function(exists) {
                    if (exists) {
                        runCommand(command, filepath);
                    }
                });
            }
            fs.watchFile(filepath, {interval: 250}, function(curr, prev) {
                // ignore simple accesses
                if (curr.mtime.valueOf() != prev.mtime.valueOf() || curr.ctime.valueOf() != prev.ctime.valueOf()) {
                    console.warn('> ' + filepath + ' changed.');
                    runCommand(command, filepath);
                }
            });

        });
        if (filepaths.length > 1)
            console.log('Watching ' + filepaths.length + ' ' + ext + ' files.')
    }
    if (globpath.substr(1).indexOf('.') > -1) {
        cb(null, [globpath]);
    } else {
        glob(globpath, ext, cb);
    }
}

compileNunjucks();
reload();
