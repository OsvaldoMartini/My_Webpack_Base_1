// <copyright file="JDBControllerTest.cs" company="IHS">
// © 2017, IHS Inc. and its affiliated and subsidiary companies, all rights reserved.
// All other trademarks are the property of IHS Inc. and its affiliated and subsidiary
// companies.
// 
// This product, including software, data and documentation are licensed to the user 
// for its internal business purposes only and may not be disclosed, disseminated, 
// sold, licensed, copied, reproduced, translated or transferred to any third party.
// 
// IHS Inc. 
// 15 Inverness Way East 
// Englewood, Colorado 80112
// USA 
// +1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.Test.Web.Controllers.AandD
{

    using IHS.Apps.CMP.Web.Controllers.AandD;
    using IHS.Apps.CMP.Web.ServiceLayer.Interfaces;

    using Microsoft.VisualStudio.TestTools.UnitTesting;

    using Moq;
    using System.Diagnostics.CodeAnalysis;
    using System.Web.Mvc;

    using System.Web;

    using IHS.Apps.CMP.Web;
    using IHS.Apps.CMP.Web.Controllers;



    using System.Dynamic;
    using IHS.Apps.CMP.Models.Security;
    using IHS.Apps.CMP.Web.Classes;
    using IHS.Apps.CMP.Models.ViewModels;
    using System;
    using IHS.Apps.CMP.Utilities.URLParsers;
    using IHS.Apps.CMP.Utilities;
    using System.Linq;
    using System.Web.Routing;
    using IHS.Apps.CMP.DataProviders.Model;
    using IHS.Apps.CMP.DataProviders;
    using System.Collections.Concurrent;
    using System.Reflection;
    using IHS.Apps.CMP.Common;
    using System.Data;
    using System.IO;

    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;
    using IHS.Core.Catalog.Data;
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using IHS.Apps.CMP.DatabaseAccess;
    using System.Configuration;
    using IHS.Apps.CMP.Models.Configuration;
    
    /// <summary>
    /// Test cases against the JanesController class
    /// </summary>
    [TestClass]
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class JDBControllerTests
    {

        /// <summary>
        /// Holds the attributes available across all categories for this provider.
        /// </summary>
        private ConcurrentDictionary<string, ProviderAttribute> providerAttributes = new ConcurrentDictionary<string, ProviderAttribute>();

        private JDBController controller;

        private Mock<ICMPBaseController> mockCMPBaseController;

        private Mock<HttpSessionStateBase> sessionStateBase;

        private Mock<ICmpRequestContext> mockCmpRequestContext;

        private Mock<ICategory> mockCurrentCategory;

        private Mock<JDBController> mockJDBController;

        private Mock<HttpRequestBase> mockHttpRequestBase;

        private Mock<ChartPageController> mockChartPageController;

        private Mock<ICMPSession> mockCpmSession;

        private Mock<AbstractDataProvider> mockProvider;

        private const string fileLocation = "../../../Web/UI/Configuration/MvcMappings.xml";
        //[Test]
        //public void GetActionReturnsProductsAsJson()
        //{
        //    var mockProductsData = new List<IProduct> { /* ... */ };
        //    productsController.setData(mockProductsData);
        //    JsonResult result = productsController.Index() as JsonResult;mockCpmSession
        //    Assert.That(
        //        result.Data as List<IProduct>,
        //        Is.EqualTo(mockProductsData));
        //}


        /// <summary>
        /// Currently tries to initisalise the MvcMappingHelper using the MvcMappings.xml file found within the web project,
        /// If this proves to be too brittle we will have to create a local / test version
        /// </summary>
        [TestInitialize]
        public void Setup()
        {
            if (File.Exists(fileLocation))
            {
                MvcMappingsHelper.Initialise(fileLocation);
            }
        }


        /// <summary>
        /// Test to confirm that the redirection only occurs when the DashboardType is Reference / JanesHome / Magazines
        /// </summary>
        [TestMethod]
        [SuppressMessage("ReSharper", "PossibleNullReferenceException")]
        public void TestJDB_GetChart_Json()
        {
            this.mockCurrentCategory = new Mock<ICategory>();
            var search = new Search
            {
                SearchSource = new CategorySource(this.mockCurrentCategory.Object)
            };
            var indexers = new ReadOnlyIndexerList(
                new CommonIndexerList<IIndexer>
                {
                    new ProviderAttribute("FT_TOTAL_PROGRAM", "FT_TOTAL_PROGRAM", AttributeType.STRING_TYPE, null),
                    new ProviderAttribute("CURRENCY_USD", "CURRENCY_USD", AttributeType.STRING_TYPE, null),
                    new ProviderAttribute("COMBINE", "COMBINE", AttributeType.STRING_TYPE, null),
                    new ProviderAttribute("BY_FORCE", "BY_FORCE", AttributeType.STRING_TYPE, null),
                    new ProviderAttribute("ItemID", "ItemID", AttributeType.STRING_TYPE, null),
                    new ProviderAttribute("XKEY", "XKEY", AttributeType.NUMERIC_TYPE, null),
                    new ProviderAttribute("SERIESVAL", "SERIESVAL", AttributeType.STRING_TYPE, null),
                    new ProviderAttribute("COUNT", "COUNT", AttributeType.DOUBLE_TYPE, null),
                    new ProviderAttribute("FORCE_ORD", "FORCE_ORD", AttributeType.DOUBLE_TYPE, null),
                    new ProviderAttribute("ACTIVIT_ORD", "ACTIVIT_ORD", AttributeType.DOUBLE_TYPE, null)
            });

            this.mockCurrentCategory.Setup(x => x.Indexers).Returns(indexers);
            this.mockCurrentCategory.Setup(p => p.Domain.ObjectKey).Returns("JANESFASTDOMAIN");
            this.mockCurrentCategory.Setup(p => p.ObjectKey).Returns("JDB_ACTIVITY_ITEMS");
            this.mockCurrentCategory.Setup(x => x.DisplayName).Returns("JDB_ACTIVITY_ITEMS");
            this.mockCurrentCategory.Setup(x => x.Name).Returns("JDB_ACTIVITY_ITEMS");
            //this.mockCurrentCategory.Setup(p => p.ObjectKey).Returns("MARKET");
            //this.mockCurrentCategory.Setup(x => x.DisplayName).Returns("MARKET");
            //this.mockCurrentCategory.Setup(x => x.Name).Returns("MARKET");


            this.mockCMPBaseController = new Mock<ICMPBaseController>();
            this.mockCmpRequestContext = new Mock<ICmpRequestContext>();

            var aaaAuth = new AaaAuthorisation();
            var licence = new License();
            licence.CategoryAuthorisations.Add(new CategoryAuthorisation("XXX ~ Look a test Auth"));
            licence.CategoryAuthorisations.Add(new CategoryAuthorisation("JDB ~ Look test JDB"));
            aaaAuth.AddLicence(licence);
            this.mockCpmSession = new Mock<ICMPSession>();
            var handler = new Mock<IHttpHandler>();
            this.sessionStateBase = new Mock<HttpSessionStateBase>();

            var viewBag = new ExpandoObject();
            //var webIdentity = new WebIdentity();
            
            this.mockCpmSession.Setup(x => x.Authorization).Returns(aaaAuth);
            this.mockCpmSession.Setup(x => x.BaseSession).Returns(sessionStateBase.Object);

            this.mockCpmSession.Object.BaseSession.Add("ImpersonatingUserId", "0000");

            this.mockCMPBaseController.Setup(x => x.ViewBag).Returns(viewBag);
            this.mockCMPBaseController.Setup(x => x.Session).Returns(this.mockCpmSession.Object);
            //this.mockCMPBaseController.Setup(x => x.User).Returns(this.cmpRequest.Object);

            DataTable dt = SetupDataTableForGetResultsReturnValue();
            this.mockProvider = new Mock<AbstractDataProvider>();
            mockProvider.Setup(x => x.GetResults<DataTable>(It.IsAny<IBuildResults<DataTable>>(),
                                       It.IsAny<ISearch>(), It.IsAny<AaaAuthorisation>()))
                                       .Returns(() => dt);


            var jdbProvider = DataProviderManager.GetProvider("JanesDefenceBudgetsProvider");
            var entitlements = jdbProvider.GetCategoryEntitlementProductNames("JDB_ACTIVITY_ITEMS");
            //var entitlements = jdbProvider.GetCategoryEntitlementProductNames("JDSF14");

            this.mockCmpRequestContext.Setup(x => x.CurrentProvider).Returns(jdbProvider);
            this.mockCmpRequestContext.Setup(x => x.HttpContext).Returns(this.mockCmpRequestContext.Object.HttpContext);

            this.mockCmpRequestContext.Setup(x => x.CurrentCategoryReference.title_resource_key).Returns("Defence Budgets");
            this.mockCmpRequestContext.Setup(x => x.CurrentCategoryReference.category_key).Returns("JDB_ACTIVITY_ITEMS");
            //this.mockCmpRequestContext.Setup(x => x.CurrentCategoryReference.category_key).Returns("JDSF14");

            this.mockCmpRequestContext.Setup(x => x.CurrentCategory).Returns(this.mockCurrentCategory.Object);


         
            var mockSearchService = Mock.Of<ISearchService>();
            var mockFacetService = Mock.Of<IFacetService>();
            this.mockJDBController = NewMock<JDBController>();
            //this.mockJDBController.Setup(x => x.Session).Returns(this.mockCpmSession.Object);

            this.mockChartPageController = new Mock<ChartPageController>(mockSearchService, mockFacetService);

            // Arrange
            var routes = new RouteCollection();
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "JDB", action = "GetChart", id = UrlParameter.Optional }
            );

            var mockContext = new Mock<HttpContextBase>();
            var mockRequest = new Mock<HttpRequestBase>();

            var nameValueCollection = new NameValueCollection { { "HTTP_X_FORWARDED_HOST", "test.ihs.com" } };
            mockRequest.Setup(x => x.ServerVariables).Returns(nameValueCollection);

            var httpApplicationContext = new HttpApplicationContext(mockContext.Object);
            var url = httpApplicationContext.GetLoginUrl(mockRequest.Object);

            //var resultDAFactory = new DAFactory(ConfigurationManager.ConnectionStrings);
            var resultDAFactory = new DAFactory(ConfigurationManager.ConnectionStrings);
            //this.httpContext.Application["DAFactory"] = resultDAFactory;

            Assert.AreEqual("https://timeouturl.ihsenergy.com", url);

            //var appConfig = httpApplicationContext.GetApplicationConfig();

            var appConfig = new application { name = "JANES" };
            this.mockCmpRequestContext.Setup(x => x.ApplicationConfig).Returns(appConfig);


            this.mockCMPBaseController.Setup(x => x.CmpRequest).Returns(this.mockCmpRequestContext.Object);

            this.mockHttpRequestBase = new Mock<HttpRequestBase>(MockBehavior.Strict);
            mockHttpRequestBase.SetupGet(x => x.ApplicationPath).Returns("/");
            mockHttpRequestBase.SetupGet(x => x.Url).Returns(new Uri("http://localhost:57592/DefenceBudgets/GetChart?cid=JDBWorldWideChart&view=chart&SD=dontSearch&UnIxr=FT_TOTAL_PROGRAM|CURRENCY_USD|ITEMID|XKEY|SERIESVAL|COUNT|FORCE_ORD|ACTIVITY_ORD|BY_FORCE|COMBINE&CHART_METADATA(X_eq_TIMELINE**Y_eq_FT_TOTAL_PROGRAM**GROUPBY_eq_BY_FORCE**RemoveCombine**UseDeflated**Currency_USD**XCount=12**GCount=12**CHARTTYPE_eq_Column)&_=1532528138003", UriKind.Absolute));
            //mockHttpRequestBase.SetupGet(x => x.Url).Returns(new Uri("http://localhost:57592/DefenceBudgets/GetChart?cid=JDBWorldWideChart&view=chart&#view=chart|grid&f=MARKET_ATTR1(Air)&pg=1&q=[ViewItemDescription|ViewPlatformFamily|ViewItemName|ViewSourcesData(F-35)]", UriKind.Absolute));
            //mockHttpRequestBase.SetupGet(x => x.Url).Returns(new Uri("http://localhost:57592/MarketsForecast/guided?view=chart#f=MARKET(Military Aircraft)&pg=1&q=[ViewItemDescription|ViewPlatformFamily|ViewItemName|ViewSourcesData(F-35)]", UriKind.Absolute));
            
			//mockHttpRequestBase.SetupGet(x => x.ServerVariables).Returns(new System.Collections.Specialized.NameValueCollection());
            //ITEMID|XKEY|SERIESVAL|COUNTFORCE_ORD
            //mockHttpRequestBase.SetupGet(x => x.ApplicationConfig).Returns(new System.Collections.Specialized.NameValueCollection());

            var response = new Mock<HttpResponseBase>(MockBehavior.Strict);
            response.Setup(x => x.ApplyAppPathModifier("/post1")).Returns("http://localhost/post1");



            var mapping = MvcMappingsHelper.Instance.FindMvcMappingByUrlKey("JDB_ACTIVITY_ITEMS");
            //var mapping = MvcMappingsHelper.Instance.FindMvcMappingByUrlKey("JDSF14");

            GetChart();
        }

        public void GetChart()
        {
            var genId = string.Concat("dvChart", Guid.NewGuid().ToString().Replace("-", string.Empty));
            ChartPageModel model = new ChartPageModel();
            var config = UIUtils.CreateParserConfigObject(this.mockCmpRequestContext.Object);
            var parserManager = new URLToSearchParser(config);
            string target_grid_config_chart_area_id = string.Empty;
            var cat_chart = string.Empty;
            string name = LanguageUtils.GetGlobalResourceString(!string.IsNullOrEmpty(this.mockCmpRequestContext.Object.CurrentCategoryReference.title_resource_key) ? this.mockCmpRequestContext.Object.CurrentCategoryReference.title_resource_key : this.mockCmpRequestContext.Object.CurrentCategoryReference.category_key);
            var url = this.mockHttpRequestBase.Object.Url;
            var category = mockCmpRequestContext.Object.CurrentCategory;
            target_grid_config_chart_area_id = ChartPageController.ParseQueryForChartAreaId(url.Query);
            var search = new Search(new CategorySource(category));
            search.Name = "JDBChart";
            if (url != null)
            {
                parserManager.Parse(url.Query, search);
                target_grid_config_chart_area_id = ChartPageController.ParseQueryForChartAreaId(url.Query);
            }

            model.ChartModel = new ChartModel();
            model.ChartModel.ChartId = "Chart" + DateTime.Now.Ticks;

            if (string.IsNullOrWhiteSpace(target_grid_config_chart_area_id) == false)
            {
                var currencyRequested = this.mockHttpRequestBase.Object.Url.AbsoluteUri.Substring(this.mockHttpRequestBase.Object.Url.AbsoluteUri.IndexOf("CURRENCY_") + 9, 3);
                var chartData = ChartPageController.GetChart(
                    this.mockCmpRequestContext.Object.CurrentProvider,
                    this.mockCmpRequestContext.Object,
                    this.mockCpmSession.Object.Authorization,
                    "div_" + model.ChartModel.ChartId,
                    search,
                    target_grid_config_chart_area_id,
                    currencyRequested,
                    this.GetCorrectUser());

                // adjust the Y axis for units
                if (search.SelectedIndexers.Any(idx => idx.ObjectKey == "FT_PRODUCTION_UNITS"))
                {
                    chartData.yAxis[0].title = new Apps.CMP.Models.Chart.Title() { text = "Units" };
                    chartData.yAxis[0].labels = new Apps.CMP.Models.Chart.Labels() { format = "{value:,.0f}", align = "left" };
                }

                chartData.credits.enabled = true;
                if (chartData.credits.enabled)
                {
                    string creditTextPre = string.Empty;
                    if (search.SelectedIndexers.Any(idx => idx.ObjectKey == "INFLATE"))
                    {
                        creditTextPre = "Current ";
                    }
                    else
                    {
                        creditTextPre = "Constant ";
                    }

                    if (search.SelectedIndexers.Any(idx => idx.ObjectKey == "BY_FORCE"))
                    {
                        chartData.title.text = "Defence Budget by Force";
                    }
                    else
                    if (search.SelectedIndexers.Any(idx => idx.ObjectKey == "BY_ACTIVITY"))
                    {
                        chartData.title.text = "Defence Budget by Activity";
                    }

                    if (!url.ToString().Contains("COUNTRY"))
                    {
                        chartData.title.text = "Worldwide " + chartData.title.text;
                    }

                    chartData.credits.text = creditTextPre + chartData.credits.text;
                }

                chartData.lang.noData = "Select some filters from the left.";

                // create a tooltip object & ensure it's disabled
                // by default HiChart enables tooltip popups on charts
                if (chartData.tooltip == null)
                {
                    chartData.tooltip = new Apps.CMP.Models.Chart.Tooltip();
                    chartData.tooltip.enabled = false;
                }

                model.ChartModel.Data = string.Empty;
                if (chartData != null)
                {
                    
                    chartData.series = chartData.series.OrderBy(x => x.order).ThenBy(x => x.order).ToList();

                    model.ChartModel.Data = chartData.PrepareJSON();
                }

                model.ChartModel.ContainerId = "div_" + model.ChartModel.ChartId;
            }

            model.Name = name;
            model.SubTitle = LanguageUtils.GetGlobalResourceString(!string.IsNullOrEmpty(this.mockCmpRequestContext.Object.CurrentCategoryReference.subtitle_resource_key) ? this.mockCmpRequestContext.Object.CurrentCategoryReference.subtitle_resource_key : string.Empty);
            model.Breadcrumb = UIUtils.GetPageBreadcrumb(this.mockCmpRequestContext.Object);

            // return Json(model, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Assigns a supplied <see cref="IHS.Apps.CMP.DataProviders.Model.ProviderAttribute"/> to a
        /// supplied <see cref="IHS.Core.Catalog.Model.CommonIndexerList"/> before also adding it to
        /// the provider attributes dictionary.
        /// </summary>
        /// <param name="providerCategory">The category to add the attribute assignment to.</param>
        /// <param name="indexers">The indexer list to add the attribute to.</param>
        /// <param name="attribute">The attribute to assign.</param>
        /// <param name="codeName">The name used for the attribute in code.</param>
        /// <param name="metaData">Attribute metadata to be added as assigned.</param>
        /// <seealso cref="AddAttributeToProviderAttributes"></seealso>
        private void AssignAttributeToProviderCategory(ProviderCategory providerCategory, CommonIndexerList<IIndexer> indexers, ProviderAttribute attribute, string codeName, TSQLMetadata metaData)
        {
            if (attribute != null)
            {
                if (metaData != null)
                {
                    // add all the common metadata
                    foreach (TSQLMetadataItem mi in metaData.AttributeMetadata)
                    {
                        attribute.SetMetaDataValue(mi.MetaKey, mi.MetaValue);
                    }

                    // add specific metadata for the attribute
                    foreach (TSQLMetadataItem mi in metaData.SpecificAttributeMetadata.Where(a => a.ObjectKey == attribute.ObjectKey))
                    {
                        attribute.SetMetaDataValue(mi.MetaKey, mi.MetaValue);
                    }

                    // add specific metadata for the attribute
                    foreach (TSQLMetadataItem mi2 in metaData.SpecificAttributeMetadata.Where(a => a.ObjectKey.EndsWith("*", StringComparison.OrdinalIgnoreCase) &&
                        attribute.ObjectKey.ToUpperInvariant().StartsWith(a.ObjectKey.Replace("*", string.Empty), StringComparison.OrdinalIgnoreCase)))
                    {
                        attribute.SetMetaDataValue(mi2.MetaKey, mi2.MetaValue);
                    }
                }

                if (!indexers.Any(i => i.DisplayName.Equals(codeName, StringComparison.OrdinalIgnoreCase)))
                {
                    indexers.Add(new CategoryAttributeAssignment(providerCategory, attribute));

                    // cache it also
                    if (!this.providerAttributes.ContainsKey(attribute.DisplayName))
                    {
                        this.providerAttributes.AddOrUpdate(attribute.DisplayName, attribute, (k, v) => attribute);
                    }
                }
            }
        }

        protected Mock<T> NewMock<T>() where T : class
        {
            var type = typeof(T);
            var constructors = type.GetConstructors();
            if (constructors.Length == 0) constructors = type.GetConstructors(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
            if (constructors.Length == 0) return new Mock<T>();

            var constructor = constructors[0];
            var parameters = constructor.GetParameters();

            var objects = parameters
                .Select(p => p.ParameterType.IsValueType ? Activator.CreateInstance(p.ParameterType) : null)
                .ToArray();
            var constructorInfo = typeof(Mock<T>).GetConstructor(new Type[] { typeof(object[]) });
            return (Mock<T>)constructorInfo.Invoke(new object[] { objects });
        }

        public string GetCorrectUser()
        {
            return this.mockCpmSession.Object.BaseSession[CMPConfiguration.ImpersonatingUserId] == null ? "0000" : mockCpmSession.Object.BaseSession[CMPConfiguration.ImpersonatingUserId].ToString();
        }

        public class MockHttpSession : HttpSessionStateBase
        {
            Dictionary<string, object> _sessionDictionary = new Dictionary<string, object>();
            public override object this[string name]
            {
                get
                {
                    return _sessionDictionary.ContainsKey(name) ? _sessionDictionary[name] : null;
                }
                set
                {
                    _sessionDictionary[name] = value;
                }
            }

            public override void Abandon()
            {
                var keys = new List<string>();

                foreach (var kvp in _sessionDictionary)
                {
                    keys.Add(kvp.Key);
                }

                foreach (var key in keys)
                {
                    _sessionDictionary.Remove(key);
                }
            }

            public override void Clear()
            {
                var keys = new List<string>();

                foreach (var kvp in _sessionDictionary)
                {
                    keys.Add(kvp.Key);
                }

                foreach (var key in keys)
                {
                    _sessionDictionary.Remove(key);
                }
            }
        }

        private DataTable SetupDataTableForGetResultsReturnValue()
        {
            var dt = new DataTable();
            dt.Columns.Add(new DataColumn("ItemID", typeof(string)));
            dt.Columns.Add(new DataColumn("VALUE", typeof(string)));
            dt.Columns.Add(new DataColumn("SERIESVAL", typeof(string)));
            dt.Columns.Add(new DataColumn("X", typeof(string)));
            dt.Rows.Add(Guid.NewGuid().ToString(), "129.01", "GROUPVAL1", "FRANCE");
            dt.Rows.Add(Guid.NewGuid().ToString(), "500", "GROUPVAL1", "ENGLAND");

            return dt;

        }

    }
}




