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

    function die() {
        def.reject();
        hide();
    }

    function affirm() {
        def.resolve();
        hide();
    }

    function init() {
        notificationEl.append(contentEl);
        z.body.append(notificationEl);
        notificationEl.on('touchstart click', affirm);
    }

    // allow *bolding* message text
    var re = /\*([^\*]+)\*/g;
    function fancy(s) {
        if (!s) return;
        return s.replace(re, function(_, match){ return '<b>' + match + '</b>' });
    }

    function notification(opts) {
        if (def && def.state() === 'pending') {
            def.reject();
        }
        def = $.Deferred();
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
        if (opts.timeout) {
            setTimeout(die, opts.timeout);
        }

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

    return {init: init, notification: notification};
});
