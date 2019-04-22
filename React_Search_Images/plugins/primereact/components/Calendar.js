'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Calendar = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _InputText = require('../inputtext/InputText');

var _Button = require('../button/Button');

var _DomHandler = require('../utils/DomHandler');

var _DomHandler2 = _interopRequireDefault(_DomHandler);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Calendar = exports.Calendar = function (_Component) {
    _inherits(Calendar, _Component);

    function Calendar(props) {
        _classCallCheck(this, Calendar);

        var _this = _possibleConstructorReturn(this, (Calendar.__proto__ || Object.getPrototypeOf(Calendar)).call(this, props));

        _this.state = {};
        _this.onTodayButtonClick = _this.onTodayButtonClick.bind(_this);
        _this.onClearButtonClick = _this.onClearButtonClick.bind(_this);
        _this.onInputFocus = _this.onInputFocus.bind(_this);
        _this.onInputBlur = _this.onInputBlur.bind(_this);
        _this.onInputKeydown = _this.onInputKeydown.bind(_this);
        _this.onInputClick = _this.onInputClick.bind(_this);
        _this.onUserInput = _this.onUserInput.bind(_this);
        _this.prevMonth = _this.prevMonth.bind(_this);
        _this.nextMonth = _this.nextMonth.bind(_this);
        _this.incrementHour = _this.incrementHour.bind(_this);
        _this.decrementHour = _this.decrementHour.bind(_this);
        _this.incrementMinute = _this.incrementMinute.bind(_this);
        _this.decrementMinute = _this.decrementMinute.bind(_this);
        _this.incrementSecond = _this.incrementSecond.bind(_this);
        _this.decrementSecond = _this.decrementSecond.bind(_this);
        _this.toggleAMPM = _this.toggleAMPM.bind(_this);
        _this.onDatePickerClick = _this.onDatePickerClick.bind(_this);
        return _this;
    }

    _createClass(Calendar, [{
        key: 'createMonth',
        value: function createMonth(month, year) {
            var dates = [];
            var firstDay = this.getFirstDayOfMonthIndex(month, year);
            var daysLength = this.getDaysCountInMonth(month, year);
            var prevMonthDaysLength = this.getDaysCountInPrevMonth(month, year);
            var dayNo = 1;
            var today = new Date();

            for (var i = 0; i < 6; i++) {
                var week = [];

                if (i === 0) {
                    for (var j = prevMonthDaysLength - firstDay + 1; j <= prevMonthDaysLength; j++) {
                        var prev = this.getPreviousMonthAndYear(month, year);
                        week.push({ day: j, month: prev.month, year: prev.year, otherMonth: true,
                            today: this.isToday(today, j, prev.month, prev.year), selectable: this.isSelectable(j, prev.month, prev.year) });
                    }

                    var remainingDaysLength = 7 - week.length;
                    for (var _j = 0; _j < remainingDaysLength; _j++) {
                        week.push({ day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                            selectable: this.isSelectable(dayNo, month, year) });
                        dayNo++;
                    }
                } else {
                    for (var _j2 = 0; _j2 < 7; _j2++) {
                        if (dayNo > daysLength) {
                            var next = this.getNextMonthAndYear(month, year);
                            week.push({ day: dayNo - daysLength, month: next.month, year: next.year, otherMonth: true,
                                today: this.isToday(today, dayNo - daysLength, next.month, next.year),
                                selectable: this.isSelectable(dayNo - daysLength, next.month, next.year) });
                        } else {
                            week.push({ day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                                selectable: this.isSelectable(dayNo, month, year) });
                        }

                        dayNo++;
                    }
                }

                dates.push(week);
            }

            return dates;
        }
    }, {
        key: 'createWeekDays',
        value: function createWeekDays() {
            this.weekDays = [];
            var dayIndex = this.props.locale.firstDayOfWeek;
            for (var i = 0; i < 7; i++) {
                this.weekDays.push(this.props.locale.dayNamesMin[dayIndex]);
                dayIndex = dayIndex === 6 ? 0 : ++dayIndex;
            }
        }
    }, {
        key: 'getTime',
        value: function getTime() {
            var date = void 0;
            if (this.props.value) {
                if (this.isSingleSelection()) date = this.props.value;else date = this.props.value.length ? this.props.value[0] : this.props.defaultDate || new Date();
            } else {
                date = this.props.defaultDate || new Date();
            }

            this.pm = date.getHours() > 11;
            var hour = void 0,
                minute = void 0,
                second = void 0;
            if (this.props.showTime) {
                minute = date.getMinutes();
                second = date.getSeconds();

                if (this.props.hourFormat === '12') hour = date.getHours() === 0 ? 12 : date.getHours() % 12;else hour = date.getHours();
            } else if (this.props.timeOnly) {
                hour = 0;
                minute = 0;
                second = 0;
            }

            return {
                hour: hour,
                minute: minute,
                second: second
            };
        }
    }, {
        key: 'getMonthYearDate',
        value: function getMonthYearDate(value) {
            var date = void 0;
            if (value) {
                if (this.isSingleSelection()) date = value;else date = value.length ? value[0] : this.props.defaultDate || new Date();
            } else {
                date = this.props.defaultDate || new Date();
            }

            return date;
        }
    }, {
        key: 'prevMonth',
        value: function prevMonth(event) {
            if (this.props.disabled) {
                event.preventDefault();
                return;
            }

            var month = this.state.currentMonth;
            var year = this.state.currentYear;

            if (month === 0) {
                month = 11;
                year--;

                if (this.props.yearNavigator && year < this.props.yearOptions[0]) {
                    year = this.props.yearOptions[this.props.yearOptions.length - 1];
                }
            } else {
                month--;
            }

            this.setState({
                currentMonth: month,
                currentYear: year,
                dates: this.createMonth(month, year)
            });

            event.preventDefault();
        }
    }, {
        key: 'nextMonth',
        value: function nextMonth(event) {
            if (this.props.disabled) {
                event.preventDefault();
                return;
            }

            var month = this.state.currentMonth;
            var year = this.state.currentYear;

            if (month === 11) {
                month = 0;
                year++;

                if (this.props.yearNavigator && year > this.props.yearOptions[this.props.yearOptions.length - 1]) {
                    year = this.props.yearOptions[0];
                }
            } else {
                month++;
            }

            this.setState({
                currentMonth: month,
                currentYear: year,
                dates: this.createMonth(month, year)
            });

            event.preventDefault();
        }
    }, {
        key: 'onDateSelect',
        value: function onDateSelect(event, dateMeta) {
            var _this2 = this;

            if (this.props.disabled || !dateMeta.selectable) {
                event.preventDefault();
                return;
            }

            if (this.isMultipleSelection() && this.isSelected(dateMeta)) {
                var filteredValue = this.props.value.filter(function (date, i) {
                    return !_this2.isDateEquals(date, dateMeta);
                });

                this.updateModel(event, filteredValue);
            } else {
                if (this.shouldSelectDate(dateMeta)) {
                    if (dateMeta.otherMonth) {
                        if (this.selectOtherMonths) {
                            this.selectDate(event, dateMeta);
                        }
                    } else {
                        this.selectDate(event, dateMeta);
                    }
                }
            }

            if (this.isSingleSelection()) {
                this.hideOverlay();
            }
            event.preventDefault();
        }
    }, {
        key: 'isSingleSelection',
        value: function isSingleSelection() {
            return this.props.selectionMode === 'single';
        }
    }, {
        key: 'isRangeSelection',
        value: function isRangeSelection() {
            return this.props.selectionMode === 'range';
        }
    }, {
        key: 'isMultipleSelection',
        value: function isMultipleSelection() {
            return this.props.selectionMode === 'multiple';
        }
    }, {
        key: 'shouldSelectDate',
        value: function shouldSelectDate(dateMeta) {
            if (this.isMultipleSelection()) return !this.props.maxDateCount || !this.props.value || this.props.maxDateCount > this.props.value.length;else return true;
        }
    }, {
        key: 'selectDate',
        value: function selectDate(event, dateMeta) {
            var date = void 0;
            var time = this.getTime();
            var selectedValue = void 0;

            if (this.props.utc) date = new Date(Date.UTC(dateMeta.year, dateMeta.month, dateMeta.day));else date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);

            if (this.props.showTime) {
                if (this.props.hourFormat === '12' && this.pm && this.currentHour !== 12) date.setHours(time.hour + 12);else date.setHours(time.hour);

                date.setMinutes(time.minute);
                date.setSeconds(time.second);
            }

            if (this.isSingleSelection()) {
                selectedValue = date;
            } else if (this.isMultipleSelection()) {
                selectedValue = this.props.value ? [].concat(_toConsumableArray(this.props.value), [date]) : [date];
            } else if (this.isRangeSelection()) {
                if (this.props.value && this.props.value.length) {
                    var startDate = this.props.value[0];
                    var endDate = this.props.value[1];

                    if (!endDate && date.getTime() > startDate.getTime()) {
                        endDate = date;
                    } else {
                        startDate = date;
                        endDate = null;
                    }

                    selectedValue = [startDate, endDate];
                } else {
                    selectedValue = [date, null];
                }
            }

            this.updateModel(event, selectedValue);
            this.updateInputfield(selectedValue);

            if (this.props.onSelect) {
                this.props.onSelect({
                    originalEvent: event,
                    value: date
                });
            }
        }
    }, {
        key: 'updateModel',
        value: function updateModel(event, val) {
            if (this.props.onChange) {
                if (this.props.dataType === 'date') {
                    this.props.onChange({ originalEvent: event, value: val });
                } else if (this.props.dataType === 'string') {
                    this.props.onChange({ originalEvent: event, value: this.formatDateTime(val) });
                }
            }
        }
    }, {
        key: 'updateInputfield',
        value: function updateInputfield(value) {
            if (this.inputfield) {
                this.inputfield.value = this.getInputFieldValue(value);
            }
        }
    }, {
        key: 'getFirstDayOfMonthIndex',
        value: function getFirstDayOfMonthIndex(month, year) {
            var day = new Date();
            day.setDate(1);
            day.setMonth(month);
            day.setFullYear(year);

            var dayIndex = day.getDay() + this.getSundayIndex();
            return dayIndex >= 7 ? dayIndex - 7 : dayIndex;
        }
    }, {
        key: 'getDaysCountInMonth',
        value: function getDaysCountInMonth(month, year) {
            return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
        }
    }, {
        key: 'getDaysCountInPrevMonth',
        value: function getDaysCountInPrevMonth(month, year) {
            var prev = this.getPreviousMonthAndYear(month, year);
            return this.getDaysCountInMonth(prev.month, prev.year);
        }
    }, {
        key: 'getPreviousMonthAndYear',
        value: function getPreviousMonthAndYear(month, year) {
            var m = void 0,
                y = void 0;

            if (month === 0) {
                m = 11;
                y = year - 1;
            } else {
                m = month - 1;
                y = year;
            }

            return { 'month': m, 'year': y };
        }
    }, {
        key: 'getNextMonthAndYear',
        value: function getNextMonthAndYear(month, year) {
            var m = void 0,
                y = void 0;

            if (month === 11) {
                m = 0;
                y = year + 1;
            } else {
                m = month + 1;
            }

            return { 'month': m, 'year': y };
        }
    }, {
        key: 'getSundayIndex',
        value: function getSundayIndex() {
            return this.props.locale.firstDayOfWeek > 0 ? 7 - this.props.locale.firstDayOfWeek : 0;
        }
    }, {
        key: 'isSelected',
        value: function isSelected(dateMeta) {
            if (this.props.value) {
                if (this.isSingleSelection()) {
                    return this.isDateEquals(this.props.value, dateMeta);
                } else if (this.isMultipleSelection()) {
                    var selected = false;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = this.props.value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var date = _step.value;

                            selected = this.isDateEquals(date, dateMeta);
                            if (selected) {
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    return selected;
                } else if (this.isRangeSelection()) {
                    if (this.props.value[1]) return this.isDateEquals(this.props.value[0], dateMeta) || this.isDateEquals(this.props.value[1], dateMeta) || this.isDateBetween(this.props.value[0], this.props.value[1], dateMeta);else return this.isDateEquals(this.props.value[0], dateMeta);
                }
            } else {
                return false;
            }
        }
    }, {
        key: 'isDateEquals',
        value: function isDateEquals(value, dateMeta) {
            if (value) return value.getDate() === dateMeta.day && value.getMonth() === dateMeta.month && value.getFullYear() === dateMeta.year;else return false;
        }
    }, {
        key: 'isDateBetween',
        value: function isDateBetween(start, end, dateMeta) {
            if (start && end) {
                return start.getDate() < dateMeta.day && start.getMonth() <= dateMeta.month && start.getFullYear() <= dateMeta.year && end.getDate() > dateMeta.day && end.getMonth() >= dateMeta.month && end.getFullYear() >= dateMeta.year;
            } else {
                return false;
            }
        }
    }, {
        key: 'isToday',
        value: function isToday(today, day, month, year) {
            return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        }
    }, {
        key: 'isSelectable',
        value: function isSelectable(day, month, year) {
            var validMin = true;
            var validMax = true;
            var validDate = true;
            var validDay = true;

            if (this.props.minDate) {
                if (this.props.minDate.getFullYear() > year) {
                    validMin = false;
                } else if (this.props.minDate.getFullYear() === year) {
                    if (this.props.minDate.getMonth() > month) {
                        validMin = false;
                    } else if (this.props.minDate.getMonth() === month) {
                        if (this.props.minDate.getDate() > day) {
                            validMin = false;
                        }
                    }
                }
            }

            if (this.props.maxDate) {
                if (this.props.maxDate.getFullYear() < year) {
                    validMax = false;
                } else if (this.props.maxDate.getFullYear() === year) {
                    if (this.props.maxDate.getMonth() < month) {
                        validMax = false;
                    } else if (this.props.maxDate.getMonth() === month) {
                        if (this.props.maxDate.getDate() < day) {
                            validMax = false;
                        }
                    }
                }
            }

            if (this.disabledDates) {
                validDate = !this.isDateDisabled(day, month, year);
            }

            if (this.disabledDays) {
                validDay = !this.isDayDisabled(day, month, year);
            }

            return validMin && validMax && validDate && validDay;
        }
    }, {
        key: 'isDateDisabled',
        value: function isDateDisabled(day, month, year) {
            if (this.props.disabledDates) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.props.disabledDates[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var disabledDate = _step2.value;

                        if (disabledDate.getFullYear() === year && disabledDate.getMonth() === month && disabledDate.getDate() === day) {
                            return true;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            return false;
        }
    }, {
        key: 'isDayDisabled',
        value: function isDayDisabled(day, month, year) {
            if (this.props.disabledDays) {
                var weekday = new Date(year, month, day);
                var weekdayNumber = weekday.getDay();
                return this.props.disabledDays.indexOf(weekdayNumber) !== -1;
            }
            return false;
        }
    }, {
        key: 'onTodayButtonClick',
        value: function onTodayButtonClick(event) {
            var date = new Date();
            var dateMeta = { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), today: true, selectable: true };

            this.onDateSelect(event, dateMeta);

            if (this.props.onTodayClick) {
                this.onTodayClick(event);
            }
        }
    }, {
        key: 'onClearButtonClick',
        value: function onClearButtonClick(event) {
            this.updateModel(event, null);
            this.hideOverlay();
            if (this.props.onClearButtonClick) {
                this.onClearButtonClick(event);
            }
        }
    }, {
        key: 'onInputFocus',
        value: function onInputFocus(event) {
            if (this.props.showOnFocus) {
                this.showOverlay();
            }

            if (this.props.onFocus) {
                this.props.onFocus(event);
            }
        }
    }, {
        key: 'onInputBlur',
        value: function onInputBlur(event) {
            if (this.props.onBlur) {
                this.props.onBlur(event);
            }
        }
    }, {
        key: 'onButtonClick',
        value: function onButtonClick(event) {
            if (!this.overlay.offsetParent || this.overlay.style.display === 'none') {
                this.inputfield.focus();
                this.showOverlay();
            } else {
                this.hideOverlay();
            }

            this.datepickerClick = true;
        }
    }, {
        key: 'onInputClick',
        value: function onInputClick(event) {
            this.datepickerClick = true;
        }
    }, {
        key: 'onInputKeydown',
        value: function onInputKeydown(event) {
            if (event.keyCode === 9) {
                this.overlay.style.display = 'none';
            }
        }
    }, {
        key: 'onMonthDropdownChange',
        value: function onMonthDropdownChange(m) {
            var month = parseInt(m, 10);
            this.setState({
                currentMonth: month,
                dates: this.createMonth(month, this.state.currentYear)
            });
        }
    }, {
        key: 'onYearDropdownChange',
        value: function onYearDropdownChange(y) {
            var year = parseInt(y, 10);
            this.setState({
                currentYear: year,
                dates: this.createMonth(this.state.currentMonth, year)
            });
        }
    }, {
        key: 'incrementHour',
        value: function incrementHour(event) {
            var time = this.getTime();
            var hour = time.hour + this.props.stepHour;

            if (this.props.hourFormat === '24') hour = hour >= 24 ? hour - 24 : hour;else if (this.props.hourFormat === '12') hour = hour >= 13 ? hour - 12 : hour;

            time.hour = hour;
            this.updateTime(event, time);

            event.preventDefault();
        }
    }, {
        key: 'decrementHour',
        value: function decrementHour(event) {
            var time = this.getTime();
            var hour = time.hour - this.props.stepHour;

            if (this.props.hourFormat === '24') hour = hour < 0 ? 24 + hour : hour;else if (this.props.hourFormat === '12') hour = hour <= 0 ? 12 + hour : hour;

            time.hour = hour;
            this.updateTime(event, time);

            event.preventDefault();
        }
    }, {
        key: 'incrementMinute',
        value: function incrementMinute(event) {
            var time = this.getTime();
            var minute = time.minute + this.props.stepMinute;
            minute = minute > 59 ? minute - 60 : minute;

            time.minute = minute;
            this.updateTime(event, time);

            event.preventDefault();
        }
    }, {
        key: 'decrementMinute',
        value: function decrementMinute(event) {
            var time = this.getTime();
            var minute = time.minute - this.props.stepMinute;
            minute = minute < 0 ? 60 + minute : minute;

            time.minute = minute;
            this.updateTime(event, time);

            event.preventDefault();
        }
    }, {
        key: 'incrementSecond',
        value: function incrementSecond(event) {
            var time = this.getTime();
            var second = time.second + this.props.stepSecond;
            second = second > 59 ? second - 60 : second;

            time.second = second;
            this.updateTime(event, time);

            event.preventDefault();
        }
    }, {
        key: 'decrementSecond',
        value: function decrementSecond(event) {
            var time = this.getTime();
            var second = time.second + this.props.stepSecond;
            second = second < 0 ? 60 + second : second;

            time.second = second;
            this.updateTime(event, time);

            event.preventDefault();
        }
    }, {
        key: 'updateTime',
        value: function updateTime(event, time) {
            var value = this.props.value ? new Date(this.props.value) : new Date();
            if (this.props.hourFormat === '12' && this.pm && time.hour !== 12) value.setHours(time.hour + 12);else value.setHours(time.hour);

            value.setMinutes(time.minute);
            value.setSeconds(time.second);

            this.updateModel(event, value);
            this.updateInputfield(value);

            if (this.props.onSelect) {
                this.props.onSelect({
                    originalEvent: event,
                    value: value
                });
            }
        }
    }, {
        key: 'toggleAMPM',
        value: function toggleAMPM(event) {
            this.pm = !this.pm;
            this.updateTime(event);
            event.preventDefault();
        }
    }, {
        key: 'onUserInput',
        value: function onUserInput(event) {
            var val = event.target.value;

            try {
                var value = this.parseValueFromString(val);
                this.updateModel(event, value);
            } catch (err) {
                //invalid date
                this.updateModel(event, null);
            }
        }
    }, {
        key: 'parseValueFromString',
        value: function parseValueFromString(text) {
            if (!text || text.trim().length === 0) {
                return null;
            }

            var value = void 0;

            if (this.isSingleSelection()) {
                value = this.parseDateTime(text);
            } else if (this.isMultipleSelection()) {
                var tokens = text.split(',');
                value = [];
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = tokens[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var token = _step3.value;

                        value.push(this.parseDateTime(token.trim()));
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            } else if (this.isRangeSelection()) {
                var _tokens = text.split(' - ');
                value = [];
                for (var i = 0; i < _tokens.length; i++) {
                    value[i] = this.parseDateTime(_tokens[i].trim());
                }
            }

            return value;
        }
    }, {
        key: 'parseDateTime',
        value: function parseDateTime(text) {
            var date = void 0;
            var parts = text.split(' ');

            if (this.props.timeOnly) {
                date = new Date();
                this.populateTime(date, parts[0], parts[1]);
            } else {
                if (this.props.showTime) {
                    date = this.parseDate(parts[0], this.props.dateFormat);
                    this.populateTime(date, parts[1], parts[2]);
                } else {
                    date = this.parseDate(text, this.props.dateFormat);
                }
            }

            return date;
        }
    }, {
        key: 'populateTime',
        value: function populateTime(value, timeString, ampm) {
            var time = this.parseTime(timeString);

            if (this.props.hourFormat === '12') {
                if (!ampm) throw new Error('Invalid Time');else if (ampm.toLowerCase() === 'PM' && time.hour !== 12) value.setHours(time.hour + 12);
            } else {
                value.setHours(time.hour);
            }

            value.setMinutes(time.minute);
            value.setSeconds(time.second);
        }
    }, {
        key: 'onDatePickerClick',
        value: function onDatePickerClick(event) {
            this.datepickerClick = true;
        }
    }, {
        key: 'showOverlay',
        value: function showOverlay() {
            if (this.props.appendTo) _DomHandler2.default.absolutePosition(this.overlay, this.inputfield);else _DomHandler2.default.relativePosition(this.overlay, this.inputfield);

            this.overlay.style.zIndex = String(_DomHandler2.default.getZindex());
            this.overlay.style.display = 'block';

            this.bindDocumentClickListener();
        }
    }, {
        key: 'hideOverlay',
        value: function hideOverlay() {
            if (!this.props.inline) {
                this.overlay.style.display = 'none';
            }
        }

        // Ported from jquery-ui datepicker formatDate    

    }, {
        key: 'formatDate',
        value: function formatDate(date, format) {
            if (!date) {
                return "";
            }

            var iFormat = void 0,
                lookAhead = function lookAhead(match) {
                var matches = iFormat + 1 < format.length && format.charAt(iFormat + 1) === match;
                if (matches) {
                    iFormat++;
                }
                return matches;
            },
                formatNumber = function formatNumber(match, value, len) {
                var num = "" + value;
                if (lookAhead(match)) {
                    while (num.length < len) {
                        num = "0" + num;
                    }
                }
                return num;
            },
                formatName = function formatName(match, value, shortNames, longNames) {
                return lookAhead(match) ? longNames[value] : shortNames[value];
            },
                output = "",
                literal = false;

            if (date) {
                for (iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) === "'" && !lookAhead("'")) literal = false;else output += format.charAt(iFormat);
                    } else {
                        switch (format.charAt(iFormat)) {
                            case "d":
                                output += formatNumber("d", date.getDate(), 2);
                                break;
                            case "D":
                                output += formatName("D", date.getDay(), this.props.locale.dayNamesShort, this.props.locale.dayNames);
                                break;
                            case "o":
                                output += formatNumber("o", Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                                break;
                            case "m":
                                output += formatNumber("m", date.getMonth() + 1, 2);
                                break;
                            case "M":
                                output += formatName("M", date.getMonth(), this.props.locale.monthNamesShort, this.props.locale.monthNames);
                                break;
                            case "y":
                                output += lookAhead("y") ? date.getFullYear() : (date.getFullYear() % 100 < 10 ? "0" : "") + date.getFullYear() % 100;
                                break;
                            case "@":
                                output += date.getTime();
                                break;
                            case "!":
                                output += date.getTime() * 10000 + this.ticksTo1970;
                                break;
                            case "'":
                                if (lookAhead("'")) output += "'";else literal = true;

                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;
        }
    }, {
        key: 'formatTime',
        value: function formatTime(date) {
            if (!date) {
                return '';
            }

            var output = '';
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();

            if (this.props.hourFormat === '12' && this.pm && hours !== 12) {
                hours -= 12;
            }

            output += hours < 10 ? '0' + hours : hours;
            output += ':';
            output += minutes < 10 ? '0' + minutes : minutes;

            if (this.props.showSeconds) {
                output += ':';
                output += seconds < 10 ? '0' + seconds : seconds;
            }

            if (this.props.hourFormat === '12') {
                output += this.pm ? ' PM' : ' AM';
            }

            return output;
        }
    }, {
        key: 'formatDateTime',
        value: function formatDateTime(date) {
            var formattedValue = null;
            if (date) {
                if (this.props.timeOnly) {
                    formattedValue = this.formatTime(date);
                } else {
                    formattedValue = this.formatDate(date, this.props.dateFormat);
                    if (this.props.showTime) {
                        formattedValue += ' ' + this.formatTime(date);
                    }
                }
            }

            return formattedValue;
        }
    }, {
        key: 'parseTime',
        value: function parseTime(value) {
            var tokens = value.split(':');
            var validTokentLength = this.props.showSeconds ? 3 : 2;

            if (tokens.length !== validTokentLength) {
                throw new Error("Invalid time");
            }

            var h = parseInt(tokens[0], 10);
            var m = parseInt(tokens[1], 10);
            var s = this.props.showSeconds ? parseInt(tokens[2], 10) : null;

            if (isNaN(h) || isNaN(m) || h > 23 || m > 59 || this.props.hourFormat === '12' && h > 12 || this.props.showSeconds && (isNaN(s) || s > 59)) {
                throw new Error("Invalid time");
            } else {
                if (this.props.hourFormat === '12' && h !== 12) {
                    h += 12;
                }

                return { hour: h, minute: m, second: s };
            }
        }

        // Ported from jquery-ui datepicker parseDate 

    }, {
        key: 'parseDate',
        value: function parseDate(value, format) {
            if (format === null || value === null) {
                throw new Error("Invalid arguments");
            }

            value = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object" ? value.toString() : value + "";
            if (value === "") {
                return null;
            }

            var iFormat = void 0,
                dim = void 0,
                extra = void 0,
                iValue = 0,
                shortYearCutoff = typeof this.props.shortYearCutoff !== "string" ? this.props.shortYearCutoff : new Date().getFullYear() % 100 + parseInt(this.props.shortYearCutoff, 10),
                year = -1,
                month = -1,
                day = -1,
                doy = -1,
                literal = false,
                date = void 0,
                lookAhead = function lookAhead(match) {
                var matches = iFormat + 1 < format.length && format.charAt(iFormat + 1) === match;
                if (matches) {
                    iFormat++;
                }
                return matches;
            },
                getNumber = function getNumber(match) {
                var isDoubled = lookAhead(match),
                    size = match === "@" ? 14 : match === "!" ? 20 : match === "y" && isDoubled ? 4 : match === "o" ? 3 : 2,
                    minSize = match === "y" ? size : 1,
                    digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
                    num = value.substring(iValue).match(digits);
                if (!num) {
                    throw new Error("Missing number at position " + iValue);
                }
                iValue += num[0].length;
                return parseInt(num[0], 10);
            },
                getName = function getName(match, shortNames, longNames) {
                var index = -1;
                var arr = lookAhead(match) ? longNames : shortNames;
                var names = [];

                for (var i = 0; i < arr.length; i++) {
                    names.push([i, arr[i]]);
                }
                names.sort(function (a, b) {
                    return -(a[1].length - b[1].length);
                });

                for (var _i = 0; _i < names.length; _i++) {
                    var name = names[_i][1];
                    if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                        index = names[_i][0];
                        iValue += name.length;
                        break;
                    }
                }

                if (index !== -1) {
                    return index + 1;
                } else {
                    throw new Error("Unknown name at position " + iValue);
                }
            },
                checkLiteral = function checkLiteral() {
                if (value.charAt(iValue) !== format.charAt(iFormat)) {
                    throw new Error("Unexpected literal at position " + iValue);
                }
                iValue++;
            };

            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        checkLiteral();
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                            day = getNumber("d");
                            break;
                        case "D":
                            getName("D", this.props.locale.dayNamesShort, this.props.locale.dayNames);
                            break;
                        case "o":
                            doy = getNumber("o");
                            break;
                        case "m":
                            month = getNumber("m");
                            break;
                        case "M":
                            month = getName("M", this.props.locale.monthNamesShort, this.props.locale.monthNames);
                            break;
                        case "y":
                            year = getNumber("y");
                            break;
                        case "@":
                            date = new Date(getNumber("@"));
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "!":
                            date = new Date((getNumber("!") - this.ticksTo1970) / 10000);
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "'":
                            if (lookAhead("'")) {
                                checkLiteral();
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }

            if (iValue < value.length) {
                extra = value.substr(iValue);
                if (!/^\s+/.test(extra)) {
                    throw new Error("Extra/unparsed characters found in date: " + extra);
                }
            }

            if (year === -1) {
                year = new Date().getFullYear();
            } else if (year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 + (year <= shortYearCutoff ? 0 : -100);
            }

            if (doy > -1) {
                month = 1;
                day = doy;
                do {
                    dim = this.getDaysCountInMonth(year, month - 1);
                    if (day <= dim) {
                        break;
                    }
                    month++;
                    day -= dim;
                } while (true);
            }

            date = this.daylightSavingAdjust(new Date(year, month - 1, day));
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                throw new Error("Invalid date"); // E.g. 31/02/00
            }
            return date;
        }
    }, {
        key: 'daylightSavingAdjust',
        value: function daylightSavingAdjust(date) {
            if (!date) {
                return null;
            }
            date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
            return date;
        }
    }, {
        key: 'bindDocumentClickListener',
        value: function bindDocumentClickListener() {
            if (!this.documentClickListener) {
                this.documentClickListener = this.docClickListener.bind(this);
                document.addEventListener('click', this.documentClickListener);
            }
        }
    }, {
        key: 'docClickListener',
        value: function docClickListener() {
            if (!this.datepickerClick) {
                this.overlay.style.display = 'none';
            }

            this.datepickerClick = false;
        }
    }, {
        key: 'unbindDocumentClickListener',
        value: function unbindDocumentClickListener() {
            if (this.documentClickListener) {
                document.removeEventListener('click', this.documentClickListener);
            }
        }
    }, {
        key: 'getInputFieldValue',
        value: function getInputFieldValue(value) {
            var formattedValue = '';

            if (value) {
                if (this.isSingleSelection()) {
                    formattedValue = this.formatDateTime(value);
                } else if (this.isMultipleSelection()) {
                    for (var i = 0; i < value.length; i++) {
                        var dateAsString = this.formatDateTime(value[i]);
                        formattedValue += dateAsString;
                        if (i !== value.length - 1) {
                            formattedValue += ', ';
                        }
                    }
                } else if (this.isRangeSelection()) {
                    if (value && value.length) {
                        var startDate = value[0];
                        var endDate = value[1];

                        formattedValue = this.formatDateTime(startDate);
                        if (endDate) {
                            formattedValue += ' - ' + this.formatDateTime(endDate);
                        }
                    }
                }
            }

            return formattedValue;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unbindDocumentClickListener();

            if (!this.props.inline && this.props.appendTo) {
                this.el.nativeElement.appendChild(this.overlay);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var date = this.getMonthYearDate(this.props.value);
            this.createWeekDays();
            var month = date.getMonth();
            var year = date.getFullYear();

            this.setState({
                currentMonth: month,
                currentYear: year,
                dates: this.createMonth(month, year)
            });

            this.ticksTo1970 = ((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) + Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000;

            if (this.props.yearNavigator && this.props.yearRange) {
                this.yearOptions = [];
                var years = this.props.yearRange.split(':'),
                    yearStart = parseInt(years[0], 10),
                    yearEnd = parseInt(years[1], 10);

                for (var i = yearStart; i <= yearEnd; i++) {
                    this.yearOptions.push(i);
                }
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return nextProps.value !== this.props.value || this.state.currentMonth !== nextState.currentMonth || this.state.currentYear !== nextState.currentYear;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var date = this.getMonthYearDate(nextProps.value);
            var month = date.getMonth();
            var year = date.getFullYear();

            if (month !== this.state.currentMonth || year !== this.state.currentYear) {
                this.setState({
                    currentMonth: month,
                    currentYear: year,
                    dates: this.createMonth(month, year)
                });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.props.inline && this.props.appendTo) {
                if (this.props.appendTo === 'body') document.body.appendChild(this.overlay);else _DomHandler2.default.appendChild(this.overlay, this.props.appendTo);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var containerStyleClass = (0, _classnames2.default)('ui-calendar', this.props.className, {
                'ui-calendar-w-btn': this.props.showIcon
            });

            if (!this.props.inline) {
                var inputElement = _react2.default.createElement(_InputText.InputText, { ref: function ref(el) {
                        return _this3.inputfield = _reactDom2.default.findDOMNode(el);
                    }, defaultValue: this.getInputFieldValue(this.props.value), type: 'text',
                    required: this.props.required, onFocus: this.onInputFocus, onKeyDown: this.onInputKeydown, onClick: this.onInputClick,
                    onBlur: this.onInputBlur, readOnly: this.props.readOnlyInput, onInput: this.onUserInput,
                    onMouseDown: this.props.onMouseDown, onKeyUp: this.props.onKeyUp, onKeyPress: this.props.onKeyPress, onContextMenu: this.props.onContextMenu,
                    style: this.props.inputStyle, className: this.props.inputClassName,
                    placeholder: this.props.placeholder || '',
                    disabled: this.props.disabled, tabIndex: this.props.tabindex });

                if (this.props.showIcon) {
                    var buttonStyleClass = (0, _classnames2.default)('ui-datepicker-trigger ui-calendar-button', {
                        'ui-state-disabled': this.props.disabled
                    });

                    var buttonElement = _react2.default.createElement(_Button.Button, { type: 'button', icon: this.props.icon, onClick: function onClick(e) {
                            return _this3.onButtonClick(e);
                        },
                        className: buttonStyleClass, disabled: this.props.disabled });
                }
            }

            var datepickerStyleClass = (0, _classnames2.default)('ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all', {
                'ui-datepicker-inline': this.props.inline,
                'ui-shadow': !this.props.inline,
                'ui-state-disabled': this.props.disabled,
                'ui-datepicker-timeonly': this.props.timeOnly
            });

            if (!this.props.timeOnly) {
                var prevLink = _react2.default.createElement(
                    'a',
                    { className: 'ui-datepicker-prev ui-corner-all', href: '#', onClick: this.prevMonth },
                    _react2.default.createElement('span', { className: 'fa fa-angle-left' })
                ),
                    nextLink = _react2.default.createElement(
                    'a',
                    { className: 'ui-datepicker-next ui-corner-all', href: '#', onClick: this.nextMonth },
                    _react2.default.createElement('span', { className: 'fa fa-angle-right' })
                );

                var currentMonthText = !this.props.monthNavigator && _react2.default.createElement(
                    'span',
                    { className: 'ui-datepicker-month' },
                    this.props.locale.monthNames[this.state.currentMonth],
                    ' '
                ),
                    monthNav = this.props.monthNavigator && _react2.default.createElement(
                    'select',
                    { className: 'ui-datepicker-month', value: this.state.currentMonth, onChange: function onChange(e) {
                            return _this3.onMonthDropdownChange(e.target.value);
                        } },
                    this.props.locale.monthNames.map(function (month, i) {
                        return _react2.default.createElement(
                            'option',
                            { key: "month_" + i, value: i },
                            month
                        );
                    })
                ),
                    yearNav = this.props.yearNavigator && _react2.default.createElement(
                    'select',
                    { className: 'ui-datepicker-year', value: this.state.currentYear, onChange: function onChange(e) {
                            return _this3.onYearDropdownChange(e.target.value);
                        } },
                    this.yearOptions.map(function (year, i) {
                        return _react2.default.createElement(
                            'option',
                            { key: "year_" + i, value: year },
                            year
                        );
                    })
                ),
                    currentYearText = !this.props.yearNavigator && _react2.default.createElement(
                    'span',
                    { className: 'ui-datepicker-year' },
                    this.state.currentYear
                );

                var title = _react2.default.createElement(
                    'div',
                    { className: 'ui-datepicker-title' },
                    currentMonthText,
                    monthNav,
                    yearNav,
                    currentYearText
                );

                var datepickerHeader = _react2.default.createElement(
                    'div',
                    { className: 'ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all' },
                    prevLink,
                    nextLink,
                    title
                );

                /* datepicker table */
                var $this = this,
                    thead = _react2.default.createElement(
                    'thead',
                    null,
                    _react2.default.createElement(
                        'tr',
                        null,
                        this.weekDays.map(function (weekDay, i) {
                            return _react2.default.createElement(
                                'th',
                                { key: i, scope: 'col' },
                                _react2.default.createElement(
                                    'span',
                                    null,
                                    weekDay
                                )
                            );
                        })
                    )
                ),
                    tbody = _react2.default.createElement(
                    'tbody',
                    null,
                    this.state.dates.map(function (week, rowIndex) {
                        var columns = week.map(function (date, columnIndex) {
                            var dateStyleClass = (0, _classnames2.default)({
                                'ui-datepicker-other-month ui-state-disabled': date.otherMonth,
                                'ui-datepicker-current-day': $this.isSelected(date),
                                'ui-datepicker-today': date.today
                            });

                            var dayStyleClass = (0, _classnames2.default)('ui-state-default', {
                                'ui-state-active': $this.isSelected(date),
                                'ui-state-highlight': date.today,
                                'ui-state-disabled': !date.selectable
                            }),
                                dayLinks = (date.otherMonth ? $this.props.showOtherMonths : true) && _react2.default.createElement(
                                'a',
                                { href: '#', className: dayStyleClass, onClick: function onClick(e) {
                                        return $this.onDateSelect(e, date);
                                    } },
                                date.day
                            );

                            return _react2.default.createElement(
                                'td',
                                { className: dateStyleClass, key: rowIndex + '_' + columnIndex },
                                dayLinks
                            );
                        });

                        return _react2.default.createElement(
                            'tr',
                            { key: rowIndex },
                            columns
                        );
                    })
                );

                var table = _react2.default.createElement(
                    'table',
                    { className: 'ui-datepicker-calendar' },
                    thead,
                    tbody
                );
            }

            /* Timepicker */
            if (this.props.showTime || this.props.timeOnly) {
                var time = this.getTime();
                var separator = _react2.default.createElement(
                    'div',
                    { className: 'ui-separator' },
                    _react2.default.createElement(
                        'a',
                        { href: '#' },
                        _react2.default.createElement('span', { className: 'fa fa-angle-up' })
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        ':'
                    ),
                    _react2.default.createElement(
                        'a',
                        { href: '#' },
                        _react2.default.createElement('span', { className: 'fa fa-angle-down' })
                    )
                );

                var hourPicker = _react2.default.createElement(
                    'div',
                    { className: 'ui-hour-picker' },
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.incrementHour },
                        _react2.default.createElement('span', { className: 'fa fa-angle-up' })
                    ),
                    _react2.default.createElement(
                        'span',
                        { style: { 'display': time.hour < 10 ? 'inline' : 'none' } },
                        '0'
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        time.hour
                    ),
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.decrementHour },
                        _react2.default.createElement('span', { className: 'fa fa-angle-down' })
                    )
                ),
                    minutePicker = _react2.default.createElement(
                    'div',
                    { className: 'ui-minute-picker' },
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.incrementMinute },
                        _react2.default.createElement('span', { className: 'fa fa-angle-up' })
                    ),
                    _react2.default.createElement(
                        'span',
                        { style: { 'display': time.minute < 10 ? 'inline' : 'none' } },
                        '0'
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        time.minute
                    ),
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.decrementMinute },
                        _react2.default.createElement('span', { className: 'fa fa-angle-down' })
                    )
                ),
                    secondPicker = this.props.showSeconds && _react2.default.createElement(
                    'div',
                    { className: 'ui-second-picker' },
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.incrementSecond },
                        _react2.default.createElement('span', { className: 'fa fa-angle-up' })
                    ),
                    _react2.default.createElement(
                        'span',
                        { style: { 'display': time.second < 10 ? 'inline' : 'none' } },
                        '0'
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        time.second
                    ),
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.incrementSecond },
                        _react2.default.createElement('span', { className: 'fa fa-angle-down' })
                    )
                ),
                    ampmPicker = this.props.hourFormat === '12' && _react2.default.createElement(
                    'div',
                    { className: 'ui-ampm-picker' },
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.toggleAMPM },
                        _react2.default.createElement('span', { className: 'fa fa-angle-up' })
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        this.pm ? 'PM' : 'AM'
                    ),
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.toggleAMPM },
                        _react2.default.createElement('span', { className: 'fa fa-angle-down' })
                    )
                );

                var timepicker = _react2.default.createElement(
                    'div',
                    { className: 'ui-timepicker ui-widget-header ui-corner-all' },
                    hourPicker,
                    separator,
                    minutePicker,
                    this.props.showSeconds && separator,
                    secondPicker,
                    ampmPicker
                );
            }

            //buttonbar
            if (this.props.showButtonBar) {
                var buttonBar = _react2.default.createElement(
                    'div',
                    { className: 'ui-datepicker-buttonbar ui-widget-header' },
                    _react2.default.createElement(
                        'div',
                        { className: 'ui-g' },
                        _react2.default.createElement(
                            'div',
                            { className: 'ui-g-6' },
                            _react2.default.createElement(_Button.Button, { type: 'button', label: this.props.locale.today, onClick: this.onTodayButtonClick, className: this.props.todayButtonClassName })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'ui-g-6' },
                            _react2.default.createElement(_Button.Button, { type: 'button', label: this.props.locale.clear, onClick: this.onClearButtonClick, className: this.props.clearButtonClassName })
                        )
                    )
                );
            }

            return _react2.default.createElement(
                'span',
                { id: this.props.id, className: containerStyleClass, style: this.props.style },
                inputElement,
                buttonElement,
                _react2.default.createElement(
                    'div',
                    { ref: function ref(el) {
                            return _this3.overlay = el;
                        }, className: datepickerStyleClass,
                        onClick: this.onDatePickerClick },
                    datepickerHeader,
                    table,
                    timepicker,
                    buttonBar
                )
            );
        }
    }]);

    return Calendar;
}(_react.Component);

