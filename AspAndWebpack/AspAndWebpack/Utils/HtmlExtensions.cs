using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AspAndWebpack.Utils
{
    public static class HtmlExtensions
    {
     
        public static IHtmlString BuildTree(this HtmlHelper htmlHelper)
        {

            //(ViewEngines.Engines[1] as MultiLanguageViewEngine).HierarchRazorView();
            var stack = htmlHelper.ViewContext.HttpContext.Items["stack"] as Stack<string>;
            var stackTree = SessionHelper.SessionStack;

            if (stackTree == null)
            {
                return MvcHtmlString.Empty;
            }

            var layout = ((System.Web.WebPages.WebPageBase)htmlHelper.ViewDataContainer).Layout;
            var virtualPath = ((System.Web.WebPages.WebPageExecutingBase)htmlHelper.ViewDataContainer).VirtualPath;
            var controller = Controller(htmlHelper);
            var action = Action(htmlHelper);
            var area = Area(htmlHelper);


            if (virtualPath.ToString().Length > 0)
            {
                var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|PageLayout:{2}|RenderSection:|PartialView:|Controller/Action:{3}/{4}", stackTree.Count.ToString(),virtualPath, layout,controller,action);

                stackTree.Push(tokerTree);
                SessionHelper.DefineValue(SessionName._stack, stackTree);
            }

            //if (virtualPath.Length > 0)
            //{
            //    stack.Push(virtualPath);
            //}
            
            return MvcHtmlString.Empty;
        }


        public static string Id(this HtmlHelper htmlHelper)
        {
            var routeValues = HttpContext.Current.Request.RequestContext.RouteData.Values;

            if (routeValues.ContainsKey("id"))
                return (string)routeValues["id"];
            else if (HttpContext.Current.Request.QueryString.AllKeys.Contains("id"))
                return HttpContext.Current.Request.QueryString["id"];

            return string.Empty;
        }

        public static string Controller(this HtmlHelper htmlHelper)
        {
            var routeValues = HttpContext.Current.Request.RequestContext.RouteData.Values;

            if (routeValues.ContainsKey("controller"))
                return (string)routeValues["controller"];

            return string.Empty;
        }

        public static string Action(this HtmlHelper htmlHelper)
        {
            var routeValues = HttpContext.Current.Request.RequestContext.RouteData.Values;

            if (routeValues.ContainsKey("action"))
                return (string)routeValues["action"];

            return string.Empty;
        }

        public static string Area(this HtmlHelper htmlHelper)
        {
            var dataTokens = HttpContext.Current.Request.RequestContext.RouteData.DataTokens;

            if (dataTokens.ContainsKey("area"))
                return (string)dataTokens["area"];

            return string.Empty;
        }
    }
}