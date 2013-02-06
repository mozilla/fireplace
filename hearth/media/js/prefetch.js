define('prefetch', [], function() {
    function init() {
        var assets = [
            'img/mkt/loading-16.png'
        ];
        _.each(assets, function(asset) {
            (new Image).src = z.body.data('media-url') + asset;
        });
    }
    return {init: init};
});
