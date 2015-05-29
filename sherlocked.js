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

.investigate('Reviews on Mobile', function(client) {
    return mobile(client, 'app/swanky-chocolate-9/ratings')
        .waitForExist('.review', 60000);
})

.investigate('Reviews on Desktop', function(client) {
    return desktop(client, 'app/swanky-chocolate-9/ratings')
        .waitForExist('.review', 60000);
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
