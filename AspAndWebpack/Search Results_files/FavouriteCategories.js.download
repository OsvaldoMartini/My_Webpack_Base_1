//javascript class construction of FavouriteCategories client side code used to call back end service to add and remove bookmarks
// any code that wants to use this should create an instance using something similar to:
//var myPagFavCat = new FavouriteCategories('url of service');


//!/!/!/!/!/!/!/!/!/!/!/!/ NOTE /!/!/!/!/!/!/!/!/!/!/!/!//

/*
 * This class is instantiating itself for the moment.
 * It saves putting a new script tag within the layout/masterpage.
 * This may need to be moved later.
 */

//!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/!/

//If you add the name used into ClientFunctionalityInstanceName of the FavouriteCategoryIndicator asp .net user control then this will all be done automatically
function FavouriteCategories (favouriteCategoryServiceUrl, instanceName) {
    this._favoriteCategoriesToggled = false;
    this._serviceUrl = favouriteCategoryServiceUrl;
    this._instanceName = instanceName;

    //method that toggles the visibility of the first parent element found with the classname defined
    this._removeParentItems = function (element, parentClassName, searchClassName) {
        if (parentClassName != undefined) {
            parentClassName = "." + parentClassName;
            var parentElement = $(element).closest(parentClassName);
            if (parentElement.length == 1) {
                
                //OK I have the parent element need to see if it has any children with the old class name
                var foundElements = $(parentElement[0]).find(searchClassName);
                if (foundElements.length == 0) {
                    $(parentElement[0]).remove();
                }
            }

        }
    };

    //Method to toggle whether the category is a favourite or not given the state of the favourite indicator class name
    FavouriteCategories.prototype.toggleFavouriteCategory = function (favouriteIndicator) {
        var that = this;
        var indicator = $(favouriteIndicator);
        var categoryKey = indicator.attr("data-catKey");
        if (categoryKey != undefined) {
            var serviceCallFunction = null;
            var newClassName;
            var newTitle;

            //Already a favourite so remove
            if (indicator.hasClass("fav_on") || indicator.hasClass("icon-star")) {
                serviceCallFunction = this.deleteFavouriteCategory;
                newTitle = "Add to Favourites";
                if(indicator.hasClass("fav_on"))
                {
                    newClassName = "fav_off";
                }
                else
                {
                    newClassName = "icon-star-empty";
                }
            } else if (indicator.hasClass("fav_off") || indicator.hasClass("icon-star-empty")) {
                serviceCallFunction = this.addFavouriteCategory;
                newTitle = "Remove from Favourites";
                if (indicator.hasClass("fav_off")) {
                    newClassName = "fav_on";
                }
                else {
                    newClassName = "icon-star";
                }
            } else {
                ShowError("Register as an individual to add favourites.", 1400);
            }

            if (serviceCallFunction != null) {
                serviceCallFunction.call(that, categoryKey, function () {
                    that._favoriteCategoriesToggled = true;
                    var jsInstanceString = "[data-jsInstance = '" + that._instanceName + "']";
                    var catKeyString = "[data-catKey = '" + categoryKey + "']";
                    var jquerySelector = $("span" + jsInstanceString + catKeyString);
                    if (jquerySelector.length === 0) {
                        // try the new MVC style favourites
                        jquerySelector = $("button" + jsInstanceString + catKeyString);
                    }

                    jquerySelector.each(function (index, element) {

                        if (indicator.hasClass("fav_on") || indicator.hasClass("fav_off")) {
                            element.className = newClassName;
                        }
                        else {
                            var e = $(element);
                            e.removeClass("icon-star");
                            e.removeClass("icon-star-empty");
                            e.addClass(newClassName);
                        }
                        
                        favouriteIndicator.setAttribute('original-title', newTitle);
                        $('.tipsy:last').remove();
                        
                    });

                    that.updateFavourites();
                });
            }
        }
    };

    FavouriteCategories.prototype.updateFavourites = function () {
        // new MVC favourites tab
        // uses jquery to clone the by subject tab then rips out unnccessary elements - saves doig another service call.

        //There could be multiple ones on the page. e.g. banner and homepage.
        var containers = $(".mySubscriptions");
        for (var c = 0; c < containers.length; c++) {
            var $container = $(containers[c]);


            var favouritesTab = $container.find(".mySubFavourites");
            if (favouritesTab.length > 0) {
                favouritesTab.empty();
                var theClone = $container.find(".mySubSubjects").children().clone();
                theClone.find(".icon-star-empty").parent().remove();
                theClone.find(".icon-blank").parent().remove();
                theClone.find("ul:not(:has(*))").remove();

                // repeat the below twice as we have 2 levels of indentation
                for (var i = 0; i < 2; i++) {
                    theClone.find("div:not(:has(*))").remove();
                    theClone.find("div.collapse:not(:has(*))").remove();
                    theClone.find("div.collapse").not(".restriction").removeClass("collapse");
                    theClone.find("div[style*='height: 0']").css('height', '');

                    theClone.find("p.icon-collapse-arrow").each(function() {
                        $(this).removeClass("collapse hand");
                        $(this).removeAttr("aria-expanded");

                        if ($(this).next().is("p") || $(this).next().length == 0) {
                            $(this).remove();
                        }
                    });
                }

                var restrictionLabels = theClone.find("span.restriction");
                if (restrictionLabels.length > 0) {
                    // need to change some attribute values so the expand collapse still works
                    for (var i = 0; i < restrictionLabels.length; i++) {
                        var label = $(restrictionLabels[i]);
                        var dt = label.attr("data-target");
                        label.attr("data-target", dt.replace("#", "#fav"));

                        dt = label.attr("aria-controls");
                        label.attr("aria-controls", "fav" + dt);

                    }
                }

                var restrictionDivs = theClone.find("div.restriction");
                if (restrictionDivs.length > 0) {
                    // need to change some attribute values so the expand collapse still works
                    for (var i = 0; i < restrictionDivs.length; i++) {
                        var d = $(restrictionDivs[i]);
                        var dt = d.attr("id");
                        d.attr("id", "fav" + dt);
                    }
                }

                if (!theClone.children().length) {
                  theClone.append('<p>No favourites selected</p>');
                }

                theClone.appendTo(favouritesTab);
            }

            // hook up the help indicators of the clone
            if (typeof (SetupHelpClick) == "function") {
              SetupHelpClick(favouritesTab);
            }
        }
    }

    //Method to add a category as a favourite via the service
    FavouriteCategories.prototype.addFavouriteCategory = function (categoryKey, successDelegate) {
        var context = this;
        var url = context._serviceUrl + "AddCategory";
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: url,
            data: '{ "categoryKey":"' + categoryKey + '" }',
            success: function () {
                successDelegate();
                ShowSuccess("Favourite added");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                ShowError("An error occurred adding the favourite. " + errorThrown);
            }
        });
    };

    //Method to remove a category as a favourite via the service
    FavouriteCategories.prototype.deleteFavouriteCategory = function (categoryKey, successDelegate) {
        var context = this;
        var url = context._serviceUrl + "DeleteCategory";
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: url,
            data: '{ "categoryKey":"' + categoryKey + '" }',
            success: function () {
                successDelegate();
                ShowSuccess("Favourite removed");
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                ShowError("An error occurred removing the favourite. " + errorThrown);
            }
        });
    };
}

var _favouritesService = new FavouriteCategories('/Services/FavouriteCategoriesService.svc/', '_favouritesService');