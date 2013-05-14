define('log', [], function() {

    var slice = Array.prototype.slice;
    var filter;
    var logs;
    var all_logs = [];

    var logger = function(logger) {

        if (!(logger in logs)) {
            logs[logger] = [];
        }

        var log_queue = logs[logger];

        function make(log_level) {
            return function() {
                var args = slice.call(arguments, 0);
                args[0] = '[' + logger + '] ' + args[0];
                args = args.map(filter);
                log_queue.push(args);
                all_logs.push(args);

                // TODO: Add colorification support here for browsers that support it.
                // *cough cough* not firefox *cough*

                console[log_level].apply(console, args);
            };
        }

        return {
            log: make('log'),
            warn: make('warn'),
            error: make('error')
        };
    };

    logger.unmentionables = [];
    logger.unmention = function(term) {
        logger.unmentionables.push(term);
        logger.unmentionables.push(encodeURIComponent(term));
    };

    logs = logger.logs = {};
    logger.all = all_logs;

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
