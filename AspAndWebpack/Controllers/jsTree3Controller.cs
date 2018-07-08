using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using jsTree3.Models;
using Newtonsoft.Json;
using AspAndWebpack.Utils;

namespace AspAndWebpack.Controllers
{
    public class jsTree3Controller : Controller
    {
        public ActionResult Demo()
        {
            return View();
        }

        public ActionResult AJAXDemo()
        {
            return View();
        }
        public JsonResult GetJsTree3Data()
        {
            var root = new JsTree3Node() // Create our root node and ensure it is opened
            {
                id = Guid.NewGuid().ToString(),
                text = "Root Node",
                state = new State(true, false, false)
            };

            var hierarch = GetHierarchCalls();

            // Create a basic structure of nodes
            //var children = new List<JsTree3Node>();
            //for (int i = 0; i < 5; i++)
            //{
            //    var node = JsTree3Node.NewNode(Guid.NewGuid().ToString());
            //    node.state = new State(IsPrime(i), false, false);

            //    for (int y = 0; y < 5; y++)
            //    {
            //        node.children.Add(JsTree3Node.NewNode(Guid.NewGuid().ToString()));
            //    }

            //    children.Add(node);
            //}

            // Add the sturcture to the root nodes children property
            root.children = hierarch;
            var result = Json(root, JsonRequestBehavior.AllowGet);
            // Return the object as JSON

            SessionHelper.SessionStack = null;
            return result;
        }

        private List<JsTree3Node> GetHierarchCalls()
        {
            // Create a basic structure of nodes
            var stackTree = SessionHelper.SessionStack;
            var children = new List<JsTree3Node>();
            int idLine = 0;
            int idGen = 1;
            var lst = stackTree.Reverse();
            foreach (string line in lst)
            {
                string[] arr = line.Split('|');
                var strStep = string.Empty;
                var strResumeCall = string.Empty;
                for (int x = 0; x < arr.Length; x++)
                {

                    var spl = arr[x];
                    var a = spl.Split(':');
                    if (a[0] == "MasterPath")
                        continue;
                    if (a[0] == "Step")
                    {
                        strStep = a[1];
                        if (strResumeCall.Length == 0)
                            strResumeCall = strStep;
                        continue;
                    }
                    //var any = children.Find(p => p.text == a[0]);
                    //var any = children.Find(p => p.text.Contains(strStep));
                    if (a[1].Length > 0)
                    {
                        strResumeCall += "|" + a[0] + "|" + a[1];
                        idGen++;
                    }

                }

                var resume = strResumeCall.Split('|');

                var node = JsTree3Node.NewNode(resume[0], Guid.NewGuid().ToString());
                addRecursive(node, resume, 1);
                children.Add(node);

                idLine++;
                strResumeCall = string.Empty;
            }

            return children;
        }

        private void addRecursive(JsTree3Node node, string[] resume, int x)
        {
            if ((x > 0) && (x < resume.Length))
            {
                //if (resume[x].Length > 0)
                node.children.Add(JsTree3Node.NewNode(resume[x], Guid.NewGuid().ToString()));
                node.state = new State(true, false, false);
                x++;
                addRecursive(node.children[0], resume, x);
            }
        }

        static bool IsPrime(int n)
        {
            if (n > 1)
            {
                return Enumerable.Range(1, n).Where(x => n % x == 0)
                                 .SequenceEqual(new[] { 1, n });
            }

            return false;
        }
    }
}
