define('views/app/ratings/add',
    ['core/capabilities', 'core/login', 'core/l10n', 'core/urls', 'core/user', 'core/z'],
    function(caps, login, l10n, urls, user, z) {
    var gettext = l10n.gettext;

    z.page.on('click touchend', '.add-review .rating', function() {
        // Scroll the page down to make the send/cancel buttons visible.
        var textarea = document.querySelector('.add-review textarea:invalid');
        if (textarea) {
            textarea.focus();
        }

    }).on('focus', '.add-review textarea', function() {
        if (window.scrollTo && !caps.widescreen()) {
            window.scrollTo(0, 200);
        }
    });

    return function(builder, args) {
        var slug = args[0];
        builder.z('type', 'leaf');
        builder.z('title', gettext('Leave a Review'));

        // If the user isn't logged in, redirect them to the detail page.
        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]));
            return;
        }

        builder.start('ratings/add.html', {'slug': slug});
    };
});
