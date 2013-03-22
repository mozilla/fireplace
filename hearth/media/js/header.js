define('header', ['capabilities', 'z'], function(capabilities, z) {
    var htim;
    z.body.on('mousedown', '.wordmark', function() {
        htim = setTimeout(function() {z.body.toggleClass('nightly');}, 5000);
    }).on('mouseup', '.wordmark', function() {
        clearTimeout(htim);
    });

    // We would use :hover, but we want to hide the menu on fragment load!
    function act_tray() {
        $('.act-tray').on('mouseover', function() {
            $('.act-tray').addClass('active');
        }).on('mouseout', function() {
            $('.act-tray').removeClass('active');
        }).on('click', '.account-links a', function() {
            $('.account-links, .settings').removeClass('active');
        });
    }
    if (capabilities.widescreen) {
        act_tray();
        z.page.on('loaded', function() {
            $('.account-links, .settings').removeClass('active');
        });
        z.body.on('reloaded_chrome', act_tray);
    }
});
