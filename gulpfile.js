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
