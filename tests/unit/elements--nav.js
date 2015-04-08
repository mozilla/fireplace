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

        it('toggles subnav class', function() {
            var mktNav = document.createElement('mkt-nav');
            mktNav.toggleSubnav();
            assert.ok(mktNav.statusElement.classList
                            .contains(nav.classes.SUBNAV_VISIBLE));
            mktNav.toggleSubnav();
            assert.notOk(mktNav.statusElement.classList
                               .contains(nav.classes.SUBNAV_VISIBLE));
        });

        it('toggles subnavs off', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild1 = document.createElement('mkt-nav-child');
            var mktNavChild2 = document.createElement('mkt-nav-child');
            mktNav.appendChild(mktNavChild1);
            mktNav.appendChild(mktNavChild2);

            mktNavChild1.show();

            mktNav.toggleSubnav(false);
            assert.notOk(mktNavChild1.classList
                                     .contains(nav.classes.VISIBLE));
            assert.notOk(mktNavChild2.classList
                                     .contains(nav.classes.VISIBLE));
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

        it('is covered while not visible', function(done) {
            var mktNav = document.createElement('mkt-nav');
            assert.ok(mktNav.classList
                            .contains(nav.classes.BACKGROUND_HIDDEN),
                      'Cover is on initially');
            mktNav.toggle();
            assert.notOk(mktNav.classList
                               .contains(nav.classes.BACKGROUND_HIDDEN),
                         'Cover is off when toggled');
            mktNav.toggleSubnav();
            assert.notOk(mktNav.classList
                               .contains(nav.classes.BACKGROUND_HIDDEN),
                         'Cover is still off during subnav');

            mktNav.toggle();

            setTimeout(function() {
                assert.ok(mktNav.classList
                                .contains(nav.classes.BACKGROUND_HIDDEN),
                          'Cover is back on');
                done();
            }, 500);
        });
    });

    describe('mkt-nav-child', function() {
        it('toggles', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild = document.createElement('mkt-nav-child');
            mktNav.appendChild(mktNavChild);

            mktNavChild.show();
            assert.ok(mktNavChild.classList
                                 .contains(nav.classes.VISIBLE));
            mktNavChild.hide();
            assert.notOk(mktNavChild.classList
                                    .contains(nav.classes.VISIBLE));
        });

        it('only shows one at a time', function() {
            var mktNav = document.createElement('mkt-nav');
            var mktNavChild1 = document.createElement('mkt-nav-child');
            var mktNavChild2 = document.createElement('mkt-nav-child');
            mktNav.appendChild(mktNavChild1);
            mktNav.appendChild(mktNavChild2);

            mktNavChild1.show();
            assert.ok(mktNavChild1.classList
                                  .contains(nav.classes.VISIBLE));
            assert.notOk(mktNavChild2.classList
                                     .contains(nav.classes.VISIBLE));

            mktNavChild2.show();
            assert.ok(mktNavChild2.classList
                                  .contains(nav.classes.VISIBLE));
            assert.notOk(mktNavChild1.classList
                                     .contains(nav.classes.VISIBLE));
        });
    });
});
