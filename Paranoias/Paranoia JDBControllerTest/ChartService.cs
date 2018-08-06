// <copyright file="ChartService.cs" company="IHS">
// © 2015, IHS Inc. and its affiliated and subsidiary companies, all rights reserved.
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

namespace IHS.Apps.CMP.Web.ServiceLayer
{
    using IHS.Apps.CMP.Common;
    using IHS.Apps.CMP.DataProviders;
    using IHS.Apps.CMP.Models;
    using IHS.Apps.CMP.Models.Configuration;
    using IHS.Apps.CMP.Models.Security;
    using IHS.Apps.CMP.Utilities;
    using IHS.Apps.CMP.Utilities.Config;
    using IHS.Apps.CMP.Utilities.ResultBuilders;
    using IHS.Apps.CMP.Web.ServiceLayer.AandD;
    using IHS.Apps.CMP.Web.ServiceLayer.Interfaces;
    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;
    using Models.ViewModels;
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Data;
    using System.Globalization;
    using System.Linq;
    using System.Text;
    using System.Web;

    /// <summary>
    /// used to Generate CMPHiChart object
    /// Generally copied from UI/Controls/HiChart.ascx.cs
    /// </summary>
    public class ChartService : IChartService
    {
        #region Public Fields

        /// <summary>
        /// 
        /// </summary>
        public static readonly string NoChartConfigForCategoryFound = "No chart configuration setup for category";

        #endregion Public Fields

        #region Private Fields

        /// <summary>
        /// Holds the localized number format
        /// </summary>
        private static string numberFormat = LanguageUtils.GetGlobalResourceString("numericFormat");

        #endregion Private Fields

        #region Public Methods

        /// <summary>
        /// Gets Chart Area Configurations and Chart Configurations based on
        /// settings in the chart object
        /// </summary>
        /// <param name="hcc">Chart object</param>
        /// <returns>Chart area configurations and Chart Configuration as a Tuple</returns>
        public static Tuple<chartArea, chart> GetChartConfig(Chart hcc)
        {
            chartArea retVal = null;
            chart chartConfig = null;

            var prov = DataProviderManager.GetProvider(hcc.cmp_providerKey);
            var cat = prov.GetCategory(hcc.cmp_categoryKey);
            var gridConfig = GridUtil.LoadConfig(hcc.cmp_applicationKey, hcc.cmp_categoryKey);
            var gcc = GridUtil.GetConfigForCategory(gridConfig, cat);

            // default the charts to the category level one if there is one.
            if (gcc.chart != null)
            {
                chartConfig = gcc.chart;
            }

            var gct = GridUtil.GetTemplateForCategory(gcc, hcc.cmp_templateName);
            if (gct != null)
            {
                // we have a template - check for charts
                if (gct.chart != null)
                {
                    chartConfig = gct.chart;
                }
            }

            if (chartConfig == null)
            {
                // last try - take the first template
                if (gcc.template[0].chart != null)
                {
                    chartConfig = gcc.template[0].chart;
                }
            }

            if (chartConfig == null)
            {
                throw new CMPException(ChartService.NoChartConfigForCategoryFound);
            }
            else
            {
                if (retVal == null)
                {
                    // look for charts with the correct id
                    foreach (chartArea area in chartConfig.area)
                    {
                        if (hcc.target_grid_config_chart_area_id.Equals(area.id, StringComparison.OrdinalIgnoreCase))
                        {
                            retVal = area;
                            break;
                        }
                    }
                }

                if (retVal == null && gct != null && gct.chart != null && gct.chart.area != null)
                {
                    // look for charts that match the title
                    foreach (chartArea area in gct.chart.area)
                    {
                        if (area.title == hcc.cmp_chartTitle)
                        {
                            retVal = area;
                        }
                    }
                }

                if (retVal == null)
                {
                    retVal = chartConfig.area[0]; //default
                }
            }

            return new Tuple<chartArea, chart>(retVal, chartConfig);
        }

        /// <summary>
        /// simple method to determine which type of title / what the title is,
        /// in future may be interfaced and class based
        /// </summary>
        /// <param name="previousTitle">Previous title value</param>
        /// <param name="method">Enumerated Method name to get the Title from/</param>
        /// <param name="search">Search Object</param>
        /// <returns>String of new title is method is defined, or previous title</returns>
        public static string GetTitleFromTitleMethod(string previousTitle, chart_title_method method, ISearch search)
        {
            return ChartService.GetTitleFromTitleMethod(previousTitle, method, search, null);
        }

        /// <summary>
        /// simple method to determine which type of title / what the title is,
        /// in future may be interfaced and class based
        /// </summary>
        /// <param name="previousTitle">Previous title value</param>
        /// <param name="method">Enumerated Method name to get the Title from/</param>
        /// <param name="search">Search Object</param>
        /// <param name="userId">Current User Id</param>
        /// <returns>String of new title is method is defined, or previous title</returns>
        public static string GetTitleFromTitleMethod(string previousTitle, chart_title_method method, ISearch search, string userId)
        {
            string retVal = previousTitle;
            switch (method)
            {
                case chart_title_method.use_config_title: break;
                case chart_title_method.jdsf_method:
                    {
                        // A  combination of Region + Market name + by + Segment name
                        // Current convention shows Worldwide if no  region is selected
                        // And then if the customer wants to change the name then we do allow that too?
                        StringBuilder sb = GetJMFTitle(search, userId, true);

                        retVal = sb.ToString();
                        break;
                    }

                case chart_title_method.jdsf_method2:
                    {
                        // A  combination of Region + Market name
                        // Current convention shows Worldwide if no  region is selected
                        // And then if the customer wants to change the name then we do allow that too?
                        StringBuilder sb = GetJMFTitle(search, userId, false);

                        retVal = sb.ToString();
                        break;
                    }

                case chart_title_method.jdsb_method:
                    {
                        // A combination of Region + Market name + by + Segment name
                        // Current convention shows Worldwide if no  region is selected
                        // And then if the customer wants to change the name then we do allow that too?
                        StringBuilder sb = new StringBuilder();

                        Collection<string> regions = GetConstraintValuesFromSearch(search, "REGION");
                        if (regions == null || regions.Count == 0)
                        {
                            sb.Append("Region: Worldwide");
                        }
                        else
                        {
                            sb.Append("Region: ");
                            sb.Append(string.Join(" + ", regions));
                        }

                        Collection<string> markets = GetConstraintValuesFromSearch(search, "MARKET");
                        if (markets != null && markets.Count > 0)
                        {
                            sb.Append(", Market: ");
                            sb.Append(string.Join(" + ", markets));
                        }

                        sb.Append(ChartService.GetTitleFromIndex(search, " by ", "MarketSegment"));

                        IIndexer timeSeriesIdx = search.SelectedIndexers.FirstOrDefault(ix => ix.GetMetaDataValue("idxGroup") != null && ix.GetMetaDataValue("idxGroup").Equals("TimeSeries"));
                        if (timeSeriesIdx == null)
                        {
                            // total years so disp0lay the years also
                            sb.Append(" (");
                            Collection<string> years = GetConstraintValuesFromSearch(search, "YEAR");
                            if (years != null && years.Count > 0)
                            {
                                sb.Append(string.Join(" - ", years));
                            }
                            else
                            {
                                sb.Append(DateTime.Now.AddYears(-5).Year);
                                sb.Append(" - ");
                                sb.Append(DateTime.Now.AddYears(10).Year);
                            }

                            sb.Append(")");
                        }

                        retVal = sb.ToString();
                        break;
                    }

                case chart_title_method.jdb_method:
                    {
                        string type = null;
                        string subType = null;
                        Collection<string> subSelect = new Collection<string>();

                        string desc = LanguageUtils.GetGlobalResourceString("JDB_RESULT_CHARTTITLE");

                        Collection<string> countries = GetConstraintValuesFromSearch(search, "COUNTRY");
                        if (countries == null || countries.Count == 0)
                        {
                            countries.Add("Worldwide");
                        }

                        // find the type of view being used
                        IIndexer timeSeriesIdx = search.SelectedIndexers.FirstOrDefault(ix => ix.GetMetaDataValue("idxGroup") != null && ix.GetMetaDataValue("idxGroup").Equals("JdbViewBy"));
                        if (timeSeriesIdx != null)
                        {
                            switch (timeSeriesIdx.ObjectKey)
                            {
                                case "BY_ACTIVITY":
                                    type = "Activity";
                                    subType = "Forces";
                                    subSelect = GetConstraintValuesFromSearch(search, "FORCE");
                                    break;

                                case "BY_FORCE":
                                    type = "Force";
                                    subType = "Activities";
                                    subSelect = GetConstraintValuesFromSearch(search, "ACTIVITY");
                                    break;

                                default:
                                    type = "!!!not set!!!";
                                    break;
                            }
                        }

                        var madeUpOf = string.Empty;
                        if (subSelect.Count > 0)
                        {
                            madeUpOf = string.Join(", ", subSelect.ToArray());
                        }
                        else
                        {
                            madeUpOf = "all " + subType;
                        }

                        var country = string.Join(", ", countries.ToArray());
                        retVal = string.Format(CultureInfo.InvariantCulture, desc, type, country, madeUpOf);

                        break;
                    }

                case chart_title_method.jdsf_equip_method:
                    {
                        // A  combination of Region + Market name + by + Segment name
                        // Current convention shows Worldwide if no  region is selected
                        // And then if the customer wants to change the name then we do allow that too?
                        StringBuilder sb = new StringBuilder();

                        Collection<string> regions = GetConstraintValuesFromSearch(search, "STD_REGION");
                        Collection<string> countries = GetConstraintValuesFromSearch(search, "STD_COUNTRY");
                        if (countries == null || countries.Count == 0)
                        {
                            if (regions == null || regions.Count == 0)
                            {
                                sb.Append("Region: Worldwide");
                            }
                            else
                            {
                                sb.Append("Region: ");
                                sb.Append(string.Join(" + ", regions));
                            }
                        }
                        else
                        {
                            sb.Append("Country: ");
                            sb.Append(string.Join(" + ", countries));
                        }

                        // Placeholder text for equipment type
                        sb.Append(" <PLACEHOLDER>");

                        sb.Append(ChartService.GetTitleFromIndex(search, " by ", "MarketSegment"));

                        IIndexer timeSeriesIdx = search.SelectedIndexers.FirstOrDefault(ix => ix.GetMetaDataValue("idxGroup") != null && ix.GetMetaDataValue("idxGroup").Equals("TimeSeries"));
                        if (timeSeriesIdx == null)
                        {
                            // total years so disp0lay the years also
                            sb.Append(" (");
                            Collection<string> years = GetConstraintValuesFromSearch(search, "YEAR");
                            if (years != null && years.Count > 0)
                            {
                                sb.Append(string.Join(" - ", years));
                            }
                            else
                            {
                                sb.Append(DateTime.Now.Year);
                                sb.Append(" - ");
                                sb.Append(DateTime.Now.AddYears(9).Year);
                            }

                            sb.Append(")");
                        }

                        retVal = sb.ToString();
                        break;
                    }
            }

            return retVal;
        }

