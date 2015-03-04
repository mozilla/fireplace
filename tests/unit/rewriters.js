define('tests/unit/rewriters',
    ['tests/unit/helpers'],
    function(h) {

    describe('rewriter pagination cache', function() {
        it('rewrites pagination stuff',
           h.injector()
           .mock('core/settings', {cache_rewriting_enabled: true,
                                   api_url: 'https://foo.com'})
           .run(['core/urls', 'rewriters', 'route_api_args', 'routes'],
                function(urls, rewriters, route_api_args, routes) {

                var cache = {};
                var first_result = cache[urls.api.params('search', {q: 'foo'})] = {
                    objects: ['first', 'second', 'third'],
                    meta: {
                        total_count: 6,
                        limit: 3,
                        next: 'second page'
                    }
                };

                var key = urls.api.params('search', {q: 'foo', offset: 3, limit: 3});
                var value = {
                    objects: ['fourth', 'fifth', 'sixth'],
                    meta: {
                        total_count: 6,
                        limit: 3,
                        next: 'third page'
                    }
                };

                for (var i = 0; i < rewriters.length; i++) {
                    rewriters[i](key, value, cache);
                }

                assert.deepEqual(
                    first_result.objects,
                    ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']);
                assert.equal(first_result.meta.total_count, 6);
                assert.equal(first_result.meta.limit, 6);
                assert.equal(first_result.meta.next, 'third page');
            }));
    });
});
