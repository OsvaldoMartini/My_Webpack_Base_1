using AspAndWebpack.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace AspAndWebpack.App_Start
{
    public class MultiLanguageViewEngine : RazorViewEngine
    {
        private static string _currentCulture = GlobalHelper.CurrentCulture;

        public MultiLanguageViewEngine()
            : this(GlobalHelper.CurrentCulture)
        {
        }

        public MultiLanguageViewEngine(string lang)
        {
            SetCurrentCulture(lang);
        }

        public void SetCurrentCulture(string lang)
        {
            _currentCulture = lang;
            ICollection<string> arViewLocationFormats =
                new string[] { "~/Views/{1}/" + lang + "/{0}.cshtml" };
            ICollection<string> arBaseViewLocationFormats = new string[] {
                @"~/Views/{1}/{0}.cshtml",
                @"~/Views/Shared/{0}.cshtml"};
            this.ViewLocationFormats = arViewLocationFormats.Concat(arBaseViewLocationFormats).ToArray();
        }

        public static string CurrentCulture
        {
            get { return _currentCulture; }
        }

        protected override IView CreateView(ControllerContext controllerContext, string viewPath, string masterPath)
        {
            var stackTree = SessionHelper.SessionStack;

            //var layout = controllerContext.RouteData.ViewDataContainer).Layout;
            //var virtualPath = ((System.Web.WebPages.WebPageExecutingBase)htmlHelper.ViewDataContainer).VirtualPath;
            var controller = controllerContext.RouteData.Values["controller"];
            var action = controllerContext.RouteData.Values["action"];


            if (viewPath.ToString().Length > 0)
            {
                //var tokerTree = String.Format("Step:Call-{0}|MasterPath:{1}|PageName:{2}|RenderBody:|RenderAction:|PartialView:|Controller/Action:{3}/{4}", stackTree.Count.ToString(), masterPath, viewPath, controller, action);
                var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|RenderBody:|RenderSection:|PartialView:|Controller/Action:{2}/{3}", stackTree.Count.ToString(), viewPath, controller, action);

                stackTree.Push(tokerTree);
                SessionHelper.DefineValue(SessionName._stack, stackTree);
            }

            return new HierarchRazorView(controllerContext, viewPath, masterPath, true, base.FileExtensions,
            base.ViewPageActivator);
        }

        protected override IView CreatePartialView(ControllerContext controllerContext, string partialPath)
        {

            var controller = controllerContext.RouteData.Values["controller"];
            var action = controllerContext.RouteData.Values["action"];

            var stackTree = SessionHelper.SessionStack;
            if (partialPath.ToString().Length > 0)
            {
                var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:|RenderBody:|RenderSection:|PartialView:{1}|Controller/Action:{2}/{3}", stackTree.Count.ToString(), partialPath, controller, action);

                stackTree.Push(tokerTree);
                SessionHelper.DefineValue(SessionName._stack, stackTree);
            }
            return new HierarchRazorView(controllerContext, partialPath, null, false, base.FileExtensions,
            base.ViewPageActivator);
        }

    }

    public class HierarchRazorView : RazorView
    {
        public HierarchRazorView(ControllerContext controllerContext, string viewPath, string layoutPath,
            bool runViewStartPages, IEnumerable<string> viewStartFileExtensions,
            IViewPageActivator viewPageActivator)
            : base(controllerContext, viewPath, layoutPath, runViewStartPages, viewStartFileExtensions)
        {
        }

        protected override void RenderView(ViewContext viewContext, System.IO.TextWriter writer, object instance)
        {
            //var stack = viewContext.HttpContext.Items["stack"] as Stack<string>;
            //if (stack == null)
            //{
            //    stack = new Stack<string>();
            //    viewContext.HttpContext.Items["stack"] = stack;
            //}

            // depending on the required logic you could
            // use a stack of some model and push some additional
            // information about the view (see below)
            //stack.Push(this.ViewPath);




            var view = (BuildManagerCompiledView)viewContext.View;
            var context = viewContext.HttpContext;
            var path = context.Server.MapPath(view.ViewPath);
            var viewName = Path.GetFileNameWithoutExtension(path);
            var controller = viewContext.RouteData.GetRequiredString("controller");
            var viewBags = viewContext.ViewData;
            var layout = this.LayoutPath;
            var viewPath = this.ViewPath;
            var js = context.Server.MapPath(
                string.Format(
                    "~/ClientApp/Controllers/{0}/{0}.{1}.js",
                    viewName,
                    controller
                )
            );
            if (File.Exists(js))
            {
                writer.WriteLine(
                    string.Format(
                        "<script type=\"text/javascript\">{0}</script>",
                        File.ReadAllText(js)
                    )
                );
            }

            var stackTree = SessionHelper.SessionStack;

            //var layout = viewContext.layout;
            //var virtualPath = viewContext.viewName;
            //var controller = viewContext.Controller;
            //var action = Action(htmlHelper);
            //var area = Area(htmlHelper);


            if (viewPath.ToString().Length > 0)
            {
                //var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|RenderBody:{2}|RenderAction:|PartialView:|Controller/Action:{3}/{4}", stackTree.Count.ToString(), viewPath, layout, controller, viewName);
                var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|RenderBody:{2}|RenderSection:|PartialView:|Controller/Action:{3}/{4}", stackTree.Count.ToString(), viewPath, layout, controller, viewName);

                stackTree.Push(tokerTree);
                SessionHelper.DefineValue(SessionName._stack, stackTree);
            }

            base.RenderView(viewContext, writer, instance);


        }
    }
}