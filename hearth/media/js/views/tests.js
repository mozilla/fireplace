define(['assert'], function() {
    return function(builder) {
        var started = 0;
        var passed = 0;
        var failed = 0;

        function is_done() {
            var ndone = passed + failed;
            var progress = $('progress');
            progress.attr('value', ndone / started)
            if (ndone === started) {
                console.log('Tests completed.')
                $('<b>Completed ' + ndone + ' tests.</b>').insertAfter(progress);
            }
        }

        window.test = function(name, runner) {
            started++;
            is_done();
            setTimeout(function() {
                var infobox = $('<li><b>' + name + '</b> <span>Running...</span></li>');
                $('ul.tests').append(infobox);
                var completion = function() {
                    passed++;
                    is_done();
                };
                try {
                    console.log('Starting ' + name);
                    runner(completion);
                    infobox.find('span').text('Passed');
                } catch(e) {
                    console.error(name, e.message);
                    failed++
                    infobox.find('span').text('Failed');
                }
                $('#c_passed').text(passed);
                $('#c_failed').text(failed);
            }, 0);
            $('#c_started').text(started);
        };
        builder.start('tests.html');

        builder.z('type', 'leaf');
        builder.z('title', 'Unit Tests');
    };
});
