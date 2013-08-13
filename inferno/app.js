var cp = require('child_process');
var crypto = require('crypto');
var fs = require('fs');
var http = require('https');

var express = require('express');
var irc = require('irc');
var app = express();

var client = new irc.Client('irc.mozilla.org', 'infernobot', {channels: ['#amo-bots']});

if (!fs.existsSync('build')) {
    fs.mkdir('build');
}


app.get('/', function(req, res){
    res.send(fs.readFileSync('templates/index.html') + '');
});

function getMinifest(type, res) {
    var manifest = JSON.parse(fs.readFileSync('build/fireplace-master/hearth/manifest.webapp'));
    manifest['package_path'] = 'https://inferno.paas.allizom.org/package.zip?type=' + type;

    res.set('Content-Type', 'application/x-web-app-manifest+json');
    res.set('ETag', '"' + getETag(type, null, 'build/package.zip') + '"');
    res.send(JSON.stringify(manifest));
}

app.get('/minifest', function(req, res){
    getMinifest('daily', res);
});
app.get('/minifest/:type', function(req, res){
    getMinifest(req.params.type, res);
});


function getETag(type, data, path) {
    var output = '';
    var now = new Date();
    switch (type) {
        case 'latest':
            var hash = crypto.createHash('md5');
            if (!data) {
                data = fs.readFileSync(path);
            }
            hash.update(data);
            return hash.digest('hex');
        case 'bidaily':
            output += Math.floor(now.getHours() / 12) + '_';
        case 'daily':
            output += now.getDay() + '_';
        case 'weekly':
            output += '_' + Math.floor(now.getDay() / 7);
            break;
    }
    return output + now.getMonth() + '_' + now.getFullYear();
}

app.get('/package.zip', function(req, res){
    var type = req.query.type || 'daily';
    fs.readFile('build/package.zip', function(err, data) {
        res.set('Content-Type', 'application/zip');
        res.set('ETag', '"' + getETag(type, data) + '"');
        res.send(data);
    });
});

app.all('/ping', function(req, res) {
    build(function() {
        res.send("Fetched, thanks. We'll take it from here.");
    });
});

function build(fetched_cb) {

    function cpe(command, options, callback) {
        function cb(error, stdout, stderr) {
            if (error) {
                console.error(error);
                console.error(stderr);
            } else {
                callback();
            }
        }
        var proc = cp.exec(command, options, cb);
        proc.on('error', function() {console.error(arguments);});
        proc.on('exit', function(code) {
            if (code !== 0) {
                console.error('Bad error code: ', code);
            }
        });
    }

    cpe('rm -rf fireplace-master', {cwd: 'build/'}, git);

    function git() {
        cpe('git clone git://github.com/mozilla/fireplace.git fireplace-master', {cwd: 'build/'}, compile);
    }

    var opts = {cwd: 'build/fireplace-master/'};
    function compile() {

        if (fetched_cb)
            fetched_cb();

        console.log('Installing deps');
        cpe('npm install', opts, damper);
        function damper() {
            console.log('Running damper compiler');
            cpe('node damper.js --compile', opts, ssettings);
        }
        function ssettings() {
            console.log('Swapping in inferno settings');
            cpe('cp hearth/media/js/settings_inferno.js hearth/media/js/settings_local.js', opts, rmfonts);
        }
        function rmfonts() {
            console.log('Removing unnecessary fonts');
            cpe('rm -f hearth/media/fonts/*.ttf hearth/media/fonts/*.svg hearth/media/fonts/*.eot', opts, rmstyl);
        }
        function rmstyl() {
            console.log('Removing unnecessary stylus files');
            cpe('rm -f hearth/media/css/*.styl', opts, rmtemplates);
        }
        function rmtemplates() {
            console.log('Removing raw templates and tests');
            cpe('rm -rf hearth/templates hearth/tests', opts, rmorigicons);
        }
        function rmorigicons() {
            console.log('Removing original region icons');
            cpe('rm -rf hearth/media/img/icons/regions/originals', opts, zip);
        }
        function zip() {
            console.log('Removing old package.zip');
            try {
                fs.unlinkSync('build/package.zip');
            } catch(e) {
                console.log('No package.zip to remove');
            }
            cpe('cd hearth/ && zip -r ../../package.zip *', opts, finish);
        }
    }

    function finish() {
        console.log('Done');
        client.say('#amo-bots', "Fireplace was updated on inferno");
        client.say('#amo-bots', "https://inferno.paas.allizom.org/");
    }
}

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);

build();
