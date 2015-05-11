define('user_helpers',
    ['regions', 'core/user', 'core/utils'],
    function(regions, user, utils) {

    var initialArgs = utils.getVars();

    var region_geoip = null;

    function region(default_, ignore_geoip) {
        if ('region' in initialArgs) {
            return initialArgs.region;
        }
        return user.get_setting('region_override') ||
               user.get_setting('region_sim') ||
               region_geoip ||
               (!ignore_geoip && user.get_setting('region_geoip')) ||
               default_ ||
               '';
    }

    function carrier() {
        if ('carrier' in initialArgs) {
            return initialArgs.carrier;
        }
        return user.get_setting('carrier_override') ||
               user.get_setting('carrier_sim') ||
               '';
    }

    return {
        carrier: carrier,
        region: region,
        set_region_geoip: function(region) {
            region_geoip = region;
            user.update_settings({region_geoip: region});
        }
    };
});
