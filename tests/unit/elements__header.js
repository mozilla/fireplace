/*
   Module named with underscores since Karma can't find it when it has hyphens
   for some reason.
*/
define('tests/unit/elements__header',
    ['elements/header', 'jquery'],
    function(Header, $) {

    function createMktHeader(cb) {
        if (document.body.querySelector('#mkt-test-wrapper')) {
            document.body.removeChild(
                document.querySelector('#mkt-test-wrapper'));
        }

        var div = document.createElement('div');
        div.setAttribute('id', 'mkt-test-wrapper');
        div.innerHTML = '<mkt-header>' +
          '<h1 class="mkt-header--title"></h1>' +
          '<mkt-header-child-toggle for="foo-child">' +
          '</mkt-header-child-toggle>' +
          '<mkt-header-child-toggle for="bar-child">' +
          '</mkt-header-child-toggle>' +
          '<mkt-header-nav> ' +
            '<a id="foo-link" href="/foo"></a>' +
            '<a id="bar-link" href="/bar"></a>' +
          '</mkt-header-nav>' +
          '<mkt-header-child id="foo-child" data-header-child--input>' +
            '<form>' +
              '<input type="search">' +
            '</form>' +
          '</mkt-header-child>' +
          '<mkt-header-child id="bar-child"></mkt-header-child>' +
        '</mkt-header>';
        var mktHeader = div.querySelector('mkt-header');

        document.body.appendChild(div);

        var interval = setInterval(function() {
            // Wait for mkt-select to initialize.
            if (!mktHeader.querySelectorAll('mkt-header-child').length &&
                mktHeader.headerChildren) {
                var mktHeaderChildToggle = div.querySelector(
                    'mkt-header-child-toggle');
                var mktHeaderNav = document.body.querySelector('mkt-header-nav');
                var mktHeaderChild = document.body.querySelector('#foo-child');
                var mktHeaderChild2 = document.body.querySelector('#bar-child');
                cb(mktHeader, mktHeaderChild, mktHeaderChildToggle,
                   mktHeaderNav, mktHeaderChild2);
                clearInterval(interval);
            }
        }, 100);
    }

    describe('mkt-header', function() {
        it('turns child into sibling', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.notOk(header.querySelector('mkt-header-child'));
                assert.ok(header.querySelector('mkt-header-child-toggle'));
                assert.ok(header.parentNode.querySelector(
                          'mkt-header + mkt-header-child'));
                done();
            });
        });

        it('returns children', function(done) {
            createMktHeader(function(header, child, toggle, nav, child2) {
                assert.equal(header.headerChildren[0], child2);
                assert.equal(header.headerChildren[1], child);
                done();
            });
        });

        it('toggles children off', function(done) {
            createMktHeader(function(header, child, toggle, nav, child2) {
                child.toggle(true);
                header.toggleChildren(false);
                assert.notOk(child.visible);
                done();
            });
        });

        it('toggles children one at a time', function(done) {
            createMktHeader(function(header, child, toggle, nav, child2) {
                header.toggleChildren(child.id);
                assert.ok(child.visible);

                header.toggleChildren(child2.id);
                assert.ok(child2.visible);
                assert.notOk(child.visible);
                done();
            });
        });

        it('toggles children off and on', function(done) {
            createMktHeader(function(header, child, toggle, nav, child2) {
                header.toggleChildren(child.id);
                assert.ok(child.visible);
                header.toggleChildren(child.id);
                assert.notOk(child.visible);
                done();
            });
        });

        it('sets showing child class on statusElement', function(done) {
            createMktHeader(function(header, child, toggle, nav, child2) {
                assert.notOk(header.parentNode.classList.contains(
                             Header.classes.SHOWING_CHILD));
                header.toggleChildren(child.id);
                assert.ok(header.parentNode.classList.contains(
                          Header.classes.SHOWING_CHILD));
                header.toggleChildren(child.id);
                assert.notOk(header.parentNode.classList.contains(
                             Header.classes.SHOWING_CHILD));
                done();
            });
        });

        it('sets its title', function(done) {
            createMktHeader(function(header) {
                var title = header.querySelector('.mkt-header--title');

                assert.ok(title);
                assert.equal(title.textContent, '');

                header.setAttribute('header-title', 'New title');
                setTimeout(function() {
                    assert.equal(title.textContent, 'New title');
                    done();
                }, 1);
            });
        });
    });

    describe('mkt-header-nav', function() {
        it('updates active node', function(done) {
            createMktHeader(function(header, child, toggle, nav) {
                nav.updateActiveNode('/bar');
                assert.ok(nav.querySelector('#bar-link')
                             .classList.contains(Header.classes.LINK_ACTIVE));
                assert.notOk(nav.querySelector('#foo-link')
                             .classList.contains(Header.classes.LINK_ACTIVE));

                nav.updateActiveNode('/foo');
                assert.notOk(nav.querySelector('#bar-link')
                             .classList.contains(Header.classes.LINK_ACTIVE));
                assert.ok(nav.querySelector('#foo-link')
                             .classList.contains(Header.classes.LINK_ACTIVE));
                done();
            });
        });
    });

    describe('mkt-header-child', function() {
        it('toggles', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.notOk(child.visible);
                child.toggle();
                assert.ok(child.visible);
                child.toggle(true);
                assert.ok(child.visible);
                child.toggle();
                assert.notOk(child.visible);
                child.toggle(false);
                assert.notOk(child.visible);
                done();
            });
        });

        it('has a visible status', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.notOk(child.visible);
                child.classList.add(Header.classes.CHILD_VISIBLE);
                assert.ok(child.visible);
                child.classList.remove(Header.classes.CHILD_VISIBLE);
                assert.notOk(child.visible);
                done();
            });
        });
    });

    describe('mkt-header-child[data-header-child--input]', function() {
        it('has input', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.equal(child.input.tagName, 'INPUT');
                assert.ok(child.isInput);
                done();
            });
        });

        it('focuses on toggle on', function(done) {
            createMktHeader(function(header, child, toggle) {
                child.toggle(true);
                assert.equal(document.activeElement, child.input);
                done();
            });
        });
    });

    describe('mkt-header-child-toggle', function() {
        it('toggles child open', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.notOk(child.visible);
                toggle.click();
                assert.ok(child.visible);
                done();
            });
        });
    });
});
