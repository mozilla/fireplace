/*
    Marketplace Category List element.

    <mkt-category-list>
        A <ul> wrapper.

        createdCallback - creates <mkt-category-item> elements from the
                          categories provided by categories.js.

    <mkt-category-item>
        An <li> element.

        createdCallback - creates <a> elements given its [data-mkt-category]
                          that a JSON object with category `slug` and `name`.

    z.page.loaded and z.page.navigate
        - Toggle active-ness of <mkt-category-link>s.
*/
define('elements/categories',
    ['categories', 'core/format', 'core/nunjucks', 'core/urls', 'core/z',
     'document-register-element', 'jquery', 'underscore'],
    function(categories, format, nunjucks, urls, z, dre, $, _) {
    'use strict';

    var LINK = 'mkt-category-link';
    var LINK_ACTIVE = 'mkt-category-link--active';

    var MktCategoryListElement = document.registerElement('mkt-category-list', {
        prototype: Object.create(HTMLUListElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;

                    var helperDiv = document.createElement('div');
                    var catTemplate =
                        '<mkt-category-item ' +
                        ' data-mkt-category-name="{name}"' +
                        ' data-mkt-category-slug="{slug}">' +
                        '</mkt-category-item>';

                    categories.forEach(function(cat) {
                        helperDiv.innerHTML = format.format(catTemplate, {
                            name: cat.name,
                            slug: cat.slug
                        });
                        root.appendChild(helperDiv.firstChild);
                    });
                }
            },
            updateActiveNode: {
                value: function(path) {
                    var root = this;

                    // Remove highlights from formerly-active nodes.
                    var links = root.querySelectorAll('a.' + LINK_ACTIVE);
                    for (var i = 0; links && (i < links.length); i++) {
                        links[i].classList.remove(LINK_ACTIVE);
                    }

                    // Highlight new active nodes based on current page.
                    var activeLinks = root.querySelectorAll(
                        'a[href="' + (path || window.location.pathname) + '"]');
                    for (i = 0; activeLinks && (i < activeLinks.length); i++) {
                        activeLinks[i].classList.add(LINK_ACTIVE);
                    }
                }
            }
        })
    });

    var MktCategoryItemElement = document.registerElement('mkt-category-item', {
        prototype: Object.create(HTMLLIElement.prototype, {
            createdCallback: {
                value: function() {
                    var root = this;
                    var name = root.getAttribute('data-mkt-category-name');
                    var slug = root.getAttribute('data-mkt-category-slug');

                    // Set slug on the item.
                    root.setAttribute('data-mkt-category-item', slug);

                    // Create <a> with href and title.
                    var catLink = document.createElement('a');
                    catLink.classList.add(LINK);
                    catLink.setAttribute(
                        'href', urls.reverse('category', [slug]));
                    catLink.setAttribute('title', name);
                    catLink.setAttribute('data-nav-no-active-node', '');
                    catLink.textContent = name;
                    root.appendChild(catLink);
                }
            },
        })
    });

    z.page.on('loaded navigate', function() {
        var catList = document.querySelector('mkt-category-list');
        if (catList) {
            try {
                catList.updateActiveNode();
            } catch(e) {}
        }
    });

    return {
        classes: {
            LINK_ACTIVE: LINK_ACTIVE
        }
    };
});
