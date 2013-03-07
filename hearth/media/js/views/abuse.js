define('views/abuse', ['utils', 'z'], function(utils, z) {
    'use strict';

    z.page.on('submit', '.abuse-form', utils._pd(function(e) {
        // Submit report abuse form
        var $this = $(this);

        $.post($this.data('action'), $this.serialize())
         .success(function(data) {
            console.log('submitted abuse report');
            $this.find('textarea').val('');
        }).error(function(jqXHR, textStatus, error) {
            var err = jqXHR.responseText;
            z.page.trigger('notify', {msg: err});
        });
        e.preventDefault();
    }));

    return function(builder, args) {
        builder.start('detail/main.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', 'Loading...');  // No L10n for you!
    };
});
