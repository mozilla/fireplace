// JS for the desktop Feedback overlay.

define(
    ['buckets', 'capabilities', 'l10n', 'urls', 'utils', 'z', 'requests', 'templates'],
    function(buckets, capabilities, l10n, urls, utils, z, requests, nunjucks) {

    var gettext = l10n.gettext;
    var overlay = utils.makeOrGetOverlay('feedback-overlay');

    z.body.on('submit', '.feedback-form', utils._pd(function(e) {
        // Submit feedback form
        var $this = $(this);
        var data = utils.getVars($this.serialize());
        data.chromeless = capabilities.chromeless ? 'Yes' : 'No';
        data.from_url = window.location.pathname;
        data.profile = buckets.get_profile();
        requests.post(urls.api.url('feedback'), data).done(function() {
            console.log('submitted feedback');
            $this.find('textarea').val('');
            overlay.removeClass('show');
        }).fail(function() {
            z.page.trigger('notify', {msg: gettext('There was a problem submitting your feedback. Try again soon.')});
        });

    })).on('click', '.submit-feedback', utils._pd(function(e) {
        if (!overlay.find('form').length) {
            overlay.html(
                nunjucks.env.getTemplate('feedback.html').render(require('helpers')));
        }
        overlay.addClass('show').trigger('overlayloaded');
    }));
});
