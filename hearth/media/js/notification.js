define('notification', ['capabilities', 'helpers', 'jquery', 'templates', 'z'], function(caps, helpers, $, nunjucks, z) {
    var notificationDef;
    var notificationEl = $('<div id="notification">');
    var contentEl = $('<div id="notification-content">');

    // allow *bolding* message text
    var re = /\*([^\*]+)\*/g;
    function fancy(s) {
        if (!s) return;
        return s.replace(re, function(_, match) { return '<b>' + match + '</b>'; });
    }

    function notificationShow() {
        notificationEl.addClass('show');
    }

    function notificationHide() {
        notificationEl.removeClass('show');
    }

    function notification(opts) {
        var addedClasses = [];
        notificationDef = $.Deferred();
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


    var confirmationDef = $.Deferred();
    var cloakEl = $('.cloak');
    var confirmationEl = $('<div class="modal confirmation">');

    function confirmationShow() {
        cloakEl.addClass('show light');
        confirmationEl.addClass('show');
    }

    function confirmationHide() {
        cloakEl.removeClass('show light');
        confirmationEl.removeClass('show');
    }

    function confirmation(opts) {
        var addedClasses = [];
        confirmationDef.always(confirmationHide);

        confirmationEl.attr('class', 'modal confirmation');
        var contentEl = confirmationEl.find('.content');
        contentEl.text('');

        var message = opts.message;
        if (!message) return;

        if ('classes' in opts) {
            addedClasses = opts.classes.split(/\s+/);
        }

        if (opts.closable) {
            addedClasses.push('closable');
        }
        if (opts.timeout) {
            setTimeout(function() {confirmationDef.reject();}, opts.timeout);
        }

        confirmationEl.addClass(addedClasses.join(' '));

        var fancyMessage = fancy(message);
        if (fancyMessage == message) {
            contentEl.text(message);
        } else {
            contentEl.html(fancyMessage);
        }

        confirmationShow();

        return confirmationDef.promise();
    }

    var content = nunjucks.env.getTemplate('confirmation.html').render(helpers);

    confirmationEl.html(content).on('touchend click', function() {
        confirmationHide();
        confirmationDef.reject();
    }).on('touchend click', '.yes', function() {
        confirmationHide();
        confirmationDef.resolve();
    });
    z.body.append(confirmationEl);

    return {
        notification: notification,
        confirmation: confirmation
    };
});
