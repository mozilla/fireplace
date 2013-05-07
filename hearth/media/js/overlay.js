define('overlay', ['keys', 'l10n', 'utils', 'z'], function(keys, l10n, utils, z) {
    // Welcome to the world of overlays!
    // To setup your trigger do:
    // function() { z.page.trigger('decloak');doOtherStuff(); }

    var gettext = l10n.gettext;

    function dismiss() {
        var $overlay = $('.cloak.show');
        if ($overlay.length) {
            $overlay.removeClass('show');
            $('.modal').removeClass('show');
            $overlay.trigger('overlay_dismissed');
        }
    }

    z.body.on('touchmove', '.cloak', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }).on('click', function() {
        $('#notification').removeClass('show');
    });

    z.page.on('loaded', dismiss);

    // Dismiss overlay when we click outside of it.
    z.body.on('click', '.cloak', function(e) {
        if ($(e.target).parent('body').length) {
            dismiss();
        }
    }).on('keydown.overlayDismiss', function(e) {
        if (!utils.fieldFocused(e) && e.which == keys.ESCAPE) {
            e.preventDefault();
            dismiss();
        }
    }).on('dismiss', '.cloak', dismiss)
      .on('overlay_dismissed', function() {
        z.body.removeClass('overlayed');
    });

    z.body.on('click', '.modal .btn-cancel', utils._pd(dismiss));
    z.body.on('decloak', function() {
        z.body.addClass('overlayed');
        $('.cloak').addClass('show');
    });
});
