define(['api', 'urls'], function(api, urls) {

    return function(builder, args) {
        builder.start('ratings/main.html');

        builder.get(api.url('ratings', args[0]))
               .parts([
            {dest: '.ratings-placeholder-inner', template: 'detail/rating.html', pluck: 'ratings'},
        ]).done().then(function() {
            var url = urls.reverse('apps.ratings.add', [args[0]]);
            // TODO: This text can also be 'Edit review', 'Be the first to write a review'.
            var btnText = 'Add a review', // TODO: L10n
                $btn = $('<p id="add-first-review"><a href="' + url + '">' + btnText + '</a></p>');
            $('#reviews').append($btn);
        });

        builder.z('type', 'leaf');
        builder.z('title', 'Ratings');  // No L10n for you!
    };
});
