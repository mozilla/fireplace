define('notification', ['defer', 'helpers', 'jquery', 'templates', 'z'], function(defer, helpers, $, nunjucks, z) {

    var notificationDef;
    var notificationEl = $('<div id="notification" class="hidden">');
    var contentEl = $('<div id="notification-content">');
    var showTimer;
    var hideTimer;

    // allow *bolding* message text
    var re = /\*([^\*]+)\*/g;
    function fancy(s) {
        if (!s) return;
        return s.replace(re, function(_, match) { return '<b>' + match + '</b>'; });
    }

    function notificationShow() {
        if (hideTimer) {
            window.clearTimeout(hideTimer);
        }
        notificationEl.removeClass('hidden');
        // Delay to ensure transition onto screen happens.
        showTimer = window.setTimeout(function() {
            notificationEl.addClass('show');
        }, 700);
    }

    function notificationHide() {
        if (showTimer) {
            window.clearTimeout(showTimer);
        }
        notificationEl.removeClass('show');
        // This needs to be greater than the transition timing
        // in notification.styl.
        hideTimer = window.setTimeout(function() {
            notificationEl.addClass('hidden');
        }, 400);
    }

    function notification(opts) {
        var addedClasses = [];
        notificationDef = defer.Deferred();
        notificationDef.always(notificationHide);
        notificationEl.attr('class', '');
        contentEl.text('');

        var message = opts.message;
        if (!message) return;

        if ('classes' in opts) {
            addedClasses = opts.classes.split(/\s+/);
        }

        if (opts.closable) {
            addedClasses.push('closable');
        }
        setTimeout(function() {notificationDef.reject();}, opts.timeout || 5000);

        notificationEl.addClass(addedClasses.join(' '));

        var fancyMessage = fancy(message);
        if (fancyMessage == message) {
            contentEl.text(message);
        } else {
            contentEl.html(fancyMessage);
        }

        notificationShow();

        return notificationDef.promise();
    }

    notificationEl.append(contentEl).on('touchend click', function() {
        notificationDef.resolve();
    });
    z.body.append(notificationEl);

    var cloakEl = $('.cloak');
    function confirmationHide() {
        cloakEl.removeClass('show light');
    }

    function confirmation(opts) {
        var confirmationEl = $('<div class="modal confirmation show">');
        confirmationEl.html(nunjucks.env.render('confirmation.html'));
        z.body.append(confirmationEl);
        cloakEl.addClass('show light');

        var confirmationDef = defer.Deferred();

        confirmationEl.on('touchend click', '.yes', function(e) {
            e.preventDefault();
            confirmationDef.resolve();
        }).on('touchend click', '.btn-cancel, .close', function(e) {
            e.preventDefault();
            confirmationDef.reject();
        });

        confirmationDef.always(function() {
            confirmationEl.remove();
            if (!$('.modal.confirmation').length) {
                cloakEl.removeClass('show light');
            }
        });

        var contentEl = confirmationEl.find('.content');
        contentEl.text('');

        var message = opts.message;
        if (!message) return;

        var addedClasses = [];
        if ('classes' in opts) {
            addedClasses = opts.classes.split(/\s+/);
        }

        if (opts.closable) {
            addedClasses.push('closable');
        }

        confirmationEl.addClass(addedClasses.join(' '));

        var fancyMessage = fancy(message);
        if (fancyMessage === message) {
            contentEl.text(message);
        } else {
            contentEl.html(fancyMessage);
        }

        return confirmationDef.promise();
    }

    z.win.on('notification', function(text) {
        notification({message: text});
    });

    return {
        notification: notification,
        confirmation: confirmation
    };
});
