define('tests/unit/elements--nav',
    ['elements/nav', 'tests/unit/helpers'],
    function(nav, helpers) {

    describe('mkt-nav', function() {
        it('toggles', function() {
            var mktNav = document.createElement('mkt-nav');
            mktNav.toggle();
            assert.ok(mktNav.statusElement
                            .classList.contains(nav.classes.VISIBLE));
            mktNav.toggle();
            assert.notOk(mktNav.statusElement
                               .classList.contains(nav.classes.VISIBLE));
        });

        it('toggles showing child class', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild1 = document.createElement('mkt-nav-child');
            mktNavChild1.id = 'foo';
            mktNav.appendChild(mktNavChild1);

            mktNav.toggleChildren('foo');
            assert.ok(mktNav.statusElement.classList
                            .contains(nav.classes.SHOWING_CHILD));
            mktNav.toggleChildren('foo');
            assert.notOk(mktNav.statusElement.classList
                               .contains(nav.classes.SHOWING_CHILD));
        });

        it('toggles children', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild1 = document.createElement('mkt-nav-child');
            var mktNavChild2 = document.createElement('mkt-nav-child');
            mktNavChild1.id = 'foo';
            mktNavChild2.id = 'bar';

            mktNav.appendChild(mktNavChild1);
            mktNav.appendChild(mktNavChild2);

            mktNav.toggleChildren('foo');
            assert.ok(mktNavChild1.visible);
            assert.notOk(mktNavChild2.visible);

            mktNav.toggleChildren('bar');
            assert.notOk(mktNavChild1.visible);
            assert.ok(mktNavChild2.visible);
        });

        it('toggles children off', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild1 = document.createElement('mkt-nav-child');
            var mktNavChild2 = document.createElement('mkt-nav-child');
            mktNav.appendChild(mktNavChild1);
            mktNav.appendChild(mktNavChild2);

            mktNavChild1.toggle(true);

            mktNav.toggleChildren(false);
            assert.notOk(mktNavChild1.visible);
            assert.notOk(mktNavChild2.visible);
        });

        it('updates active nodes', function() {
            var mktNav = document.createElement('mkt-nav');
            var link1 = document.createElement('a');
            link1.setAttribute('href', 'http://foo.qux');
            var link2 = document.createElement('a');
            link2.setAttribute('href', 'http://bar.baz');
            mktNav.appendChild(link1);
            mktNav.appendChild(link2);

            mktNav.updateActiveNode('http://foo.qux');
            assert.ok(link1.classList.contains(nav.classes.ACTIVE));
            assert.notOk(link2.classList.contains(nav.classes.ACTIVE));

            mktNav.updateActiveNode('http://bar.baz');
            assert.ok(link2.classList.contains(nav.classes.ACTIVE));
            assert.notOk(link1.classList.contains(nav.classes.ACTIVE));
        });
    });

    describe('mkt-nav-child', function() {
        it('has visible status', function() {
            var mktNavChild = document.createElement('mkt-nav-child');
            assert.notOk(mktNavChild.visible);
            mktNavChild.classList.add(nav.classes.VISIBLE);
            assert.ok(mktNavChild.visible);
        });

        it('toggles', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild = document.createElement('mkt-nav-child');
            mktNav.appendChild(mktNavChild);

            mktNavChild.toggle();
            assert.ok(mktNavChild.visible);
            mktNavChild.toggle();
            assert.notOk(mktNavChild.visibile);
            mktNavChild.toggle(true);
            assert.ok(mktNavChild.visible);
            mktNavChild.toggle(false);
            assert.notOk(mktNavChild.visibile);
        });
    });

    describe('mkt-nav-toggle', function() {
        it('toggles nav', function() {
            var mktNav = document.createElement('mkt-nav');
            mktNav.id = 'nav';
            var mktNavToggle = document.createElement('mkt-nav-toggle');
            mktNavToggle.setAttribute('for', 'nav');
            document.body.appendChild(mktNav);
            document.body.appendChild(mktNavToggle);

            assert.notOk(mktNav.statusElement.classList.contains(
                         nav.classes.VISIBLE));

            mktNavToggle.click();

            assert.ok(mktNav.statusElement.classList.contains(
                      nav.classes.VISIBLE));

            document.body.removeChild(mktNav);
            document.body.removeChild(mktNavToggle);
        });
    });

    describe('mkt-nav-child-toggle', function() {
        it('toggles nav child', function() {
            var mktNav = document.createElement('mkt-nav');

            var mktNavChild = document.createElement('mkt-nav-child');
            mktNavChild.id = 'foo-child';

            var mktNavChildToggle = document.createElement(
                'mkt-nav-child-toggle');
            mktNavChildToggle.setAttribute('for', 'foo-child');

            mktNav.appendChild(mktNavChild);

            document.body.appendChild(mktNav);
            document.body.appendChild(mktNavChildToggle);

            assert.notOk(mktNavChild.visible);
            mktNavChildToggle.click();
            assert.ok(mktNavChild.visible);

            document.body.removeChild(mktNav);
            document.body.removeChild(mktNavChildToggle);
        });
    });
});
