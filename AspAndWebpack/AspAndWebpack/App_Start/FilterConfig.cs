using System.Web;
using System.Web.Mvc;
using AspAndWebpack.Controllers.Filters;

namespace AspAndWebpack.App_Start
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
            filters.Add(new LogActionFilter());
        }
    }
}
