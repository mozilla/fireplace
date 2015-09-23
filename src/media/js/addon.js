define('addon',
    ['core/log', 'core/models', 'core/notification', 'core/z'],
    function(log, models, notification, z) {
    var logger = log('addon');

    z.body.on('click', '.addon-install-btn', function() {
        var addon = models('addon')
            .lookup($(this).closest('[data-slug]').data('slug'));

        var r = navigator.mozApps.installPackage(addon.mini_manifest_url);
        logger.log('Installing add-on', addon.mini_manifest_url);
        r.onerror = function(e) {
            notification.notification({
                message: 'Error installing add-on'
            });
        };
        r.onsuccess = function(e) {
            notification.notification({
                message: 'Add-on successfully installed'
            });
        };
    });
});
