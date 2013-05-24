(function() {

  // When refocussing the app, toggle the iframe based on `navigator.onLine`.
  window.addEventListener('focus', toggleOffline, false);

  function toggleOffline() {
    console.log('Checking for network connection...')
    if (navigator.onLine === false) {
      // Hide iframe.
      console.log('Network connection not found; hiding iframe ...')
      document.body.classList.add('offline');
    } else {
      // Show iframe.
      console.log('Network connection found; showing iframe ...')
      document.body.classList.remove('offline');
    }
  }

  toggleOffline();

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
    transName = transBlocks[i].getAttribute('data-l10n');
    if (locale in translations[transName]) {
      transBlocks[i].innerHTML = translations[transName][locale];
    }
  }

  try {
    var conn = navigator.mozMobileConnection;
    var qs = '';
    if (conn) {
      // `MCC`: Mobile Country Code
      // `MNC`: Mobile Network Code
      // `lastKnownNetwork`: `{MCC}-{MNC}`.
      var network = (conn.lastKnownNetwork || conn.lastKnownHomeNetwork || '-').split('-');
      qs = '?mcc=' + (network[0] || '') + '&mnc=' + (network[1] || '');
      console.log('MCC: "' + network[0] + '"');
      console.log('MNC: "' + network[1] + '"');
    }
  } catch(e) {
    // Fail gracefully if `navigator.mozMobileConnection` gives us problems.
  }
  var i = document.createElement('iframe');
  i.seamless = true;
  i.onerror = function() {
      document.body.classList.add('offline');
  };
  i.src = 'https://marketplace.firefox.com/' + qs;
  document.body.appendChild(i);
})();
