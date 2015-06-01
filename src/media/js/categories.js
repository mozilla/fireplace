define('categories', ['core/l10n'], function(l10n) {
    'use strict';
    var gettext = l10n.gettext;

    return [
        {slug: 'games', name: gettext('Games')},
        {slug: 'books-comics', name: gettext('Books & Comics')},
        {slug: 'business', name: gettext('Business')},
        {slug: 'education', name: gettext('Education')},
        {slug: 'entertainment', name: gettext('Entertainment')},
        {slug: 'food-drink', name: gettext('Food & Drink')},
        {slug: 'health-fitness', name: gettext('Health & Fitness')},
        {slug: 'humor', name: gettext('Humor')},
        {slug: 'internet', name: gettext('Internet')},
        {slug: 'kids', name: gettext('Kids')},
        {slug: 'lifestyle', name: gettext('Lifestyle')},
        {slug: 'maps-navigation', name: gettext('Maps & Navigation')},
        {slug: 'music', name: gettext('Music')},
        {slug: 'news', name: gettext('News')},
        {slug: 'personalization', name: gettext('Personalization')},
        {slug: 'photo-video', name: gettext('Photo & Video')},
        {slug: 'productivity', name: gettext('Productivity')},
        {slug: 'reference', name: gettext('Reference')},
        {slug: 'science-tech', name: gettext('Science & Tech')},
        {slug: 'shopping', name: gettext('Shopping')},
        {slug: 'social', name: gettext('Social')},
        {slug: 'sports', name: gettext('Sports')},
        {slug: 'travel', name: gettext('Travel')},
        {slug: 'utilities', name: gettext('Utilities')},
        {slug: 'weather', name: gettext('Weather')}
    ];
});
