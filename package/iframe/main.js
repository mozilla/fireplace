(function() {
    function log() {
        // `console.log` wrapper that prefixes log statements.
        console.log('[yulelog]', Array.prototype.slice.call(arguments, 0).join(' '));
    }

    // No trailing slash, please.
    var MKT_URL = '{domain}';
    log('MKT_URL:', MKT_URL);

    var activitiesToSend = [];
    var activitiesInProgress = {};

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

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    var profile = '';

    // Bump this number every time you add a feature. It must match zamboni's
    // settings.APP_FEATURES_VERSION.
    var APP_FEATURES_VERSION = 8;

    function buildFeaturesPromises() {
        var promises = [];
        // The order matters - we'll push promises in the same order to
        // generate the features signature.
        var features = [
            // false,  // Hardcoded boolean value.
            // 'mozApps' in navigator,  // Dynamic boolean value.
            // ['hardware.memory', 512],  // getFeature() with comparison.
            // 'api.window.MozMobileNetworkInfo',  // hasFeature().

            // We are only interested in a few features for now. We're already
            // only doing this if getFeature() is present, and it was
            // introduced in 2.0, so we know we can hardcode anything that
            // comes with 2.0 or better and for which we don't need to know the
            // exact value. This sucks, won't scale, and we need a better
            // long-term solution, but for now it helps us work the fact that
            // hasFeature() does not exist in 2.0 :(
            true, // 'getMobileIdAssertion' in window.navigator || 'api.window.Navigator.getMobileIdAssertion',
            true, // 'manifest.precompile',
            ['hardware.memory', 512],
            ['hardware.memory', 1024],
            true, // NFC
            'acl.version',
            // Don't add any more as long as bug 1172487 is not fixed, it won't
            // work correctly.
        ];

        features.forEach(function(key) {
            if (typeof key === 'boolean') {
                // Hardcoded boolean value, just pass it to promises directly.
                promises.push(key);
            }
            else if (typeof key === 'string') {
                if (key.substr(0, 9) === 'manifest.' ||
                    key === 'acl.version') {
                    // Handle cases where we need to call getFeature() instead
                    // of just hasFeature().
                    // It's necessary in 2 cases:
                    // - The `manifest.*` properties ; Because of bug 1098470,
                    //   hasFeature(manifest.*) can fail, while
                    //   getFeature(manifest.*) will work. On later builds,
                    //   where this bug was fixed, the behaviour is reversed
                    //   so we call hasFeature() first and *then* getFeature()
                    //   if it returned a falsy value.
                    // - The `acl.version` property, which is only available
                    //   through getFeature().
                    promises.push(new Promise(function(resolve, reject) {
                        navigator.hasFeature(key).then(function(supported) {
                            if (!supported) {
                                navigator.getFeature(key).then(function(feat) {
                                    resolve(feat);
                                });
                            } else {
                                resolve(supported);
                            }
                        });
                    }));
                } else {
                    // Regular case: just call hasFeature().
                    promises.push(navigator.hasFeature(key));
                }
            }
            else {
                // We are dealing with a more complex case, where we need to
                // call getFeature() and compare against a value.
                var feature = key[0];
                var value = key[1];
                // We need to wrap the getFeature() Promise into one of our own
                // that does the comparison, so that we can just call
                // Promise.all later and get only booleans.
                promises.push(new Promise(function(resolve, reject) {
                    navigator.getFeature(feature).then(function(data) {
                        resolve(data >= value);
                    });
                }));
            }
        });
        return Promise.all(promises);
    }

    function buildIframeWithFeatureProfile() {
        buildFeaturesPromises().then(function(promises) {
            // Build the signature:
            // - First, get a binary representation of all the feature flags.
            //   the first 47 (!) are currently hardcoded as true.
            var hardcoded_signature_part = '11111111111111111111111111111111111111111111111';
            var features_int = parseInt(
                hardcoded_signature_part +
                promises.map(function(x) { return !!x ? '1' : '0'; }).join(''),
            2);
            profile = [
                // First part is the hexadecimal string built from the array
                // containing the results from all the promises (which should
                // only be booleans);
                features_int.toString(16),
                // Second part is the number of features checked. The hardcoded
                // features are added to the number of promises we checked.
                promises.length + hardcoded_signature_part.length,
                // Last part is a hardcoded version number, to bump whenever
                // we make changes.
                APP_FEATURES_VERSION
            ].join('.');

            log('Generated profile: ' + profile);

            // Now that we have a feature profile, build the iframe with it.
            buildIframe();
        });
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
                    // Testing lastKnownHomeNetwork first is important, because it's the
                    // only one which contains the SPN.
                    network = (connData.lastKnownHomeNetwork || connData.lastKnownNetwork || '-').split('-');
                    log('navigator.mozMobileConnections[' + i + '].lastKnownNetwork:',
                        connData.lastKnownNetwork);
                    log('navigator.mozMobileConnections[' + i + '].lastKnownHomeNetwork:',
                        conn.lastKnownHomeNetwork);
                    mccs.push({mcc: network[0], mnc: network[1], spn: network[2]});
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

        if (profile) {
            qs.push('pro=' + profile);
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
        // Build the iframe. If we have Promise and getFeature, we build the
        // profile signature first.
        if (typeof window.Promise !== 'undefined' &&
            typeof navigator.getFeature !== 'undefined') {
            log('navigator.getFeature and window.Promise available');
            buildIframeWithFeatureProfile();
        } else {
            log('navigator.getFeature or window.Promise unavailable :(');
            buildIframe();
        }

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
            log('Activity name: ', req.source.name);
            log('Activity data: ', JSON.stringify(req.source.data));
            var msg = {
                name: req.source.name,
                data: req.source.data
            };
            if (req.source.name === 'marketplace-openmobile-acl') {
                // For each activity expecting a returnValue (at the moment
                // only "marketplace-openmobile-acl", keep the request around,
                // generating an unique id. When we receive back a message
                // saying an activity is done, if the id matches one we have,
                // post the result back to the activity caller).
                msg.id = getRandomInt(0, Number.MAX_SAFE_INTEGER);
                activitiesInProgress[msg.id] = req;
                log('This activity needs to return, generated id: ', msg.id);
                // 'marketplace-openmobile-acl' also needs to wait on a
                // getFeature() promise before sending the activity message.
                if (typeof navigator.getFeature !== 'undefined') {
                    navigator.getFeature('acl.version').then(function(val) {
                        log('Sending activity with acl.version: ', val);
                        msg.data.acl_version = val;
                        activitiesToSend.push(msg);
                    });
                }
                // Don't bother sending this one if getFeature() is absent.
                return;
            }
            activitiesToSend.push(msg);
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
        } else if (e.data.type === 'fxa-watch') {
            log('Registering FxA callbacks');
            navigator.mozId.watch({
                wantIssuer: 'firefox-accounts',
                loggedInUser: e.data.email,
                onready: function() {},
                onlogin: function(a) {log('fxa-login'); postMessage({type: 'fxa-login', assertion: a});},
                onlogout: function() {log('fxa-logout'); postMessage({type: 'fxa-logout'});}
            });
        } else if (e.data.type === 'fxa-request') {
            navigator.mozId.request({oncancel: function(){postMessage({type: 'fxa-cancel'});}});
        } else if (e.data.type == 'activity-result' && e.data.id && activitiesInProgress[e.data.id]) {
            log('Posting back result for activity id:', e.data.id);
            activitiesInProgress[e.data.id].postResult(e.data.result);
            delete activitiesInProgress[e.data.id];
        } else if (e.data.type == 'activity-error' && e.data.id && activitiesInProgress[e.data.id]) {
            log('Posting back error for activity id:', e.data.id);
            activitiesInProgress[e.data.id].postError(e.data.result);
            delete activitiesInProgress[e.data.id];
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

    var languages = [
        'bg', 'bn-BD', 'ca', 'cs', 'da', 'de', 'el', 'en-US', 'es', 'eu', 'fr',
        'ga-IE', 'hr', 'hu', 'it', 'ja', 'ko', 'mk', 'nb-NO', 'nl', 'pa',
        'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sq', 'sr', 'sr-Latn', 'ta', 'tr',
        'xh', 'zh-CN', 'zh-TW', 'zu', 'dbg'
    ];

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
    var qs_lang = /[\?&]lang=([\w\-]+)/i.exec(window.location.search);
    var locale = get_locale((qs_lang && qs_lang[1]) || navigator.language);

    var translations = {
        "offline-error-message": {
            "bg": "Извинявайте, трябва да сте свързани към мрежа, за да посетите Marketplace.",
            "cs": "Omlouváme se, ale pro přístup k Marketplace musíte být online.",
            "da": "Du skal være online for at få adgang til Marketplace.",
            "de": "Es tut uns leid, Sie müssen online sein, um auf den Marketplace zuzugreifen.",
            "el": "Λυπούμαστε, πρέπει να είστε συνδεδεμένοι στο διαδίκτυο για να χρησιμοποιήσετε το Marketplace.",
            "en-US": "Sorry, you need to be online to access the Marketplace.",
            "es": "Lo sentimos, necesitas estar conectado para acceder al Marketplace.",
            "eu": "Sentitzen dugu, Marketplace-era sartzeko linean egon behar duzu.",
            "fr": "Vous devez être en ligne pour accéder au Marketplace.",
            "hu": "Elnézést, a Marketplace eléréséhez internetkapcsolat szükséges.",
            "it": "Spiacenti, devi essere online per poter accedere al Marketplace.",
            "ja": "申し訳ありませんが、Marketplace へアクセスするにはインターネット接続が必要です。",
            "nb-NO": "Du må være tilkoblet for å få tilgang til Marketplace.",
            "nl": "Sorry, u dient online te zijn om de Marketplace te bezoeken.",
            "pa": "ਅਫਸੋਸ, ਮੰਡੀ ਵਰਤਣ ਲਈ ਤੁਹਾਨੂੰ ਆਨਲਾਈਨ ਹੋਣ ਦੀ ਲੋੜ ਹੈ।",
            "pl": "Przepraszamy, musisz być online, by mieć dostęp do Marketplace.",
            "pt-BR": "Desculpe, você precisa estar on-line para acessar o Marketplace.",
            "ru": "Для доступа к Marketplace вам необходимо подключиться к сети.",
            "sk": "Ospravedlňujeme sa, ale pre prístup k službe Marketplace musíte byť online.",
            "sq": "Na ndjeni, lypset të jeni i lidhur në linjë për të përdorur Marketplace-in.",
            "sr": "Жао нам је, морате бити на мрежи да бисте приступили Marketplace-у.",
            "sr-Latn": "Žao nam je, morate biti na mreži da biste pristupili Marketplace-u.",
            "tr": "Üzgünüz, Marketplace'e erişmek için çevrimiçi olmalısınız.",
            "xh": "Uxolo, kudingeka ube kwi-intaneti ukufikelela kwi-Marketplace",
            "zh-CN": "抱歉，您需要在线才能访问应用市场。",
            "zh-TW": "抱歉，您必須連線到網路才能使用 Marketplace。",
            "zu": "Siyaxolisa, kudingeka ukuthi ube semoyeni ukuze ukwazi ukufinyelela ku-Marketplace.",
            "dbg": "Şǿřřẏ, ẏǿŭ ƞḗḗḓ ŧǿ ƀḗ ǿƞŀīƞḗ ŧǿ ȧƈƈḗşş ŧħḗ Ḿȧřķḗŧƥŀȧƈḗ."
        },
        "date-error-message": {
            "bg": "Извинявайте, часовникът на устройството е неточен.",
            "cs": "Omlouváme se, ale čas na vašem zařízení není nastaven korektně.",
            "da": "Beklager, men uret på din enhed ser ud til at være forkert indstillet.",
            "de": "Es tut uns leid, die Uhr Ihres Geräts scheint falsch eingestellt zu sein.",
            "el": "Λυπούμαστε, το ρολόι της συσκευής σας έχει ρυθμιστεί λανθασμένα. ",
            "en-US": "Sorry, your device clock appears to be set incorrectly.",
            "es": "Lo sentimos, el reloj de tu dispositivo parece estar configurado incorrectamente.",
            "eu": "Sentitzen dugu, dirudienez zure gailuaren erlojua gaizki konfiguratuta dago.",
            "fr": "Désolé, il semblerait que l'horloge de votre périphérique ne soit pas correctement configurée.",
            "hu": "Elnézést, úgy tűnik a készülék órája nem jól jár.",
            "it": "Spiacenti, l’orologio del dispositivo in uso sembra non essere impostato correttamente.",
            "ja": "申し訳ありませんが、お使いの端末の時刻設定が正しくないようです。",
            "nb-NO": "Beklager, men klokken på din enhet ser ut til å være feilinnstilt.",
            "nl": "Sorry, uw apparaatklok lijkt niet juist te zijn ingesteld.",
            "pa": "ਅਫਸੋਸ, ਤੁਹਾਡੇ ਯੰਤਰ ਦੀ ਘੜੀ ਗਲਤ ਚੱਲਦੀ ਜਾਪਦੀ ਹੈ।",
            "pl": "Przepraszamy, wygląda na to, że zegar twojego urządzenia jest ustawiony niepoprawnie.",
            "pt-BR": "Desculpe, o relógio do seu aparelho parece estar configurado incorretamente.",
            "ru": "К сожалению, похоже, что часы на вашем устройстве установлены неправильно.",
            "sk": "Ospravedlňujeme sa, ale čas na vašom zariadení nie je nastavený správne.",
            "sq": "Na ndjeni, ora e pajisjes suaj duket se nuk është rregulluar saktë.",
            "sr": "Жао нам је, изгледа да је Ваш сат уређаја погрешно подешен.",
            "sr-Latn": "Žao nam je, izgleda da je Vaš sat uređaja pogrešno podešen.",
            "tr": "Üzgünüz, cihazınızın saati yanlış ayarlanmış görünüyor.",
            "xh": "Uxolo, ixesha lesixhobo sakho libonakala lisetwe ngokungachanekanga.",
            "zh-CN": "抱歉，您的设备时钟似乎有误。",
            "zh-TW": "抱歉，您的裝置時間錯誤。",
            "zu": "Siyaxolisa, kubonakala sengathi iwashi ledivayisi yakho alihambi kahle.",
            "dbg": "Şǿřřẏ, ẏǿŭř ḓḗṽīƈḗ ƈŀǿƈķ ȧƥƥḗȧřş ŧǿ ƀḗ şḗŧ īƞƈǿřřḗƈŧŀẏ."
        },
        "date-error-message-suggestion": {
            "bg": "Моля, настройте датата и часа на устройството ви, за да посетите Marketplace.",
            "cs": "Pro přístup k Marketplace si prosím nastavte na svém zařízení aktuální datum a čas.",
            "da": "Indstil dags dato og klokkeslæt på din enhed for at få adgang til Marketplace.",
            "de": "Bitte stellen Sie in Ihren Geräteeinstellungen das heutige Datum und die Uhrzeit ein, um auf den Marketplace zuzugreifen.",
            "el": "Παρακαλούμε ρυθμίστε την σημερινή ημερομηνία και ώρα από τις ρυθμίσεις της συσκευής σας, για να αποκτήσετε πρόσβαση στο Marketplace.",
            "en-US": "Please set today's date and time in your device settings to access the Marketplace.",
            "es": "Por favor establece la fecha y hora de hoy en las opciones de tu dispositivo para poder acceder a Marketplace.",
            "eu": "Ezarri gaurko eguna eta ordua zure gailuaren ezarpenetan Marketplace-era sartzeko.",
            "fr": "Merci de configurer correctement la date et l'heure dans les paramètres de votre appareil pour pouvoir accéder au Marketplace.",
            "hu": "Állítsa be a mai dátumot és időt a készülék beállításaiban a Marketplace eléréséhez.",
            "it": "Imposta ora e data correnti nelle impostazioni del dispositivo per accedere al Marketplace.",
            "ja": "端末の設定で現在の日時を正しく設定してから Marketplace へアクセスしてください。",
            "nb-NO": "Sett dagens dato og klokkeslett i enhetsinnstillingene for å få tilgang til Marketplace.",
            "nl": "Stel in uw apparaatinstellingen de datum en tijd van vandaag in om de Marketplace te benaderen.",
            "pa": "ਮੰਡੀ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ ਆਪਣੇ ਯੰਤਰ ਦੀ ਸੈਟਿੰਗ ਵਿੱਚ ਅੱਜ ਦਾ ਸਮਾਂ ਤੇ ਮਿਤੀ ਦਿਉ।",
            "pl": "Ustaw dzisiejszą datę i czas w ustawieniach swojego urządzenia, by mieć dostęp do Marketplace.",
            "pt-BR": "Por favor, atualize a data e a hora do seu aparelho para acessar o Marketplace.",
            "ru": "Пожалуйста, установите текущую дату и время в настройках вашего устройства для доступа к Marketplace.",
            "sk": "Pre prístup k službe Marketplace si prosím nastavte na svojom zariadení aktuálny dátum a čas.",
            "sq": "Ju lutemi, që të përdorni Marketplace-in, rregulloni te pajisja juaj datën e sotme dhe orën e tanishme.",
            "sr": "Молимо подесите данашњи датум и време у поставкама Вашег уређаја да бисте приступили Marketplace-у.",
            "sr-Latn": "Molimo podesite današnji datum i vreme u postavkama Vašeg uređaja da biste pristupili Marketplace-u.",
            "tr": "Marketplace'e erişmek için lütfen cihaz ayarlarınızdan bugünün tarihini ve saatini ayarlayın.",
            "xh": "Nceda usete umhla nexesha lanamhlanje kwiisetingi zesixhobo sakho ukufikelela kwi-Marketplace.",
            "zh-CN": "请在您的设备设置中设置今天的日期和时间以访问应用市场。",
            "zh-TW": "請將您的裝置時間設定至今天以使用 Marketplace。",
            "zu": "Uyacelwa usethe usuku lwanamuhla kanye nesikhathi kumasethingi edivayisi yakho ukuze ukwazi ukufinyelela ku-Marketplace.",
            "dbg": "Ƥŀḗȧşḗ şḗŧ ŧǿḓȧẏ'ş ḓȧŧḗ ȧƞḓ ŧīḿḗ īƞ ẏǿŭř ḓḗṽīƈḗ şḗŧŧīƞɠş ŧǿ ȧƈƈḗşş ŧħḗ Ḿȧřķḗŧƥŀȧƈḗ."
        },
        "try-again": {
            "bg": "Повторен опит",
            "cs": "Zkusit znovu",
            "da": "Prøv igen",
            "de": "Erneut versuchen",
            "el": "Προσπαθήστε ξανά",
            "en-US": "Try again",
            "es": "Intenta de nuevo",
            "eu": "Saiatu berriro",
            "fr": "Réessayer",
            "hu": "Újra",
            "it": "Riprova",
            "ja": "再読み込み",
            "nb-NO": "Prøv igjen",
            "nl": "Opnieuw proberen",
            "pa": "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
            "pl": "Spróbuj ponownie",
            "pt-BR": "Tente novamente",
            "ru": "Попробовать снова",
            "sk": "Skúsiť znova",
            "sq": "Riprovoni",
            "sr": "Покушај поново",
            "sr-Latn": "Pokušaj ponovo",
            "tr": "Tekrar dene",
            "xh": "Zama kwakhona",
            "zh-CN": "重试",
            "zh-TW": "重試",
            "zu": "Zama futhi",
            "dbg": "Ŧřẏ ȧɠȧīƞ"
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