        /// <summary>
        /// Returns a fully hydrated ChartPageModel for a requested chart.
        /// </summary>
        /// <param name="parameters">A FlexiChartControllerParameters object.</param>
        /// <returns>A fully fledged chart page model. <see cref="FlexiChartControllerParameters"/></returns>
        public ChartPageModel GetFlexiChart(FlexiChartControllerParameters p)
        {
            ChartPageModel model = new ChartPageModel();
            model.ChartModel = new ChartModel();
            model.ChartModel.ChartId = "Chart" + DateTime.Now.Ticks;

            p.parserManager.Parse(p.url.Query, p.search);
            p.target_grid_config_chart_area_id = ChartService.ParseQueryForChartAreaId(p.url.Query);
            // Set the search.name property so that we can hit a specific query.
            p.search.Name = "FlexiChart";

            const string CHART_METADATA_X = "CHART_METADATA_X";
            const string CHART_METADATA_Y = "CHART_METADATA_Y";
            const string CHART_METADATA_G = "CHART_METADATA_G";
            const string CHART_METADATA_XCOUNT = "CHART_METADATA_XCOUNT";
            const string CHART_METADATA_GCOUNT = "CHART_METADATA_GCOUNT";

            string chartMetadata = p.url.Query.Split(new[] { "CHART_METADATA(" }, StringSplitOptions.None)[1];
            chartMetadata = chartMetadata.Split(new[] { ")" }, StringSplitOptions.None)[0];
            string[] variables = chartMetadata.Split(new[] { "**" }, StringSplitOptions.None);

            var equalsConstraintX = new EqualsConstraint(UIObjectHelper.GetIndexer(p.search.SearchSource, CHART_METADATA_X), variables[0].Replace("X_eq_",""));
            p.search.Constraints.Add(equalsConstraintX);

            var equalsConstraintY = new EqualsConstraint(UIObjectHelper.GetIndexer(p.search.SearchSource, CHART_METADATA_Y), variables[1].Replace("Y_eq_", ""));
            p.search.Constraints.Add(equalsConstraintY);

            var equalsConstraintG = new EqualsConstraint(UIObjectHelper.GetIndexer(p.search.SearchSource, CHART_METADATA_G), variables[2].Replace("GROUPBY_eq_", ""));
            p.search.Constraints.Add(equalsConstraintG);

            var equalsConstraintXCount = new EqualsConstraint(UIObjectHelper.GetIndexer(p.search.SearchSource, CHART_METADATA_XCOUNT), variables[3].Replace("XCount=", ""));
            p.search.Constraints.Add(equalsConstraintXCount);

            var equalsConstraintGCount = new EqualsConstraint(UIObjectHelper.GetIndexer(p.search.SearchSource, CHART_METADATA_GCOUNT), variables[4].Replace("GCount=", ""));
            p.search.Constraints.Add(equalsConstraintGCount);

            string chartMetadataXKey = variables[0].Substring(5);
            string chartMetadataYKey = variables[1].Substring(5);
            string chartMetadataGroupKey = variables[2].Substring(11);
            string xTitle = p.flexichart.permitted_keys.x.Where(i => i.key == chartMetadataXKey).FirstOrDefault().title;
            string yTitle = p.flexichart.permitted_keys.y.Where(i => i.key == chartMetadataYKey).FirstOrDefault().title;
            string gTitle = p.flexichart.permitted_keys.g.Where(i => i.key == chartMetadataGroupKey).FirstOrDefault().title;
            if (chartMetadata.ToLowerInvariant().Contains("nothing"))
            {
                gTitle = string.Empty;
            }

            string ChartType = chartMetadata.Substring(chartMetadata.IndexOf("CHARTTYPE_eq_", StringComparison.InvariantCultureIgnoreCase) + 13) ?? "Column";

            var hcc = ChartService.GetChartConfig(p.providername, p.applicationKey, "div_" + model.ChartModel.ChartId,
                p.target_grid_config_chart_area_id, p.configCategory);
            var y_axis = new chartAreaY_axis[] {
                new chartAreaY_axis() {
                    type = (chart_type) Enum.Parse(typeof(chart_type), ChartType, true),
                    stacked = true,
                    data_type = data_type.@double,
                    title = yTitle,
                    key = "VALUE" }
            };
            var newChartArea = new chartArea()
            {
                id = "JDSFChartConfigArea",
                show_program_count = false,
                y_axis = y_axis,
                x_axis = new chartAreaX_axis() { key = "X", data_type = data_type.@string, title = xTitle },
                query_name = "FlexiChart",
                grouping_key = "SERIESVAL",
                show_totals_on_summary_table = true,
                show_summary_table = true,
                title = yTitle + " per " + xTitle + (!string.IsNullOrWhiteSpace(gTitle) ? " grouped by " + gTitle : ""),
                title_method = chart_title_method.use_config_title,
                title_methodSpecified = true,
                renderWhenOnlyCategoryConstraintPresent = false
            };

            Tuple<chartArea, chart> configData;
            try
            {
                configData = ChartService.GetChartConfig(hcc);
            }
            catch (CMPException cmpEx) when (cmpEx.Message.Equals(ChartService.NoChartConfigForCategoryFound))
            {
                configData = new Tuple<chartArea, chart>(newChartArea, null);
            }

            Tuple<chartArea, chart> configDataFixed = new Tuple<chartArea, chart>(newChartArea, configData.Item2);

            configData.Item2.updated_date_query_name = string.Empty;

            p.chartData = ChartService.GetChart2(p.auths, p.search, hcc, configDataFixed, "NOCURRENCY", p.userid);

            p.chartData.yAxis[0].title = new Apps.CMP.Models.Chart.Title() { text = yTitle };

            if (p.chartData.legend.title == null)
            {
                p.chartData.legend.title = new Apps.CMP.Models.Chart.Title();
                p.chartData.legend.title.text = gTitle;
            }

            if (string.IsNullOrWhiteSpace(gTitle))
            {
                p.chartData.legend.enabled = false;
            }

            if (p.chartData.credits.enabled)
            {

                p.chartData.credits.text = "CREDITS";
            }

            p.chartData.lang.noData = "No results matching the current filters.";

            // create a tooltip object & ensure it's disabled
            // by default HiChart enables tooltip popups on charts
            if (p.chartData.tooltip == null)
            {
                p.chartData.tooltip = new Apps.CMP.Models.Chart.Tooltip();
                p.chartData.tooltip.enabled = false;
            }

            model.ChartModel.Data = string.Empty;
            if (p.chartData != null)
            {
                model.ChartModel.Data = p.chartData.PrepareJSON();
            }

            model.ChartModel.ContainerId = "div_" + model.ChartModel.ChartId;
            model.Name = p.name;

            return model;

        }
       

