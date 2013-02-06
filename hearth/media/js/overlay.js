define('overlay', ['keys', 'z'], function(keys, z) {
    function dismiss() {
        var $overlay = $('.overlay.show');
        if ($overlay.length) {
            $overlay.removeClass('show');
            $overlay.trigger('overlay_dismissed');
        }
    }

    function notify(msg, title) {
        $('#msg-overlay').remove();

        var $overlay = $('<div id="msg-overlay" class="overlay">');
        var $section = $('<section>');
        if (title) {
            $section.append($('<h3>').text(title));
        }
        $section.append($('<p>').text(msg));
        $section.append($('<button class="dismiss">').text(gettext('OK')));
        $overlay.append($section);
        z.body.append($overlay);
        $overlay.addClass('show');
    }

    function init() {
        z.body.on('touchmove', '.overlay', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        z.page.on('loaded', function(e) {
            // Dismiss overlay when we load a new fragment.
            dismiss();
        });

        // Dismiss overlay when we click outside of it.
        z.win.on('click', '.overlay', function(e) {
            if ($(e.target).parent('body').length) {
                dismiss();
            }
        }).on('keydown.overlayDismiss', function(e) {
            if (!fieldFocused(e) && e.which == keys.ESCAPE) {
                e.preventDefault();
                dismiss();
            }
        }).on('dismiss', '.overlay', dismiss)
          .on('click', '.overlay .dismiss', _pd(dismiss))
          .on('overlay_dismissed', function() {
            z.body.removeClass('overlayed');
        }).on('notify', function(e, o) {
            if (!o.msg) return;
            notify(o.msg, o.title);
        });
    }

    return {init: init, notify: notify};
});
