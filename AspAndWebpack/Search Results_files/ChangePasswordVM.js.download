var ChangePasswordVM = function () {

    var self = this;

    self.currentPassword = ko.observable("").extend({
        required: {
            message: "Current password is required.",
            params: true
        }
    });

    self.newPassword = ko.observable("").extend({
        required: {
            message: "New password is required.",
            params: true
        },
        pattern: {
            message: "New password does not match the password requirements.",
            params: "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9!-@[-`{-~])[A-Za-z0-9!-@[-`{-~]{8,20}$"
        }
    });

    self.retypePassword = ko.observable("").extend({
        required: {
            message: "Confirm new password is required.",
            params: true
        },
        equal: {
            message: "The passwords you have entered do not match.",
            params: self.newPassword
        }
    });

    self.checkPasswordRequirements = function (data, event) {
        var value = event.target.value;
        self.checkValidNoSpaces(value);
        self.checkValidLength(value);
        self.checkValidLowerCase(value);
        self.checkValidUppercase(value);
        self.checkValidNumberOrSpecial(value);
    };

    self.errors = ko.validation.group([self.currentPassword, self.newPassword, self.retypePassword]);

    self.submitPassword = function () {

        //Trigger updates so the validation can kick in.
        self.currentPassword.valueHasMutated();
        self.newPassword.valueHasMutated();
        self.retypePassword.valueHasMutated();

        if (self.errors().length === 0) {

            self.isProcessing(true);

            var url = "/MyProfile/ChangePassword?currentPassword={currentPassword}&newPassword={newPassword}";
            url = url.replace("{currentPassword}", self.currentPassword());
            url = url.replace("{newPassword}", self.newPassword());

            $.post(url,
                    function (data) {
                        if (data.Succeeded) {
                            self.serverErrorMessage("");
                            self.serverSuccessMessage(data.Message);
                            setTimeout(function () {
                                window.location.href = data.LogoutLink;
                            },
                                3000);
                        } else {
                            self.serverErrorMessage(data.Message);
                        }
                    })
                .fail(function (data) {
                    self.serverErrorMessage("Something has gone wrong. Please try again");
                })
                .always(function () {
                    self.isProcessing(false);
                });
        }
    };

    self.serverErrorMessage = ko.observable("");
    self.serverSuccessMessage = ko.observable("");
    self.isProcessing = ko.observable(false);
    self.showPasswords = ko.observable(false);

    self.isErrorMessagesVisible = ko.computed(function () {
        var result = self.serverErrorMessage().length > 0 ||
            (!self.currentPassword.isValid() && self.currentPassword.isModified()) ||
            (!self.newPassword.isValid() && self.newPassword.isModified()) ||
            (!self.retypePassword.isValid() && self.retypePassword.isModified());
        return result;
    });


    self.toggleShowPasswords = function () {
        var x = self.showPasswords();
        self.showPasswords(!x);
    };

    self.validNoSpaces = ko.observable(false);
    self.checkValidNoSpaces = function (value) {
        var result = false;

        if (value && value.length > 0) {
            result = !(/\s/g.test(value));
        }

        self.validNoSpaces(result);
    };

    self.validLength = ko.observable(false);
    self.checkValidLength = function (value) {
        var result = false;

        if (value && value.length > 0) {
            result = value.length >= 8 && value.length <= 20;
        }

        self.validLength(result);
    };

    self.validLowercase = ko.observable(false);
    self.checkValidLowerCase = function (value) {
        var result = false;

        if (value && value.length > 0) {
            result = /[a-z]/.test(value);
        }

        self.validLowercase(result);
    };

    self.validUppercase = ko.observable(false);
    self.checkValidUppercase = function (value) {
        var result = false;

        if (value.length > 0) {
            result = /[A-Z]/.test(value);
        }

        self.validUppercase(result);
    };

    self.validNumberOrSpecial = ko.observable(false);
    self.checkValidNumberOrSpecial = function (value) {
        var result = false;

        if (value.length > 0) {
            result = /.*[0-9!-@[-`{-~]/.test(value);
        }

        self.validNumberOrSpecial(result);
    };
};