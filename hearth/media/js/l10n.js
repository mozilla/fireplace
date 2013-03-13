(function() {

if (!window.define) {
    var locale = navigator.language.split('-')[0].toLowerCase();
    if (locale === 'en') {
        return;
    }
    document.write('<script src="/locales/' + locale + '.js"></script>');

} else {
    define('l10n', ['format'], function(format) {
        var rtlList = ['ar', 'he', 'fa', 'ps', 'ur'];

        function get(str, args) {

            var out;
            if (navigator.l10n && str in navigator.l10n.strings) {
                out = navigator.l10n.strings[str];
            } else {
                out = str;
            }
            if (args) {
                out = format.format(out, args);
            }
            return out;
        }
        function nget(str, plural, args) {
            if (!('n' in args)) {
                throw new Error('`n` not passed to ngettext');
            }
            var out;
            var n = args.n;
            if (navigator.l10n && str in navigator.l10n.strings) {
                var plid = navigator.l10n.pluralize(n);
                out = navigator.l10n.strings[str].plurals[plid];
            } else {
                out = n === 1 ? str : plural;
            }
            out = format.format(out, args);
            return out;
        }

        window.gettext = get;
        window.ngettext = nget;

        return {
            gettext: get,
            ngettext: nget,
            getDirection: function() {
                // http://www.w3.org/International/questions/qa-scripts
                // Arabic, Hebrew, Farsi, Pashto, Urdu
                return rtlList.indexOf(navigator.language) >= 0 ? 'rtl' : 'ltr';
            }
        }
    });
}
})();
