// Visual regression test script for Sherlocked.
var ROOT = 'http://localhost:' + require('./config').PORT + '/';

function mobile(client, path) {
    return client
        .setViewportSize({width: 320, height: 960})
        .url(ROOT + (path || ''));
}

function desktop(client, path) {
    return client
        .setViewportSize({width: 1050, height: 2048})
        .url(ROOT + (path || ''));
}


require('sherlocked')

.investigate('Home Page on Mobile', function(client) {
    return mobile(client)
        .waitForExist('.feed-home', 60000);
})

.investigate('Home Page on Desktop', function(client) {
    return desktop(client)
        .waitForExist('.feed-home', 60000);
})

.investigate('Home Page on Mobile RTL', function(client) {
    return mobile(client, '?lang=ar')
        .waitForExist('.feed-home', 60000);
})

.investigate('Home Page on Desktop RTL', function(client) {
    return desktop(client, '?lang=ar')
        .waitForExist('.feed-home', 60000);
})

.investigate('Collection on Mobile', function(client) {
    return mobile(client, 'feed/editorial/brand-list')
        .waitForExist('.app-list', 60000);
})

.investigate('Collection on Desktop', function(client) {
    return desktop(client, 'feed/editorial/brand-list')
        .waitForExist('.app-list', 60000);
})

.investigate('Popular Page on Mobile', function(client) {
    return mobile(client, 'popular')
        .waitForExist('.app-list', 60000);
})

.investigate('Popular Page on Desktop', function(client) {
    return desktop(client, 'popular')
        .waitForExist('.app-list', 60000);
})

.investigate('App Detail on Mobile', function(client) {
    return mobile(client, 'app/swanky-chocolate-9')
        .waitForExist('.mkt-tile', 60000);
})

.investigate('App Detail on Desktop', function(client) {
    return desktop(client, 'app/swanky-chocolate-9')
        .waitForExist('.mkt-tile', 60000);
})

.investigate('App Detail on Mobile RTL', function(client) {
    return mobile(client, 'app/drôle-sandwich-2?lang=ar')
        .waitForExist('.mkt-tile', 60000);
})

.investigate('App Detail on Desktop RTL', function(client) {
    return desktop(client, 'app/drôle-sandwich-2?lang=ar')
        .waitForExist('.mkt-tile', 60000);
})

.investigate('Reviews on Mobile', function(client) {
    return mobile(client, 'app/swanky-chocolate-9/ratings')
        .waitForExist('.review', 60000);
})

.investigate('Reviews on Desktop', function(client) {
    return desktop(client, 'app/swanky-chocolate-9/ratings')
        .waitForExist('.review', 60000);
})

.investigate('Category on Mobile', function(client) {
    return mobile(client, 'category/music')
        .waitForExist('.app-list', 60000);
})

.investigate('Category on Desktop', function(client) {
    return desktop(client, 'category/music')
        .waitForExist('.app-list', 60000);
})

.investigate('Category menu on Mobile', function(client) {
    return mobile(client)
        .waitForExist('.feed-home', 60000)
        .click('mkt-nav-toggle[for=nav]')
        .click('mkt-nav-child-toggle[for=categories]');
})

.investigate('Category menu on Desktop', function(client) {
    return desktop(client)
        .waitForExist('.feed-home', 60000)
        .click('mkt-header-child-toggle[for=header--categories]');
})

.begin([
    {
        browserName: 'firefox',
        platform: 'OS X 10.9'
    },
    {
        browserName: 'chrome',
        platform: 'OS X 10.9'
    },
    {
        browserName: 'safari',
        platform: 'OS X 10.9'
    }
]);
