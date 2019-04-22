using System;
using System.Web.WebPages;
using AspAndWebpack.Utils;


public static class SectionExtensions
{
    private static readonly object _o = new object();
    public static HelperResult RenderSection(this WebPageBase page,string sectionName,Func<object, HelperResult> defaultContent)
    {

        var stackTree = SessionHelper.SessionStack;
        var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|RenderBody:{2}|RenderSection:{3}|PartialView:|Controller/Action:", stackTree.Count.ToString(), page.VirtualPath ?? page.VirtualPath, page.Layout ?? page.Layout, sectionName);

        stackTree.Push(tokerTree);
        SessionHelper.DefineValue(SessionName._stack, stackTree);
        
        if (page.IsSectionDefined(sectionName))
        {
            return page.RenderSection(sectionName);
        }
        else
        {
            return defaultContent(_o);
        }
    }

    public static HelperResult RedefineSection(this WebPageBase page,string sectionName)
    {
        var stackTree = SessionHelper.SessionStack;
        var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|RenderBody:{2}|RenderSection:{3}|PartialView:|Controller/Action:", stackTree.Count.ToString(), page.VirtualPath ?? page.VirtualPath, page.Layout ?? page.Layout, sectionName);

        stackTree.Push(tokerTree);
        SessionHelper.DefineValue(SessionName._stack, stackTree);
    
        return RedefineSection(page, sectionName, defaultContent: null);
    }

    public static HelperResult RedefineSection(this WebPageBase page,string sectionName,Func<object, HelperResult> defaultContent)
    {
        var stackTree = SessionHelper.SessionStack;
        var tokerTree = String.Format("Step:Call-{0}|MasterPath:|PageName:{1}|RenderBody:{2}|RenderSection:{3}|PartialView:|Controller/Action:", stackTree.Count.ToString(), page.VirtualPath ?? page.VirtualPath,page.Layout?? page.Layout, sectionName);

        stackTree.Push(tokerTree);
        SessionHelper.DefineValue(SessionName._stack, stackTree);
        

        if (page.IsSectionDefined(sectionName))
        {
            page.DefineSection(sectionName, () => page.Write(page.RenderSection(sectionName)));
        }
        else if (defaultContent != null)
        {
            page.DefineSection(sectionName, () => page.Write(defaultContent(_o)));
        }
        return new HelperResult(_ => { });
    }
}
