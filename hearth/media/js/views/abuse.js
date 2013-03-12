define('views/abuse',
    ['utils', 'requests', 'z'],
    function(utils, requests, z) {
    'use strict';

    z.page.on('submit', '.abuse-form', utils._pd(function(e) {
        // Submit report abuse form
        var $this = $(this);

        requests.post($this.data('action'), $this.serialize(), function(data) {
            console.log('submitted abuse report');
            $this.find('textarea').val('');
        });
    }));

    return function(builder, args) {
        builder.start('detail/main.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', 'Loading...');  // No L10n for you!
    };
});
