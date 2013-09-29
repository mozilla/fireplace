(function() {
var a = require('assert');
var assert = a.assert;
var eq_ = a.eq_;
var contains = a.contains;

function MockNavigator(strings, pluralizer) {
    this.l10n = {
        strings: strings,
        pluralize: pluralizer
    };
}

var eltenen = require('l10n');
var basic_context = new MockNavigator(
    {foo: {body: 'bar'},
     formatted: {body: 'zip {zap}'},
     sing: {plurals: ['zero {n}', 'one {n}']},
     sing2: {plurals: ['zero {n} {asdf}', 'one {n} {asdf}']}},
    function(n) {return !!(n - 1);}
);

test('l10n.gettext', function(done) {
    eq_(eltenen.gettext('foo', null, basic_context), 'bar');
    done();
});

test('l10n.gettext fallback', function(done) {
    eq_(eltenen.gettext('does not exist', null, basic_context), 'does not exist');
    done();
});

test('l10n.gettext args', function(done) {
    eq_(eltenen.gettext('formatted', {zap: 123}, basic_context), 'zip 123');
    done();
});

test('l10n.gettext fallback args', function(done) {
    eq_(eltenen.gettext('does not {exist}', {exist: 123}, basic_context), 'does not 123');
    done();
});

test('l10n.ngettext', function(done) {
    eq_(eltenen.ngettext('sing', 'plural', {n: 1}, basic_context), 'zero 1');
    eq_(eltenen.ngettext('sing', 'plural', {n: 2}, basic_context), 'one 2');
    done();
});

test('l10n.ngettext pluralization', function(done) {
    var context = new MockNavigator(
        {sing: {plurals: ['0{n}', '1{n}', '2{n}', '3{n}']}},
        function(n) {return n;}
    );
    eq_(eltenen.ngettext('sing', 'plural', {n: 0}, context), '00');
    eq_(eltenen.ngettext('sing', 'plural', {n: 1}, context), '11');
    eq_(eltenen.ngettext('sing', 'plural', {n: 2}, context), '22');
    eq_(eltenen.ngettext('sing', 'plural', {n: 3}, context), '33');
    done();
});

test('l10n.ngettext fallback', function(done) {
    eq_(eltenen.ngettext('foo {n}', 'bar {n}', {n: 1}, basic_context), 'foo 1');
    eq_(eltenen.ngettext('foo {n}', 'bar {n}', {n: 2}, basic_context), 'bar 2');
    done();
});

test('l10n.ngettext args', function(done) {
    eq_(eltenen.ngettext('sing2', 'sang2', {n: 1, asdf: 'bar'}, basic_context), 'zero 1 bar');
    eq_(eltenen.ngettext('sing2', 'sang2', {n: 2, asdf: 'bar'}, basic_context), 'one 2 bar');
    done();
});

test('l10n.ngettext fallback args', function(done) {
    eq_(eltenen.ngettext('foo {n} {asdf}', '', {n: 1, asdf: 'bar'}, basic_context),
        'foo 1 bar');
    eq_(eltenen.ngettext('', 'foo {n} {asdf}', {n: 2, asdf: 'bar'}, basic_context),
        'foo 2 bar');
    done();
});

test('l10n.ngettext no N', function(done, fail) {
    try {
        console.error(eltenen.ngettext('singular', 'plural', {not_n: 1}, basic_context));
    } catch (e) {
        return done();
    }
    fail();
});

test('l10n.getDirection', function(done) {
    var context = {language: 'en-US'};
    eq_(eltenen.getDirection(context), 'ltr');
    context.language = 'pt-BR';
    eq_(eltenen.getDirection(context), 'ltr');
    context.language = 'ar';
    eq_(eltenen.getDirection(context), 'rtl');
    context.language = 'ar-AR';
    eq_(eltenen.getDirection(context), 'rtl');
    context.language = 'ar-POOP';
    eq_(eltenen.getDirection(context), 'rtl');
    done();
});

test('l10n.getLocale', function(done) {
    // Exact matches
    eq_(eltenen.getLocale('en-US'), 'en-US');
    // Shortened matches
    eq_(eltenen.getLocale('de-DE'), 'de');
    // Re-expanded matches
    eq_(eltenen.getLocale('en-FOO'), 'en-US');
    // Potato matches
    eq_(eltenen.getLocale('potato-LOCALE'), 'en-US');
    done();
});


})();
