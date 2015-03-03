define('tests/unit/navbar',
    ['tests/unit/helpers'],
    function(h) {

    describe('navbar', function() {
        it('renders context path', function(done) {
            var stack = [{path: '/ignoreme'}, {path: '/testing'}];
            var nunjucks = sinon.stub({
                env: {render: sinon.spy()}
            });

            h.injector().mock('core/navigation', {
                stack: function() { return stack; }
            }).mock('core/nunjucks', nunjucks)
            .require(['navbar'], function(navbar) {
                navbar.render();

                var renderCall = nunjucks.env.render.getCall(0);
                assert.equal(renderCall.args[0], 'nav.html');
                assert.equal(renderCall.args[1].path, '/testing');

                nunjucks.env.render.reset();  // Clear recorded calls.
                stack = [];
                navbar.render();

                renderCall = nunjucks.env.render.getCall(0);
                assert.equal(renderCall.args[0], 'nav.html');
                assert.equal(renderCall.args[1].path, '');

                done();
            });
        });
    });
});
