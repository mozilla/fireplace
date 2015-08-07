/*
    The common Marketplace gulpfiles reside in mozilla/marketplace-gulp.
*/
var gulp = require('gulp');
var config = require('./config');
var marketplaceGulp = require('marketplace-gulp')(config);
gulp.tasks = marketplaceGulp.gulp.tasks;


//*****************
// Fireplace stuff.
// - Package build
//*****************
var fs = require('fs');
var path = require('path');

var archiver = require('archiver');
var browserify = require('browserify');
var commonplace = require('commonplace');
var gulp = require('gulp');
var envify = require('envify/custom');
var mergeStream = require('merge-stream');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var rm = require('rimraf');
var runSequence = require('run-sequence');
var vinylSource = require('vinyl-source-stream');


var packageFilesWhitelist = [
    // include.js not included since it is written straight to package folder.
    // Locale files will be dynamically whitelisted later.
    'src/app.html',
    'src/app-icons/*.png',
    'src/media/css/include.css',
    'src/media/css/splash.css',
    'src/media/js/l10n.js',
];
var imageWhitelist = [
    // Match all images. If it isn't being used, it should be nixed.
    'src/media/img/**/*',
    '!src/media/app-icons/**/*'
];
var PKG_PATH = 'package/builds/';
var TMP_PATH = 'package/.tmp/';  // Used to get around amd-optimize loader.
var server = process.env.SERVER || 'prod';
var latestPackageFolder = PKG_PATH + '_' + server + '/';
var latestPackageZip = PKG_PATH + '_' + server + '.zip';
var versionTimestamp = getVersionTimestamp();
var packageFilename = server + '_' + versionTimestamp;
var versionPackageZip = PKG_PATH + packageFilename + '.zip';

var iframePackageFilesWhitelist = [
    // Locale files will be dynamically whitelisted later.
    'package/iframe/app-icons/*.png',
    'package/iframe/bundle.js',
    'package/iframe/index.html',
    'package/iframe/style.css',
];
var IFRAME_SRC_PATH = path.join('package', 'iframe');
var iframeLatestPackageFolder = PKG_PATH + '_iframe_' + server + '/';
var iframeLatestPackageZip = PKG_PATH + '_iframe_' + server + '.zip';
var iframePackageFilename = 'iframe_' + server + '_' + versionTimestamp;
var iframeVersionPackageZip = PKG_PATH + iframePackageFilename + '.zip';


gulp.task('package',
    ['build_package', 'images', 'package_manifest', 'whitelist_copy'], function() {
    /*
        Creates a package which involves:
            - Generating language packs.
            - Copying source files into a folder in package/builds.
            - Zipping the folder into a latest zip and a version zip.
    */
    commonplace.generate_langpacks();

    [latestPackageZip, versionPackageZip].forEach(function(outputZipName) {
        zipPackage(latestPackageFolder, outputZipName);
    });
    console.log('Package complete: ./package/builds/' +
                packageFilename + '.zip');
});


gulp.task('whitelist_copy', function() {
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
        }));
});


