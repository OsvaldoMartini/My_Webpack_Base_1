using System.Web.Optimization;

namespace AspAndWebpack
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.IgnoreList.Clear();

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/js/jquery.min.js"));

            bundles.UseCdn = true;
            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/js/bootstrap.js"));

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/css/bootstrap.css",
                "~/css/modern-business.css"));

        }
    }
}
