define('notification', ['capabilities', 'z'], function(caps, z) {
    var notificationEl = $('<div id="notification">');
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
        z.body.append(notificationEl);
        notificationEl.on('touchstart click', affirm);
    }

    function notification(opts) {
        if (def && def.state() === 'pending') {
            def.reject();
        }
        def = $.Deferred();
        notificationEl.removeClass(addedClasses.join(' '))
                      .text('');
        addedClasses = [];

        if (!opts.message) return;

        if ('classes' in opts) {
            addedClasses = opts.classes.split(/\s+/);
        }

        if (opts.closable) {
            addedClasses.push('closable');
        }
        if (opts.timeout) {
            setTimeout(die, opts.timeout);
        }

        notificationEl.addClass(addedClasses.join(' '))
                      .text(opts.message);

        notificationEl.addClass('show');

        return def.promise();

    }

    return {init: init, notification: notification};
});
