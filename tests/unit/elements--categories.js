define('tests/unit/elements--header',
    ['categories', 'elements/categories', 'jquery', 'tests/unit/helpers'],
    function(categories, Categories, $, helpers) {

    function createMktCatList(cb) {
        var catList = document.createElement('mkt-category-list');
        document.body.appendChild(catList);

        var interval = setInterval(function() {
            // Wait to initialize.
            if (catList.querySelector('.mkt-category-link')) {
                cb(catList);
                clearInterval(interval);
            }
        }, 100);
    }

    describe('mkt-category-list', function() {
        it('initializes its contents', function(done) {
            createMktCatList(function(catList) {
                assert.equal(
                    catList.querySelectorAll('mkt-category-item').length,
                    categories.length);

                assert.equal(
                    catList.querySelectorAll('.mkt-category-link').length,
                    categories.length);

                var gameLink = catList.querySelector(
                    '[data-mkt-category-slug="games"] .mkt-category-link');
                assert.equal(gameLink.getAttribute('href'), '/category/games');
                assert.equal(gameLink.getAttribute('title'), 'Games');
                assert.equal(gameLink.textContent, 'Games');
                assert.ok(gameLink.hasAttribute('data-nav-no-active-node'));

                done();
            });
        });

        it('updates active node', function(done) {
            createMktCatList(function(catList) {
                assert.equal(
                    catList.querySelectorAll(Categories.classes.LINK_ACTIVE)
                           .length, 0,
                    'Check start with no active links');

                catList.updateActiveNode('/category/games');
                assert.ok(
                    catList.querySelector('[data-mkt-category-slug="games"] a')
                           .classList.contains(Categories.classes.LINK_ACTIVE),
                    'Check games link active'
                );
                assert.equal(
                    catList.querySelectorAll(
                        '.' + Categories.classes.LINK_ACTIVE).length, 1,
                    'Check now one active link');

                done();
            });
        });
    });
});
