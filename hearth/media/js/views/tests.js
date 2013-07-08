define('views/tests', ['assert', 'requests'], function(assert, requests) {
    return function(builder) {
        var started = 0;
        var passed = 0;
        var failed = 0;

        function is_done() {
            var ndone = passed + failed;
            var progress = $('progress');
            progress.attr('value', ndone / started);
            if (ndone === started) {
                console.log('Tests completed.');
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
                var has_failed = function(message) {
                    console.error(name, message);
                    failed++;
                    infobox.find('span').html('Failed<br>' + message).css('background-color', 'pink');
                    $('#c_failed').text(failed);
                };
                try {
                    console.log('Starting ' + name);
                    infobox.find('span').text('Started').css('background-color', 'goldenrod');
                    runner(completion, has_failed);
                } catch (e) {
                    has_failed(e.message);
                }
            }, 0);
            $('#c_started').text(started);
        };
        builder.start('tests.html');
        var scripts = document.querySelectorAll('#page script');
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            requests.get(script.getAttribute('src'), true).done(function(data) {
                eval(data);
            });
        }

        builder.z('type', 'debug');
        builder.z('dont_reload_on_login', true);
        builder.z('title', 'Unit Tests');
    };
});
