var fs = require('fs');

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

module.exports.glob = function(path, ext, done) {
    var results = [];
    fs.readdir(path, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    module.exports.glob(file, ext, function(err, res) {
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

module.exports.globSync = function(path, ext, done) {
    var results = [];
    var list = fs.readdirSync(path);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
        file = path + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            module.exports.globSync(file, ext, function(err, res) {
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
};
