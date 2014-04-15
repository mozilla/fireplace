define('content-ratings', ['format', 'l10n', 'urls', 'utils', 'z'],
    function(format, l10n, urls, utils, z) {
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

    var descriptor_icons = {
        'pegi': {
            'discrimination': _rating_path('descriptors/pegi_discrimination.png'),
            'drugs': _rating_path('descriptors/pegi_drugs.png'),
            'gambling': _rating_path('descriptors/pegi_gambling.png'),
            'lang': _rating_path('descriptors/pegi_language.png'),
            'nudity': _rating_path('descriptors/pegi_nudity.png'),
            'online': _rating_path('descriptors/pegi_online.png'),
            'scary': _rating_path('descriptors/pegi_fear.png'),
            'sex': _rating_path('descriptors/pegi_sex.png'),
            'violence': _rating_path('descriptors/pegi_violence.png'),

            'digital-purchases': _rating_path('descriptors/pegi_inapp_purchase_option.png'),
            'shares-info': _rating_path('descriptors/pegi_personal_data_sharing.png'),
            'shares-location': _rating_path('descriptors/pegi_location_data_sharing.png'),
            'users-interact': _rating_path('descriptors/pegi_social_interaction_functionality.png'),
        }
    };

    var interactive_icons = {
        // Only show the ESRB-branded interactive Elements icons for ESRB.
        'esrb': {
            'digital-purchases': _rating_path('interactives/ESRB_digital-purchases.png'),
            'shares-info': _rating_path('interactives/ESRB_shares-info.png'),
            'shares-location': _rating_path('interactives/ESRB_shares-location.png'),
            'users-interact': _rating_path('interactives/ESRB_users-interact.png'),
        },
        // CLASSIND doesn't want to show Interactive Elements as part of their rating.
        'classind': {},
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
        descriptors: {
            classind: {
                // L10n: (es) `Atos Crim\xEDnosos`.
                'criminal-acts': gettext('Criminal Acts'),
                // L10n: (es) `Drogas`.
                'drugs': gettext('Drugs'),
                // L10n: (es) `Drogas Il\xEDcitas`.
                'drugs-illegal': gettext('Illegal Drugs'),
                // L10n: (es) `Drogas L\xEDcitas`.
                'drugs-legal': gettext('Legal Drugs'),
                // L10n: (es) `Linguagem Impr\xF3pria`.
                'lang': gettext('Inappropriate Language'),
                // L10n: (es) `Nudez`.
                'nudity': gettext('Nudity'),
                // L10n: (es) `Sexo`.
                'sex': gettext('Sex'),
                // L10n: (es) `Sexo Expl\xEDcito`.
                'sex-explicit': gettext('Explicit Sex'),
                // L10n: (es) `Conte\xFAdo Impactante`.
                'shocking': gettext('Impacting Content'),
                // L10n: (es) `Viol\xEAncia`.
                'violence': gettext('Violence'),
                // L10n: (es) `Viol\xEAncia Extrema`.
                'violence-extreme': gettext('Extreme Violence'),
            },
            esrb: {
                'alcohol-ref': gettext('Alcohol Reference'),
                'alcohol-tobacco-ref': gettext('Alcohol and Tobacco Reference'),
                'alcohol-tobacco-use': gettext('Use of Alcohol and Tobacco'),
                'alcohol-use': gettext('Use of Alcohol'),
                'blood': gettext('Blood'),
                'blood-gore': gettext('Blood and Gore'),
                'comic-mischief': gettext('Comic Mischief'),
                'crime': gettext('Crime'),
                'crime-instruct': gettext('Criminal Instruction'),
                'crude-humor': gettext('Crude Humor'),
                'drug-alcohol-ref': gettext('Drug and Alcohol Reference'),
                'drug-alcohol-tobacco-ref': gettext('Drug, Alcohol, and Tobacco Reference'),
                'drug-alcohol-tobacco-use': gettext('Use of Drug, Alcohol, and Tobacco'),
                'drug-alcohol-use': gettext('Use of Drug and Alcohol'),
                'drug-ref': gettext('Drug Reference'),
                'drug-tobacco-ref': gettext('Drug and Tobacco Reference'),
                'drug-tobacco-use': gettext('Use of Drug and Tobacco'),
                'drug-use': gettext('Use of Drugs'),
                'fantasy-violence': gettext('Fantasy Violence'),
                'hate-speech': gettext('Hate Speech'),
                'intense-violence': gettext('Intense Violence'),
                // L10n: `Language` as in foul language.
                'lang': gettext('Language'),
                'mild-blood': gettext('Mild Blood'),
                'mild-fantasy-violence': gettext('Mild Fantasy Violence'),
                'mild-lang': gettext('Mild Language'),
                'mild-violence': gettext('Mild Violence'),
                'nudity': gettext('Nudity'),
                'partial-nudity': gettext('Partial Nudity'),
                'real-gambling': gettext('Real Gambling'),
                'scary': gettext('Scary Themes'),
                'sex-content': gettext('Sexual Content'),
                'sex-themes': gettext('Sexual Themes'),
                'sim-gambling': gettext('Simulated Gambling'),
                'strong-lang': gettext('Strong Language'),
                'strong-sex-content': gettext('Strong Sexual Content'),
                'suggestive': gettext('Suggestive Themes'),
                'tobacco-ref': gettext('Tobacco Reference'),
                'tobacco-use': gettext('Use of Tobacco'),
                'violence': gettext('Violence'),
                'violence-ref': gettext('Violence References'),
            },
            generic: {
                'discrimination': gettext('Discrimination'),
                'drugs': gettext('Drugs'),
                'gambling': gettext('Gambling'),
                // L10n: `Language` as in foul language.
                'lang': gettext('Language'),
                'online': gettext('Online'),
                'scary': gettext('Fear'),
                // L10n: `Sex` as in sexual, not as in gender.
                'sex-content': gettext('Sex'),
                'violence': gettext('Violence'),
            },
            pegi: {
                'discrimination': gettext('Discrimination'),
                'drugs': gettext('Drugs'),
                'gambling': gettext('Gambling'),
                // L10n: `Language` as in foul language.
                'lang': gettext('Language'),
                'online': gettext('Online'),
                'scary': gettext('Fear'),
                // L10n: `Sex` as in sexual, not as in gender.
                'sex-content': gettext('Sex'),
                'violence': gettext('Violence'),

                'users-interact': gettext('Social Interaction Functionality'),
                'shares-info': gettext('Personal Data Sharing'),
                'digital-purchases': gettext('In-app Purchase Option'),
                'shares-location': gettext('Location Data Sharing'),
            },
            usk: {
                // L10n: (de) `Diskriminierung `.
                'discrimination': gettext('Discrimination'),
                // L10n: (de) `Drogen`.
                'drugs': gettext('Drugs'),
                // L10n: (de) `Explizite Sprache`.
                'lang': gettext('Explicit Language'),
                // L10n: (de) `\xC4ngstigende Inhalte`.
                'scary': gettext('Frightening Content'),
                // L10n: (de) `Erotik/Sexuelle Inhalte`.
                'sex-content': gettext('Sexual Content'),
                // L10n: (de) `Gewalt`.
                'violence': gettext('Violence'),
            }
        },
        interactives: {
            'digital-purchases': gettext('Digital Purchases'),
            'shares-info': gettext('Shares Info'),
            'shares-location': gettext('Shares Location'),
            'users-interact': gettext('Users Interact'),
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
    if (window.navigator.l10n.language == 'es') {
        rating_icons.esrb = {
            '0': _rating_path('esrb_e_spa.png'),
            '10': _rating_path('esrb_e10_spa.png'),
            '13': _rating_path('esrb_t_spa.png'),
            '17': _rating_path('esrb_m_spa.png'),
            '18': _rating_path('esrb_ao_spa.png'),
        };
        delete interactive_icons.esrb;  // TODO: add Spanish interactive icons.
    }

    return {
        descriptor_icons: descriptor_icons,
        detail_links: detail_links,
        names: names,
        interactive_icons: interactive_icons,
        rating_icons: rating_icons,
    };
});
