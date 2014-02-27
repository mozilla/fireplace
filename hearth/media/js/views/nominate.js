define('views/nominate',
    ['forms', 'jquery', 'l10n', 'notification', 'requests', 'user', 'views', 'z'],
    function (forms, $, l10n, notification, requests, user, views, z) {

    'use strict';

    var url = 'https://docs.google.com/forms/d/15vGkdMsqxgETHmV55rp2xDYWby4jUOm2bTliZvklCKg/formResponse';

    // Because the Google Form is in English, we have to take the value from
    // the form data and turn it into its English equivalent. The things I
    // do for Google.
    var replacers = {
        'entry.829647127': {
            'restofworld': 'Rest of World',
            'ar': 'Argentina',
            'br': 'Brazil',
            'cl': 'Chile',
            'cn': 'China',
            'co': 'Colombia',
            'de': 'Germany',
            'gr': 'Greece',
            'hu': 'Hungary',
            'it': 'Italy',
            'mx': 'Mexico',
            'me': 'Montenegro',
            'pe': 'Peru',
            'pl': 'Poland',
            'rs': 'Serbia',
            'es': 'Spain',
            'uk': 'United Kingdom',
            'us': 'United States',
            'uy': 'Uruguay',
            've': 'Venezuela'
        },
        'entry.596690778': {
            'games': 'Games',
            'books': 'Books',
            'business': 'Business',
            'education': 'Education',
            'entertainment': 'Entertainment',
            'health-fitness': 'Health and Fitness',
            'lifestyle': 'Lifestyle',
            'maps-navigation': 'Maps and Navigation',
            'music': 'Music',
            'news-weather': 'News and Weather',
            'photo-video': 'Photo and Video',
            'productivity': 'Productivity',
            'reference': 'Reference',
            'shopping': 'Shopping',
            'social': 'Social',
            'sports': 'Sports',
            'travel': 'Travel',
            'utilities': 'Utilities'
        }
    };

    var gettext = l10n.gettext;
    var notify = notification.notification;

    function twitter() {
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
    }

    z.page.on('click', '.nominate-another', function (e) {
        require('views').reload();
    }).on('submit', '.nominate-form', function (e) {
        e.preventDefault();

        var $this = $(this);
        var chunks = [];
        var data = [];
        var fieldName = '';
        var fieldValue = '';
        var serialized = $this.serialize();

        serialized.split('&').forEach(function (val) {
            chunks = val.split('=');
            fieldName = chunks.shift();
            fieldValue = chunks.join('=');
            if (fieldName in replacers) {
                fieldValue = replacers[fieldName][fieldValue];
            }
            if (typeof fieldValue !== 'undefined') {
                data.push(fieldName + '=' + fieldValue);
            }
        });

        if (user.logged_in()) {
            data.push('entry.1146212836=' + user.get_setting('display_name'));
            data.push('entry.903244083=' + user.get_setting('email'));
        }
        data = data.join('&');

        function done() {
            // We're going to get back an error about the endpoint not being
            // CORS'd, but it's OK. The POST actually does go through.
            // It's fine. It's fine. Also, lol, Google.
            forms.toggleSubmitFormState($this, true);
            $('.nominate-form').hide();
            $('.nominate-success').show();
            twitter();
        }

        requests.post(url, new requests.URLEncodedData(data))
            .done(done).fail(done);
    });

    return function (builder) {
        builder.start('nominate.html');
        builder.z('type', 'leaf');
        builder.z('title', gettext('Nominate apps'));
    };
});
