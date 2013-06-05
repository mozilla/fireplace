define('confirmation', ['capabilities', 'helpers', 'jquery', 'templates', 'z'], function(caps, helpers, $, nunjucks, z) {
    var cloakEl = $('.cloak');
    var confirmationEl = $('<div class="modal confirmation">');
    var addedClasses = [];

    function confirmationShow() {
        cloakEl.addClass('show light');
        confirmationEl.addClass('show');
    }

    function confirmationHide() {
        cloakEl.removeClass('show light');
        confirmationEl.removeClass('show');
    }

    function confirmation(opts) {
        var def = $.Deferred();
        def.always(confirmationHide);
        confirmationEl.removeClass(addedClasses.join(' '));
        var contentEl = confirmationEl.find('.content');
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
            setTimeout(function() {def.reject();}, opts.timeout);
        }

        confirmationEl.addClass(addedClasses.join(' '));

        var fancyMessage = fancy(message);
        if (fancyMessage == message) {
            contentEl.text(message);
        } else {
            contentEl.html(fancyMessage);
        }

        show();

        return def.promise();
    }

    var content = nunjucks.env.getTemplate('confirmation.html').render(helpers);

    confirmationEl.html(content).on('touchstart click', function() {
        console.error('reject')
        def.reject();
    }).on('touchstart click', '.yes', function() {
        console.error('resolve')
        def.resolve();
    });
    z.body.append(confirmationEl);

    return confirmation;
});
