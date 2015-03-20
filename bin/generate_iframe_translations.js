#!/usr/bin/env node 

var languages = [
 'bg', 'bn-BD', 'ca', 'cs', 'da', 'de', 'el', 'en-US', 'es', 'eu', 'fr',
 'ga-IE', 'hr', 'hu', 'it', 'ja', 'ko', 'mk', 'nb-NO', 'nl', 'pa',
 'pl', 'pt-BR', 'ro', 'ru', 'sk', 'sq', 'sr', 'sr-Latn', 'ta', 'tr',
 'xh', 'zh-CN', 'zh-TW', 'zu', 'dbg'
];
global.navigator = {};
global.to_translate = {
    'offline-error-message': 'Sorry, you need to be online to access the Marketplace.',
    'date-error-message': 'Sorry, your device clock appears to be set incorrectly.',
    'date-error-message-suggestion': 'Please set today\'s date and time in your device settings to access the Marketplace.',
    'try-again': 'Try again',
};
global.data = {};

function find_translation(key) {
    var english_str = to_translate[key];
    var translated_str = navigator.l10n.strings[english_str];
    if (translated_str && translated_str.body) {
        return translated_str.body;
    }
}

languages.forEach(function(language) {
    var translation; 
    require('../src/media/locales/' + language + '.js');
    Object.keys(to_translate).forEach(function(key) {
        var translation = find_translation(key);
        if (translation) {
            if (data[key] === undefined) {
                data[key] = {};
            }
            data[key][language] = translation;
        }
    });
});

console.log(JSON.stringify(data));

