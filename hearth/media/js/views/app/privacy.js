define('views/app/privacy', [], function() {

    return function(builder, args) {
        builder.start('detail/privacy.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', 'Privacy Policy');  // No L10n for you!
    };
});
