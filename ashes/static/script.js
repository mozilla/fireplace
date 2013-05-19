$(function() {

    var token = localStorage.getItem('token');
    var email = localStorage.getItem('email');
    var sign_in = $('.sign-in');
    var body = $('body');

    if (token) {
        body.addClass('logged-in');
    }

    sign_in.on('click', function() {
        navigator.id.request();
    });

    navigator.id.watch({
        onlogin: function(assertion) {
            $.post('/auth', {assertion: assertion}).done(function(data) {
                if (data.error) {
                    alert(data.error);
                    navigator.id.logout();
                    return;
                }
                localStorage.setItem('token', token = data.token);
                localStorage.setItem('email', email = data.email);
                body.addClass('logged-in');
            });
        },
        onlogout: function() {
            token = null;
            body.removeClass('logged-in');
            try {
                localStorage.clearItem('token');
                localStorage.clearItem('email');
            } catch (e) {}
        }
    });

    function mapping(data) {
        var output = '<dl>';
        for (var key in data) {
            output += '<dt>' + key + '</dt>';
            if (typeof data[key] === 'object') {
                output += '<dd>' + mapping(data[key]) + '</dd>';
            } else {
                output += '<dd>' + data[key] + '</dd>';
            }
        }
        return output + '</dl>';
    }

    function list(data, formatter) {
        var output = '<ul class="list-group list-group-flush">';
        for (var i = 0, e; e = data[i++];) {
            output += '<li class="list-group-item">' + formatter(e) + '</li>';
        }
        return output + '</ul>';
    }

    $('.report-form').on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!token || !email) {
            return;
        }
        var qs = '?token=' + encodeURIComponent(token);
        qs += '&email=' + encodeURIComponent(email);
        $.get('/report/' + encodeURIComponent($('#inputID').val()) + qs)
         .done(function(data) {
            var posted = new Date(data.posted * 1000);
            $('#report_query_output').html(
                '<h2>Report ' + data.uid + '</h2>' +
                '<p class="lead">Posted <time>' + posted.toLocaleDateString() + ' at ' + posted.toLocaleTimeString() + '</time></p>' +
                '<p>Feature Profile: <kbd>' + data.profile + '</kbd></p>' +
                '<h3>Log Data</h3>' +
                list(data.logs, function(line) {
                    return line.join(' ');
                }) +
                '<h3>Capability Data</h3>' +
                mapping(data.capabilities) +
                '<h3>Settings</h3>' +
                mapping(data.settings)
            );

        }).fail(function() {
            alert('Could not find a report with that address.');
        });
    })
});
