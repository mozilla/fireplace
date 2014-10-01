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

    function buildQS() {
        var qs = [];

        try {
            // navigator.mozMobileConnections is the new API.
            // navigator.mozMobileConnection is the legacy API.
            var conn = navigator.mozMobileConnections;
            var network;
            if (conn) {
                log('navigator.mozMobileConnections available');
                var mccs = [];
                var connData;
                for (var i = 0; i < conn.length; i++) {
                    connData = conn[i];
                    network = (connData.lastKnownHomeNetwork || connData.lastKnownNetwork || '-').split('-');
                    log('navigator.mozMobileConnections[' + i + '].lastKnownNetwork:',
                        connData.lastKnownNetwork);
                    log('navigator.mozMobileConnections[' + i + '].lastKnownHomeNetwork:',
                        conn.lastKnownHomeNetwork);
                    mccs.push({mcc: network[0], mnc: network[1]});
                }
                mccs = JSON.stringify(mccs);
                qs.push('mccs=' + mccs);
                log('MCCs: ' + mccs);
            } else {
                log('navigator.mozMobileConnections unavailable');

                // Yes. This should be assignment not comparison.
                if (conn = navigator.mozMobileConnection) {
                    log('navigator.mozMobileConnection available');
                    // `MCC`: Mobile Country Code
                    // `MNC`: Mobile Network Code
                    // `lastKnownHomeNetwork`: `{MCC}-{MNC}` (SIM's origin)
                    // `lastKnownNetwork`: `{MCC}-{MNC}` (could be different network if roaming)
                    network = (conn.lastKnownHomeNetwork || conn.lastKnownNetwork || '-').split('-');
                    qs.push('mcc=' + (network[0] || ''));
                    qs.push('mnc=' + (network[1] || ''));
                    log('navigator.mozMobileConnection.lastKnownNetwork:',
                        conn.lastKnownNetwork);
                    log('navigator.mozMobileConnection.lastKnownHomeNetwork:',
                        conn.lastKnownHomeNetwork);
                    log('MCC: "' + network[0] + '", MNC: "' + network[1] + '"');
                } else {
                    log('navigator.mozMobileConnection unavailable');
                }
            }
        } catch(e) {
            // Fail gracefully if `navigator.mozMobileConnection(s)`
            // gives us problems.
        }

        if ('id' in navigator) {
            qs.push('nativepersona=true');
        }

        return qs.join('&');
    }

    // The iframe src is served over https, which means that if the system date
    // is too far behind, the user will just end up seeing a certificate error.
    // We check against an hardcoded year corresponding to the current certificate
    // creation date, and display an error message if necessary.
    function isSystemDateIncorrect() {
        log('Checking for system date ...');
        var rval = new Date().getFullYear() < 2014;
        if (rval) {
            log('System date appears to be incorrect!');
        } else {
            log('System date appears to be OK.');
        }
        return rval;
    }

    if (isSystemDateIncorrect()) {
        document.body.classList.add('dateerror');

        document.querySelector('.try-again').addEventListener('click', function() {
            if (!isSystemDateIncorrect()) {
                window.location.reload();
            }
        }, false);
    } else {
        buildIframe();

        // When refocussing the app, toggle the iframe based on `navigator.onLine`.
        window.addEventListener('focus', toggleOffline, false);

        toggleOffline(true);

        document.querySelector('.try-again').addEventListener('click', function() {
            toggleOffline();
        }, false);
    }

    function buildIframe() {
        // Add the iframe with the actual Marketplace to the document.
        var iframeSrc = MKT_URL + '/?' + buildQS();
        var i = document.createElement('iframe');
        i.seamless = true;
        i.onerror = function() {
            document.body.classList.add('offline');
        };
        i.src = iframeSrc;
        document.body.appendChild(i);
    }

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

    var languages = ['it', 'dbg', 'cs', 'el', 'en-US', 'eu', 'es', 'ru', 'nl', 'pt', 'pa', 'pl', 'fr', 'zh-TW', 'pt-BR', 'de', 'da', 'hu', 'ja', 'zh-CN', 'sr', 'sv', 'sv-SE', 'sk', 'uk', 'sr-Latn'];

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
            'it': 'Attualmente risulti non in linea. Riprova più tardi.',
            'dbg': 'Şǿřřẏ, ẏǿŭ ȧřḗ ƈŭřřḗƞŧŀẏ ǿƒƒŀīƞḗ. Ƥŀḗȧşḗ ŧřẏ ȧɠȧīƞ ŀȧŧḗř.',
            'cs': 'Omlouváme se, ale jste aktuálně offline. Zkuste to znovu později.',
            'en-US': 'Sorry, you are currently offline. Please try again later.',
            'eu': 'Sentitzen dugu, une honetan lineaz kanpo zaude. Saiatu berriz geroago.',
            'gl': 'Sentímolo, pero nestes momentos non está conectado. Tente de novo máis tarde.',
            'es': 'Lo sentimos, actualmente estás desconectado. Por favor intenta de nuevo más tarde.',
            'ru': 'К сожалению, вы не подключены к сети. Пожалуйста, повторите попытку позже.',
            'nl': 'Sorry, u bent momenteel offline. Probeer het later nog eens.',
            'pt': 'Lamentamos, mas está desligado da rede. Por favor, tente novamente mais tarde.',
            'tr': 'Şu anda internete bağlı değilsiniz. Lütfen daha sonra tekrar deneyin.',
            'pa': 'ਮੁਆਫ ਕਰਨਾ, ਤੁਸੀਂ ਇਸ ਵੇਲੇ ਆਫਲਾਈਨ ਹੋ। ਬਾਅਦ ਵਿੱਚ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜੀ।',
            'pl': 'Przepraszamy, jesteś teraz w trybie offline. Spróbuj ponownie później.',
            'fr': 'Désolé, vous êtes actuellement hors connexion, veuillez réessayer plus tard.',
            'zh-TW': '抱歉，您目前不在線上，請稍後再試。',
            'pt-BR': 'Desculpe, você está atualmente offline. Por favor, tente novamente mais tarde.',
            'de': 'Es tut uns Leid, Sie sind derzeit offline. Bitte versuchen Sie es später erneut.',
            'da': 'Du er i øjeblikket offline. Prøv igen senere.',
            'el': 'Λυπούμαστε, πρέπει να είστε συνδεδεμένοι στο διαδίκτυο για να χρησιμοποιήσετε το Marketplace',
            'hu': 'Elnézést, nincs internetkapcsolat. Próbálja újra később.',
            'ja': '申し訳ありませんが、現在オフラインです。また後で試してください。',
            'zh-CN': '抱歉，您目前离线，请稍后再试。',
            'sr': 'Жао нам је, тренутно сте ван мреже. Молимо Вас покушајте касније.',
            'sq': 'Na ndjeni, hëpërhë jeni jashtë linje. Ju lutemi, riprovoni më vonë.',
            'ko': '죄송합니다. 오프라인 상태이니 나중에 다시 시도해 주십시오.',
            'sv': 'Tyvärr, du är inte ansluten till internet. Försök igen senare.',
            'sv-SE': 'Tyvärr, du är inte ansluten till internet. Försök igen senare.',
            'sk': 'Prepáčte, ale momentálne ste v režime offline. Prosím vyskúšajte to neskôr.',
            'uk': 'Нажаль, ви зараз поза мережею. Спробуйте знову пізніше.',
            'sr-Latn': 'Žao nam je, trenutno ste van mreže. Molimo Vas pokušajte kasnije.',
        },
        'try-again': {
            'it': 'Riprova',
            'dbg': 'Ŧřẏ ȧɠȧīƞ',
            'cs': 'Zkusit znovu',
            'el': 'Δοκιμάστε ξανά',
            'en-US': 'Try again',
            'eu': 'Saiatu berriro',
            'es': 'Intenta de nuevo',
            'ru': 'Попробовать снова',
            'nl': 'Opnieuw proberen',
            'pt': 'Tentar novamente',
            'pa': 'ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
            'pl': 'Spróbuj ponownie',
            'fr': 'Réessayer',
            'zh-TW': '重試',
            'pt-BR': 'Tente novamente',
            'de': 'Erneut versuchen',
            'da': 'Prøv igen',
            'hu': 'Újra',
            'ja': '再読み込み',
            'zh-CN': '重试',
            'sr': 'Покушај поново',
            'sv': 'Försök igen',
            'sv-SE': 'Försök igen',
            'sk': 'Skúsiť znova',
            'uk': 'Спробувати знову',
            'sr-Latn': 'Pokušaj ponovo',
        }
    };

    var transName;
    var transBlocks = document.querySelectorAll('[data-l10n]');
    for (var i = 0; i < transBlocks.length; i++) {
        transName = transBlocks[i].dataset.l10n;
        if (transName in translations && locale in translations[transName]) {
            transBlocks[i].innerHTML = translations[transName][locale];
        }
    }

})();
