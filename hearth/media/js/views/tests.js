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
                $('ol.tests').append(infobox);
                var completion = function() {
                    passed++;
                    $('#c_passed').text(passed);
                    infobox.find('span').text('Passed').css('background-color', 'lime');
                    is_done();
                };
                try {
                    console.log('Starting ' + name);
                    infobox.find('span').text('Started').css('background-color', 'goldenrod');
                    runner(completion);
                } catch(e) {
                    console.error(name, e.message);
                    failed++;
                    infobox.find('span').html('Failed<br>' + e.message).css('background-color', 'pink');
                }
                $('#c_failed').text(failed);
            }, 0);
            $('#c_started').text(started);
        };
        builder.start('tests.html');

        builder.z('type', 'leaf');
        builder.z('title', 'Unit Tests');
    };
});
