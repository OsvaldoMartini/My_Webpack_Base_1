/**
 * A collection of functions for recording analytics for the site.
 */
var Analytics = {

    event: function(category, action, label) {
        if (typeof window.ga !== 'undefined') {
            window.ga("send",
            {
                hitType: "event",
                eventCategory: category,
                eventAction: action,
                eventLabel: label,
                nonInteraction: 0
            });
        }
    }

}