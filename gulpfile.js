/* The main gulpfile that is distributed between all Commonplace projects
   resides in mozilla/marketplace-gulp. This allows for an easy upgrade path.
   Therefore, this gulpfile is a gulpfile local to this Commonplace project and
   can be modified at will.

   If you wish to make changes to the main build system, modify the Gulpfile
   in marketplace-gulp. If you want to locally develop on the Gulpfile, I'd
   recommend git-cloning mozilla/marketplace-gulp directly into your
   bower_components directory.
*/
var requireDir = require('require-dir');

var config = require('./config');

// Include all tasks from the common gulpfile.
requireDir(config.GULP_SRC_PATH);


//*****************
// Fireplace stuff.
// - Package build
// - Docker setup
//*****************
var fs = require('fs');

var argv = require('yargs').argv;
var clean = require('gulp-clean');
var commonplace = require('commonplace');
var gulp = require('gulp');
var mergeStream = require('merge-stream');
var path = require('path');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');

var marketplaceGulp = require(config.BOWER_PATH + 'marketplace-gulp/index');


var packageFilesWhitelist = [
    'src/app.html',
    'src/app-icons/*.png',
    'src/media/css/fxa.css',
    'src/media/css/include.css',
    'src/media/css/splash.css',
    'src/media/js/include.js',
    'src/media/js/l10n.js',
    // Locale files dynamically whitelisted later.
];
var imageWhitelist = [
    // Match all images. If it isn't being used, it should be nixed.
    'src/media/img/**/*.*',
];
var PKG_PATH = 'package/archives/';
var TMP_PATH = 'package/.tmp/';  // Used to get around amd-optimize loader.
var server = argv.SERVER || process.env.SERVER || 'prod';
var latestPackageFolder = PKG_PATH + '_' + server + '/';
var latestPackageZip = PKG_PATH + '_' + server + '.zip';
var versionTimestamp = getVersionTimestamp();
var packageFilename = server + '_' + versionTimestamp;


gulp.task('package',
    ['build_packaged', 'images', 'packaged_manifest'], function() {
    /*
        Creates a package which involves:
            - Generating language packs.
            - Copying source files into a folder in package/archives.
            - Zipping the folder into a latest zip and a version zip.
    */
    commonplace.generate_langpacks();

    packageFilesWhitelist = packageFilesWhitelist.concat(getLanguageWhitelist());
    return gulp.src(packageFilesWhitelist)
        // Create latest folder.
        .pipe(gulp.dest(function(file) {
            // Maintain directory structure for each file.
            var filePath = file.path.split(__dirname)[1].slice(1).split('/');
            // Remove 'src' path and filename.
            filePath.shift();
            filePath.pop();
            // Copy it to the package.
            return latestPackageFolder + filePath.join('/');
        }))
        // Create latest zip.
        .pipe(zip('_' + server + '.zip'))
        .pipe(gulp.dest(PKG_PATH))
        // Create version zip.
        .pipe(rename(packageFilename + '.zip'))
        .pipe(gulp.dest(PKG_PATH))
        .on('end', function() {
            console.log('Package complete: ./package/archives/' +
                        packageFilename + '.zip');
        });
});


gulp.task('js_build_package', ['packaged_settings', 'templates_build_sync'], function() {
    // JS build that excludes the settings_local in the src directory and
    // instead uses the built settings_local_package.
    var js = marketplaceGulp.paths.js;
    js.push('!' + config.JS_DEST_PATH + 'settings_local.js');
    js.push(TMP_PATH + 'settings_local.js');
    return marketplaceGulp.jsBuild(gulp.src(js))
        .pipe(gulp.dest(latestPackageFolder + 'media/js'));
});


gulp.task('images', ['latest_package_clean'], function() {
    return gulp.src(imageWhitelist)
        .pipe(gulp.dest(function(file) {
            // Maintain directory structure of the images since we use a
            // general glob on a nested directory structure.
            // Get the path relative to the CWD.
            var filePath = file.path.split(__dirname)[1].slice(1).split('/');
            // Remove 'src' path.
            filePath.shift();
            filePath.join('/');
            // Copy it to the package.
            return path.join(latestPackageFolder + 'media/img/',
                             path.dirname(filePath));
        }));
});


gulp.task('packaged_settings', function() {
    return gulp.src('package/templates/settings_local_package.js')
        .pipe(replace(/{domain}/g, config.packageConfig[server].domain))
        .pipe(replace(/{media_url}/g, config.packageConfig[server].media_url))
        .pipe(replace(/{version}/g, versionTimestamp))
        .pipe(rename('settings_local.js'))
        .pipe(gulp.dest(TMP_PATH));
});


gulp.task('packaged_manifest', ['latest_package_clean'], function() {
    // Creates a packaged manifest with configurations from config.js using
    // the selected SERVER.
    return gulp.src('package/templates/manifest.webapp')
        .pipe(replace(/{name}/g, config.packageConfig[server].name))
        .pipe(replace(/{origin}/g, config.packageConfig[server].origin))
        .pipe(replace(/{version}/g, versionTimestamp))
        .pipe(gulp.dest(latestPackageFolder));
});


gulp.task('package_info_stdout', function() {
    console.log('Creating package for ' + server + ':');
    console.log('    Domain: ' + config.packageConfig[server].domain);
    console.log('    Media URL: ' + config.packageConfig[server].media_url);
    console.log('    Name: ' + config.packageConfig[server].name);
    console.log('    Origin: ' + config.packageConfig[server].origin);
    console.log('    Version: ' + versionTimestamp);
});


gulp.task('build_packaged', ['buildID_write', 'css_build_sync',
                             'js_build_package', 'package_info_stdout',
                             'templates_build_sync', 'imgurls_write']);


gulp.task('latest_package_clean', function() {
    // Delete latest package folder + zip to replace with newer ones.
    return gulp.src([latestPackageFolder, latestPackageZip], {read: false})
        .pipe(clean({force: true}));
});


function getLanguageWhitelist() {
    // Parses app.html to get only the languages we ship to reduce our package
    // size. As of writing, there are 82 languages total, each at around 30KB.
    // But we only use around 40 of them in the package.
    var template = fs.readFileSync('src/app.html').toString();
    var langMatch = template.match(/<body data-languages="\[(.*?)\]">/);
    var langs = langMatch[1].replace(/&#34;/g, '').replace(/\s/g, '').split(',');
    return langs.map(function(lang) {
        return 'src/media/locales/' + lang + '.js';
    });
}


function getVersionTimestamp() {
    // Year month day hour minute second (e.g., 20141125.063510).
    var date = new Date();
    return date.getFullYear() + pad(date.getMonth(), 2) +
           pad(date.getDate(), 2) + '.' + date.getHours() + date.getMinutes() +
           date.getSeconds();
}


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


gulp.task('docker', function() {
    runSequence(
        ['bower_copy', 'require_config'],
        'build',
        'serve'
    );
});
