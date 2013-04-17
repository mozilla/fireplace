define('overlay', ['keys', 'l10n', 'utils', 'z'], function(keys, l10n, utils, z) {

    var gettext = l10n.gettext;

    function dismiss() {
        var $overlay = $('.overlay.show');
        if ($overlay.length) {
            $overlay.removeClass('show');
            $overlay.trigger('overlay_dismissed');
        }
    }

    function init() {
        z.body.on('touchmove', '.overlay', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }).on('click', function() {
            $('#notification').removeClass('show');
        });

        z.page.on('loaded', function(e) {
            // Dismiss overlay when we load a new fragment.
            dismiss();
        });

        // Dismiss overlay when we click outside of it.
        z.body.on('click', '.overlay', function(e) {
            if ($(e.target).parent('body').length) {
                dismiss();
            }
        }).on('keydown.overlayDismiss', function(e) {
            if (!utils.fieldFocused(e) && e.which == keys.ESCAPE) {
                e.preventDefault();
                dismiss();
            }
        }).on('dismiss', '.overlay', dismiss)
          .on('click', '.overlay .dismiss', utils._pd(dismiss))
          .on('overlay_dismissed', function() {
            z.body.removeClass('overlayed');
        });
    }

    return {init: init};
});
