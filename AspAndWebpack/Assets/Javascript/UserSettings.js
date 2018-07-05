﻿/**
 * An object to handle operations for user settings. NOTE: only user editable/viewer settings can be accessed via this object.
 */
var UserSettings = {
    /**
     * A collection of cookie keys.
     */
    cookies: {
        showUnauthorizedWidgets: "IHS_692E2727-F9E5-4316-B23A-74F00093BD06_ShowUnauthorizedWidgets",
        standard: "IHS_692E2727-F9E5-4316-B23A-74F00093BD06_"
    },

    /**
     * Set a user setting. This can only be achieved on editable user settings.
     * @param {string} propertyName - The name of the user property to set.
     * @param {object} value - The value to assign the user property.
     * @param {object} options - A set of options for the operation.
     *                  (1) success {function} -> A function to call if the operation is successful.
     *                  (2) fail {function} -> A function to call if the operation is not successful.
     *                  (3) reloadPage {boolean} -> Whether or not to reload the page after the operation has completed.
     */
    set: function(propertyName, value, options) {
        options = options || {};
        var url = String.format("/MyProfile/SetSetting?propertyName={0}&value={1}", propertyName, value);
        $.post(url)
            .success(function (result) {
                if (options.success) options.success(result);
                if (options.reloadPage) location.reload(true);
            })
            .fail(function (jqxhr, status) {
                if (options.fail) {
                    options.fail(jqxhr, status);
                }
            })
            .always(function () {
                if (options.done) {
                    options.done();
                }
            });
    },

    /**
     * Set a user setting via a cookie.
     * @param {string} propertyName - The name of the user property to set.
     * @param {object} value - The value to assign the user property.
     * @param {string} cookieName - The name of the cookie to set. Will use try and use the user settings cookies (see top of class), otherwise it will use the string passed in.
     * @param {object} options - A set of options for the operation.
     *                  (1) reloadPage {boolean} -> Whether or not to reload the page after the operation has completed.
     */
    setCookie: function (propertyName, value, cookieName, options) {
        options = options || {};
        var cookieToUse = UserSettings.cookies[cookieName] || cookieName || (UserSettings.cookies.standard + propertyName);
        Cookies.createCookie(cookieToUse, value);
        if (options.reloadPage) location.reload(true);
    },

    /**
     * Retrieve the value of a user setting. This can only be achieved on viewable user settings.
     * @param {string} propertyName - The name of the user property to get.
     * @param {object} options - A set of options for the operation.
     *                  (1) success {function} -> A function to call if the operation is successful. Will contain the value found.
     *                  (2) fail {function} -> A function to call if the operation fails.
     *                  (3) cookieName {string} -> Will check the cookie first for the user setting before requesting the server.
     */
    get: function (propertyName, options) {
        options = options || {};
        var url = String.format("/MyProfile/GetSetting?propertyName={0}", propertyName);
        $.get(url)
            .success(function (value) {
                if (options.success && value != undefined && value !== '') options.success(value);
            })
            .fail(function (jqxhr, status) {
                if (options.fail) options.fail(jqxhr, status);
            });
    },
    /**
     * Retrieve the value of a user setting. This can only be achieved on viewable user settings.
     * @param {string} propertyNames - A collection of the names of the user property to get.
     * @param {object} options - A set of options for the operation.
     *                  (1) success {function} -> A function to call if the operation is successful. Will contain the value found.
     *                  (2) fail {function} -> A function to call if the operation fails.
     *                  (3) cookieName {string} -> Will check the cookie first for the user setting before requesting the server.
     */
    getMany: function (propertyNames, options) {
        options = options || {};
        var url = String.format("/MyProfile/GetSettings?propertyNames={0}", propertyNames.join());
        $.get(url)
            .success(function (value) {
                if (options.success && value != undefined && value !== '') options.success(value);
            })
            .fail(function (jqxhr, status) {
                if (options.fail) options.fail(jqxhr, status);
            });
    },

    /**
    * Retrieve the value of a user setting via a cookie.
    * @param {string} propertyName - The name of the user property to set.
    * @param {string} cookieName - The name of the cookie to extract the value from. Will use try and use the user settings cookies (see top of class), otherwise it will use the string passed in.
    * @param {object} options - A set of options for the operation.
    *                  (1) success {function} -> A function to call if the operation is successful. Will contain the value found.
    *                  (2) defaultValue {object} -> The default value to use if the cookie does not exist. Defaults to null.
    * @returns {string} - The value stored against the user setting.
    */
    getCookie: function (propertyName, cookieName, options) {
        options = options || {};

        var cookieToUse = UserSettings.cookies[cookieName] || cookieName || (UserSettings.cookies.standard + propertyName);

        var value = Cookies.readCookie(cookieToUse);

        if (value === null && options.defaultValue != null) value = options.defaultValue;

        if (options.success && value != undefined && value !== '') {
            options.success(value);
        }

        return value;
    }
};


