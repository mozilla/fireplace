var cp = require('child_process');
var fs = require('fs');
var http = require('https');

var express = require('express');
var irc = require('irc');
var app = express();

var client = new irc.Client('irc.mozilla.org', 'infernobot', {channels: ['#amo-bots']});

app.get('/', function(req, res){
    res.send(fs.readFileSync('templates/index.html') + '');
});

app.get('/minifest', function(req, res){
    var manifest = JSON.parse(fs.readFileSync('build/fireplace-master/hearth/manifest.webapp'));
    manifest['package_path'] = 'http://inferno.paas.allizom.org/package.zip';
    res.set('Content-Type', 'application/x-web-app-manifest+json');
    res.send(JSON.stringify(manifest));
});

app.get('/package.zip', function(req, res){
    fs.readFile('build/package.zip', function(err, data) {
        res.set('Content-Type', 'application/zip');
        res.send(data);
    });
});

app.all('/ping', function(req, res) {

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

        res.send("Fetched, thanks. We'll take it from here.");

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
            cpe('rm -rf hearth/templates hearth/tests', opts, zip);
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
        client.say('#amo-bots', "http://inferno.paas.allizom.org/");
    }

});

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
