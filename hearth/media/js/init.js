var z = {
    win: $(window),
    doc: $(document),
    body: $(document.body),
    page: $('#page'),
    context: {},
    prefix: (function() {
        try {
            var s = window.getComputedStyle(document.body, '');
            return (Array.prototype.slice.call(s).join('').match(/moz|webkit|ms|khtml/)||(s.OLink===''&&['o']))[0];
        } catch (e) {
            return 'moz';
        }
    })(),
    prefixed: function(property) {
        if (!z.prefix) return property;
        return '-' + z.prefix + '-' + property;
    },
    canInstallApps: true,
    allowAnonInstalls: settings.allow_anon_installs,
    enableSearchSuggestions: settings.search_suggestions_enabled,
    confirmBreakNum: 6
};

z.prefixUpper = z.prefix[0].toUpperCase() + z.prefix.substr(1);

(function() {
    function trigger() {
        z.win.trigger('saferesize');
    }
    window.addEventListener('resize', _.debounce(trigger, 200), false);
})();

z.doc.ready(function() {
    // Initialize email links.
    z.page.on('fragmentloaded', function() {
        $('span.emaillink').each(function() {
            var $this = $(this);
            $this.find('.i').remove();
            var em = $this.text().split('').reverse().join('');
            $this.prev('a').attr('href', 'mailto:' + em);
        });
    });
    if (z.readonly) {
        $('form[method=post]')
            .before(gettext('This feature is temporarily disabled while we ' +
                            'perform website maintenance. Please check back ' +
                            'a little later.'))
            .find('button, input, select, textarea').attr('disabled', true)
            .addClass('disabled');
    }
    z.anonymous = true;

    stick.basic();
});


z.page.on('fragmentloaded', function() {
    z.apps = {};
    if (z.capabilities.webApps) {
        // Get list of installed apps and mark as such.
        r = navigator.mozApps.getInstalled();
        r.onsuccess = function() {
            _.each(r.result, function(val) {
                z.apps[val.manifestURL] = val;
                z.win.trigger(
                    'app_install_success',
                    [val, {'manifest_url': val.manifestURL}, false]
                );
            });
        };
    }

    // Navigation toggle.
    var $header = $('#site-header'),
        $nav = $header.find('nav ul'),
        $outer = $('html, body');
    $header.on('click', '.menu-button', _pd(function() {
        $nav.addClass('active');
        $('.nav-overlay').addClass('show');
    })).on('click', '.region', _pd(function() {
        $outer.animate({scrollTop: $outer.height()}, 1000);
    }));

    z.win.bind('overlay_dismissed', function() {
       $nav.removeClass('active');
    });

    // Header controls.
    $('header').on('click', '.header-button', function(e) {
        var $this = $(this),
            $btns = $('.header-button'),
            $sq = $('#search-q'),
            $filters = $('#filters');

        if ($this.hasClass('dismiss')) {
            // Dismiss looks like back but actually just dismisses an overlay.
            $filters.removeClass('show');
        } else if ($this.hasClass('filter')) {
            // `getVars()` defaults to use location.search.
            initSelectedFilter();
            $filters.addClass('show');
        } else if ($this.hasClass('search')) {
            z.body.addClass('show-search');
            $btns.blur();
            $sq.focus();
        } else if ($this.hasClass('cancel')) {
            z.body.removeClass('show-search');
            $sq.blur();
            $btns.blur();
        }

        z.page.on('fragmentloaded', function() {
            z.body.removeClass('show-search');
            $sq.blur();
        });
        e.preventDefault();
    });

});

// TODO: phase this out.
var gettext = document.webL10n.get;
