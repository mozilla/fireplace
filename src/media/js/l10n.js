(function() {

// This is a little misleading.  If you're using the Marketplace this is likely
// overridden below with body_langs.  See bug 892741 for details.
var languages = [
    'bg', 'bn-BD', 'ca', 'cs', 'da', 'de', 'el', 'en-US', 'es', 'eu', 'fr',
    'ga-IE', 'hr', 'hu', 'it', 'ja', 'ko', 'mk', 'nb-NO', 'nl', 'pa',
    'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sq', 'sr', 'sr-Latn', 'ta', 'tr',
    'xh', 'zh-CN', 'zh-TW', 'zu', 'dbg'
];
// Resist the temptation to use .dataset, as it doesn't work with IE10.
var body_langs = document.body.getAttribute('data-languages');
if (body_langs) {
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

function get_locale_src(locale, document) {
    if (!document) {
        document = window.document;
    }
    // We need the CDN url, but only in a website context - if we are inside a
    // packaged app, we don't want an unecessary network request. Fortunately,
    // the packaged app's app.html shouldn't have data-media set on its <body>.
    var media_url = document.body.getAttribute('data-media');
    // If we have a build id, cool, we'll use that to do cachebusting. If we
    // don't, then we're probably in a packaged app context again and don't
    // need to care about that.
    var build_id = document.body.getAttribute('data-build-id-js');
    var repo = document.body.getAttribute('data-repo');
    return [
        media_url ? media_url : '/media/',
        repo ? repo + '/' : '',
        'locales/' + locale + '.js',
        build_id ? '?b=' + build_id : ''
    ].join('');
}

if (!window.define) {
    var qs_lang = /[\?&]lang=([\w\-]+)/i.exec(window.location.search);
    var locale = get_locale((qs_lang && qs_lang[1]) || navigator.language || navigator.userLanguage);
    if (locale === 'en-US') {
        // Pull the English locales in since feed editorial brand strings
        // don't necessarily always match the gettext key. So don't return
        // here.
        window.navigator.l10n = {language: 'en-US'};
    }

    /* jshint ignore:start */
    document.write('<script src="' + get_locale_src(locale) + '"></script>');
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
            getLocaleSrc: get_locale_src,
            getLocale: get_locale,
            languages: languages
        };
    });
}
})();
