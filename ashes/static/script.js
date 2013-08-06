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

    var slice = Array.prototype.slice;

    function identity() {return slice.call(arguments);}
    function cend(func, args) {return function() {func.apply(this, slice.call(arguments).concat(args));};}
    function htmlentities(data) {
        return data.toString()
                   .replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
    }
    function log_join(line) {
        return line.map(htmlentities).join(' ');
    }

    function mapping(data, formatter) {
        var output = '<dl>';
        for (var key in data) {
            output += '<dt>' + key + '</dt>';
            if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
                output += '<dd>' + mapping(data[key], formatter) + '</dd>';
            } else {
                output += '<dd>' + (formatter || identity)(data[key]) + '</dd>';
            }
        }
        return output + '</dl>';
    }

    function list(data, formatter) {
        var output = '<ul class="list-group list-group-flush">';
        for (var i = 0, e; e = data[i++];) {
            output += '<li class="list-group-item">' + (formatter || identity)(e) + '</li>';
        }
        return output + '</ul>';
    }

    function tab_bar(tabs) {
        var rand = 'tb' + Math.floor(Math.random() * 9000 + 1000) + '_';
        return [
            '<ul class="nav nav-tabs">',
            tabs.map(function(v, k) {
                return '<li' + (!k ? ' class="active"' : '') + '><a href="#' + rand + k + '">' + v[0] + '</a></li>';
            }).join(''),
            '</ul>',
            '<div class="tab-content">',
            tabs.map(function(v, k) {
                return '<div class="tab-pane' + (!k ? ' active' : '') + '" id="' + rand + k + '">' + v[1] + '</div>';
            }).join(''),
            '</div>'
        ].join('');
    }

    function render_report(data) {
        return tab_bar([
            ['Logs', list(data.logs, log_join)],
            ['Persistent Logs', mapping(data.persistent_logs, function(data) {return list(data, log_join);})],
            ['Capabilities', mapping(data.capabilities)],
            ['Settings', mapping(data.settings)]
        ]);
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
                render_report(data)
            );

        }).fail(function() {
            alert('Could not find a report with that address.');
        });
    });

    $(document.body).on('click', '.nav-tabs a', function(e) {
        e.preventDefault();
        $(this).tab('show');
    });
});
