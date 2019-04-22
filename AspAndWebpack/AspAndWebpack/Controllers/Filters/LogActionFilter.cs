    using System.Diagnostics;
    using System.Web.Mvc;
    using System.Web.Routing;
    using AspAndWebpack.Utils;

namespace AspAndWebpack.Controllers.Filters
{

    public class LogActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Log("OnActionExecuting", filterContext.RouteData);
        }

        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            // Log("OnActionExecuted", filterContext.RouteData);
        }

        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            //var layout = ((System.Web.Mvc.ControllerContext)filterContext).HttpContext;
            //var virtualPath = ((System.Web.WebPages.WebPageExecutingBase)htmlHelper.ViewDataContainer).VirtualPath;
            //var controller = Controller(htmlHelper);

            //Log("OnResultExecuting", filterContext.RouteData);
        }

        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            // Log("OnResultExecuted", filterContext.RouteData);
        }


        private void Log(string methodName, RouteData routeData)
        {
            var controllerName = routeData.Values["controller"];
            var actionName = routeData.Values["action"];

            var message = $"{methodName} controller:{controllerName} action:{actionName}";
            var stackTree = SessionHelper.SessionStack;
            if (controllerName.ToString().Length > 0)
            {
               var tokerTree = $"Step:Call-{stackTree.Count.ToString()}|MasterPath:|PageName:|RenderBody:|RenderAction:{methodName}|PartialView:|Controller/Action:{controllerName}/{actionName}";

                stackTree.Push(tokerTree);
                SessionHelper.DefineValue(SessionName._stack, stackTree);
            }

            Debug.WriteLine(message, "Action Filter Log");
        }
     }
}