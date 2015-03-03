/* This is a shared file between Fireplace and Transonic. */
define('edbrands',
    ['core/l10n'], function(l10n) {
    'use strict';
    var ngettext = l10n.ngettext;

    function get_brand_type(slug, numApps) {
        /*
        Passed the slug of an editorial brand and the number of apps it
        contains, will return the translated name of that brand.

        If no arguments are passed, will returns an array of all slugs of all
        editorial brands.

        Example (assuming en_US is the active language):
        >>> get_brand_type()
        ['apps-for-albania', 'apps-for-argentina', ...]
        >>> get_brand_type('hidden-gem', 1)
        'Hidden Gem'
        >>> get_brand_type('hidden-gem', 2)
        'Hidden Gems'
        */

        if (!arguments.length) {
            slug = null;
            numApps = 1;
        }

        // Do not change these translations unless you know what you're doing;
        // you will almost certainly muck up the alignment with their translations.
        // If you wish to change how they are displayed to users, use Verbatim.
        var brand_types = {
            'apps-for-albania': ngettext('App for Albania', 'Apps for Albania', {n: numApps}),
            'apps-for-argentina': ngettext('App for Argentina', 'Apps for Argentina', {n: numApps}),
            'apps-for-bangladesh': ngettext('App for Bangladesh', 'Apps for Bangladesh', {n: numApps}),
            'apps-for-brazil': ngettext('App for Brazil', 'Apps for Brazil', {n: numApps}),
            'apps-for-bulgaria': ngettext('App for Bulgaria', 'Apps for Bulgaria', {n: numApps}),
            'apps-for-chile': ngettext('App for Chile', 'Apps for Chile', {n: numApps}),
            'apps-for-china': ngettext('App for China', 'Apps for China', {n: numApps}),
            'apps-for-colombia': ngettext('App for Colombia', 'Apps for Colombia', {n: numApps}),
            'apps-for-costa-rica': ngettext('App for Costa Rica', 'Apps for Costa Rica', {n: numApps}),
            'apps-for-croatia': ngettext('App for Croatia', 'Apps for Croatia', {n: numApps}),
            'apps-for-czech-republic': ngettext('App for Czech Republic', 'Apps for Czech Republic', {n: numApps}),
            'apps-for-ecuador': ngettext('App for Ecuador', 'Apps for Ecuador', {n: numApps}),
            'apps-for-el-salvador': ngettext('App for El Salvador', 'Apps for El Salvador', {n: numApps}),
            'apps-for-france': ngettext('App for France', 'Apps for France', {n: numApps}),
            'apps-for-germany': ngettext('App for Germany', 'Apps for Germany', {n: numApps}),
            'apps-for-greece': ngettext('App for Greece', 'Apps for Greece', {n: numApps}),
            'apps-for-hungary': ngettext('App for Hungary', 'Apps for Hungary', {n: numApps}),
            'apps-for-india': ngettext('App for India', 'Apps for India', {n: numApps}),
            'apps-for-italy': ngettext('App for Italy', 'Apps for Italy', {n: numApps}),
            'apps-for-japan': ngettext('App for Japan', 'Apps for Japan', {n: numApps}),
            'apps-for-macedonia': ngettext('App for Macedonia', 'Apps for Macedonia', {n: numApps}),
            'apps-for-mexico': ngettext('App for Mexico', 'Apps for Mexico', {n: numApps}),
            'apps-for-montenegro': ngettext('App for Montenegro', 'Apps for Montenegro', {n: numApps}),
            'apps-for-nicaragua': ngettext('App for Nicaragua', 'Apps for Nicaragua', {n: numApps}),
            'apps-for-panama': ngettext('App for Panama', 'Apps for Panama', {n: numApps}),
            'apps-for-peru': ngettext('App for Peru', 'Apps for Peru', {n: numApps}),
            'apps-for-poland': ngettext('App for Poland', 'Apps for Poland', {n: numApps}),
            'apps-for-russia': ngettext('App for Russia', 'Apps for Russia', {n: numApps}),
            'apps-for-serbia': ngettext('App for Serbia', 'Apps for Serbia', {n: numApps}),
            'apps-for-south-africa': ngettext('App for South Africa', 'Apps for South Africa', {n: numApps}),
            'apps-for-spain': ngettext('App for Spain', 'Apps for Spain', {n: numApps}),
            'apps-for-uruguay': ngettext('App for Uruguay', 'Apps for Uruguay', {n: numApps}),
            'apps-for-venezuela': ngettext('App for Venezuela', 'Apps for Venezuela', {n: numApps}),
            'arts-entertainment': ngettext('Arts & Entertainment App', 'Arts & Entertainment Apps', {n: numApps}),
            'book': ngettext('Featured Book App', 'Featured Book Apps', {n: numApps}),
            'creativity': ngettext('Featured Creativity App', 'Featured Creativity Apps', {n: numApps}),
            'education': ngettext('Featured Education App', 'Featured Education Apps', {n: numApps}),
            'games': ngettext('Featured Game', 'Featured Games', {n: numApps}),
            'groundbreaking': ngettext('Groundbreaking App', 'Groundbreaking Apps', {n: numApps}),
            'health-fitness': ngettext('Health & Fitness App', 'Health & Fitness Apps', {n: numApps}),
            'hidden-gem': ngettext('Hidden Gem', 'Hidden Gems', {n: numApps}),
            'lifestyle': ngettext('Featured Lifestyle App', 'Featured Lifestyle Apps', {n: numApps}),
            'local-favorite': ngettext('Local Favorite App', 'Local Favorite Apps', {n: numApps}),
            'maps-navigation': ngettext('Maps & Navigation App', 'Maps & Navigation Apps', {n: numApps}),
            'music': ngettext('Featured Music App', 'Featured Music Apps', {n: numApps}),
            'mystery-app': ngettext('Mystery App!', 'Mystery Apps!', {n: numApps}),
            'news-weather': ngettext('News & Weather App', 'News & Weather Apps', {n: numApps}),
            'photo-video': ngettext('Photo & Video App', 'Photo & Video Apps', {n: numApps}),
            'shopping': ngettext('Featured Shopping App', 'Featured Shopping Apps', {n: numApps}),
            'social': ngettext('Featured Social App', 'Featured Social Apps', {n: numApps}),
            'sports': ngettext('Featured Sports App', 'Featured Sports Apps', {n: numApps}),
            'tools-time-savers': ngettext('Tool & Time Saver', 'Tools & Time Savers', {n: numApps}),
            'travel': ngettext('Featured Travel App', 'Featured Travel Apps', {n: numApps}),
            'work-business': ngettext('Work & Business App', 'Work & Business Apps', {n: numApps})
        };
        if (slug) {
            return brand_types[slug];
        }
        return Object.keys(brand_types);
    }

    return {
        BRAND_TYPES: get_brand_type(),
        get_brand_type: get_brand_type,
    };
});
