// Eldritch Majicks

var views = [
    'views/homepage',
    'views/app/ratings',
    'views/app/abuse',
    'views/app/privacy',
    'views/app',
    'views/category',
    'views/search',
    'views/settings',
    'views/purchases',
    'views/feedback',
    'views/privacy',
    'views/terms'
];

define(['underscore'].concat(views), function(_) {
    var view_dict = {};
    _.each(views, function(v) {
        console.log(v.replace('views/', ''), require(v));
        view_dict[v.replace('views/', '')] = require(v);
    });
    window.v = view_dict;
    return view_dict;
});