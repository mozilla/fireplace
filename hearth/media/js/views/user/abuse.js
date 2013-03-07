define('views/user/abuse', [], function() {

    return function(builder, args) {
        builder.start('user/abuse.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('title', 'Report Abuse');  // No L10n for you!
    };
});
