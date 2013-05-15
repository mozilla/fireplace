define('log', [], function() {

    var slice = Array.prototype.slice;
    var filter;
    var logs;
    var all_logs = [];

    var logger = function(type, tag) {

        // Give nice log prefixes:
        // > [log] This is a nice message!
        var prefix = '[' + type + ']';

        // If we have a tag, add that on:
        // > [log][special] Special messages!
        if (tag) {
            prefix += '[' + tag + ']';
        }
        prefix += ' ';

        if (!(type in logs)) {
            logs[type] = [];
        }

        var log_queue = logs[type];

        function make(log_level) {
            return function() {
                var args = slice.call(arguments, 0);
                if (args.length) {
                    args[0] = prefix + args[0];
                    args = args.map(filter);
                    log_queue.push(args);
                    all_logs.push(args);
                }

                // TODO: Add colorification support here for browsers that support it.
                // *cough cough* not firefox *cough*

                console[log_level].apply(console, args);
            };
        }

        return {
            log: make('log'),
            warn: make('warn'),
            error: make('error'),

            group: make('group'),
            groupCollapsed: make('groupCollapsed'),
            groupEnd: make('groupEnd'),

            // Have log('payments') but want log('payments', 'mock')?
            // log('payments').tagged('mock') gives you the latter.
            tagged: function(tag) {
                return logger(type, tag);
            }
        };
    };

    logger.unmentionables = [];
    logger.unmention = function(term) {
        logger.unmentionables.push(term);
        logger.unmentionables.push(encodeURIComponent(term));
    };

    logs = logger.logs = {};
    logger.all = all_logs;
    logger.get_recent = function(count, type) {
        var selected_logs = type ? logs[type] : all_logs;
        var length = selected_logs.length;
        return selected_logs.slice(Math.max(length - count, 0), length);
    };

    filter = logger.filter = function(data) {
        if (typeof data !== 'string') {
            return data;
        }
        for (var i = 0, e; e = logger.unmentionables[i++];) {
            if (data.indexOf(e) !== -1) {
                data = data.replace(e, '---');
            }
        }
        return data;
    };

    return logger;
});
