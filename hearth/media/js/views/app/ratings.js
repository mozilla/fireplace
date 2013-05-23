define('views/app/ratings', ['capabilities', 'helpers', 'l10n', 'login', 'templates', 'urls', 'user', 'utils', 'underscore', 'z'],
       function(capabilities, helpers, l10n, login, nunjucks, urls, user, utils, _, z) {

    var gettext = l10n.gettext;

    z.page.on('click', '#write-review', function() {
        if (capabilities.widescreen()) {
            var ctx = _.extend({slug: $(this).data('slug')}, helpers);
            e.preventDefault();
            e.stopPropagation();

            z.page.append(
                nunjucks.env.getTemplate('ratings/write.html').render(ctx)
            );

            z.body.trigger('decloak');
            $('.compose-review.modal').addClass('show');
            $('.compose-review').find('select[name="rating"]').ratingwidget('large');
            utils.initCharCount();
        }
    });

    return function(builder, args) {
        var slug = args[0];

        builder.start('ratings/main.html', {
            'slug': slug
        }).done(function() {
            if (!user.logged_in()) {
                $('#write-review').text(gettext('Sign in to Review')).on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    login.login();
                });
            }
        });

        builder.z('type', 'leaf');
        builder.z('reload_on_login', true);
        builder.z('reload_on_logout', true);
        builder.z('parent', urls.reverse('app', [slug]));
        builder.z('title', gettext('Reviews'));
    };
});
