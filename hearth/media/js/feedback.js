// JS for the desktop Feedback overlay.

define(
    ['capabilities', 'utils', 'urls', 'z', 'requests', 'templates'],
    function(capabilities, utils, urls, z, requests, nunjucks) {
    var overlay = $('#feedback-overlay');

    if (!overlay.length) {
        overlay = $('<div id="feedback-overlay" class="overlay">');
        z.container.append(overlay);
    }

    z.container.on('submit', '.feedback-form', utils._pd(function(e) {
        // Submit feedback form
        var $this = $(this);

        var platformInput = $this.find('input[name="platform"]');
        if (capabilities.gaia) {
            platformInput.val('Gaia');
        } else if (capabilities.firefoxAndroid) {
            platformInput.val('Firefox for Android');
        } else if (capabilities.mobile) {
            platformInput.val('Mobile');
        } else if (capabilities.desktop) {
            platformInput.val('Desktop');
        }
        $this.find('input[name="chromeless"]').val(capabilities.chromeless ? 'Yes' : 'No');
        $this.find('input[name="from_url"]').val(window.location.pathname);

        requests.post(urls.api.url('feedback'), $this.serialize(), function() {
            console.log('submitted feedback');
            $this.find('textarea, input').val('');
            overlay.removeClass('show');
        });

    })).on('click', '.submit-feedback', utils._pd(function(e) {
        if (!overlay.find('form').length) {
            overlay.html(
                nunjucks.env.getTemplate('feedback.html').render(require('helpers')));
        }
        overlay.addClass('show');
    }));
});
