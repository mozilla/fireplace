function get_locale(locale) {
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

function install() {
    var transName;
    var transBlocks = document.querySelectorAll('[data-l10n]');
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
    for (var i = 0; i < transBlocks.length; i++) {
        transName = transBlocks[i].dataset.l10n;
        if (transName in translations && locale in translations[transName]) {
            transBlocks[i].innerHTML = translations[transName][locale];
        }
    }
}

module.exports = {
    install: install,
};
