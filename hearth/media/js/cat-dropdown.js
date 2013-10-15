define('cat-dropdown',
    // We require `mobilenetwork` here to initialize carrier/region detection so that gets
    // set before we pass those values to the API to get the list of categories.
    ['underscore', 'jquery', 'keys', 'l10n', 'models', 'requests', 'templates', 'urls', 'z', 'builder', 'mobilenetwork'],
    function(_, $, keys, l10n, models, requests, nunjucks, urls, z) {
    'use strict';

    var gettext = l10n.gettext;
    var desktopWidth = 710;

    var catModels = models('category');
    catModels.cast({
        name: gettext('All Categories'),
        slug: 'all'
    });

    var $catDropdown = $('#cat-dropdown');
    var $catList = $('#cat-list');
    var $catMenu = $('.cat-menu');
    var $dropdown = $('.dropdown');
    var $dropdownLink;

    // TODO: Detect when the user is offline and raise an error.

    // Do the request out here so it happens immediately when the app loads.
    var categoryReq = requests.get(urls.api.url('categories'));
    // Store the categories in models.
    categoryReq.done(function(data) {
        /*global console */
        console.groupCollapsed('Casting categories to model cache...');
        catModels.cast(data.objects);
        console.groupEnd();
        // If we're on a category page, set the page title to the category name.
        if (z.context.cat) {
            var cat = catModels.lookup(z.context.cat);
            if (cat && cat.slug !== 'all') {
                require('builder').getLastBuilder().z('title', cat.name);
            }
        }
    });

    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
        }
        $catMenu.toggleClass('hidden');
        $dropdown.toggleClass('active');
    }

    function updateDropDown(catSlug, catTitle) {
        var oldCatSlug = $dropdownLink.data('catSlug');
        if (oldCatSlug !== catSlug) {
            categoryReq.then(function() {
                var model = catModels.lookup(catSlug);
                catTitle = catTitle || (model && model.name) || catSlug;
                if (catTitle && catSlug && oldCatSlug && $dropdownLink) {
                    $dropdownLink.text(catTitle)
                             .removeClass('cat-' + oldCatSlug)
                             .addClass('cat-' + catSlug)
                             .data('catSlug', catSlug);
                }
            });
        }
    }

    function updateCurrentCat(catSlug, $elm) {
        var currentClass = 'current';
        $elm = $elm || $catMenu.find('.cat-' + catSlug);
        if (!$elm.hasClass(currentClass)) {
            $catMenu.find('.' + currentClass).removeClass(currentClass);
            $elm.addClass(currentClass);
        }
    }

    function handleCatClick(e) {
        e.preventDefault();
        var $target = $(e.target);
        var newCat = $target.data('catSlug');
        var catTitle = $target.text();
        toggleMenu();
        updateDropDown(newCat, catTitle);
        updateCurrentCat(newCat, $target);
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
        $catDropdown.html(
            nunjucks.env.getTemplate('cat_dropdown.html').render());
        handleResize();
        $dropdown = $('.dropdown');
        $dropdownLink = $dropdown.find('a');

        // Fetch the category dropdown-data
        categoryReq.done(function(data) {
            $catList.html(
                nunjucks.env.getTemplate('cat_list.html').render({categories: data.objects}));
            $catMenu = $('.cat-menu');
            handleCatsRendered();
        });
    }

    function handleDropDownDisplayByKey(e){
        if (e.keyCode === keys.ESCAPE) {
            toggleMenu(e);
        }
    }

    function handleResize() {
        $('.dropdown a').toggleClass('mobile', z.win.width() <= desktopWidth);
    }

    z.body.on('click', '.dropdown a', toggleMenu)
          .on('click', '.cat-menu a', handleCatClick)
          .on('keydown', '#cat-dropdown, #cat-list', handleDropDownDisplayByKey);
    z.doc.on('saferesize', handleResize);
    z.page.on('build_start', handleBuildStart)
          .on('reload_chrome', handleRenderDropdown);

    return {'catrequest': categoryReq};
});
