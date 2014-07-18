(function() {

// Please leave quotes around keys! They're needed for Space Heater.
var routes = window.routes = [
    {'pattern': '^/$', 'view_name': 'hello_world'},
];

// Only `require.js` has `window.require.defined`, so we can use this to
// sniff for whether we're using the minified bundle or not. (In production
// we use commonplace's `amd.js`.)
if (window.require.hasOwnProperty('defined')) {
    // The minified JS bundle doesn't need some dev-specific JS views.
    // Those go here.
    routes = routes.concat([
        {'pattern': '^/tests$', 'view_name': 'tests'}
    ]);
}

define(
    'routes',
    routes.map(function(i) {return 'views/' + i.view_name;}),
    function() {
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var view = require('views/' + route.view_name);
            route.view = view;
        }
        return routes;
    }
);

})();
