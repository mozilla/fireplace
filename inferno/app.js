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

var bundle = 'https://nodeload.github.com/mozilla/fireplace/zip/master';
app.all('/ping', function(req, res) {
    http.get(bundle, function(request) {
        var downloadfile = fs.openSync('build/temp.zip', 'w');
        var buffer = '';
        request.on('data', function(chunk) {
            fs.write(downloadfile, chunk, 0, chunk.length, null, function() {});
        });
        request.on('end', function() {
            fs.closeSync(downloadfile);
            console.log('Wrote to temp');
            res.send("Fetched, thanks. We'll take it from here.");
            extract();
        });
    });

    function extract() {
        cp.exec('rm -rf fireplace-master', {cwd: 'build/'}, unzip) ;
        function unzip() {
            cp.exec('unzip -u temp.zip', {cwd: 'build/'}, rmold) ;
        }
        function rmold() {
            console.log('Removing temp file.');
            cp.exec('rm build/temp.zip', {}, compile);
        }
    }

    var opts = {cwd: 'build/fireplace-master/'};
    function compile() {
        console.log('Installing deps');
        cp.exec('npm install', opts, damper);
        function damper() {
            console.log('Running damper compiler');
            cp.exec('node damper.js --compile', opts, ssettings);
        }
        function ssettings() {
            console.log('Swapping in inferno settings');
            cp.exec('cp hearth/media/js/settings_inferno.js hearth/media/js/settings_local.js', opts, rmfonts);
        }
        function rmfonts() {
            console.log('Removing unnecessary fonts');
            cp.exec('rm -f hearth/media/fonts/*.ttf hearth/media/fonts/*.svg hearth/media/fonts/*.eot', opts, zip);
        }
        function zip() {
            console.log('Removing old package.zip');
            try {
                fs.unlinkSync('build/package.zip');
            } catch(e) {
                console.log('No package.zip to remove');
            }
            cp.exec('cd hearth/ && zip -r ../../package.zip *', opts, finish);
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
