/**
 * A class for handling export requests.
 */
var Export = {

    /**
     * Export Janes Records.
     * @param {object} options - The set of options to configure the export.
     */
    exportRecords: function (options) {

        options = $.extend({
            /* Properties */
            ids: [],
            linkIds: [],
            url: "/{category}/FileExport/ExportRecords",
            category : "MAINSEARCH",
            exportMethod: "Stream",
            exportFormat: "Pdf",
            saveAsFilename: "IHS Janes",
            searchQuery: null,
            downloadUrl: "/{category}/Download/Generated/{id}",
            from: null,

            /* Functions */
            done: function () { },
            fail: function () { },
            success: function () { }
        },
            options);

        //If the category marker exists within the url, inject the category argument into it.
        options.url = options.url.replace("{category}", options.category);

        showPopup("Export", "<div>Your document is now being generated. Please wait, this could take a while.</div><div style='height:100px'><span class='loading' /></div>");

        if (typeof ga !== 'undefined') {
            var ids = options.ids === undefined ? "" : options.ids.join(',');
            var url = options.searchQuery === null ? options.url : options.searchQuery;
            url += url.indexOf("?") > -1 ? "&exportIds=" : "?exportIds=" + ids + "&from=" + options.from;
            ga("send",
            {
                hitType: "event",
                eventCategory: "Export",
                eventAction: options.exportMethod,
                eventLabel: url,
                nonInteraction: 0
            });
        }

        $.ajax({
            url: options.url,
            method: "POST",
            data: {
                ExportIDs: options.ids,
                ExportLinkIDs: options.linkIds,
                SearchQuery: options.searchQuery,
                ExportMethod: options.exportMethod,
                ExportFormat: options.exportFormat,
                SaveAs: options.saveAsFilename
            },
            traditional: true,
            async: true
        })
            .success(function () {
                //Call the callback
                options.success();
            })
            .done(function (id) {
                //if a file id has been returned
                if (id && id.length > 0 && id !== '00000000-0000-0000-0000-000000000000') {
                    options.downloadUrl = options.downloadUrl.replace("{category}", options.category);
                    options.downloadUrl = options.downloadUrl.replace("{id}", id);
                    
                    showPopup("Export", "Your file can be now downloaded <a href='" + options.downloadUrl + "' target='_blank'>here</a>.");

                    //Call the callback
                    options.done();
                } else {
                    showPopup("Export", "Your file can be found in the 'My Files' area of the site.");
                }
            })
            .fail(function () {
                showPopup("Export", "Something has gone wrong!");
                //Call the callback
                options.fail();
            });
    }



}




