function RegisterButtonClick(data, containerId) {

    $(".btnRegister", containerId)
        .on("click",
            function(e) {

                e.preventDefault();

                data.dataId = $(this).attr('data-id');
                data.dataTitle = $(this).attr('data-title');
                data.dataDate = $(this).attr('data-date');
                data.dataTime = $(this).attr('data-time');

                // $('#divRegistrationMaster').css('display', 'inline');
                $('.modal', containerId).modal('show');
                var viewModel = new RegistrationVm(data, containerId);
                ko.cleanNode($('#intelBriefRegForm', containerId)[0]);
                ko.applyBindings(viewModel, $('#intelBriefRegForm', containerId)[0]);

                //used for caching of registration
                var cdata = {
                    id: $(this).attr('data-id').trim()
                };

                $.ajax({
                    type: "POST",
                    url: '/Services/BriefRegistrationService.svc/AttendeeExist',
                    data: ko.toJSON({ data: cdata }),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function(result) {
                        if (result != "") {
                            //hide/clear existing errors
                            $('#divThanks', containerId).css('display', 'none');
                            $('#divAlreadyEnrolled', containerId).css('display', 'none');
                            $('#divEventNotFound', containerId).css('display', 'none');
                            $('#divError', containerId).css('display', 'none');
                            $('#divErrorDetails', containerId).html('');

                            //show errors/messages
                            var message = result.split("#");
                            $('#' + message[0], containerId).css('display', 'inline');
                            $('#' + message[1], containerId).css('display', 'none');
                            if (message[2] && message[3]) {
                                $('#' + message[2], containerId).html(message[3]);
                          }
                        }
                    },
                    error: function(err) {
                        if (typeof console !== 'undefined') {
                            console.log(err.status + " - " + err.statusText);
                        }

                        ShowError("We were unable to complete your request. Please try again later. If this problem persists please contact customer care at customercare@ihsmarkit.com");
                    }
                });

            });
}

function DisplayRegistration_Close(id) {
    $(id).modal('hide');
}

function RegistrationVm(intialData, containerId) {
    var self = this;

    var serviceUrl = "/Services/BriefRegistrationService.svc/";

    self.id = ko.observable(intialData.dataId);
    self.title = ko.observable(intialData.dataTitle);
    self.date = ko.observable(intialData.dataDate);
    self.time = ko.observable(intialData.dataTime);

    //Register form
    self.firstname = ko.observable(intialData.dataFirstname)
        .extend({ required: { message: " First Name is required." } });
    self.lastname = ko.observable(intialData.dataLastname).extend({ required: { message: " Last Name is required." } });
    self.email = ko.observable(intialData.dataEmail)
        .extend({
            required: { message: " Email Address is required." },
            email: { message: " Please enter a valid email address" }
        });

    self.emailCheck = function(val, other) {
        return val === other;
    }

    self.confirmEmail = ko.observable(intialData.dataEmail)
        .extend({
            validation: {
                validator: self.emailCheck,
                message: ' Emails do not match.',
                params: self.email
            },
            required: { message: " Confirm Email Address is required." },
            email: { message: " Please enter a valid email address" }
        });
    self.jobTitle = ko.observable(intialData.dataJobTitle).extend({ required: { message: " Job Title is required." } });
    self.company = ko.observable(intialData.dataCompany).extend({ required: { message: " Company is required." } });
    self.address = ko.observable(intialData.dataAddress).extend({ required: { message: " Address is required." } });
    self.address2 = ko.observable(intialData.dataAddress2);
    self.city = ko.observable(intialData.dataCity);
    self.state = ko.observable(intialData.dataState).extend({ required: { message: " State/Province is required." } });
    self.country = ko.observable(intialData.dataCountry).extend({ required: { message: " Country is required." } });
    self.postcode = ko.observable(intialData.dataPostcode)
        .extend({ required: { message: " Zip/Post Code is required." } });
    self.futureInfo = ko.observable("");

    this.errors = ko.validation.group(this);
    this.isValid = ko.computed(function() {
        return self.errors().length === 0;
    });
    self.submit = function(registration) {
        if (self.isValid()) {
            var postData = ko.toJSON({ data: registration });
            $.ajax({
                type: "POST",
                url: serviceUrl + "RegisterBriefing",
                data: postData,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function(result) {
                    if (result !== "") {
                        //hide/clear existing errors
                        $('#divThanks', containerId).css('display', 'none');
                        $('#divAlreadyEnrolled', containerId).css('display', 'none');
                        $('#divEventNotFound', containerId).css('display', 'none');
                        $('#divError', containerId).css('display', 'none');
                        $('#divErrorDetails', containerId).html('');

                        //show errors/messages
                        var message = result.split("#");
                        $('#' + message[0]).css('display', 'inline');
                        $('#' + message[1]).css('display', 'none');
                        $('#' + message[2]).html(message[3]);
                    } else {
                        ShowError("We were unable to complete your request. Please try again later. If this problem persists please contact customer care at customercare@ihsmarkit.com");
                    }
                },
                error: function(err) {
                    if (typeof console !== 'undefined') {
                        console.log(err.status + " - " + err.statusText);
                    }

                    ShowError("We were unable to complete your request. Please try again later. If this problem persists please contact customer care at customercare@ihsmarkit.com");
                }
            });
        } else {
            self.errors.showAllMessages();
            return;
        }
    };

};

// Random bad request issues in production - possible cause - the json being passed was not correct
// This code ensures only the properties expected are being passed up to the server
// When ko.toJson is called
RegistrationVm.prototype.toJSON = function() {
    var copy = ko.toJS(this); //get a clean copy
    //remove unwanted properties
    delete copy.title;
    delete copy.date;
    delete copy.time;
    delete copy.confirmEmail;
    delete copy.errors;
    delete copy.isValid;
    //return the copy to be serialized
    return copy;
};