define('mobilenetwork', [], function() {
    var regions = {
        // United States
        310: 'us',

        // United Kingdom
        235: 'uk',

        // Brazil
        724: 'br',

        // Spain
        214: 'es',

        // Colombia
        732: 'co',

        // Venezuela
        734: 've',

        // Poland
        260: 'pl',

        // Mexico
        334: 'mx',

        // Hungary
        216: 'hu',

        // Germany
        262: 'de'
    };

    var carriers = {
        // United States
        310: {
            26: 'deutsche_telekom',
            160: 'deutsche_telekom',
            170: 'deutsche_telekom',
            200: 'deutsche_telekom',
            210: 'deutsche_telekom',
            220: 'deutsche_telekom',
            230: 'deutsche_telekom',
            240: 'deutsche_telekom',
            250: 'deutsche_telekom',
            260: 'deutsche_telekom',
            270: 'deutsche_telekom',
            280: 'deutsche_telekom',
            290: 'deutsche_telekom',
            330: 'deutsche_telekom',
            490: 'deutsche_telekom',
            580: 'deutsche_telekom',
            660: 'deutsche_telekom',
            800: 'deutsche_telekom'
        },

        // United Kingdom
        235: {
            2: 'telefonica',
            10: 'telefonica',
            11: 'telefonica',
            30: 'deutsche_telekom'
        },

        // Brazil
        724: {
            6: 'telefonica',
            10: 'telefonica',
            11: 'telefonica',
            23: 'telefonica'
        },

        // Spain
        214: {
            5: 'telefonica',
            7: 'telefonica'
        },

        // Colombia
        732: {
            123: 'telefonica'
        },

        // Venezuela
        734: {
            4: 'telefonica'
        },

        // Poland
        260: {
            2: 'deutsche_telekom'
        },

        // Mexico
        334: {
            2: 'america_movil',
            20: 'america_movil',
            300: 'telefonica'
        },

        // Hungary
        216: {
            30: 'deutsche_telekom'
        },

        // Germany
        262: {
            1: 'deutsche_telekom',
            6: 'deutsche_telekom'
        },

        // Slovakia
        231: {
            2: 'deutsche_telekom',
            4: 'deutsche_telekom',
            6: 'telefonica'
        },

        // Czech Republic
        232: {
            2: 'telefonica'
        },

        // Austria
        232: {
            8: 'telefonica'
        },

        // Guatemala
        704: {
            3: 'telefonica'
        },

        // El Salvador
        706: {
            4: 'telefonica'
        },

        // Nicaragua
        710: {
            3: 'telefonica'
        },

        // Costa Rica
        712: {
            4: 'telefonica'
        },

        // Panama
        714: {
            2: 'telefonica',
            3: 'america_movil'
        },

        // Chile
        730: {
            2: 'telefonica'
        },

        // Ecuador
        740: {
            1: 'america_movil'
        },

        // Paraguay
        744: {
            4: 'telefonica',
        },

        // Peru
        716: {
            6: 'telefonica',
            10: 'america_movil'
        },

        // Argentina
        722: {
            10: 'telefonica',
            70: 'telefonica'
        },

        // Uruguay
        748: {
            7: 'telefonica'
        }
    };

    function getNetwork(mcc, mnc) {
        // Look up region and carrier from MCC (Mobile Country Code)
        // and MNC (Mobile Network Code).
        mcc = +mcc || 0;
        mnc = +mnc || 0;
        return {
            region: regions[mcc] || null,
            carrier: carriers[mcc] && carriers[mcc][mnc] || null
        };
    }

    return {
        getNetwork: getNetwork
    };
});
