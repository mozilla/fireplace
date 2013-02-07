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
    console.log('View Completion Report:');
    _.each(views, function(v) {
        console.log(!!require(v) ? '√' : 'X', v.replace('views/', ''));
        view_dict[v.replace('views/', '')] = require(v);
    });
    window.v = view_dict;
    return view_dict;
});
