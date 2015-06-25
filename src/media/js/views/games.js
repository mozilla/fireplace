define('views/games',
    ['jquery', 'core/l10n', 'core/nunjucks', 'core/urls', 'core/z'],
    function($, l10n, nunjucks, urls, z) {
    'use strict';

    return function(builder, args, params) {
        builder.z('title', gettext('Games'));
        builder.z('type', 'root games');

        builder.start('games.html', {
            heroGame: {
                author: 'playcanv.as',
                icon: 'https://marketplace.cdn.mozilla.net/img/uploads/addon_icons/512/512076-128.png?modified=2a31ca21',
                installLink: urls.reverse('app', ['tanx']),
                name: 'Tanx',
                url: 'http://apps.playcanvas.com.s3-website-eu-west-1.amazonaws.com/aW9A2i70/'
            },
            sidekickGames: []
        });
    };
});
