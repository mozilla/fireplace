(function() {

var languages = [
    'bg', 'ca', 'cs', 'de', 'el', 'en-US', 'es', 'eu', 'fr', 'ga-IE', 'hr',
    'hu', 'it', 'ja', 'mk', 'nl', 'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sr',
    'sr-Latn', 'tr', 'zh-TW', 'dbg'
];
var body_langs;
if (body_langs = document.body.getAttribute('data-languages')) {
    languages = JSON.parse(body_langs);
}

var lang_expander = {
    'en': 'en-US', 'ga': 'ga-IE',
    'pt': 'pt-BR', 'sv': 'sv-SE',
    'zh': 'zh-CN', 'sr': 'sr-Latn'
};

function get_locale(locale) {
    if (languages.indexOf(locale) !== -1) {
        return locale;
    }
    locale = locale.split('-')[0];
    if (languages.indexOf(locale) !== -1) {
        return locale;
    }
    if (locale in lang_expander) {
        locale = lang_expander[locale];
        if (languages.indexOf(locale) !== -1) {
            return locale;
        }
    }
    return 'en-US';
}

if (!window.define) {
    var qs_lang = /[\?&]lang=([\w\-]+)/i.exec(window.location.search);
    var locale = get_locale((qs_lang && qs_lang[1]) || navigator.language || navigator.userLanguage);
    if (locale === 'en-US') {
        window.navigator.l10n = {language: 'en-US'};
        return;
    }

    // Cachebust the .js file for our CDN.
    var build_id = document.body.getAttribute('data-buildIdJs') || +new Date();
    var repo = document.body.getAttribute('data-repo');
    /* jshint ignore:start */
    document.write('<script src="/media/' + (repo ? repo + '/' : '') + 'locales/' + locale + '.js?b=' + build_id + '"></script>');
    /* jshint ignore:end */

} else {
    define('l10n', ['format'], function(format) {
        var rtlList = ['ar', 'he', 'fa', 'ps', 'ur'];

        function get(str, args, context) {
            context = context || navigator;
            var out;
            if (context.l10n && context.l10n.strings && str in context.l10n.strings) {
                out = context.l10n.strings[str].body || str;
            } else {
                out = str;
            }
            if (args) {
                out = format.format(out, args);
            }
            return out;
        }
        function nget(str, plural, args, context) {
            context = context || navigator;
            if (!args || !('n' in args)) {
                throw new Error('`n` not passed to ngettext');
            }
            var out;
            var n = args.n;
            var strings;
            var fallback = n === 1 ? str : plural;
            if (context.l10n && context.l10n.strings && str in (strings = context.l10n.strings)) {
                if (strings[str].plurals) {
                    // +true is 1 / +false is 0
                    var plid = +context.l10n.pluralize(n);
                    out = strings[str].plurals[plid] || fallback;
                } else {
                    // Support for languages like zh-TW where there is no plural form.
                    out = strings[str].body || fallback;
                }
            } else {
                out = fallback;
            }
            return format.format(out, args);
        }

        window.gettext = get;
        window.ngettext = nget;

        return {
            gettext: get,
            ngettext: nget,
            getDirection: function(context) {
                var language = context ? context.language : window.navigator.l10n.language;
                if (language.indexOf('-') > -1) {
                    language = language.split('-')[0];
                }
                // http://www.w3.org/International/questions/qa-scripts
                // Arabic, Hebrew, Farsi, Pashto, Urdu
                return rtlList.indexOf(language) >= 0 ? 'rtl' : 'ltr';
            },
            getLocale: get_locale,
            languages: languages
        };
    });
}
})();
