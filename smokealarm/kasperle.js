
if (typeof window !== 'undefined') {
    console.log('Running in Casper mode');
    exports.suite = require('./casper').suite;

} else {
    console.log('Running in Marionette mode');
    module.exports.suite = require('./marionette').suite;

}
