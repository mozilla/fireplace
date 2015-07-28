define('views/games/listing',
    ['core/l10n'],
    function(l10n) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', gettext('Games'));
        builder.z('type', 'root games');

        builder.start('games/listing.html', {
            currentGameCategory: args[0],
            currentGameTag: args[0] === 'all' ?
                            'featured-game' : 'featured-game-' + args[0],
            gameCategories: [
                ['all', gettext('All games')],
                ['action', gettext('Action')],
                ['puzzle', gettext('Puzzle')],
                ['strategy', gettext('Strategy')],
                ['adventure', gettext('Adventure')],
            ]
        });
    };
});