var SettingsVM = function (settings, isSharedUser) {
    var self = this;
    self.settings = ko.observableArray($.map(settings || [], function (s) { return new SettingVM(s); }));

    self.isVisible = ko.observable(true);

    self.settings.subscribe(function () {
        self.showHideSettings();
        if (isSharedUser) {
            for (var i = 0; i < self.settings().length; i++) {
                self.settings()[i].isSharedUser = true;
                self.settings()[i].getSetting();
            }
        }
    });
    self.showHideSettings = function () {
        $('#settingMenu').toggle(self.settings().length > 0);
        self.isVisible(self.settings().length > 0);
    };
    self.showHideSettings();

    self.fetchSettings = function () {
        if (isSharedUser) {
            self.settings().forEach(function (setting) {
                setting.value(UserSettings.getCookie(setting.name));
            });
            return;
        }
        var settings = self.settings().reduce(function (result, setting) {
            if (setting.name) {
                result.push(setting.name)
                setting.isLoading(true);
            }
            return result;
        }, []);

        UserSettings.getMany(settings, {
            success: function (result) {
                self.settings().forEach(function (setting) {
                    if (result.hasOwnProperty(setting.name) && result[setting.name] != undefined && result[setting.name] !== '') {
                        var save = setting.saveChanges;
                        setting.saveChanges = false;
                        var subscription = setting.value.subscribe(function () { setting.saveChanges = save; subscription.dispose(); });
                        setting.value(result[setting.name]);                        
                    }
                    setting.isLoading(false);
                });
            }
        })
    };
};
var SettingVM = function (setting, fetch) {
    var self = this;
    if (typeof setting == 'string') {
        setting = { Title: setting, Type: 2};
    }

    //fix -property introduced to stop the infinite loop for shared users.
    self.initialising = false;
    self.icon = setting.Icon || '';
    self.title = setting.Title || '';
    self.tooltip = setting.Tooltip || '';
    self.name = setting.Name || '';
    self.info = setting.Info;
    self.options = ko.observableArray($.map(setting.Options || [], function (o) { return new SettingOptionVM(o); }));
    self.type =  ['OnOff', 'Multiple', 'Title'][ setting.Type != null ? setting.Type :
                        !setting.Value ? 2 :
                        self.options().length ? 1 :
                        0];
    self.value = (typeof setting.Value === 'function') ?
        ko.computed({
            read: function () {
                return setting.Value();
            },
            write: function (newValue) {
                newValue = self.fixValue(newValue);
                setting.Value(newValue);
            }
        }).extend({ throttle: 200 }) :
        ko.observable(setting.Value);
    self.reloadPage = setting.ReloadPage || false;
    self.isSharedUser = false;
    self.saveChanges = setting.saveChanges != null ? setting.saveChanges : true;
    self.help = new HelpLink(setting.help || {});
    self.isLoading = ko.observable(false);
    self.isError = ko.observable(false);
    /**
    * Set the user setting.
    */
    self.setSetting = function () {
        self.isError(false);
        if (self.isSharedUser) {
            UserSettings.setCookie(self.name, self.value(), '', { reloadPage: self.reloadPage });
            return;
        }
        self.isLoading(true);
        UserSettings.set(self.name, self.value(), {
            reloadPage: self.reloadPage,
            success: function (result) {
                result = self.fixValue(result);
                if (result === self.value()) return;
                self.isError(true);
                console.warn(result + "!=" + self.value());               
            },
            fail: function () { self.isError(true); },
            done: function () { self.isLoading(false); }
        });
    };

    /**
    * Retrieve the value of a user setting.
    */
    self.getSetting = function () {
        if (!self.name) return;
        var newValue = function (val) {
            val = self.fixValue(val);
            self.initialising = true;
            self.value(val);
            self.initialising = false;
        }
        if (self.isSharedUser) {
            UserSettings.getCookie(self.name, '', { success: newValue });
            return;
        }

        UserSettings.get(self.name, { success: newValue });
    };
    //self.onChange = (typeof setting.Value === 'function') ? function () { } : (setting.onChange || self.setSetting);
    self.onChange = setting.onChange || function () { };

    self.value.subscribe(function (val) {
        self.onChange(val);

        if (self.initialising) {
            self.initialising = false;
            return;
        }

        if (self.saveChanges && self.name) {
            self.setSetting(val);
        }
    });

    self.fixValue = function (value) {
        if (self.type == 'OnOff' && (typeof value === 'string' || value instanceof String)) {
            value = value.toLowerCase();
            if (value === 'true') value = true;
            if (value === 'false') value = false;
        }

        return value;
    };
};

var SettingOptionVM = function (option) {
    var self = this;
    self.name = option.Name || '';
    self.icon = option.Icon || '';
    self.title = ko.observable(option.Title || '');
};
