var fs = require('fs');
var path = require('path');

var fs_exists;
if ('exists' in fs) {
    fs_exists = fs.exists;
} else {
    fs_exists = path.exists;
}

var sl = path.normalize(__dirname + '/../hearth/media/js/settings_local.js');
fs_exists(sl, function(exists) {
    if (!exists) {
        console.log("Settings local does not exist...creating");
        fs.writeFileSync(sl, fs.readFileSync(sl + '.dist'));
    } else {
        console.log('Settings local exists.')
    }
});
