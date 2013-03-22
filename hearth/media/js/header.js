define('header', ['capabilities', 'z'], function(capabilities, z) {
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
