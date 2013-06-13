define('views/app/ratings/add',
    ['capabilities', 'login', 'l10n', 'urls', 'user', 'z'],
    function(caps, login, l10n, urls, user, z) {

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];

        // If the user isn't logged in, redirect them to the detail page.
        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]));
            return;
        }

        builder.start('ratings/write.html', {'slug': slug}).done(function() {
            var $reviewBox = $('.compose-review');

            $reviewBox.removeClass('modal')
                      .find('.cancel').on('click', function() {
                z.page.trigger('navigate', urls.reverse('app', [slug]));
            });

            // Scroll the page down to make the send/cancel buttons visible.
            $reviewBox.find('.rating').on('click touchend', function() {
                var textarea = document.querySelector('.compose-review textarea');
                if (textarea) {
                    textarea.focus();
                }
            });

            if (scrollTo && !caps.widescreen()) {
                console.log('scrollTo');
                $reviewBox.find('textarea').on('focus', function() {
                    console.log('focus');
                    window.scrollTo(0, 200);
                });
            }
        });

        builder.z('type', 'leaf');
        builder.z('reload_on_login', true);
        builder.z('parent', urls.reverse('app/ratings', [slug]));
        builder.z('title', gettext('Write a Review'));
    };
});
