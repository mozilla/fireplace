(function() {
    var commonplace_modules = [
        'assert',
        'buckets',
        'builder',
        'cache',
        'capabilities',
        'defer',
        'forms',
        'helpers',
        'log',
        'login',
        'models',
        'navigation',
        'notification',
        'requests',
        'storage',
        'urls',
        'user',
        'utils',
        'z',
    ]
    var commonplace_views = [
        'not_found',
        'hello_world',
        'tests',
    ]

    var config = {
        enforceDefine: true,
        paths: {
            'format': 'lib/format',
            'jquery': 'lib/jquery-2.0.2',
            'nunjucks': 'lib/nunjucks',
            'nunjucks.compat': 'lib/nunjucks.compat',
            'settings': ['settings_local', 'settings'],
            'templates': '../../templates',
            'underscore': 'lib/underscore',
        }
    };
    for (var i = 0; i < commonplace_modules.length; i++) {
        var module = commonplace_modules[i];
        config.paths[module] = 'commonplace/' + module;
    }
    for (var i = 0; i < commonplace_views.length; i++) {
        var view = commonplace_views[i];
        config.paths['views/' + view] = 'views/commonplace/' + view;
    }

    require.config(config);
})();
