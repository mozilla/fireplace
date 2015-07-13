define('views/app/ratings/add',
    ['core/capabilities', 'core/login', 'core/l10n', 'core/urls', 'core/user',
     'core/z', 'utils_local'],
    function(caps, login, l10n, urls, user,
             z, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    z.page.on('click touchend', '.add-review .rating', function() {
        // Scroll the page down to make the send/cancel buttons visible.
        var textarea = document.querySelector('.add-review textarea:invalid');
        if (textarea) {
            textarea.focus();
        }
    });

    return function(builder, args) {
        var slug = decodeURIComponent(args[0]);
        builder.z('type', 'leaf');
        builder.z('title', gettext('Leave a Review'));
        utilsLocal.headerTitle(gettext('Write a Review'));

        // If the user isn't logged in, redirect them to the detail page.
        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]));
            return;
        }

        builder.start('ratings/add.html', {'slug': slug});
    };
});
