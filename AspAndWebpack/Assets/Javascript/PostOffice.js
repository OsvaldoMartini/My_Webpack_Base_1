/**
 * A very basic messaging service.  Can register a listener for messages with a particular subject, or post a message so that other listeners can pick it up.
 */
var PostOffice = {

    /**
     * A collection of callbacks waiting for a post about a particular subject.
     */
    "waiting": {},

    /**
     * Post a message. This will then "deliver" the contents to all recipients waiting for a message about that particular subject.
     */
    "send": function (subject, contents) {
        if (PostOffice.waiting.hasOwnProperty(subject)) {
            var recipients = PostOffice.waiting[subject];

            for (var i = 0; i < recipients.length; i++) {
                var recipient = recipients[i];
                recipient(contents);
            }
        }
    },

    /**
     * Inform that you are waiting for a message about a particular subject. The callback will be called once a message with the relevant subject has been posted.
     */
    "receive": function (subject, callback) {
        if (PostOffice.waiting.hasOwnProperty(subject)) {
            PostOffice.waiting[subject].push(callback);
        } else {
            PostOffice.waiting[subject] = [callback];
        }
    },

    /**
     * Stop receiving any updates for a particular subject.
     */
    "stopReceiving": function (subject, callback) {
        if (PostOffice.waiting.hasOwnProperty(subject)) {
            var index = PostOffice.waiting[subject].indexOf(callback);
            if (index > -1) {
                PostOffice.waiting[subject].splice(index, 1);
            }
        }
    }
}