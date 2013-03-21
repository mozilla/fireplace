define(['l10n', 'urls'], function(l10n, urls) {

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('ratings/main.html', {
            'slug': slug,
            'addUrl': urls.reverse('apps/ratings', [slug])
        });

        builder.onload('ratings', function(data) {
            // // TODO: This text can also be 'Edit review', 'Be the first to write a review'.
            // var btnText = 'Add a review', // TODO: L10n
            //     $btn = $('<p id="add-review"><a class="button" href="' + url + '">' + btnText + '</a></p>');
            // $('#reviews').prepend($btn);
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Ratings'));
    };
});
