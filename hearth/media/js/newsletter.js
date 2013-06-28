define('newsletter',
       ['capabilities', 'l10n', 'notification', 'requests',
        'storage', 'templates', 'underscore', 'urls', 'user', 'utils', 'z'],
    function(caps, l10n, n, requests, storage, nunjucks, _, urls, user, utils, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = n.notification;

    // Marketplace newsletter supported languages.
    var langs = ['en-US', 'pt-BR', 'es', 'pl'];

    // Init newsletter signup checking system.
    function init() {
        // Toggle the conditions below if you want to test on Desktop.
        //if (!user.logged_in()) return;
        if (!user.logged_in() || !caps.firefoxOS || langs.indexOf(navigator.language) == -1) return;

        var counter = +storage.getItem('newscounter');
        if (counter == 4) return;

        var now = Date.now();
        var storedTime = storage.getItem('newstimestamp');
        var expired = true;

        // Counter expires in 72 hours.
        if (storedTime) {
            storedTime = new Date(+storedTime);
            expired = (now - storedTime) > 259200000; // 72 hours (1000 x 60 x 60 x 72)
        }

        // Increment counter if not expired otherwise save the time and set to 1.
        if (!counter || expired) {
            storage.setItem('newstimestamp', now);
            storage.setItem('newscounter', '1');
        } else {
            if (counter++ == 2) {
                injectSignupForm();
                storage.removeItem('newstimestamp');
                storage.setItem('newscounter', '4');
            } else {
                storage.setItem('newscounter', counter);
            }
        }
    }

    // Handle newsletter signup form submit.
    z.body.on('submit', '.news-signup-form', function(e) {
        e.preventDefault();
        var $signup = $('main').find('.newsletter');

        var $this = $(this);
        var data = utils.getVars($this.serialize());

        $signup.addClass('loading').find('.processing, .spinner').css('display', 'block');

        requests.post(urls.api.url('newsletter'), data).done(function() {
            $signup.removeClass('loading').addClass('done')
                                          .find('.processing').hide();
        }).fail(function() {
            $signup.removeClass('loading').find('.processing').hide();
            notify({message: gettext('There was an error submitting your newsletter sign up request')});
        });
    });

    function injectSignupForm() {
        var $signup;
        $('main').prepend(
            nunjucks.env.getTemplate('user/newsletter.html').render({email: user.get_setting('email')})
        );

        $signup = $('.newsletter');

        $signup.find('.close').on('click', utils._pd(function(e) {
            $signup.hide();
        }));
    }

    return {init: init};

});
