define('categories', ['core/l10n'], function(l10n) {
    'use strict';
    var gettext = l10n.gettext;

    return [
        {slug: 'games', name: gettext('Games')},
        {slug: 'books', name: gettext('Books')},
        {slug: 'business', name: gettext('Business')},
        {slug: 'education', name: gettext('Education')},
        {slug: 'entertainment', name: gettext('Entertainment')},
        {slug: 'health-fitness', name: gettext('Health & Fitness')},
        {slug: 'lifestyle', name: gettext('Lifestyle')},
        {slug: 'maps-navigation', name: gettext('Maps & Navigation')},
        {slug: 'music', name: gettext('Music')},
        {slug: 'news-weather', name: gettext('News & Weather')},
        {slug: 'photo-video', name: gettext('Photo & Video')},
        {slug: 'productivity', name: gettext('Productivity')},
        {slug: 'reference', name: gettext('Reference')},
        {slug: 'shopping', name: gettext('Shopping')},
        {slug: 'social', name: gettext('Social')},
        {slug: 'sports', name: gettext('Sports')},
        {slug: 'travel', name: gettext('Travel')},
        {slug: 'utilities', name: gettext('Utilities')}
    ];
});
