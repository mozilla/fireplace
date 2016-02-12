// This needs to depend on routes and settings_app to ensure that urls.media
// will load the correct URL.
define('content-ratings',
    ['core/format', 'core/l10n', 'core/urls', 'core/utils', 'core/z',
     'routes', 'settings_app'],
    function(format, l10n, urls, utils, z,
             routes, appSettings) {
    'use strict';

    format = format.format;
    var gettext = l10n.gettext;

    function _rating_path(path) {
        return utils.urlparams(
            urls.media('fireplace/img/icons/ratings/' + path),
            {'build': z.body.data('build-id-js') || '0'}
        );
    }

    // Map IARC stuff to their icons. Wow, much icons.
    var rating_icons = {
        'classind': {
            '0': _rating_path('CLASSIND_L.png'),
            '10': _rating_path('CLASSIND_10.png'),
            '12': _rating_path('CLASSIND_12.png'),
            '14': _rating_path('CLASSIND_14.png'),
            '16': _rating_path('CLASSIND_16.png'),
            '18': _rating_path('CLASSIND_18.png'),
        },
        'esrb': {
            '0': _rating_path('ESRB_e.png'),
            '10': _rating_path('ESRB_e10.png'),
            '13': _rating_path('ESRB_t.png'),
            '17': _rating_path('ESRB_m.png'),
            '18': _rating_path('ESRB_ao.png'),
        },
        'generic': {
            '3': _rating_path('generic_3.png'),
            '7': _rating_path('generic_7.png'),
            '12': _rating_path('generic_12.png'),
            '16': _rating_path('generic_16.png'),
            '18': _rating_path('generic_18.png'),
            'pending': _rating_path('generic_rp.png'),
        },
        'pegi': {
            '3': _rating_path('pegi_3.png'),
            '7': _rating_path('pegi_7.png'),
            '12': _rating_path('pegi_12.png'),
            '16': _rating_path('pegi_16.png'),
            '18': _rating_path('pegi_18.png'),
        },
        'usk': {
            '0': _rating_path('USK_0.png'),
            '6': _rating_path('USK_6.png'),
            '12': _rating_path('USK_12.png'),
            '16': _rating_path('USK_16.png'),
            '18': _rating_path('USK_18.png'),
            'rating-refused': _rating_path('USK_RR.png'),
        }
    };

    var detail_links = {
        'classind': 'http://www.culturadigital.br/classind',
        'esrb': 'http://www.esrb.org/ratings/ratings_guide.jsp',
        'generic': 'https://www.globalratings.com/ratings_guide.aspx',
        'pegi': 'http://www.pegi.info/en/index/id/33/',
        'usk': 'http://www.usk.de/iarc0/',
    };

    // L10n: For ages {0} and higher. (de) `ab {0} Jahren`.
    var RATING_NAME = gettext('For ages {0}+');
    var names = {
        bodies: {
            'classind': 'CLASSIND',
            'esrb': 'ESRB',
             // L10n: the generic ratings body.
            'generic': gettext('Generic'),
            'pegi': 'PEGI',
            'usk': 'USK',
        },
        ratings: {
            generic: {
                // L10n: (de) ab 0 Jahren.
                '0': gettext('For all ages'),
                '3': format(RATING_NAME, 3),
                '6': format(RATING_NAME, 6),
                '7': format(RATING_NAME, 7),
                '10': format(RATING_NAME, 10),
                '12': format(RATING_NAME, 12),
                '14': format(RATING_NAME, 14),
                '16': format(RATING_NAME, 16),
                '18': format(RATING_NAME, 18),
                'pending': gettext('Rating Pending'),
                'rating-refused': gettext('Rating Refused')
            },
            esrb: {
                '0': gettext('Everyone'),
                '10': gettext('Everyone 10+'),
                '13': gettext('Teen'),
                '17': gettext('Mature 17+'),
                '18': gettext('Adults Only 18+')
            },
        },
    };
    names.ratings.classind = names.ratings.generic;
    names.ratings.pegi = names.ratings.generic;
    names.ratings.usk = names.ratings.generic;

    // Language icons.
    if (utils.lang() == 'es') {
        rating_icons.esrb = {
            '0': _rating_path('esrb_e_spa.png'),
            '10': _rating_path('esrb_e10_spa.png'),
            '13': _rating_path('esrb_t_spa.png'),
            '17': _rating_path('esrb_m_spa.png'),
            '18': _rating_path('esrb_ao_spa.png'),
        };
    }

    return {
        detail_links: detail_links,
        names: names,
        rating_icons: rating_icons,
    };
});
