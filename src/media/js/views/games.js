define('views/games',
    ['jquery', 'core/l10n', 'core/nunjucks', 'core/urls', 'core/z', 'hero-games'],
    function($, l10n, nunjucks, urls, z, heroGames) {
    'use strict';

    var heroGames = [
        {
            author: 'playcanv.as',
            icon: 'https://marketplace.cdn.mozilla.net/img/uploads/addon_icons/512/512076-128.png?modified=2a31ca21',
            imageUrl: '/media/img/hero-game-tanx.png',
            installLink: 'https://marketplace.firefox.com/app/tanx',
            name: 'Tanx',
            url: 'http://apps.playcanvas.com.s3-website-eu-west-1.amazonaws.com/aW9A2i70/'
        },
        {
            author: 'playcanv.as',
            icon: 'https://marketplace.cdn.mozilla.net/img/uploads/addon_icons/512/512280-128.png?modified=7e5456cc',
            installLink: 'https://marketplace.firefox.com/app/swooop',
            imageUrl: 'https://marketplace.cdn.mozilla.net/img/uploads/previews/full/173/173538.png?modified=1432135622',
            name: 'SWOOP',
            url: 'http://apps.playcanvas.com.s3-website-eu-west-1.amazonaws.com/E2yLcwrS/',
        },
        {
            author: 'Wonderstruck',
            icon: 'https://lh6.googleusercontent.com/N28Jca0CebDCzjFOcZ903pmylDgV44oZOfNZ5EbWlI2GBFzJ9lusOUhLLr5828ebCMVF8EWC=s100-h100-e365-rw',
            installLink: 'https://ga.me/games/polycraft',
            imageUrl: 'http://36.media.tumblr.com/3ea1b138b804b439196830ddff6ebbdd/tumblr_mow188tn3X1rj7pfno1_1280.jpg',
            name: 'Polycraft',
            url: 'https://ga.me/games/polycraft',
        },
        {
            author: 'HelloEnjoy',
            icon: 'https://lh4.googleusercontent.com/qxLF_8U0RvetXN-14N9EPfIrGp-iuAlha0knMXI9_NX_rtAYaSVgA9kdEl1vzNNlikWDga3J=s100-h100-e365-rw',
            installLink: 'http://hellorun.helloenjoy.com/',
            imageUrl: 'http://helloenjoy.com/wordpress/wp-content/uploads/2013/09/HelloRun-Screenshot05.jpg',
            name: 'HelloRun',
            url: 'http://hellorun.helloenjoy.com/',
        },
    ];

    return function(builder, args, params) {
        builder.z('type', 'root games');

        builder.start('games.html', {heroGames: heroGames});
    };
});
