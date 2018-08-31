// <copyright file="ChartPageController.cs" company="IHS">
//   © 2015, IHS Inc. and its affiliated and subsidiary companies, all rights reserved. All other trademarks
//   are the property of IHS Inc. and its affiliated and subsidiary companies. This product, including
//   software, data and documentation are licensed to the user for its internal business purposes only and may
//   not be disclosed, disseminated, sold, licensed, copied, reproduced, translated or transferred to any third
//   party. IHS Inc. 15 Inverness Way East Englewood, Colorado 80112 USA
//   +1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.Web.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Web.Mvc;
    using System.Web.SessionState;
    using IHS.Apps.CMP.DataProviders;
    using IHS.Apps.CMP.Models;
    using IHS.Apps.CMP.Models.Configuration;
    using IHS.Apps.CMP.Models.Security;
    using IHS.Apps.CMP.Models.ViewModels;
    using IHS.Apps.CMP.Utilities;
    using IHS.Apps.CMP.Utilities.URLParsers;
    using IHS.Apps.CMP.Web.Classes;
    using IHS.Apps.CMP.Web.ServiceLayer;
    using IHS.Apps.CMP.Web.ServiceLayer.Interfaces;
    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;
 
    /// <summary> The chart page controller. </summary>
    [SessionState(SessionStateBehavior.ReadOnly)]
    public class ChartPageController : CategoryController
    {
        #region Private Fields

        /// <summary> The janes service. </summary>
        private readonly ISearchService searchService;

        /// <summary>
        /// The facet service
        /// </summary>
        private readonly IFacetService facetService;

        /// <summary> The provider. </summary>
        private AbstractDataProvider provider;

        #endregion Private Fields

        #region Public Constructors

        /// <summary>
        /// Initialises a new instance of the <see cref="SearchController" /> class. Initializes a new
        /// instance of the <see cref="SearchController" /> class.
        /// </summary>
        /// <param name="searchService">The SearchService to use</param>
        /// <param name="facetService">The facet service.</param>
        public ChartPageController(ISearchService searchService, IFacetService facetService)
        {
            this.searchService = searchService;
            this.facetService = facetService;
        }

        #endregion Public Constructors

        #region Public Properties

        /// <summary> Gets the provider. </summary>
        public AbstractDataProvider Provider
        {
            get
            {
                if (this.provider == null)
                {
                    this.provider = this.CmpRequest.CurrentProvider;
                }

                return this.provider;
            }
        }

        #endregion Public Properties

        #region Public Methods

        /// <summary> Retrieves the chart markup </summary>
        /// <returns> The <see cref="ActionResult"/>. </returns>
        public ActionResult Chart()
        {
            bool getChartData = false;
            var model = this.GetResultsModel(getChartData);

            return this.View("Charts", model);
        }

        /// <summary> Get all the available charts for a given category. </summary>
        /// <returns> Chart data in JSON format. </returns>
        public JsonResult GetAvailableCharts()
        {
            List<Tuple<string, string, string>> charts = new List<Tuple<string, string, string>>();

            if (this.CmpRequest.CurrentCategoryGridConfig.chart != null && this.CmpRequest.CurrentCategoryGridConfig.chart.area.Length > 0)
            {
                foreach (chartArea chartArea in this.CmpRequest.CurrentCategoryGridConfig.chart.area)
                {
                    charts.Add(new Tuple<string, string, string>(chartArea.title, chartArea.id, chartArea.y_axis[0].type.ToString()));
                }
            }
            else
            {
                if (this.CmpRequest.CurrentCategoryGridConfig.template != null && this.CmpRequest.CurrentCategoryGridConfig.template.Length > 0)
                {
                    // get the first template which has some data, this may not be good enough in the future.
                    foreach (template template in this.CmpRequest.CurrentCategoryGridConfig.template)
                    {
                        if (template.chart != null && template.chart.area.Length > 0)
                        {
                            foreach (chartArea chartArea in template.chart.area)
                            {
                                charts.Add(new Tuple<string, string, string>(chartArea.title, chartArea.id, chartArea.y_axis[0].type.ToString()));
                            }

                            break;
                        }
                    }
                }
            }

            return this.Json(charts, JsonRequestBehavior.AllowGet);
        }

        /// <summary> The get results. </summary>
        /// <returns> The <see cref="ActionResult"/>. </returns>
        [ValidateInput(false)] // Turned off validation as special characters are allowed in the query
        public JsonResult GetResults()
        {
            bool getChartData = true;
            var model = this.GetResultsModel(getChartData);

            return this.Json(model, JsonRequestBehavior.AllowGet);
        }

        #endregion Public Methods

        #region Internal Methods

        /// <summary> Builds the chart for the given <paramref name="search"/>. </summary>
        /// <param name="provider">                         The provider to use. </param>
        /// <param name="cmpRequest">                       The request context. </param>
        /// <param name="authorisation">                    The authorisations for the user. </param>
        /// <param name="target_div_id">                    The id of the html target. </param>
        /// <param name="search">                           The search object. </param>
        /// <param name="target_grid_config_chart_area_id"> The chart config to use (from the grid config). </param>
        /// <param name="currency">                         The currency to use if required. </param>
        /// <param name="userId">                           The user Id to use if required. </param>
        /// <returns> A chart object. </returns>
        internal static Chart GetChart(
            AbstractDataProvider provider, 
            ICmpRequestContext cmpRequest,
            AaaAuthorisation authorisation,
            string target_div_id,
            ISearch search, 
            string target_grid_config_chart_area_id, 
            string currency, 
            string userId)
        {
            var configCategory = provider.GetCategory(cmpRequest.CurrentCategory.ObjectKey);
            Chart hcc = GetChartConfig(provider, cmpRequest, target_div_id, target_grid_config_chart_area_id, configCategory);

            if (hcc == null)
            {
                return null;
            }

            Tuple<chartArea, chart> configData = ChartService.GetChartConfig(hcc);

            chartArea chartArea = configData.Item1;

            try
            {
                if (hcc.chart == null)
                {
                    hcc.chart = new Chart.ChartType();
                }

                hcc.chart.zoomType = "xy";

                hcc.chart.events = new Chart.Events();
                hcc.chart.events.click = "placeholder";

                if (!string.IsNullOrEmpty(chartArea.title))
                {
                    hcc.title.text = chartArea.title;
                }

                if (chartArea.title_methodSpecified)
                {
                    hcc.title.text = ChartService.GetTitleFromTitleMethod(hcc.title.text, chartArea.title_method, search as Search, userId);

                    //// Charts config are not granular enough to differentiate between chart types (i.e. MarketsForecast charts all use same chart config regardless of forecast type.)
                    //// Do not display CAGR when Product Units forecast is displayed.
                    //// TODO: Consider a more elegant way of managing this?
                    if (hcc.cmp_categoryUrl.Equals("MarketsForecast", StringComparison.InvariantCultureIgnoreCase))
                    {
                        chartArea.show_cagr_on_summary_table = !hcc.title.text.EndsWith("Production Units", StringComparison.InvariantCultureIgnoreCase);
                    }
                }

                hcc.target_grid_config_chart_area_id = chartArea.id;
                hcc.use_hi_stocks = chartArea.use_hi_stocks;

                hcc.yAxis.Add(new Chart.YAxi { opposite = false });
            }
            catch
            {
            }

            return GetChart2(provider, cmpRequest.CurrentCategory.ObjectKey, authorisation, target_div_id, search, hcc, configData, currency, userId);
        }

        /// <summary> Builds the chart for the given <paramref name="search"/>. </summary>
        /// <param name="provider">                         The provider to use. </param>
        /// <param name="categoryKey">                       The required category key. </param>
        /// <param name="authorisation">                    The authorisations for the user. </param>
        /// <param name="target_div_id">                    The id of the html target. </param>
        /// <param name="search">                           The search object. </param>
        /// <param name="hcc">                              The chart config to use. </param>
        /// <param name="configData">                       The config to use. </param>
        /// <param name="currency">                         The currency to use if required. </param>
        /// <param name="userId">                           The user Id to use if required. </param>
        /// <returns> A chart object. </returns>
        internal static Chart GetChart2(
            AbstractDataProvider provider, 
            string categoryKey,
            AaaAuthorisation authorisation, 
            string target_div_id, 
            ISearch search, 
            Chart hcc, 
            Tuple<chartArea, chart> configData, 
            string currency, 
            string userId)
        {
            Chart data = null;

            if (hcc == null)
            {
                return null;
            }

            ChartService chartService = new ChartService();
            chartArea chartArea = configData.Item1;
            chart chartConfig = configData.Item2;
            try
            {
                if (hcc.chart == null)
                {
                    hcc.chart = new Chart.ChartType();
                }

                hcc.chart.zoomType = "xy";

                hcc.chart.events = new Chart.Events();
                hcc.chart.events.click = "placeholder";

                if (!string.IsNullOrEmpty(chartArea.title))
                {
                    hcc.title.text = chartArea.title;
                }

                if (chartArea.title_methodSpecified)
                {
                    hcc.title.text = ChartService.GetTitleFromTitleMethod(hcc.title.text, chartArea.title_method, search as Search, userId);
                }

                hcc.target_grid_config_chart_area_id = chartArea.id;
                hcc.use_hi_stocks = chartArea.use_hi_stocks;

                hcc.yAxis.Add(new Chart.YAxi { opposite = false });

                //chartArea.units = "M";
                //chartArea.y_axis_label_align = "right";
            }
            catch
            {
            }

            data = chartService.GetChartForJson(chartConfig, chartArea, hcc, search as Search, authorisation, true, string.IsNullOrWhiteSpace(currency) ? "USD" : currency);
            data.title.x = 20;

            data.lang.noData = "No results matching the current filters.";

            data.SetColors(new List<string>
                {
                    "#d8dcdb", "#a2caec", "#103C68", "#96bc33", "#ecee9a", "#ffdd7f", "#f7bfad", "#2a78a8", "#bed158", "#FCB94D", "#a1abb2", "#e98756", "#f7941d", "#3a4e58", "#f04e23", "#0097D1"
                });

            return data;
        }

        /// <summary>
        /// Get the high chart config.
        /// </summary>
        /// <param name="provider">The provider to use.</param>
        /// <param name="cmpRequest">The cmp request.</param>
        /// <param name="target_div_id">The target div.</param>
        /// <param name="target_grid_config_chart_area_id">The id of the chart config.</param>
        /// <param name="configCategory">The category of the config.</param>
        /// <returns>A chart model.</returns>
        internal static Chart GetChartConfig(AbstractDataProvider provider, ICmpRequestContext cmpRequest, string target_div_id, string target_grid_config_chart_area_id, ICategory configCategory)
        {
            var hcc = new IHS.Apps.CMP.Models.Chart();

            hcc.cmp_categoryKey = configCategory.ObjectKey;
            hcc.cmp_categoryUrl = MvcMappingsHelper.Instance.FindMvcMappingByCategoryKey(configCategory.ObjectKey).url_key;
            hcc.cmp_providerKey = provider.Name;
            hcc.cmp_applicationKey = cmpRequest.ApplicationConfig.name;
            hcc.cmp_viewName = string.Empty;
            //// hcc.cmp_templateName = "byType";
            hcc.target_div_id = target_div_id;
            hcc.target_grid_config_chart_area_id = target_grid_config_chart_area_id;
            hcc.exporting = new IHS.Apps.CMP.Models.Chart.Exporting();
            hcc.exporting.enabled = false;
            hcc.chart = new IHS.Apps.CMP.Models.Chart.ChartType();
            hcc.legend = new IHS.Apps.CMP.Models.Chart.Legend(); // use default highchart values.
            return hcc;
        }

        /// <summary>
        /// Get the chart configurations from the service.
        /// </summary>
        /// <param name="hcc">The config to use.</param>
        /// <returns>A chart</returns>
        internal static Tuple<chartArea, chart> GetChartConfigs(Chart hcc)
        {
            return ChartService.GetChartConfig(hcc);
        }

        /// <summary>
        ///   Builds the chart for the given <paramref name="search"/> and converts the result to JSON.
        /// </summary>
        /// <param name="provider">                         The provider to use. </param>
        /// <param name="cmpRequest">                       The request context. </param>
        /// <param name="authorisation">                    The authorisations for the user. </param>
        /// <param name="target_div_id">                    The id of the html target. </param>
        /// <param name="search">                           The search object. </param>
        /// <param name="target_grid_config_chart_area_id"> The chart config to use (from the grid config). </param>
        /// <param name="currency">                         The currency to use if required. </param>
        /// <param name="userId">                           The user Id to use if required. </param>
        /// <returns> A string representation of the chart in json. </returns>
        internal static string GetChartJson(
            AbstractDataProvider provider, 
            ICmpRequestContext cmpRequest,
            AaaAuthorisation authorisation, 
            string target_div_id, 
            ISearch search, 
            string target_grid_config_chart_area_id, 
            string currency, 
            string userId)
        {
            string json = string.Empty;

            Chart data = ChartPageController.GetChart(provider, cmpRequest, authorisation, target_div_id, search, target_grid_config_chart_area_id, currency, userId);

            if (data != null)
            {
                json = data.PrepareJSON();
            }

            return json;
        }

        /// <summary> Parse the url query to see if a chart area id has been passed in. </summary>
        /// <param name="decodedQuery"> The query string. </param>
        /// <returns> The Chart Area ID if found, else empty string. </returns>
        internal static string ParseQueryForChartAreaId(string decodedQuery)
        {
            var queryKeyValue = decodedQuery.Replace("?", string.Empty).Split('&');
            var removeString = "cid=";
            foreach (var keyValue in queryKeyValue)
            {
                if (keyValue.StartsWith(removeString, StringComparison.InvariantCultureIgnoreCase))
                {
                    return keyValue.Remove(0, removeString.Length);
                }
            }

            return string.Empty;
        }

        #endregion Internal Methods

        #region Protected Methods

        /// <summary> Creates new search object based on the current category. </summary>
        /// <returns> The <see cref="ISearch"/>. </returns>
        protected ISearch CreateSearch()
        {
            var category = this.CmpRequest.CurrentCategory;
            return new Search(new CategorySource(category));
        }

        #endregion Protected Methods

        #region Private Methods

        /// <summary> Retrieve the model for the search results. </summary>
        /// <param name="getChart"> A value indicating whether to get the chart model and data. </param>
        /// <returns> The search results model. </returns>
        private ChartPageModel GetResultsModel(bool getChart)
        {
            var search = this.CreateSearch();
            var config = UIUtils.CreateParserConfigObject(this.CmpRequest);
            var parserManager = new URLToSearchParser(config);
            string target_grid_config_chart_area_id = string.Empty;
            string name = LanguageUtils.GetGlobalResourceString(!string.IsNullOrEmpty(this.CmpRequest.CurrentCategoryReference.title_resource_key) ? this.CmpRequest.CurrentCategoryReference.title_resource_key : this.CmpRequest.CurrentCategoryReference.category_key);
            var url = this.Request.Url;

            if (url != null)
            {
                parserManager.Parse(url.Query, search);
                target_grid_config_chart_area_id = ChartPageController.ParseQueryForChartAreaId(url.Query);
            }

            var renderTimeStarted = DateTime.Now;
            var configCategory = this.InitializeCategory();
            var categoryKey = this.CmpRequest.CurrentCategory.ObjectKey;
            var catConfig = this.CmpRequest.CurrentCategoryControlConfig;
            var conConfig = this.CmpRequest.ControlConfig;

            var availableFacets = this.facetService.GetPanels(conConfig, catConfig, this.Provider, search, this.User, this.Session.Authorization, categoryKey);

            ChartPageModel model = new ChartPageModel();
            ResultsMetaDataModel metaData = new ResultsMetaDataModel();
            model.MetaData = metaData;

            model.ChartModel = new ChartModel();
            model.ChartModel.ChartId = "Chart" + DateTime.Now.Ticks;

            if (getChart && string.IsNullOrWhiteSpace(target_grid_config_chart_area_id) == false)
            {
                model.ChartModel.Data = GetChartJson(
                    this.Provider, 
                    this.CmpRequest, 
                    this.Session.Authorization,
                    "div_" + model.ChartModel.ChartId, 
                    search, 
                    target_grid_config_chart_area_id, 
                    null, 
                    null);

                model.ChartModel.ContainerId = "div_" + model.ChartModel.ChartId;
            }

            var simpleFacets = new FacetParser(config).ParseToSimpleFacets(url.Query);
            metaData.AppliedFacets = this.facetService.GetSelectedFacets(search, simpleFacets, configCategory);

            metaData.AvailableFacets = availableFacets;

            model.Name = name;
            model.SubTitle = LanguageUtils.GetGlobalResourceString(!string.IsNullOrEmpty(this.CmpRequest.CurrentCategoryReference.subtitle_resource_key) ? this.CmpRequest.CurrentCategoryReference.subtitle_resource_key : string.Empty);

            model.Breadcrumb = UIUtils.GetPageBreadcrumb(this.CmpRequest);

            model.MetaData.RenderTime = (DateTime.Now - renderTimeStarted).ToString();
            return model;
        }

        /// <summary> The initialize category. </summary>
        /// <exception cref="ApplicationException"> Initialise the values for the custom view page </exception>
        /// <returns> The <see cref="IAttributeContainer"/>. </returns>
        private IAttributeContainer InitializeCategory()
        {
            var search = this.CreateSearch();

            IAttributeContainer container;
            CategoryConstraint categoryConstraint = UIObjectHelper.GetCategoryConstraint(search);
            if (categoryConstraint == null || categoryConstraint.CategoryIDList == null || categoryConstraint.CategoryIDList.Count == 0)
            {
                container = this.CmpRequest.CurrentCategory;
            }
            else
            {
                var source = search.SearchSource as GenerousDomainSource;
                if (source != null && categoryConstraint.CategoryIDList.Count > 1)
                {
                    container = source.Domains[0];
                }
                else
                {
                    Guid categoryGuid = new Guid(categoryConstraint.CategoryIDList[0].ToString());
                    container = UIObjectHelper.GetCategory(this.Provider, categoryGuid);
                }
            }

            if (container == null)
            {
                throw new ApplicationException("Cannot establish a config category ID");
            }

            return container;
        }

        #endregion Private Methods
    }
}