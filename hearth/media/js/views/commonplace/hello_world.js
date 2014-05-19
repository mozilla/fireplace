define('views/hello_world', ['l10n'], function(l10n) {

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('hello.html');

        builder.z('type', 'root');
        builder.z('title', gettext('Hello World!'));
    };
});
