define('views/app/ratings', ['l10n', 'urls', 'user'], function(l10n, urls, user) {

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
        });

        builder.z('type', 'leaf');
        builder.z('reload_on_login', true);
        builder.z('parent', urls.reverse('app', [slug]));
        builder.z('title', gettext('Reviews'));
    };
});
