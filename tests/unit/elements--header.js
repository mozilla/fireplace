define('tests/unit/elements--header',
    ['elements/header', 'jquery', 'tests/unit/helpers'],
    function(Header, $, helpers) {

    function createMktHeader(cb) {
        var div = document.createElement('div');
        div.innerHTML = '<mkt-header>' +
          '<mkt-header-child-toggle for="foo-child">' +
          '</mkt-header-child-toggle>' +
          '<mkt-header-child id="foo-child" data-header-child--input>' +
            '<form>' +
              '<input type="search">' +
            '</form>' +
          '</mkt-header-child>' +
        '</mkt-header>';
        document.body.appendChild(div);
        var mktHeader = div.querySelector('mkt-header');

        var interval = setInterval(function() {
            // Wait for mkt-select to initialize.
            if (!mktHeader.querySelector('mkt-header-child') &&
                mktHeader.headerChildren) {
                var mktHeaderChild = document.querySelector(
                    'mkt-header-child');
                var mktHeaderChildToggle = document.querySelector(
                    'mkt-header-child-toggle');
                cb(mktHeader, mktHeaderChild, mktHeaderChildToggle);
                clearInterval(interval);
            }
        }, 100);
    }

    describe('mkt-header', function() {
        it('turns child into sibling', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.notOk(header.querySelector('mkt-header-child'));
                assert.ok(header.querySelector('mkt-header-child-toggle'));
                assert.ok(document.body.querySelector(
                          'mkt-header + mkt-header-child'));
                done();
            });
        });

        it('returns children', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.equal(header.headerChildren[0], child);
                done();
            });
        });

        it('hides children', function(done) {
            createMktHeader(function(header, child, toggle) {
                child.toggle(true);
                header.hideHeaderChildren();
                assert.notOk(child.visible);
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

        it('toggles off on blur', function(done) {
            createMktHeader(function(header, child, toggle) {
                child.toggle(true);
                assert.ok(child.visible, 'Initially visible');
                child.input.onblur();
                setTimeout(function() {
                    assert.notOk(child.visible, 'No longer visible');
                    done();
                }, 100);
            });
        });

        it('clears on form submit', function(done) {
            createMktHeader(function(header, child, toggle) {
                child.input.value = 'lol';
                $(child.querySelector('form')).trigger('submit');
                setTimeout(function() {
                    assert.equal(child.input.value, '');
                    done();
                }, 50);
            });
        });
    });

    describe('mkt-header-child-toggle', function() {
        it('has headerChild', function(done) {
            createMktHeader(function(header, child, toggle) {
                assert.equal(toggle.headerChild, child);
                done();
            });
        });

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
