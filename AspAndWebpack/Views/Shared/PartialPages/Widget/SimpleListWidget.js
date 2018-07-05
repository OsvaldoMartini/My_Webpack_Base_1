
/** 
**Simplelistwidget.js
used in the jmf custom report widget at the mo - name change due

**/

 
function SendGoogleAnalytic(a) {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Download', "JMF ForecastReport:" , a.text);
    }
}


function Feedback()
{
    var message = $('#customReportComments').val();
    if (message.length > 0)
    {
        var url = '/MarketsForecast/ReportFeedback';
        var jqxhr = $.post(url, { message: message });

        $('#customReportCommentsDiv').addClass("hidden");
        $('#customReportCommentsToggle').addClass("hidden");
        $('#customReportThanksDiv').removeClass("hidden", 250);
        $('#customReportThanksDiv').addClass("hidden", 5250, "linear");

    }

   
}