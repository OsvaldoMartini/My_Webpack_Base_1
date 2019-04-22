'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InputText = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InputText = exports.InputText = function (_Component) {
    _inherits(InputText, _Component);

    function InputText(props) {
        _classCallCheck(this, InputText);

        var _this = _possibleConstructorReturn(this, (InputText.__proto__ || Object.getPrototypeOf(InputText)).call(this, props));

        _this.onInput = _this.onInput.bind(_this);
        return _this;
    }

    _createClass(InputText, [{
        key: 'onInput',
        value: function onInput(e) {
            if (this.props.onInput) {
                this.props.onInput(e);
            }

            this.updateFilledState(e.target.value);
        }
    }, {
        key: 'updateFilledState',
        value: function updateFilledState(val) {
            if (val && val.length) this.inputEl.classList.add('ui-state-filled');else this.inputEl.classList.remove('ui-state-filled');
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _value = this.props.value || this.props.defaultValue;

            this.updateFilledState(_value);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var className = (0, _classnames2.default)('ui-inputtext ui-state-default ui-corner-all ui-widget', this.props.className, {
                'ui-state-disabled': this.props.disabled
            });

            var inputProps = Object.assign({}, this.props);
            delete inputProps.onInput;

            return _react2.default.createElement('input', _extends({ ref: function ref(el) {
                    return _this2.inputEl = el;
                } }, inputProps, { className: className, onInput: this.onInput }));
        }
    }]);

    return InputText;
}(_react.Component);

InputText.defaultProps = {
    onInput: null
};
InputText.propTypes = {
    onInput: _propTypes2.default.func
};