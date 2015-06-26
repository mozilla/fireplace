'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

define('hero-games', [], function () {
    Terne.registerElement('hero-games', (function () {
        var _class = function _class() {
            _classCallCheck(this, _class);
        };

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    { 'class': 'hero-games' },
                    this.heroGame()
                );
            }
        }, {
            key: 'init',
            value: function init() {
                var _this = this;

                this.on('click', function (e) {
                    if (e.target.classList.contains('js-enable-hero-game')) {
                        _this.props.enabled = true;
                        _this.renderGame();
                    }
                });
                document.body.addEventListener('show-hero-game', function (e) {
                    _this.props.enabled = false;
                    _this.props.activeGame = e.detail;
                    _this.renderGame();
                });
            }
        }, {
            key: 'heroGame',
            value: function heroGame() {
                return React.createElement('hero-game', { enabled: this.props.enabled, game: this.currentGame() });
            }
        }, {
            key: 'currentGame',
            value: function currentGame() {
                var _this2 = this;

                return (this.props.games || []).find(function (g) {
                    return _this2.props.activeGame === g.name;
                }) || this.props.games[0];
            }
        }, {
            key: 'renderGame',
            value: function renderGame() {
                Terne.render(this.heroGame(), this.querySelector('.hero-games'));
            }
        }]);

        return _class;
    })());

    Terne.registerElement('hero-game', (function () {
        var _class2 = function _class2() {
            _classCallCheck(this, _class2);
        };

        _createClass(_class2, [{
            key: 'render',
            value: function render() {
                if (this.props.enabled) {
                    return React.createElement('iframe', { 'class': 'gamescreen', src: this.props.game.url });
                } else {
                    return React.createElement(
                        'div',
                        { 'class': 'gamescreen' },
                        React.createElement('img', { src: this.props.game.imageUrl, 'class': 'js-enable-hero-game' }),
                        React.createElement('button', { 'class': 'js-enable-hero-game start-hero-game' })
                    );
                }
            }
        }]);

        return _class2;
    })());
});
