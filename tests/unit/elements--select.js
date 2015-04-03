define('tests/unit/elements--select',
    ['elements/select', 'tests/unit/helpers'],
    function(select, helpers) {

    function createMktSelect(cb) {
        var div = document.createElement('div');
        div.innerHTML = '<mkt-select>' +
          '<mkt-selected><mkt-selected-text></mkt-selected>' +
          '<optgroup>' +
            '<option value="1" selected="">One</option>' +
            '<option value="2">Two</option>' +
          '</optgroup>' +
        '</mkt-select>';
        document.body.appendChild(div);
        var mktSelect = div.querySelector('mkt-select');

        var interval = setInterval(function() {
            // Wait for mkt-select to initialize.
            if (mktSelect.select) {
                var mktOptions = mktSelect.querySelectorAll('mkt-option');
                cb(mktSelect, mktOptions[0], mktOptions[1]);
                clearInterval(interval);
            }
        }, 100);
    }

    describe('mkt-select', function() {
        it('sets up select', function(done) {
            createMktSelect(function(mktSelect) {
                assert.equal(mktSelect.querySelector('select'),
                             mktSelect.select);
                assert.equal(mktSelect.select.style.display, 'none');
                assert.equal(mktSelect.select.tagName, 'SELECT');
                assert.ok(mktSelect.select.querySelector('optgroup'));
                assert.equal(mktSelect.select.querySelectorAll('option')
                                             .length, 2);
                done();
            });
        });

        it('sets up mkt-options', function(done) {
            createMktSelect(function(mktSelect, opt1, opt2) {
                var mktOptgroup = mktSelect.querySelector('mkt-optgroup');

                assert.equal(mktOptgroup.querySelectorAll('mkt-option').length,
                             2);
                assert.ok(opt1);
                assert.ok(opt2);

                assert.equal(opt1.option.tagName, 'OPTION');
                assert.equal(opt2.option.tagName, 'OPTION');
                done();
            });
        });

        it('sets up mkt-selected-text', function(done) {
            createMktSelect(function(mktSelect, opt1, opt2) {
                assert.equal(mktSelect.querySelector('mkt-selected-text')
                                      .innerHTML, 'One');
                done();
            });
        });

        it('updates mkt-option indices', function(done) {
            createMktSelect(function(mktSelect, opt1, opt2) {
                assert.notOk(opt1.hasAttribute('data-mkt-option--index'));
                assert.equal(opt2.getAttribute('data-mkt-option--index'), 0);

                opt1.removeAttribute('selected');
                opt2.setAttribute('selected', true);
                mktSelect.updateOptionIndices();

                assert.notOk(opt2.hasAttribute('data-mkt-option--index'));
                assert.equal(opt1.getAttribute('data-mkt-option--index'), 0);
                done();
            });
        });

        it('updates mkt-selected-text', function(done) {
            createMktSelect(function(mktSelect, opt1, opt2) {
                var mktSelectedText = mktSelect.querySelector('mkt-selected-text');

                assert.equal(mktSelectedText.innerHTML, 'One');

                opt1.removeAttribute('selected');
                opt2.setAttribute('selected', true);
                mktSelect.updateSelectedText();

                assert.equal(mktSelectedText.innerHTML, 'Two');
                done();
            });
        });

        it('toggles', function(done) {
                createMktSelect(function(mktSelect, opt1, opt2) {
                assert.notOk(mktSelect.classList
                                      .contains(select.classes.VISIBLE));
                mktSelect.toggle();
                assert.ok(mktSelect.classList
                                   .contains(select.classes.VISIBLE));
                mktSelect.toggle();
                assert.notOk(mktSelect.classList
                                      .contains(select.classes.VISIBLE));
                done();
            });
        });

        it('can get its value', function(done) {
            createMktSelect(function(mktSelect, opt1, opt2) {
                assert.equal(mktSelect.value, 1);
                done();
            });
        });

        it('updates when changing value', function(done) {
            createMktSelect(function(mktSelect, opt1, opt2) {
                var mktSelectedText = mktSelect.querySelector(
                    'mkt-selected-text');

                assert.equal(mktSelectedText.innerHTML, 'One');
                assert.ok(opt1.hasAttribute('selected'));
                assert.notOk(opt2.hasAttribute('selected'));

                mktSelect.value = '2';

                assert.equal(mktSelectedText.innerHTML, 'Two');
                assert.notOk(opt1.hasAttribute('selected'));
                assert.ok(opt1.hasAttribute('data-mkt-option--index'));
                assert.ok(opt2.hasAttribute('selected'));
                assert.notOk(opt2.hasAttribute('data-mkt-option--index'));

                done();
            });
        });
    });
});