gulp.task('js_build_package', ['package_settings', 'templates_build_sync'], function(done) {
    // JS build that points to the packaged settings, outputs to the package
    // directory, and generates a sourcemap unique to the package.
    var paths = config.requireConfig.paths;
    paths.settings_local = '../../../' + TMP_PATH + 'settings_local';

    marketplaceGulp.jsBuild({
        generateSourceMaps: false,  // No source mappings for packages yet.
        out: latestPackageFolder + 'media/js/' + marketplaceGulp.paths.include_js,
        paths: paths,
    }, function() {
        done();
    });
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


gulp.task('package_settings', function() {
    return gulp.src('package/templates/settings_local_package.js')
        .pipe(replace(/{domain}/g, config.packageConfig[server].domain))
        .pipe(replace(/{media_url}/g, config.packageConfig[server].media_url))
        .pipe(replace(/{version}/g, versionTimestamp))
        .pipe(rename('settings_local.js'))
        .pipe(gulp.dest(TMP_PATH));
});


gulp.task('package_manifest', ['latest_package_clean'], function() {
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


gulp.task('build_package', ['buildID_write', 'css_build_sync',
                            'js_build_package', 'package_info_stdout',
                             'templates_build_sync', 'imgurls_write']);


gulp.task('latest_package_clean', function(cb) {
    // Delete latest package folder + zip to replace with newer ones.
    rm(latestPackageFolder, function() {});
    rm(latestPackageZip, cb);
});


function getLanguageWhitelist() {
    // Parses app.html to get only the languages we ship to reduce our package
    // size. As of writing, there are 82 languages total, each at around 30KB.
    // But we only use around 40 of them in the package.
    var template = fs.readFileSync('src/app.html').toString();
    var langMatch = template.match(/<body data-languages="\[(.*?)\]"?/);
    var langs = langMatch[1].replace(/&#34;/g, '').replace(/\s/g, '').split(',');
    return langs.map(function(lang) {
        return 'src/media/locales/' + lang + '.js';
    });
}


function getVersionTimestamp() {
    // Year month day hour minute second (e.g., 20141125.063510).
    var date = new Date();
    return date.getFullYear() + pad(date.getMonth() + 1, 2) +
           pad(date.getDate(), 2) + '.' + date.getHours() + date.getMinutes() +
           date.getSeconds();
}


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function zipPackage(dirToZip, outputZipName) {
    // Use archiver to recursively zip contents of folder.
    var output = fs.createWriteStream(outputZipName);
    var archive = archiver('zip');
    archive.pipe(output);
    archive.bulk([
        {src: [ '**/*' ], cwd: dirToZip, expand: true}
    ]);
    archive.finalize();
}


gulp.task('watch_package', function() {
    // Watch and recompile on change.
    var paths = marketplaceGulp.paths;
    gulp.watch(paths.styl, ['package']);
    gulp.watch(paths.js, ['package']);
    gulp.watch(paths.html, ['package']);
});


gulp.task('iframe_package', ['iframe_package_js', 'iframe_package_manifest',
                             'iframe_whitelist_copy'], function() {
    [iframeLatestPackageZip, iframeVersionPackageZip].forEach(function(outputZipName) {
        zipPackage(iframeLatestPackageFolder, outputZipName);
    });
    console.log('Package complete: ./package/builds/' +
                iframePackageFilename + '.zip');
});


gulp.task('iframe_whitelist_copy', ['iframe_package_clean',
                                    'iframe_package_js'], function() {
    // Copy files from whitelist to the folder.
    return gulp.src(iframePackageFilesWhitelist)
        .pipe(gulp.dest(function(file) {
            // Maintain directory structure for each file.
            var filePath = file.path.split(__dirname)[1].slice(1).split('/');
            // Remove 'package/iframe' from path and filename.
            filePath.shift();
            filePath.shift();
            filePath.pop();
            // Copy it to the package.
            return iframeLatestPackageFolder + filePath.join('/');
        }));
});


gulp.task('iframe_package_js', function() {
    return browserify('./package/iframe/js/main.js')
        .transform(envify({
            MKT_URL: config.packageConfig[server].domain
        }))
        .bundle()
        .pipe(vinylSource('bundle.js'))
        .pipe(gulp.dest('./package/iframe'));
});


gulp.task('iframe_package_manifest', ['iframe_package_clean'], function() {
    // Build iframe package manifest. Swap in the name, origin, version.
    var name = config.packageConfig[server].name;

    return gulp.src(path.join(IFRAME_SRC_PATH, 'manifest.webapp'))
        .pipe(replace(/{name}/, name))
        .pipe(replace(/{origin}/, config.packageConfig[server].iframe_origin))
        .pipe(replace(/{version}/, versionTimestamp))
        .pipe(gulp.dest(iframeLatestPackageFolder));
});


gulp.task('iframe_package_clean', function(cb) {
    // Delete latest iframe package folder + zip to replace with newer ones.
    rm(iframeLatestPackageZip, function() {});
    rm(iframeLatestPackageFolder, cb);
});


gulp.task('docker', function() {
    runSequence(
        ['bower_copy', 'require_config'],
        'build',
        'serve'
    );
});
