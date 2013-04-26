define('cat-dropdown',
    ['underscore', 'helpers', 'models', 'requests', 'templates', 'urls', 'z'],
    function(_, helpers, models, requests, nunjucks, urls, z) {

    'use strict';

    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
        }
        $('.cat-menu').toggleClass('hidden');
        $('.dropdown').toggleClass('active');
    }

    function updateDropDown(catSlug, catTitle) {
        var $dropDown = $('.dropdown a');
        var oldCatSlug = $dropDown.data('catSlug');
        if (oldCatSlug !== catSlug) {
            catTitle = catTitle || $('.cat-menu').find('.cat-' + catSlug).text();
            if (catTitle && catSlug && oldCatSlug) {
                $dropDown.text(catTitle)
                         .removeClass('cat-' + oldCatSlug)
                         .addClass('cat-' + catSlug)
                         .data('catSlug', catSlug);
            }
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
        var context = _.extend({z: z}, helpers);
        // Render the dropdown itself.
        $('#cat-dropdown').html(
            nunjucks.env.getTemplate('cat_dropdown.html').render(context));

        // Fetch the category dropdown-data
        var req = requests.get(urls.api.url('categories'));
        req.done(function(data) {
            models('category').cast(data.objects);
            context.categories = data.objects;
            $('#cat-list').html(
                nunjucks.env.getTemplate('cat_list.html').render(context));
            handleCatsRendered();
            z.page.trigger('cats_rendered');
        });
    }

    z.body.on('click', '.dropdown a', toggleMenu)
          .on('click', '.cat-menu a', handleDropDownClicks);
    z.page.on('build_start', handleBuildStart)
          .on('reload_chrome', handleRenderDropdown);

});
