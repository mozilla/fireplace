// Note that 'mobilenetwork' must be required immediately prior to 'cat-dropdown'.
define('cat-dropdown',
    ['builder', 'categories', 'consumer_info', 'jquery', 'keys', 'l10n', 'models', 'requests', 'templates', 'underscore', 'urls', 'z'],
    function(builder, categories, consumer_info, $, keys, l10n, models, requests, nunjucks, _, urls, z) {
    'use strict';

    var gettext = l10n.gettext;
    var desktopWidth = 710;
    var $catDropdown = $('#cat-dropdown');
    var $catList = $('#cat-list');
    var $catMenu = $('.cat-menu');
    var $dropdown = $('.dropdown');
    var $dropdownLink;
    var catModels = models('category');

    // TODO: Detect when the user is offline and raise an error.

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
            var model = catModels.lookup(catSlug);
            catTitle = catTitle || (model && model.name) || catSlug;
            if (catTitle && catSlug && oldCatSlug && $dropdownLink) {
                $dropdownLink.text(catTitle)
                         .removeClass('cat-' + oldCatSlug)
                         .addClass('cat-' + catSlug)
                         .data('catSlug', catSlug);
            }
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
        $catDropdown.html(nunjucks.env.render('cat_dropdown.html'));
        handleResize();
        $dropdown = $('.dropdown');
        $dropdownLink = $dropdown.find('a');

        $catList.html(nunjucks.env.render('cat_list.html', {categories: categories}));
        $catMenu = $('.cat-menu');
        handleCatsRendered();
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
    z.page.on('build_start', handleBuildStart);
});
