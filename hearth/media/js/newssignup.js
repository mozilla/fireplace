define('newssignup',
       ['capabilities', 'helpers', 'l10n', 'notification', 'requests',
        'storage', 'templates', 'underscore', 'urls', 'user', 'utils', 'z'],
    function(caps, helpers, l10n, n, requests, storage, nunjucks, _, urls, user, utils, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = n.notification;

    // Init newsletter signup checking system.
    function init() {
        // Toggle the conditions below if you want to test on Desktop.
        //if (!user.logged_in()) return;
        if (!user.logged_in() || !caps.firefoxOS) return;

        var counter = +storage.getItem('newscounter');
        if (counter == 4) return;

        var now = Date.now();
        var storedTime = storage.getItem('newstimestamp');
        var expired = true;

        // Counter expires in 72 hours.
        if (storedTime) {
            storedTime = new Date(+storedTime);
            expired = (now - storedTime) > 4320000; // 72 hours
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
        var $signup = z.page.find('.newssignup');

        var $this = $(this);
        var data = utils.getVars($this.serialize());

        $signup.addClass('loading').find('.processing, .spinner').css('display', 'block');

        requests.post(urls.api.url('app_abuse'), data).done(function() {
            $signup.removeClass('loading').addClass('done')
                                          .find('.processing').hide();
        }).fail(function() {
            $signup.removeClass('loading').find('.processing').hide();
            notify({message: gettext('There was an error submitting your newsletter sign up request')});
        });
    });

    function injectSignupForm() {
        var ctx = _.extend({email: user.get_setting('email')}, helpers);
        var $signup;
        z.page.prepend(
            nunjucks.env.getTemplate('user/newssignup.html').render(ctx)
        );

        $signup = z.page.find('.newssignup');

        $signup.find('.close').on('click', utils._pd(function(e) {
            $signup.hide();
        }));
    }

    return {init: init};

});
