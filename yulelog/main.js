(function() {

    function log() {
        // `console.log` wrapper that prefixes log statements.
        console.log('[yulelog]', Array.prototype.slice.call(arguments, 0).join(' '));
    }

    // No trailing slash, please.
    // Note: our Makefile swaps this out when you supply `DOMAIN`
    // when running `make log`.
    var MKT_URL = 'https://marketplace.firefox.com';
    log('MKT_URL:', MKT_URL);

    var activitiesToSend = [];

    function postMessage(msg) {
        log('postMessaging to ' + MKT_URL + ': ' + JSON.stringify(msg));
        document.querySelector('iframe').contentWindow.postMessage(msg, MKT_URL);
    }

    function sendActivities() {
        log('Sending activities: ' + JSON.stringify(activitiesToSend));
        while (activitiesToSend.length) {
            postMessage(activitiesToSend.pop());
        }
        // The next time we try to append something to `activitiesToSend`,
        // we'll have already called this function (`sendActivities`)
        // so just postMessage the message (`msg`) immediately.
        activitiesToSend = {
            push: function(msg) {
                postMessage(msg);
            }
        };
    }

    var qs = '';
    try {
        var conn = navigator.mozMobileConnection;
        if (conn) {
            // `MCC`: Mobile Country Code
            // `MNC`: Mobile Network Code
            // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
            // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
            var network = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
            qs = '?mcc=' + (network[0] || '') + '&mnc=' + (network[1] || '');
            log('lastKnownNetwork', conn.lastKnownNetwork);
            log('lastKnownHomeNetwork', conn.lastKnownHomeNetwork);
            log('MCC: "' + network[0] + '"');
            log('MNC: "' + network[1] + '"');
        }
    } catch(e) {
        // Fail gracefully if `navigator.mozMobileConnection` gives us problems.
    }
    var iframeSrc = MKT_URL + '/' + qs;
    var i = document.createElement('iframe');
    i.seamless = true;
    i.onerror = function() {
        document.body.classList.add('offline');
    };
    i.src = iframeSrc;
    document.body.appendChild(i);

    log('Activity support?', !!navigator.mozSetMessageHandler);
    if (navigator.mozSetMessageHandler) {
        navigator.mozSetMessageHandler('activity', function(req) {
            log('Activity name:', req.source.name);
            log('Activity data:', JSON.stringify(req.source.data));
            activitiesToSend.push({name: req.source.name, data: req.source.data});
        });
    }

    window.addEventListener('message', function(e) {
        // Receive postMessage from the packaged app and do something with it.
        log('Handled post message from ' + e.origin + ': ' + JSON.stringify(e.data));
        if (e.origin !== MKT_URL) {
            log('Ignored post message from ' + e.origin + ': ' + JSON.stringify(e.data));
            return;
        }
        if (e.data === 'loaded') {
            log('Preparing to send activities ...');
            sendActivities();
        }
    }, false);

    // When refocussing the app, toggle the iframe based on `navigator.onLine`.
    window.addEventListener('focus', toggleOffline, false);

    function toggleOffline(init) {
        log('Checking for network connection ...');
        if (navigator.onLine === false) {
            // Hide iframe.
            log('Network connection not found; hiding iframe ...');
            document.body.classList.add('offline');
        } else {
            // Show iframe.
            log('Network connection found; showing iframe ...');
            if (!init) {
                // Reload the page to reload the iframe.
                window.location.reload();
            }
        }
    }

    toggleOffline(true);

    document.querySelector('.try-again').addEventListener('click', function(e) {
        toggleOffline();
    }, false);

    var languages = ['cs', 'de', 'en-US', 'es', 'fr', 'ga-IE', 'it', 'pl', 'pt-BR'];

    var lang_expander = {
        en: 'en-US',
        pt: 'pt-BR'
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
    var qs_lang = /[\?&]lang=([\w\-]+)/i.exec(window.location.search);
    var locale = get_locale((qs_lang && qs_lang[1]) || navigator.language);

    var translations = {
        'offline-message': {
            'cs': 'Omlouváme se, ale pro přístup k Marketplace musíte být online.',
            'de': 'Es tut uns Leid, Sie müssen online sein, um auf den Marktplatz zugreifen zu können.',
            'es': 'Disculpa, debes tener una conexión a internet para acceder al Marketplace.',
            'fr': 'Désolé, vous devez être en ligne pour accéder au Marketplace.',
            'it': 'Devi essere in linea per accedere al Marketplace.',
            'pl': 'Przepraszamy, musisz być online, by mieć dostęp do Marketplace.',
            'pt-BR': 'Lamentamos, mas você precisa estar on-line para acessar o Marketplace.'
        },
        'try-again': {
            'cs': 'Zkusit znovu',
            'de': 'Erneut versuchen',
            'es': 'Probar de nuevo',
            'fr': 'Réessayer',
            'it': 'Prova di nuovo',
            'pl': 'Spróbuj ponownie',
            'pt-BR': 'Tente novamente'
        }
    };

    var transName;
    var transBlocks = document.querySelectorAll('[data-l10n]');
    for (var i = 0; i < transBlocks.length; i++) {
        transName = transBlocks[i].dataset.l10n;
        if (locale in translations[transName]) {
            transBlocks[i].innerHTML = translations[transName][locale];
        }
    }

})();
