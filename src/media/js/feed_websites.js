/*
    Helpers for displaying the MOW feed items.
*/
define('feed_websites',
    ['core/l10n', 'core/nunjucks', 'core/urls', 'core/utils',  'core/z'],
    function(l10n, nunjucks, urls, utils, z) {
    'use strict';
    var gettext = l10n.gettext;

    var tabs = {
        activeClass: 'feed-item-website-tabs-active',
        element: null,
        init: function(evt) {
            var tabGroup = document.getElementsByClassName('feed-item-website-tabs')[0];
            if (tabGroup) {
                this.element = tabGroup;
                tabGroup.getElementsByTagName('li')[0].classList.add(this.activeClass);
                z.doc.trigger('image-deferrer--load');
            }
        },
        change: function(evt) {
            evt.preventDefault();
            document.getElementsByClassName(this.activeClass).forEach(function(element){
                element.classList.remove(this.activeClass);
            }.bind(this));
            evt.target.parentNode.classList.add(this.activeClass);
        }
    };

    var carousel = {
        activeClass: 'feed-item-website-carousel-active',
        counterClass: 'feed-item-website-carousel-counter',
        activeIndex: null,
        carousel: null,
        counter: null,
        count: null,
        init: function(evt) {
            var carousel = document.getElementsByClassName('feed-item-website-carousel')[0];
            if (carousel) {
                this.carousel = carousel;
                this.slides = this.carousel.getElementsByTagName('li');
                this.count = this.slides.length;
                this.counter = this.carousel.getElementsByClassName(this.counterClass)[0];
                this.activate(0);
            }
        },
        change: function(evt) {
            evt.preventDefault();
            var newIndex = this.activeIndex + 1;
            if (newIndex == this.count) {
                newIndex = 0;
            }
            this.activate(newIndex);
        },
        activate: function(n) {
            document.getElementsByClassName(this.activeClass).forEach(function(element){
                element.classList.remove(this.activeClass);
            }.bind(this));
            this.slides[n].classList.add(this.activeClass);
            this.activeIndex = n;
            this.counter.textContent = gettext('{current} of {count}', {
                current: this.activeIndex + 1,
                count: this.count
            });
            z.doc.trigger('image-deferrer--load');
        }
    };

    return {
        carousel: carousel,
        tabs: tabs
    };
});
