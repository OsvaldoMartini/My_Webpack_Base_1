//ASP.NET AJAX breaks down completely in some circumstances when using WebKit-based browsers. Chrome/Safari
//this JavaScript fixes these issues.
Sys.Browser.WebKit = {}; 
if (navigator.userAgent.indexOf('WebKit/') > -1)
{
    Sys.Browser.agent = Sys.Browser.WebKit;
    Sys.Browser.version = parseFloat(navigator.userAgent.match(/WebKit\/(\d+(\.\d+)?)/)[1]);
    Sys.Browser.name = 'WebKit';
}