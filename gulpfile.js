/* The main gulpfile that is distributed between all Commonplace projects
   resides in Commonplace. This allows for an easy upgrade path. Therefore,
   this gulpfile is a gulpfile local to this Commonplace project and can be
   modified at will.

   If you wish to make changes to the main build system, modify the Gulpfile
   in Commonplace. You may make local modifications to the Gulpfile in the
   bower_components directory, but remember to upstream it.
*/
var requireDir = require('require-dir');

var config = require('./config');

// Include all tasks from the common gulpfile.
requireDir(config.GULP_SRC_PATH);
