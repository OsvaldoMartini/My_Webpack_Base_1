using System;
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
            var stack = htmlHelper.ViewContext.HttpContext.Items["stack"] as Stack<string>;
            if (stack == null)
            {
                return MvcHtmlString.Empty;
            }

            return MvcHtmlString.Empty;

            // TODO: your custom logic to build the tree
        }
    }
}