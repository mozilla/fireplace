function log() {
    // `console.log` wrapper that prefixes log statements.
    console.log('[yulelog]', Array.prototype.slice.call(arguments, 0).join(' '));
}

module.exports = {
    log: log,
};
