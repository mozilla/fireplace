var fs = require('fs');
var path = require('path');

module.exports.opts = function(opts, defaults) {
    var out = defaults || {},
        last, i, is_flag;
    for(i = 0; i < opts.length; i++) {
        is_flag = opts[i].substr(0, 1) === '-';
        if (is_flag && last) {
            out[last] = true;
        } else if (!is_flag && last) {
            out[last] = opts[i];
        }
        last = is_flag ? opts[i].replace(/^\-+/, '') : null;
    }
    if (last) {out[last] = true;}
    return out;
};

module.exports.glob = function(path_, ext, done) {
    var results = [];
    fs.readdir(path_, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path_ + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    module.exports.glob(file, ext, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    // If it's got the right extension, add it to the list.
                    if(file.substr(file.length - ext.length) == ext)
                        results.push(path.normalize(file));
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

module.exports.globSync = function(path_, ext, done) {
    var results = [];
    var list = fs.readdirSync(path_);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
        file = path_ + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            module.exports.globSync(file, ext, function(err, res) {
                results = results.concat(res);
                if (!--pending) done(null, results);
            });
        } else {
            // If it's got the right extension, add it to the list.
            if(file.substr(file.length - ext.length) == ext)
                results.push(path.normalize(file));
            if (!--pending) done(null, results);
        }
    });
};
