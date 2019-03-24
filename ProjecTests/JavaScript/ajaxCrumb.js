

$(document).ready(function () { HookupCrumbs(); })
 
 

function HookupCrumbs()
{

   // alert('HookupCrumbs');
    $('#ctl00_Breadcrumb1_pnlBreadcrumbs  a').each(function () {
        var qs = $(this).attr('onclick');
        if ($(this).attr('onclick').lastIndexOf('AjaxCrumb_') < 0) {
            $(this).attr('onclick', 'this.style.textDecoration="line-through";AjaxCrumb_' + qs)
        }
      
        
    })
}

function AjaxCrumb_CMPPostback(a,b)
{
   // alert(2); 
    ProcessCrumbClick(a, b); return false;
  
}

function AjaxCrumb___doPostBack(a, b) {
   // alert(1); 
    ProcessCrumbClick(a, b); return false;
   
}

var AjaxFormPostResults = "";
function ProcessCrumbClick(a, b)
{
    theForm.__EVENTTARGET.value = a;
    theForm.__EVENTARGUMENT.value = b;
    var f = $("#aspnetForm");
    var aaa = f.serialize();
   
    var formPostTarget = f.attr('action');
    
    var request1 = $.post(formPostTarget, aaa);
    request1.done(function (msg) {
        AjaxFormPostResults = msg;
        $(document).trigger('AjaxCrumbSessionSearchChangedEvent');
    });
    request1.fail(function () {
        ShowError("error");
    })
    return false;

    //if (!theForm.onsubmit || (theForm.onsubmit() != false)) {
    //    theForm.__EVENTTARGET.value = a;
    //    theForm.__EVENTARGUMENT.value = b;
    //    theForm.target = "_blank";

    //    theForm.submit();
    //}
}
 