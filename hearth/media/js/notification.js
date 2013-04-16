define('notification', ['capabilities', 'jquery', 'z'], function(caps, $, z) {
    var notificationEl = $('<div id="notification">');
    var contentEl = $('<div id="notification-content">');
    var def;
    var addedClasses = [];

    function show() {
        notificationEl.addClass('show');
    }

    function hide() {
        notificationEl.removeClass('show');
    }

    // allow *bolding* message text
    var re = /\*([^\*]+)\*/g;
    function fancy(s) {
        if (!s) return;
        return s.replace(re, function(_, match) { return '<b>' + match + '</b>'; });
    }

    function notification(opts) {
        if (def && def.state() === 'pending') {
            def.reject();
        }
        def = $.Deferred();
        def.then(hide);
        notificationEl.removeClass(addedClasses.join(' '));
        contentEl.text('');
        addedClasses = [];

        var message = opts.message;
        if (!message) return;

        if ('classes' in opts) {
            addedClasses = opts.classes.split(/\s+/);
        }

        if (opts.closable) {
            addedClasses.push('closable');
        }
        setTimeout(def.reject, opts.timeout || 5000);

        notificationEl.addClass(addedClasses.join(' '));

        var fancyMessage = fancy(message);
        if (fancyMessage == message) {
            contentEl.text(message);
        } else {
            contentEl.html(fancyMessage);
        }

        notificationEl.addClass('show');

        return def.promise();

    }

    notificationEl.append(contentEl).on('touchstart click', function() {
        def.resolve();
    });
    z.body.append(notificationEl);

    return {notification: notification};
});
