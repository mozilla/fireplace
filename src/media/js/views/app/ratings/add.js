define('views/app/ratings/add',
    ['capabilities', 'login', 'l10n', 'urls', 'user', 'z'],
    function(caps, login, l10n, urls, user, z) {
    var gettext = l10n.gettext;

    z.page.on('click', '.add-review-form .cancel', function(e) {
        e.preventDefault();
        var slug = $(this).closest('.add-review-form').attr('data-app');
        var app_detail_url = urls.reverse('app', [slug]);

        if (window.location.pathname !== app_detail_url) {
            // When cancelling, we want to go back to the app detail page.
            // navigation.back() would incorrectly to go to reviews list page.
            z.page.trigger('navigate', app_detail_url);
        }
    })

    .on('click touchend', '.compose-review .rating', function() {
        // Scroll the page down to make the send/cancel buttons visible.
        var textarea = document.querySelector('.compose-review textarea:invalid');
        if (textarea) {
            textarea.focus();
        }

    }).on('focus', '.compose-review textarea', function() {
        if (window.scrollTo && !caps.widescreen()) {
            window.scrollTo(0, 200);
        }
    });

    return function(builder, args) {
        var slug = args[0];

        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app/ratings', [slug]));
        builder.z('title', gettext('Leave a Review'));

        // If the user isn't logged in, redirect them to the detail page.
        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]));
            return;
        }

        builder.start('ratings/add.html', {'slug': slug});
    };
});
