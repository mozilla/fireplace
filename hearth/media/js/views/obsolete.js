define('views/obsolete', ['l10n', 'z'], function(l10n, z) {
    'use strict';

    z.page.on('click', '.system-update', function(e) {
        e.preventDefault();
        var activity = new MozActivity({
            name: 'configure',
            data: {section: 'about'}
        });
        activity.onsuccess = function() {
            window.location.reload();
        };
    });

    return function(builder) {
        builder.start('obsolete.html');
        builder.z('type', 'nag');
    };
});
