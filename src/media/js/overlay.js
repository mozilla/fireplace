define('overlay', ['keys', 'core/l10n', 'core/utils', 'core/z'], function(keys, l10n, utils, z) {
    // Welcome to the world of overlays!
    // To setup your trigger do:
    // function() { z.body.trigger('decloak');doOtherStuff(); }

    var gettext = l10n.gettext;
    var $cloak = $('.cloak');

    function dismiss() {
        if ($cloak.is('.show')) {
            $('.modal').removeClass('show');
            // Reset class to `cloak`, since we may have added other classes.
            $cloak.attr('class', 'cloak').trigger('overlay_dismissed');
        }
    }

    $cloak.on('touchmove', function(e) {
        e.preventDefault();
        e.stopPropagation();
    }).on('click', function(e) {
        if ($(e.target).parent('body').length) {
            dismiss();
        }
    }).on('dismiss', function() {
        dismiss();
    });

    z.body.on('click', function() {
        $('#notification').removeClass('show');
    }).on('keydown.overlayDismiss', function(e) {
        if (!utils.fieldFocused(e) && e.which == keys.ESCAPE) {
            e.preventDefault();
            dismiss();
        }
    }).on('overlay_dismissed', function() {
        z.body.removeClass('overlayed');
    }).on('decloak', function() {
        z.body.addClass('overlayed');
        $cloak.addClass('show');
    }).on('click', '.modal .btn-cancel, .modal .cancel', utils._pd(dismiss));

    z.win.on('navigating', dismiss);
});