        /// <summary>
        /// Sets "last Updated" text in the chart Credit.
        /// </summary>
        /// <param name="provider">Data Provider</param>
        /// <param name="h">Chart Object</param>
        /// <param name="updated_date_query_name">Query name used to get Updated Date</param>
        /// <param name="s">Search Object</param>
        /// <param name="auth">Current User authorisations</param>
        public static void SetUpdatedDate(AbstractDataProvider provider, Chart h, string updated_date_query_name, Search s, AaaAuthorisation auth)
        {
            s.Name = updated_date_query_name;

            Collection<IItem> results = provider.GetResults<Collection<IItem>>(new ItemResultBuilder(), s, auth);

            if (results != null && results.Count > 0)
            {
                object res = results[0].Values.FirstOrDefault();

                if (res != null && res is DateTime)
                {
                    string date = CommonUtilities.TryConvertDate(res, CMPConfiguration.DateDisplayFormat);
                    if (!string.IsNullOrEmpty(date))
                    {
                        h.credits = new Chart.Credits() { text = " Last Updated: " + date };
                    }
                }
            }
        }

        /// <summary>
        /// Creates the javascript to input the CMP Hi Chart into a page.
        /// </summary>
        /// <param name="json">The Json String containing the chart object.</param>
        /// <returns>String of Javascript.</returns>
        public static string WriteJson(string json)
        {
            StringBuilder js = new StringBuilder();

            js.Append("<script type=\"text/javascript\">");
            js.Append(Environment.NewLine);
            js.AppendLine("$(document).ready(function(){");
            js.Append("var thischart");
            js.Append(DateTime.Now.Ticks.ToString(CultureInfo.InvariantCulture));
            js.Append(" = new CMPHiChart(");
            js.Append(json);
            js.Append(");");
            js.AppendLine("});");
            js.Append(Environment.NewLine);
            js.Append("</script>");

            return js.ToString();

            //Page.ClientScript.RegisterClientScriptBlock(typeof(string), "jsonHighChart" + DateTime.Now.Ticks.ToString(), js.ToString());
        }

        /// <summary>
        /// Fetches the Chart object for the given chart settings, search and authorisations
        /// </summary>
        /// <param name="hcc">Chart object</param>
        /// <param name="s">Search Object</param>
        /// <param name="auth">Current User authorisations</param>
        /// <param name="currency">Currency used in the Chart</param>
        /// <returns>Chart Object with data.</returns>
        public Chart GetChartForJson(Chart hcc, Search s, AaaAuthorisation auth, string currency)
        {
            Tuple<chartArea, chart> data = GetChartConfig(hcc);
            chartArea chartArea = data.Item1;
            chart chartConfig = data.Item2;

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
                    hcc.title.text = GetTitleFromTitleMethod(hcc.title.text, chartArea.title_method, s);
                }

                hcc.target_grid_config_chart_area_id = chartArea.id;
                hcc.use_hi_stocks = chartArea.use_hi_stocks;
            }
            catch
            {
            }

