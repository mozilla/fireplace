define('cat-dropdown',
    ['underscore', 'helpers', 'jquery', 'l10n', 'models', 'requests', 'templates', 'urls', 'z'],
    function(_, helpers, $, l10n, models, requests, nunjucks, urls, z) {
    'use strict';

    var gettext = l10n.gettext;

    var cat_models = models('category');
    cat_models.cast({
        name: gettext('All Categories'),
        slug: 'all'
    });

    var cat_dropdown = $('#cat-dropdown');
    var cat_list = $('#cat-list');


    // TODO: Detect when the user is offline and raise an error.

    // Do the request out here so it happens immediately when the app loads.
    var category_req = requests.get(urls.api.url('categories'));
    // Store the categories in models.
    category_req.done(function(data) {
        cat_models.cast(data.objects);
    });

    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
        }
        $('.cat-menu').toggleClass('hidden');
        $('.dropdown').toggleClass('active');
        $('body').toggleClass('cats-open');
    }

    function updateDropDown(catSlug, catTitle) {
        var $dropDown = $('.dropdown a');
        var oldCatSlug = $dropDown.data('catSlug');
        if (oldCatSlug !== catSlug) {
            category_req.then(function() {
                var model = cat_models.lookup(catSlug);
                catTitle = catTitle || (model && model.name) || catSlug;
                if (catTitle && catSlug && oldCatSlug) {
                    $dropDown.text(catTitle)
                             .removeClass('cat-' + oldCatSlug)
                             .addClass('cat-' + catSlug)
                             .data('catSlug', catSlug);
                }
            });
        }
    }

    function updateCurrentCat(catSlug, $elm) {
        var $catMenu = $('.cat-menu');
        var currentClass = 'current';
        $elm = $elm || $catMenu.find('.cat-' + catSlug);
        if (!$elm.hasClass(currentClass)) {
            $catMenu.find('.' + currentClass).removeClass(currentClass);
            $elm.addClass(currentClass);
        }
    }

    function handleDropDownClicks(e) {
        e.preventDefault();
        var $target = $(e.target);
        var newCat = $target.data('catSlug');
        var catTitle = $target.text();
        toggleMenu();
        updateDropDown(newCat, catTitle);
        updateCurrentCat(newCat, $target);
    }

    function handleDropDownMousedowns(e) {
        // When I press down on the mouse, add that cute little white checkmark.
        e.preventDefault();
        var $target = $(e.target);
        updateCurrentCat($target.data('catSlug'), $target);
    }

    function dropDownRefresh(catSlug) {
        updateDropDown(catSlug);
        updateCurrentCat(catSlug);
    }

    function handleBuildStart(e) {
        // Handle the showing of the dropdown.
        if (z.context && z.context.show_cats === true) {
            z.body.addClass('show-cats');
            z.context.show_cats = false;
            handleCatsRendered();
        } else {
            z.body.removeClass('show-cats');
        }
    }

    function handleCatsRendered() {
        if (z.context && z.context.cat) {
            dropDownRefresh(z.context.cat);
        }
    }

    function handleRenderDropdown() {
        // Render the dropdown itself.
        cat_dropdown.html(
            nunjucks.env.getTemplate('cat_dropdown.html').render(helpers));

        // Fetch the category dropdown-data
        category_req.done(function(data) {
            var context = _.extend({categories: data.objects}, helpers);
            cat_list.html(
                nunjucks.env.getTemplate('cat_list.html').render(context));
            handleCatsRendered();
        });
    }

    z.body.on('click', '.dropdown a', toggleMenu)
          .on('mouseup', '.cat-menu a', handleDropDownClicks)
          .on('mousedown', '.cat-menu a', handleDropDownMousedowns);
    z.page.on('build_start', handleBuildStart)
          .on('reload_chrome', handleRenderDropdown);

});
