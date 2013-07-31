define('views/deprecated',
    ['capabilities', 'l10n', 'z'],
    function(capabilities, l10n, z) {
    'use strict';

    z.page.on('click', '.app-update', function(e) {
        e.preventDefault();
        if (window.location.protocol === 'app:') {
            var activity = new MozActivity({
                name: 'configure',
                data: {section: 'about'}
            });
            activity.onsuccess = function() {
                window.location.reload();
            };
        } else {
            window.location.reload();
        }
    });

    return function(builder) {
        builder.start('deprecated.html');
        builder.z('type', 'nag');
    };
});