            return this.GetChartForJson(chartConfig, chartArea, hcc, s, auth, true, currency);
        }

        /// <summary>
        /// creates the chart object from the given chart area
        /// </summary>
        /// <param name="chartConfig">Chart Configuration</param>
        /// <param name="chartArea">Chart Area Configuration</param>
        /// <param name="h">Chart Object</param>
        /// <param name="s">Search Object</param>
        /// <param name="auths">User Authorisations</param>
        /// <param name="getData">Flag indicating whether data should be collected</param>
        /// <param name="currency">Currency to be used.</param>
        /// <returns>Chart Object with data.</returns>
        public Chart GetChartForJson(chart chartConfig, chartArea chartArea, Chart h, Search s, AaaAuthorisation auths, bool getData, string currency)
        {
            string catKey = h.cmp_categoryKey;
            string providerKey = h.cmp_providerKey;

            DataTable data = null;

            AbstractDataProvider theProvider = DataProviderManager.GetProvider(providerKey);

            // Check the config to see if we should not get data if the search has no real constraints.
            if (!chartArea.renderWhenOnlyCategoryConstraintPresent && (s.Constraints == null || s.Constraints.Count < 2))
            {
                if (s.Constraints == null || s.Constraints.Count == 0)
                {
                    getData = false;
                }
                else
                {
                    var catCon = s.Constraints[0] as CategoryConstraint;
                    if (catCon != null)
                    {
                        getData = false;
                    }
                }
            }

            // Check the config to see if we should not get data if the search has no real constraints.
            if (chartArea.SearchConstraintRequired && s.Constraints.Count == 0)
            {
                getData = false;
            }

            ////Allow configs to specify dont get data if they so desire
            if (chartArea.getData == false)
            {
                getData = false;
            }

            if (getData)
            {
                var cat = theProvider.GetCategory(catKey);
                data = this.GetData(chartArea, theProvider, cat, h, s, auths);
            }

            if (data != null && data.Rows != null && data.Rows.Count > 0)
            {
                if (!chartArea.x_axis.fixed_value)
                {
                    FillXGaps(data, chartArea.x_axis.key);
                }

                this.GetSeriesData(data, chartArea, h, currency);

                SetLegend(h, chartArea);
                SetupPlotOptions(h, chartArea);

                if (!string.IsNullOrEmpty(chartConfig.updated_date_query_name))
                {
                    SetUpdatedDate(theProvider, h, chartConfig.updated_date_query_name, s, auths);
                }

                if (chartArea.show_summary_table)
                {
                    SetHtmlDataTable(h, chartArea, currency, data);
                }
            }

            if (chartArea.x_axis.data_type == data_type.datetime && h.xAxis != null && h.xAxis.Count > 0 && h.xAxis[0] != null && h.xAxis[0].categories != null)
            {
                h.xAxis[0].categories.Clear();
            }

            return h;
        }

        /// <summary>
        /// Fetches the Chart object as a Json String for the given chart settings, search and authorisations
        /// </summary>
        /// <param name="hcc">Chart object</param>
        /// <param name="s">Search Object</param>
        /// <param name="auth">Current User authorisations</param>
        /// <param name="currency">Currency used in the Chart</param>
        /// <returns>Chart Object with data as a JSON String.</returns>
        public string GetChartInJson(Chart hcc, Search s, AaaAuthorisation auth, string currency)
        {
            Chart chart = this.GetChartForJson(hcc, s, auth, currency);

            string json = chart.PrepareJSON();
            return json;
        }

        /// <summary>
        /// creates the json chart object from the given chart area
        /// </summary>
        /// <param name="chartConfig">Chart Configuration</param>
        /// <param name="chartArea">Chart Area Configuration</param>
        /// <param name="h">Chart Object</param>
        /// <param name="s">Search Object</param>
        /// <param name="auths">User Authorisations</param>
        /// <param name="getData">Flag indicating whether data should be collected</param>
        /// <param name="currency">Currency to be used.</param>
        /// <returns>Chart Object with data as a JSON String.</returns>
        public string GetChartInJson(chart chartConfig, chartArea chartArea, Chart h, Search s, AaaAuthorisation auths, bool getData, string currency)
        {
            Chart chart = this.GetChartForJson(chartConfig, chartArea, h, s, auths, getData, currency);

            string json = chart.PrepareJSON();
            return json;
        }

        /// <summary>
        /// Gets the data for the chart
        /// </summary>
        /// <param name="chartArea">Chart Area Configuration</param>
        /// <param name="provider">Data Provider</param>
        /// <param name="category">Category Used</param>
        /// <param name="h">Chart Object</param>
        /// <param name="s">Search Object</param>
        /// <param name="auth">User Authorisations</param>
        /// <returns>Table containing chart data.</returns>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2201:DoNotRaiseReservedExceptionTypes", Justification = "Need to throw an exception,TODO: use a more appropriate exception")]
        public DataTable GetData(chartArea chartArea, AbstractDataProvider provider, ICategory category, Chart h, Search s, AaaAuthorisation auth)
        {
            if (chartArea.grouping_key == null)
            {
                chartArea.grouping_key = string.Empty;
            }

            DataTable results = null;
            var resultBuilder = new GroupedDataTableResultBuilder();

            //config has query name set so we want to use a specific query.
            if (!string.IsNullOrEmpty(chartArea.query_name))
            {
                s.Name = chartArea.query_name;
                var normalBuilder = new DataTableResultsBuilder();
                results = provider.GetResults<DataTable>(normalBuilder, s, auth);

                // the datatable builder adds a row to the table, so we should
                // remove it (assuming its empty)
                if (results != null && results.Rows != null && results.Rows.Count > 1)
                {
                    results =
                        results.Rows.Cast<DataRow>()
                            .Where(
                                row =>
                                !row.ItemArray.All(
                                    field =>
                                    field is System.DBNull || string.Compare((field as string).Trim(), string.Empty, StringComparison.InvariantCulture) == 0))
                            .CopyToDataTable();
                }
            }
            else
            {
                // we set the name here as we want to use a specific query -
                // this query has some special hints see (INDEXERS_GROUPBY_SQL)
                // and (INDEXERS_SQL)
                s.Name = "groupeddatatable"; //ensure we use the normal call

                List<IIndexer> ixrs = new List<IIndexer>();
                s.Sorts.Clear();

                //add the x axis ixrs
                var ixr = UIObjectHelper.GetIndexer(category, chartArea.x_axis.key.Trim());
                ixrs.Add(ixr);
                s.Sorts.Add(new Sort(ixr, SortOrder.Descending));

                //add the grouping key - this creates the series
                foreach (string grouping_key in chartArea.grouping_key.Split(new char[] { ',' }, StringSplitOptions.None))
                {
                    if (!string.IsNullOrEmpty(grouping_key))
                    {
                        ixr = UIObjectHelper.GetIndexer(category, grouping_key.Trim());
                        ixrs.Add(ixr);
                    }
                }

                // add the y value
                foreach (chartAreaY_axis yAxis in chartArea.y_axis)
                {
                    bool isAggregate = false;
                    bool isCount = false;

                    string thisKey = yAxis.key;
                    if (thisKey.StartsWith("SUM**", StringComparison.InvariantCulture))
                    {
                        isAggregate = true;
                        thisKey = thisKey.Replace("SUM**", string.Empty);
                    }

                    if (thisKey.StartsWith("COUNT**", StringComparison.InvariantCulture))
                    {
                        isCount = true;
                        thisKey = thisKey.Replace("COUNT**", string.Empty);
                    }

                    ixr = UIObjectHelper.GetIndexer(category, thisKey.Trim());

                    if (isAggregate)
                    {
                        ixr.SetMetaDataValue("isAggregate", "true");
                    }

                    if (isCount)
                    {
                        ixr.SetMetaDataValue("isCount", "true");
                    }

                    ixrs.Add(ixr);

                    if (!string.IsNullOrEmpty(yAxis.secondary_key))
                    {
                        ixr = UIObjectHelper.GetIndexer(category, yAxis.secondary_key.Trim());
                        ixrs.Add(ixr);
                    }
                }

                s.SelectedIndexers.Clear();
                s.SelectedIndexers.AddRange(ixrs);

                results = provider.GetGroupedResults<DataTable>(resultBuilder, s, false, auth);

                if (results != null)
                {
                    //remove column names and stars from columns if they exist
                    RemoveCategoryNameAndStarFromColumnNames(results);

                    if (!string.IsNullOrEmpty(chartArea.grouping_key))
                    {
                        results.DefaultView.Sort = chartArea.grouping_key + "," + chartArea.x_axis.key;
                    }
                    else
                    {
                        results.DefaultView.Sort = chartArea.x_axis.key;
                    }

                    results = results.DefaultView.ToTable();

                    //remove empty rows
                    if (results != null && results.Rows != null && results.Rows.Count > 1)
                    {
                        results = results.Rows.Cast<DataRow>().Where(
                            row => !row.ItemArray.All(field => field is System.DBNull || string.IsNullOrEmpty(field.ToString())))
                                .CopyToDataTable();
                    }
                }
            }

            return results;
        }

        /// <summary>
        /// Loop through each unique row in the aggregate column.
        /// This is where the highChart config portion object gets set up
        /// </summary>
        /// <param name="results">Table Containing the data to be represented by the chart.</param>
        /// <param name="chartarea">Chart Area configuration</param>
        /// <param name="hcc">Chart object</param>
        /// <param name="currency">Currency to use</param>
        public void GetSeriesData(DataTable results, chartArea chartarea, Chart hcc, string currency)
        {
            string groupingKey = chartarea.grouping_key;
            string xColKey = chartarea.x_axis.key;

            //if we have the query name set then we assume the data comes back in the correct order
            if (string.IsNullOrEmpty(chartarea.query_name))
            {
                //remove anything where the grouping key is empty or null - nb this might be an issue for some charts - suck it and see
                // if its year or something numeric - dont try to string compare
                if (!string.IsNullOrEmpty(groupingKey) && !groupingKey.ToLowerInvariant().Contains("year") && !groupingKey.ToLowerInvariant().Contains("count"))
                {
                    results =
                        new DataView(
                            results,
                            "isnull(" + groupingKey + ",'') <> ''",
                            null,
                            DataViewRowState.CurrentRows).ToTable();
                }

                //order the datatable correctly before getting data
                results = new DataView(results, null,
                    string.IsNullOrEmpty(groupingKey) ? xColKey : groupingKey + "," + xColKey,
                    DataViewRowState.CurrentRows).ToTable();
            }

            // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
            //get the unique x values
            Chart.XAxi xAxis1 = new Chart.XAxi();

            if (!chartarea.x_axis.fixed_value && !string.IsNullOrEmpty(chartarea.x_axis.title))
            {
                xAxis1.title = new Chart.Title();
                xAxis1.title.style = null;
                xAxis1.title.text = LanguageUtils.GetGlobalResourceString(chartarea.x_axis.title);
            }

            xAxis1.labels = new Chart.Labels();

            if (chartarea.x_axis.data_type == data_type.datetime)
            {
                xAxis1.type = "datetime";

                //xAxis1.labels.step = 30;
                xAxis1.dateTimeLabelFormats = new Chart.DateTimeLabelFormats();

                //xAxis1.dateTimeLabelFormats.month = "%b \'%y";
                xAxis1.dateTimeLabelFormats.year = "%Y";
                xAxis1.showLastLabel = true;
                xAxis1.tickInterval = ((TimeSpan)(new DateTime(2001, 1, 1) - new DateTime(2000, 1, 1))).TotalMilliseconds; // one year in milliseconds
                xAxis1.minRange = 62899200000; // 2 years in milliseconds ish. This line is here because when a single series is displayed on a year x axis the chart automatically zooms in to show the x axis label as the day and month.
            }

            // setup the xAxis categories to use - NB: for datetime series these
            // are removed as the datetime is set within the series and not in
            // the xAxis categories. Add these here makes rendering the HTML
            // table easier. xAxis1.categories will be cleared for datetime
            // charts before the JSON is written.
            if (chartarea.x_axis.fixed_value)
            {
                xAxis1.categories.Add(chartarea.x_axis.title);
            }
            else
            {
                foreach (DataRow row in results.Rows)
                {
                    string xVal = HttpUtility.HtmlDecode(row[xColKey].ToStringSafe());

                    if (!xAxis1.categories.Contains(xVal))
                    {
                        // xVals.Add(xVal);
                        xAxis1.categories.Add(xVal);
                    }
                }
            }

            hcc.xAxis.Clear();
            hcc.xAxis.Add(xAxis1);

            hcc.yAxis.Clear();
            hcc.series.Clear();

            string currentSeriesName = string.Empty;
            int counter = 0;

            List<string> seriesNames = new List<string>();

            foreach (chartAreaY_axis yAxis in chartarea.y_axis)
            {
                Chart.YAxi newYAxis = new Chart.YAxi();
                newYAxis.title = new Chart.Title();
                newYAxis.title.style = null;

                if (!string.IsNullOrEmpty(yAxis.title))
                {
                    if (yAxis.title.Equals("{CURRENCY}", StringComparison.OrdinalIgnoreCase))
                    {
                        newYAxis.title.text = LanguageUtils.GetGlobalResourceString("CURRENCY_" + currency);
                    }
                    else
                    {
                        newYAxis.title.text = LanguageUtils.GetGlobalResourceString(yAxis.title);
                    }
                }
                else
                {
                    newYAxis.title.text = LanguageUtils.GetGlobalResourceString(yAxis.key);
                }

                newYAxis.opposite = true;

                newYAxis.floor = yAxis.floor;

                if (yAxis.data_type == data_type.datetime)
                {
                    newYAxis.type = "datetime";

                    //xAxis1.labels.step = 30;
                    newYAxis.dateTimeLabelFormats = new Chart.DateTimeLabelFormats();

                    //xAxis1.dateTimeLabelFormats.month = "%b \'%y";
                    newYAxis.dateTimeLabelFormats.year = "%Y";
                    newYAxis.showLastLabel = true;
                    newYAxis.tickInterval = ((TimeSpan)(new DateTime(2001, 1, 1) - new DateTime(2000, 1, 1))).TotalMilliseconds; // one year in milliseconds
                    newYAxis.minRange = 62899200000; // 2 years in milliseconds ish. This line is here because when a single series is displayed on a year x axis the chart automatically zooms in to show the x axis label as the day and month.
                }

                if (!string.IsNullOrEmpty(yAxis.format))
                {
                    newYAxis.labels = new Chart.Labels();
                    newYAxis.labels.format = yAxis.format;

                    newYAxis.labels.align = yAxis.label_align;

                    if (!string.IsNullOrEmpty(yAxis.units))
                    {
                        newYAxis.labels.format += yAxis.units;
                    }
                }

                if (counter % 2 != 0)
                {
                    newYAxis.opposite = !newYAxis.opposite;
                }

                hcc.yAxis.Add(newYAxis);
                if (yAxis.type == chart_type.Gantt)
                {
                    hcc.chart.inverted = true;
                }

                if (!string.IsNullOrEmpty(yAxis.reorder_data_by))
                {
                    //order the datatable correctly before getting data
                    results = new DataView(results, null, yAxis.reorder_data_by, DataViewRowState.CurrentRows).ToTable();
                }

                BuildAllSeriesForColumn(results, chartarea, ref currentSeriesName, hcc, counter, yAxis, newYAxis, chartarea.x_axis, seriesNames);

                counter++;
            }

            return;
        }

        #endregion Public Methods

        #region Private Methods

        internal static Chart GetChart2(AaaAuthorisation authorisation, ISearch search, Chart hcc, Tuple<chartArea, chart> configData, string currency, string userId)
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

            return data;
        }

        /// <summary>
        /// Adds a Y value to the list.
        /// </summary>
        /// <param name="yAxis">The Y axis config.</param>
        /// <param name="thisyVal">The y value to add.</param>
        /// <param name="dataVals">The list to add the value to.</param>
        private static void AddYValue(chartAreaY_axis yAxis, object thisyVal, List<object> dataVals)
        {
            if (yAxis.data_type == data_type.@double)
            {
                double dbl = 0;
                if (double.TryParse(thisyVal.ToStringSafe(), out dbl))
                {
                }

                dbl = Math.Round(dbl, 2);
                dataVals.Add(dbl);
            }
            else if (yAxis.data_type == data_type.integer)
            {
                int i = 0;
                if (int.TryParse(thisyVal.ToStringSafe(), out i))
                {
                }

                dataVals.Add(i);
            }
            else if (yAxis.data_type == data_type.datetime)
            {
                // datetime series date needs to be in the following format
                // data: [[Date.UTC(2013, 07, 10), 9],[Date.UTC(2013, 07, 11),
                //       22], etc...
                thisyVal = CommonUtilities.TryConvertToDate(thisyVal, string.IsNullOrEmpty(yAxis.format) ? null : yAxis.format);

                TimeSpan ts = (TimeSpan)((DateTime)thisyVal - new DateTime(1970, 1, 1));
                dataVals.Add(ts.TotalMilliseconds);
            }
            else
            {
                dataVals.Add(thisyVal.ToStringSafe());
            }
        }

        /// <summary>
        /// write the data to a series object
        /// </summary>
        /// <param name="cell">The Y Value cell data</param>
        /// <param name="cell2">The C Value cell data</param>
        /// <param name="series">Chart Series Object</param>
        /// <param name="chartArea">Chart Area Configuration</param>
        /// <param name="yAxis">The YAxis in play.</param>
        /// <param name="xAxis">The XAxis in play.</param>
        private static void AppendSeriesData(object cell, object cell2, Chart.Series series, chartArea chartArea, chartAreaY_axis yAxis, chartAreaX_axis xAxis)
        {
            List<object> dataVals = new List<object>();

            // GANTTS use 2 Y values and the categories for X - so do not add X here
            if (yAxis.type != chart_type.Gantt)
            {
                if (xAxis.data_type == data_type.datetime)
                {
                    // datetime series date needs to be in the following format
                    // data: [[Date.UTC(2013, 07, 10), 9],[Date.UTC(2013, 07, 11),
                    //       22], etc...
                    cell2 = CommonUtilities.TryConvertToDate(cell2, string.IsNullOrEmpty(xAxis.format) ? null : xAxis.format);

                    TimeSpan ts = (TimeSpan)((DateTime)cell2 - new DateTime(1970, 1, 1));
                    dataVals.Add(ts.TotalMilliseconds);
                }
                else
                {
                    if (string.IsNullOrEmpty(chartArea.grouping_key))
                    {
                        // no grouping so add the x name also to the data
                        dataVals.Add(cell2.ToStringSafe());
                    }
                }
            }

            if (cell != null)
            {
                AddYValue(yAxis, cell.ToStringSafe(string.Empty), dataVals);
            }

            if (yAxis.type == chart_type.Gantt)
            {
                AddYValue(yAxis, cell2.ToStringSafe(string.Empty), dataVals);
            }

            series.data.Add(dataVals);
        }

        /// <summary>
        /// write the data to a series object
        /// </summary>
        /// <param name="results">Table containing chart Data</param>
        /// <param name="chartarea">Chart Area configuration</param>
        /// <param name="currentSeriesName">Current series Name</param>
        /// <param name="hcc">Chart object</param>
        /// <param name="counter">Counter of series</param>
        /// <param name="yAxis">The Y axis in play.</param>
        /// <param name="chartYAxis">The charts y axis currently being setup.</param>
        /// <param name="xAxis">The X axis in play.</param>
        /// <param name="seriesNames">List of used series names.</param>
        private static void BuildAllSeriesForColumn(DataTable results, chartArea chartarea, ref string currentSeriesName, Chart hcc, int counter, chartAreaY_axis yAxis, Chart.YAxi chartYAxis, chartAreaX_axis xAxis, List<string> seriesNames)
        {
            bool first = true;
            string groupingKey = chartarea.grouping_key;
            if (yAxis.ignore_grouping_key)
            {
                groupingKey = string.Empty;
            }

            string xColKey = xAxis.key;
            if (yAxis.type == chart_type.Gantt)
            {
                xColKey = yAxis.secondary_key;
            }

            Chart.Series newSeries = null;

            // Loop through each row for a given y column, create a series object
            // when looping, if the y col changes value, we create a new one.

            //write the data to a series object
            foreach (DataRow row in results.Rows)
            {
                //// if we are not grouping, then every record from the column
                //// goes into the same series IHS.Apps.CMP.Web.ServiceLayer.dll!IHS.Apps.CMP.Web.ServiceLayer.ChartService.GetSeriesData(System.Data.DataTable results, IHS.Apps.CMP.Models.Configuration.chartArea chartarea, IHS.Apps.CMP.Models.Chart hcc, string currency) Line 925 C#

                if (!string.IsNullOrEmpty(groupingKey))
                {
                    //we are grouping, so need to delimit data with separate series based on when grouping col value changes
                    if (row[groupingKey] == null || row[groupingKey].ToString() != currentSeriesName || first)
                    {
                        string rowSeriesName = row[groupingKey].ToStringSafe();

                        int rowSeriesOrd = 0;
                        if (row.Table.Columns.Contains("FORCE_ORD"))
                        {
                            rowSeriesOrd = Convert.ToInt16(row["FORCE_ORD"].ToString(), CultureInfo.InvariantCulture);
                        }
                        else if (row.Table.Columns.Contains("ACTIVITY_ORD"))
                        {
                            rowSeriesOrd = Convert.ToInt16(row["ACTIVITY_ORD"].ToString(), CultureInfo.InvariantCulture);
                        }

                        newSeries = new Chart.Series();

                        if (!string.IsNullOrEmpty(rowSeriesName))
                        {
                            newSeries.name = System.Net.WebUtility.HtmlDecode(rowSeriesName);
                            newSeries.order = rowSeriesOrd;

                            if (seriesNames.Contains(rowSeriesName))
                            {
                                newSeries.name += " (" + counter + ")";
                            }
                            else
                            {
                                seriesNames.Add(rowSeriesName);
                            }

                            newSeries.yAxis = counter;
                            hcc.series.Add(newSeries);

                            if (yAxis.type == chart_type.Gantt)
                            {
                                newSeries.type = "columnrange";
                            }
                            else
                            {
                                newSeries.type = yAxis.type.ToString().ToLowerInvariant();
                            }
                        }

                        currentSeriesName = rowSeriesName;
                        first = false;
                    }

                    if (!string.IsNullOrEmpty(newSeries.name))
                    {
                        AppendSeriesData(row[yAxis.key], row[xColKey], newSeries, chartarea, yAxis, xAxis);
                    }
                }
                else
                {
                    // no grouping key, all the data in 1 series
                    if (first)
                    {
                        newSeries = new Chart.Series();
                        newSeries.name = chartYAxis.title.text;
                        newSeries.yAxis = counter;
                        if (yAxis.type == chart_type.Gantt)
                        {
                            newSeries.type = "columnrange";
                        }
                        else
                        {
                            newSeries.type = yAxis.type.ToString().ToLowerInvariant();
                        }

                        first = false;
                        hcc.series.Add(newSeries);
                        seriesNames.Add(newSeries.name);
                    }

                    AppendSeriesData(row[yAxis.key], row[xColKey], newSeries, chartarea, yAxis, xAxis);
                }
            }
        }

        /// <summary>
        /// Check a number of scenarios
        /// <para/>
        /// Primarily this fills in gaps in the X colum
        /// <para/>
        /// if there is > 1 non aggregate column then we need to handle this
        /// but to start with this wont be the case.
        /// <para/>
        /// go through all the records in the non aggregate column and check
        /// to see if they are integers
        /// if so , get the max and the min
        /// loop from min to max,
        /// if data table doesn't contain a row with this value, add a new one setting all the other cells to ZERO
        /// </summary>
        /// <param name="results">Table containing chart Data</param>
        /// <param name="xColKey">X Column key</param>
        /// <remarks>
        /// TODO
        /// MONTH NAMES?
        /// ANYTHING ELSE YOU CAN THINK OF?
        /// </remarks>
        private static void FillXGaps(DataTable results, string xColKey)
        {
            if (string.IsNullOrEmpty(xColKey) || !results.Columns.Contains(xColKey) || results.Rows.Count == 0)
            {
                return;
            }

            //get the min and max
            foreach (DataRow row in results.Rows)
            {
                if (!IsInteger(row[xColKey]))
                {
                    return;
                }
            }

            int min = 1;
            int max = 12;
            DataView viewToFindMinAndMax = new DataView(results, string.Empty, xColKey, DataViewRowState.CurrentRows);

            min = Convert.ToInt16(viewToFindMinAndMax[0][xColKey].ToString(), CultureInfo.InvariantCulture);
            max = Convert.ToInt16(viewToFindMinAndMax[viewToFindMinAndMax.Count - 1][xColKey].ToString(), CultureInfo.InvariantCulture);

            for (int a = min; a <= max; a++)
            {
                string rowfilter = xColKey + "=" + a.ToString(CultureInfo.InvariantCulture) + string.Empty;

                DataView view = new DataView(results, rowfilter, string.Empty, DataViewRowState.CurrentRows);
                if (view.Count > 0)
                {
                    continue;
                }

                DataRow row = results.NewRow();
                for (int x = 0; x < results.Columns.Count; x++)
                {
                    row[x] = DBNull.Value;
                }

                // make sure the grouped key is set to the current
                // int we are looping through.
                row[xColKey] = a;
                results.Rows.Add(row);
            }
        }

        /// <summary>
        /// Get Constraint Values From Search for given indexerName
        /// </summary>
        /// <param name="search">Search Object</param>
        /// <param name="indexerName">Name of search indexer</param>
        /// <returns>Constraint Values</returns>
        private static Collection<string> GetConstraintValuesFromSearch(ISearch search, string indexerName)
        {
            string prefix = string.Empty;
            Collection<string> values = new Collection<string>();
            var cstr = UIObjectHelper.GetConstraintByKey(search.Constraints, indexerName);
            if (cstr != null)
            {
                if (cstr is NotEqualsConstraint || cstr is NotInConstraint || cstr is NotInRangeConstraint)
                {
                    prefix = "NOT ";
                }

                values = UIObjectHelper.GetConstraintValue(cstr);
                if (cstr is RangeConstraint)
                {
                    // values come out max then min - we want them the other way round
                    values = new Collection<string>(values.Reverse().ToList());
                }
            }

            return new Collection<string>(values.Select(v => prefix + v).ToList());
        }

        /// <summary>
        /// Get the markets forecast title for this chart.
        /// </summary>
        /// <param name="search">The search to parse.</param>
        /// <param name="userId">The current user id.</param>
        /// <param name="addMarketSegmentNameAsByProperty">A flag to indicate if we should add the 'By MarketSegment' property.</param>
        /// <returns>A string builder.</returns>
        private static StringBuilder GetJMFTitle(ISearch search, string userId, bool addMarketSegmentNameAsByProperty)
        {
            StringBuilder sb = new StringBuilder();

            Collection<string> regions = GetConstraintValuesFromSearch(search, "STD_REGION");
            Collection<string> countries = GetConstraintValuesFromSearch(search, "STD_COUNTRY");
            if (countries == null || countries.Count == 0)
            {
                if (regions == null || regions.Count == 0)
                {
                    sb.Append("Region: Worldwide");
                }
                else
                {
                    sb.Append("Region: ");
                    sb.Append(string.Join(" + ", regions));
                }
            }
            else
            {
                sb.Append("Country: ");
                sb.Append(string.Join(" + ", countries));
            }

            Collection<string> markets = GetConstraintValuesFromSearch(search, "MARKET");
            if (markets != null && markets.Count > 0)
            {
                sb.Append(", Market: ");
                sb.Append(string.Join(" + ", markets));
            }

            if (addMarketSegmentNameAsByProperty)
            {
                sb.Append(ChartService.GetTitleFromIndex(search, " by ", "MarketSegment"));
            }

            IIndexer customSegmentIdx = search.SelectedIndexers.FirstOrDefault(ix => ix.ObjectKey.StartsWith("CUSTOMUSERSEGMENTATTR", true, CultureInfo.InvariantCulture));
            if (customSegmentIdx != null)
            {
                int attributeId;
                if (!string.IsNullOrEmpty(userId) && int.TryParse(customSegmentIdx.ObjectKey.Substring(21), out attributeId))
                {
                    sb.Append(" by ");
                    string label = JDSFService.GetCustomSegmentsForUser(userId, false, null)
                                        .Where(s => s.ShowInUserInterface && s.Id == attributeId)
                                        .FirstOrDefault().Title;
                    sb.Append(label);
                }
            }

            sb.Append(ChartService.GetTitleFromIndex(search, ", Forecast Type: ", "ForecastType"));

            IIndexer timeSeriesIdx = search.SelectedIndexers.FirstOrDefault(ix => ix.GetMetaDataValue("idxGroup") != null && ix.GetMetaDataValue("idxGroup").Equals("TimeSeries"));
            if (timeSeriesIdx == null)
            {
                // total years so disp0lay the years also
                sb.Append(" (");
                Collection<string> years = GetConstraintValuesFromSearch(search, "YEAR");
                if (years != null && years.Count > 0)
                {
                    sb.Append(string.Join(" - ", years));
                }
                else
                {
                    sb.Append(DateTime.Now.Year);
                    sb.Append(" - ");
                    sb.Append(DateTime.Now.AddYears(9).Year);
                }

                sb.Append(")");
            }

            return sb;
        }

        /// <summary>
        /// Gets the title section from a specified indexer.
        /// </summary>
        /// <param name="search">The search object.</param>
        /// <param name="joiner">The string to join this section to the previous.</param>
        /// <param name="idxName">The indexer name.</param>
        /// <param name="idxLabel">The meta data value name containing the label, defaults to label.</param>
        /// <returns>String containing the title section, if the indexer is found.</returns>
        private static string GetTitleFromIndex(ISearch search, string joiner, string idxName, string idxLabel = "label")
        {
            IIndexer idx = search.SelectedIndexers.FirstOrDefault(ix => ix.GetMetaDataValue("idxGroup") != null && ix.GetMetaDataValue("idxGroup").Equals(idxName));
            if (idx == null)
            {
                return string.Empty;
            }

            StringBuilder sb = new StringBuilder();
            sb.Append(joiner);
            string label = idx.GetMetaDataValue(idxLabel);
            if (!string.IsNullOrEmpty(label))
            {
                sb.Append(label);
            }
            else
            {
                sb.Append(LanguageUtils.GetGlobalResourceString(idx.ObjectKey));
            }

            return sb.ToString();
        }

        /// <summary>
        /// Checks if object is an integer
        /// </summary>
        /// <param name="cell">Object to check</param>
        /// <returns>True is is an integer, else false</returns>
        private static bool IsInteger(object cell)
        {
            int x;
            return int.TryParse(cell.ToString(), out x);
        }

        /// <summary>
        /// Remove category name and star from column names
        /// </summary>
        /// <param name="results">Table containing chart Data</param>
        private static void RemoveCategoryNameAndStarFromColumnNames(DataTable results)
        {
            foreach (DataColumn col in results.Columns)
            {
                if (col.ColumnName.Contains("*"))
                {
                    col.ColumnName = col.ColumnName.Split('*')[1];
                }
            }
        }

        /// <summary>
        /// create a html string on the object which can be visible by the client
        /// </summary>
        /// <param name="h">Chart Object</param>
        /// <param name="chartarea">Chart Area Configuration</param>
        /// <param name="currency">Currency used in chart</param>
        /// <param name="dataTable">The data table to parse if required.</param>
        private static void SetHtmlDataTable(Chart h, chartArea chartarea, string currency, DataTable dataTable)
        {
            string valFormat = numberFormat;
            if (!string.IsNullOrEmpty(chartarea.label_format))
            {
                valFormat = chartarea.label_format;
            }

            StringBuilder html = new StringBuilder();

            html.Append("<table class='hichartDataTableTitle'><tr><td colspan='3'><h4>");
            html.Append(h.title.text);
            html.Append("</h4></td></tr></table>");
            html.Append("<table class='hichartDataTable table'>");

            try
            {
                if (h.xAxis != null && h.xAxis[0] != null && h.xAxis[0].categories != null)
                {
                    html.Append("<tr class='text-right'><th></th>");

                    if (h.series.Count == 1 && h.series[0].type.Equals("pie", StringComparison.OrdinalIgnoreCase))
                    {
                        // single series so render the table slightly different
                        html.Append("<th class='text-right'>");
                        html.Append(h.series[0].name);
                        html.Append("</th>");

                        decimal dataTotal = 0;

                        for (int i = 0; i < h.series[0].data.Count; i++)
                        {
                            List<object> data = (List<object>)h.series[0].data[i];

                            //series data is a list of objects with the first in the list being the date.
                            html.Append("<tr class='text-right'><th>");
                            html.Append(data[0].ToString());
                            html.Append("</th>");

                            if (data.Count == 2)
                            {
                                decimal dataVal = Convert.ToDecimal(data[1].ToString(), CultureInfo.InvariantCulture);
                                dataTotal += dataVal;
                                html.Append("<td>");
                                html.Append(dataVal.ToString(valFormat, CultureInfo.InvariantCulture));
                                html.Append("</td>");
                            }

                            html.Append("</tr>");
                        }

                        if (chartarea.show_totals_on_summary_table)
                        {
                            html.Append("<tr class='text-right info'><th>Total</th>");
                            html.Append("<td>");
                            html.Append(dataTotal.ToString(valFormat, CultureInfo.InvariantCulture));
                            html.Append("</td>");
                            html.Append("</tr>");
                        }
                    }
                    else
                    {
                        int numOfColumns = h.xAxis[0].categories.Count;
                        decimal[] verticalTotals = new decimal[numOfColumns];

                        double cagrStartYear = 0;
                        double cagrEndYear = 0;
                        double cagrIntervalYears = Convert.ToDouble(numOfColumns) - 1;
                        int totalProgramCount = 0;

                        //Program Count
                        if (chartarea.show_program_count && numOfColumns > 1)
                        {
                            html.Append("<th class='text-right'># Records</th>");
                        }

                        for (int i = 0; i < numOfColumns; i++)
                        {
                            html.Append("<th class='text-right'>");
                            html.Append(h.xAxis[0].categories[i]);
                            html.Append("</th>");
                        }

                        if (chartarea.show_totals_on_summary_table && numOfColumns > 1)
                        {
                            html.Append("<th class='text-right info'>Total</th>");
                        }

                        //CAGR header
                        if (chartarea.show_cagr_on_summary_table && numOfColumns > 1)
                        {
                            html.Append("<th class='text-right warning'>CAGR</th>");
                        }

                        html.Append("</tr>");

                        foreach (var series in h.series)
                        {
                            html.Append("<tr class='text-right seriesval'><th>");

                            if (chartarea.show_links_on_summary_table)
                            {
                                html.Append("<a onclick='if (typeof seriesValClicked === \"function\") { seriesValClicked(\"" + HttpUtility.JavaScriptStringEncode(series.name) + "\");}' class='hand' >");
                            }

                            html.Append(series.name);
                            html.Append("<span data-bind=\"text: $data\"></span>");

                            if (chartarea.show_links_on_summary_table)
                            {
                                html.Append("</a>");
                            }

                            html.Append("</th>");

                            //Program Counts
                            if (chartarea.show_program_count && series.data.Count > 1)
                            {
                                html.Append("<td class='info'>");
                                int thisProgramCount = Convert.ToInt32(dataTable.Select("SERIESVAL = '" + series.name.Replace("'", "''") + "'")
                                    .CopyToDataTable()
                                    .Rows[0]["records_count"]);
                                totalProgramCount = totalProgramCount + thisProgramCount;
                                html.Append(thisProgramCount);
                                html.Append("</td>");
                            }

                            decimal dataTotal = 0;

                            for (int i = 0; i < series.data.Count; i++)
                            {
                                //series data is a list of objects with the first in the list being the date.
                                List<object> data = (List<object>)series.data[i];
                                html.Append("<td>");

                                decimal dataVal = 0;

                                if (data.Count == 2)
                                {
                                    dataVal = Convert.ToDecimal(data[1].ToString(), CultureInfo.InvariantCulture);
                                }
                                else
                                {
                                    dataVal = Convert.ToDecimal(data[0].ToString(), CultureInfo.InvariantCulture);
                                }

                                if (i == 0)
                                {
                                    cagrStartYear = Convert.ToDouble(dataVal);
                                }

                                if (i == cagrIntervalYears)
                                {
                                    cagrEndYear = Convert.ToDouble(dataVal);
                                }

                                verticalTotals[i] += dataVal;
                                dataTotal += dataVal;

                                html.Append(dataVal.ToString(valFormat, CultureInfo.InvariantCulture));
                                html.Append("</td>");
                            }

                            if (series.data.Count < numOfColumns)
                            {
                                for (int z = 0; z < numOfColumns - series.data.Count; z++)
                                {
                                    // fill in the blanks
                                    html.Append("<td></td>");
                                }
                            }

                            if (chartarea.show_totals_on_summary_table && series.data.Count > 1)
                            {
                                html.Append("<td class='info'>");
                                html.Append(dataTotal.ToString(valFormat, CultureInfo.InvariantCulture));
                                html.Append("</td>");
                            }

                            //CAGR values
                            if (chartarea.show_cagr_on_summary_table && numOfColumns > 1)
                            {
                                double cagrPercentage = 0;

                                if (cagrStartYear != 0 && cagrIntervalYears != 0)
                                {
                                    cagrPercentage = (Math.Pow(cagrEndYear / cagrStartYear, 1 / cagrIntervalYears) - 1) * 100;
                                }

                                string cagrVal = "N/A";
                                if (!double.IsNaN(cagrPercentage) && !double.IsInfinity(cagrPercentage))
                                {
                                    cagrVal = Math.Round(cagrPercentage, 1).ToString(CultureInfo.InvariantCulture) + "%";
                                }

                                html.Append("<td class='warning'>");
                                html.Append(cagrVal);
                                html.Append("</td>");
                                html.Append("</tr>");
                            }
                        }

                        if (chartarea.show_totals_on_summary_table)
                        {
                            html.Append("<tr class='text-right info'>");
                            html.Append("<th>Total</th>");

                            //Program Counts
                            if (chartarea.show_program_count)
                            {
                                html.Append("<td class='bold'>");
                                html.Append(totalProgramCount);
                                html.Append("</td>");
                            }

                            decimal grandTotal = 0;
                            for (int x = 0; x < verticalTotals.Length; x++)
                            {
                                if (x == 0)
                                {
                                    cagrStartYear = Convert.ToDouble(verticalTotals[x]);
                                }

                                if (x == cagrIntervalYears)
                                {
                                    cagrEndYear = Convert.ToDouble(verticalTotals[x]);
                                }

                                grandTotal += verticalTotals[x];
                                html.Append("<td>");
                                html.Append(verticalTotals[x].ToString(valFormat, CultureInfo.InvariantCulture));
                                html.Append("</td>");
                            }

                            if (numOfColumns > 1)
                            {
                                html.Append("<td>");
                                html.Append(grandTotal.ToString(valFormat, CultureInfo.InvariantCulture));
                                html.Append("</td>");
                            }

                            if (chartarea.show_cagr_on_summary_table && numOfColumns > 1)
                            {
                                double cagrPercentageTotal = 0;

                                cagrPercentageTotal = (Math.Pow(cagrEndYear / cagrStartYear, 1 / cagrIntervalYears) - 1) * 100;

                                string cagrVal = "N/A";
                                if (!double.IsNaN(cagrPercentageTotal) && !double.IsInfinity(cagrPercentageTotal))
                                {
                                    cagrVal = Math.Round(cagrPercentageTotal, 1).ToString(CultureInfo.InvariantCulture) + "%";
                                }

                                html.Append("<td class='warning'>");
                                html.Append(cagrVal);
                                html.Append("</td>");
                            }

                            html.Append("</tr>");
                        }
                    }
                }
                else
                {
                    html.Append("<tr><th>No data to display</th></tr>");
                }
            }
            catch
            {
                html.Append("<tr><th>Error generating data table</th></tr>");
            }

            html.Append("</table>");

            if (chartarea.show_footer_on_summary_table && !string.IsNullOrEmpty(currency))
            {
                html.Append("<table id='hiChartFooter' class='hichartDataTableTitle'><tr><td colspan='3'><h4>(All data shown in ");
                html.Append(currency);

                if (!string.IsNullOrEmpty(chartarea.y_axis[0].units))
                {
                    html.Append(" ");
                    html.Append(chartarea.y_axis[0].units);
                }

                html.Append(")</h4></td></tr></table>");
            }

            h.htmlDataTable = html.ToString();
        }

        /// <summary>
        /// Sets Legend settings, if not set.
        /// </summary>
        /// <param name="h">Chart Object</param>
        /// <param name="chartarea">Chart Area configuration</param>
        private static void SetLegend(Chart h, chartArea chartarea)
        {
            if (chartarea.hide_legend)
            {
                h.legend = new Chart.Legend();
                h.legend.enabled = false;
            }

            if (h.legend != null)
            {
                return;
            }

            h.legend = new Chart.Legend();
            h.legend.enabled = true; // hi stocks defaults this to false but hicharts to true

            if (chartarea.y_axis.Any(y => y.type == chart_type.Pie))
            {
                h.legend.enabled = false;
            }
            else
            {
                h.legend.title = new Chart.Title();
                h.legend.title.text = "Click on items to hide";
                h.legend.verticalAlign = "top";

                switch (chartarea.legend_position)
                {
                    case position.top:
                        h.legend.layout = "horizontal";
                        break;

                    case position.bottom:
                        h.legend.layout = "horizontal";
                        h.legend.verticalAlign = "bottom";
                        break;

                    case position.right:
                        h.legend.layout = "vertical";
                        h.legend.align = "right";
                        break;

                    case position.left:
                        h.legend.layout = "vertical";
                        h.legend.align = "left";
                        break;
                }

                h.legend.itemMarginBottom = 5;
                h.legend.y = 5;
                h.legend.itemStyle = new Chart.ItemStyle();
                h.legend.itemStyle.width = Convert.ToInt16(chartarea.legend_item_width, CultureInfo.InvariantCulture);
                h.legend.itemStyle.fontSize = Convert.ToInt16(chartarea.legend_item_font_size, CultureInfo.InvariantCulture);
            }
        }

        /// <summary>
        /// Get the high chart config.
        /// </summary>
        /// <param name="providerName">The provider name to use.</param>
        /// <param name="cmp_applicationKey">The cmp request application key.</param>
        /// <param name="target_div_id">The target div.</param>
        /// <param name="target_grid_config_chart_area_id">The id of the chart config.</param>
        /// <param name="configCategory">The category of the config.</param>
        /// <returns>A chart model.</returns>
        public static Chart GetChartConfig(string providerName, string cmp_applicationKey, string target_div_id, string target_grid_config_chart_area_id, ICategory configCategory)
        {
            var hcc = new IHS.Apps.CMP.Models.Chart();

            hcc.cmp_categoryKey = configCategory.ObjectKey;
            hcc.cmp_categoryUrl = MvcMappingsHelper.Instance.FindMvcMappingByCategoryKey(configCategory.ObjectKey).url_key;
            hcc.cmp_providerKey = providerName;
            hcc.cmp_applicationKey = cmp_applicationKey;
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

        /// <summary> Parse the url query to see if a chart area id has been passed in. </summary>
        /// <param name="decodedQuery"> The query string. </param>
        /// <returns> The Chart Area ID if found, else empty string. </returns>
        private static string ParseQueryForChartAreaId(string decodedQuery)
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

        /// <summary>
        /// Sets up the chart PlotOptions for the chart type
        /// </summary>
        /// <param name="hcc">Chart object</param>
        /// <param name="chartArea">Chart Area Configuration</param>
        private static void SetupPlotOptions(Chart hcc, chartArea chartArea)
        {
            hcc.plotOptions = new Chart.PlotOptions();

            foreach (chartAreaY_axis yAxis in chartArea.y_axis)
            {
                switch (yAxis.type)
                {
                    case chart_type.Area:
                        hcc.plotOptions.series = new Chart.PlotOptionsSeries();
                        hcc.plotOptions.series.cursor = "pointer";
                        if (yAxis.stacked)
                        {
                            hcc.plotOptions.series.stacking = "normal";
                        }

                        hcc.plotOptions.series.turboThreshold = 0;

                        hcc.plotOptions.series.events = new Chart.Events();
                        hcc.plotOptions.series.events.click = "replaced with function client side";
                        break;

                    case chart_type.Column:
                        hcc.plotOptions.column = new Chart.PlotOptionsColumn();
                        hcc.plotOptions.column.cursor = "pointer";
                        hcc.plotOptions.column.events = new Chart.Events();
                        hcc.plotOptions.column.events.click = "replaced with function client side";
                        if (yAxis.stacked)
                        {
                            hcc.plotOptions.column.stacking = "normal";
                        }

                        break;

                    case chart_type.Gantt:
                        hcc.plotOptions.columnrange = new Chart.PlotOptionsColumnRange();
                        hcc.plotOptions.columnrange.dataLabels.format = "{y:%d %b %y}";
                        //hcc.plotOptions.columnrange.groupPadding = 1;
                        //hcc.plotOptions.columnrange.borderWidth = 5;
                        break;

                    case chart_type.Pie:
                        hcc.plotOptions.pie = new Chart.PlotOptionsPie();
                        hcc.plotOptions.pie.cursor = "pointer";
                        hcc.plotOptions.pie.showInLegend = true;
                        hcc.plotOptions.pie.dataLabels = new Chart.PlotOptionsPieDataLabels() { enabled = true };

                        hcc.plotOptions.pie.events = new Chart.Events();
                        hcc.plotOptions.pie.events.click = "replaced with function client side";
                        break;

                    case chart_type.Line:
                        hcc.plotOptions.line = new Chart.PlotOptionsLine();
                        hcc.plotOptions.line.stacking = null;
                        hcc.plotOptions.line.turboThreshold = 0;

                        hcc.plotOptions.line.events = new Chart.Events();
                        hcc.plotOptions.line.events.click = "replaced with function client side";
                        break;

                    default:
                        hcc.plotOptions.series = new Chart.PlotOptionsSeries();
                        hcc.plotOptions.series.stacking = null;
                        hcc.plotOptions.series.turboThreshold = 0;

                        hcc.plotOptions.series.events = new Chart.Events();
                        hcc.plotOptions.series.events.click = "replaced with function client side";
                        break;
                }
            }
        }

        #endregion Private Methods
    } 
}