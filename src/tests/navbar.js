(function() {
var a = require('assert');
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');
var urls = require('urls');

test('navbar render context path', function(done, fail) {
    var expected_path = '/testing';
    var stack = [{path: '/ignoreme'}, {path: expected_path}];
    mock(
        'navbar',
        {
            navigation: {stack: function() { return stack; }},
            nunjucks: {
                env: {
                    render: function(template, context) {
                        if (template == 'nav.html') {
                            eq_(context.path, expected_path);
                        }
                    }
                }
            },
        },
        function(navbar) {
            navbar.render();
            stack = [];
            expected_path = '';
            navbar.render();

            done();
        },
        fail
    );
});

})();