Calendar.defaultProps = {
    id: null,
    value: null,
    defaultDate: null,
    selectionMode: 'single',
    style: null,
    className: null,
    inputStyle: null,
    inputClassName: null,
    placeholder: null,
    disabled: false,
    dateFormat: "mm/dd/yy",
    inline: false,
    showOtherMonths: true,
    selectOtherMonths: false,
    showIcon: false,
    icon: "fa-calendar",
    utc: false,
    showOnFocus: true,
    appendTo: null,
    readOnlyInput: false,
    shortYearCutoff: "+10",
    minDate: null,
    maxDate: null,
    monthNavigator: false,
    yearNavigator: false,
    maxDateCount: null,
    yearRange: null,
    showTime: false,
    hourFormat: "24",
    timeOnly: false,
    locale: {
        firstDayOfWeek: 0,
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        today: 'Today',
        clear: 'Clear'
    },
    dataType: "date",
    showButtonBar: false,
    todayButtonClassName: 'ui-button-secondary',
    clearButtonClassName: 'ui-button-secondary',
    required: false,
    tabindex: null,
    stepHour: 1,
    stepMinute: 1,
    stepSecond: 1,
    showSeconds: false,
    disabledDates: null,
    disabledDays: null,
    onFocus: null,
    onSelect: null,
    onBlur: null,
    onChange: null,
    onTodayButtonClick: null,
    onClearButtonClick: null,
    onMouseDown: null,
    onKeyUp: null,
    onKeyPress: null,
    onContextMenu: null
};
Calendar.propsTypes = {
    id: _propTypes2.default.string,
    value: _propTypes2.default.any,
    defaultDate: _propTypes2.default.instanceOf(Date),
    selectionMode: _propTypes2.default.string,
    style: _propTypes2.default.string,
    className: _propTypes2.default.string,
    inputStyle: _propTypes2.default.string,
    inputClassName: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    disabled: _propTypes2.default.bool,
    dateFormat: _propTypes2.default.string,
    inline: _propTypes2.default.bool,
    showOtherMonths: _propTypes2.default.bool,
    selectOtherMonths: _propTypes2.default.bool,
    showIcon: _propTypes2.default.bool,
    icon: _propTypes2.default.string,
    utc: _propTypes2.default.bool,
    showOnFocus: _propTypes2.default.bool,
    appendTo: _propTypes2.default.string,
    readOnlyInput: _propTypes2.default.bool,
    shortYearCutoff: _propTypes2.default.string,
    minDate: _propTypes2.default.any,
    maxDate: _propTypes2.default.any,
    monthNavigator: _propTypes2.default.bool,
    yearNavigator: _propTypes2.default.bool,
    maxDateCount: _propTypes2.default.number,
    yearRange: _propTypes2.default.string,
    showTime: _propTypes2.default.bool,
    hourFormat: _propTypes2.default.string,
    timeOnly: _propTypes2.default.bool,
    locale: _propTypes2.default.object,
    dataType: _propTypes2.default.string,
    showButtonBar: _propTypes2.default.bool,
    todayButtonClassName: _propTypes2.default.bool,
    clearButtonClassName: _propTypes2.default.bool,
    required: _propTypes2.default.bool,
    tabindex: _propTypes2.default.number,
    stepHour: _propTypes2.default.number,
    stepMinute: _propTypes2.default.number,
    stepSecond: _propTypes2.default.number,
    showSeconds: _propTypes2.default.bool,
    disabledDates: _propTypes2.default.Array,
    disabledDays: _propTypes2.default.Array,
    onFocus: _propTypes2.default.func,
    onSelect: _propTypes2.default.func,
    onBlur: _propTypes2.default.func,
    onChange: _propTypes2.default.func,
    onTodayButtonClick: _propTypes2.default.func,
    onClearButtonClick: _propTypes2.default.func,
    onMouseDown: _propTypes2.default.func,
    onKeyUp: _propTypes2.default.func,
    onKeyPress: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func
};