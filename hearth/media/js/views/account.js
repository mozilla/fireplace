define('views.settings', ['z'], function(z) {
    // For stylized <select>s.
    z.body.on('focus', '.styled.select select', function() {
        $(this).closest('.select').addClass('active');
    }).on('blur', '.styled.select select', function() {
        $(this).closest('.select').removeClass('active');
    });

    return function(builder) {
        builder.start('settings/main.html');

        builder.z('type', 'leaf');
        builder.z('title', 'Account Settings');  // No L10n for you!
    };
});
