define('views/app/ratings', ['capabilities', 'helpers', 'l10n', 'templates', 'urls', 'user', 'utils', 'underscore', 'z'],
       function(capabilities, helpers, l10n, nunjucks, urls, user, utils, _, z) {

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];

        builder.start('ratings/main.html', {
            'slug': slug
        }).done(function() {
            if (!user.logged_in()) {
                $('#write-review').text(gettext('Sign in to Review')).on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    require('login').login();
                });
            }

            if (capabilities.widescreen()) {
                $('#write-review').on('click', function(e) {
                    var ctx = _.extend({slug: slug}, helpers);
                    e.preventDefault();
                    e.stopPropagation();

                    z.page.append(
                        nunjucks.env.getTemplate('ratings/write.html').render(ctx)
                    );

                    z.body.trigger('decloak');
                    $('.compose-review.modal').addClass('show');
                    $('.compose-review').find('select[name="rating"]').ratingwidget('large');
                    utils.initCharCount();
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
