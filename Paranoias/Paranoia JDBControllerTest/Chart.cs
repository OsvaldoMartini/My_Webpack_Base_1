// <copyright file="Chart.cs" company="IHS">
//   © 2015, IHS Inc. and its affiliated and subsidiary companies, all rights reserved. All other trademarks
//   are the property of IHS Inc. and its affiliated and subsidiary companies.
// 
//   This product, including software, data and documentation are licensed to the user for its internal
//   business purposes only and may not be disclosed, disseminated, sold, licensed, copied, reproduced,
//   translated or transferred to any third party.
// 
//   IHS Inc. 15 Inverness Way East Englewood, Colorado 80112 USA
//   +1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.Models
{
    using System;
    using System.Collections.Generic;
    using Highcharts;
    using IHS.Apps.CMP.Common;

    /// <summary> stores all the setup for the json hiChart including data </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.StyleCop.CSharp.NamingRules", "SA1300:ElementMustBeginWithUpperCaseLetter", Justification = "Name aligns with HighCharts javascript", Scope = "class")]
    [CLSCompliant(false)]
    public partial class Chart
    {
        /// <summary> Constructor initialises Lists and needed objects in Chart Object </summary>
        public Chart()
        {
            this.rangeSelector = new RangeSelector() { enabled = false };
            this.navigator = new Navigator() { enabled = false };
            this.scrollbar = new Scrollbar() { enabled = false };
            this.credits = new Credits() { enabled = false };
            this.exporting = new Exporting() { enabled = true };
            this.title = new Title();
            this.chart = new ChartType();

            this.series = new List<Series>();
            this.xAxis = new List<XAxi>();
            this.yAxis = new List<YAxi>();
            this.search = new List<StoredSearch>();
            this.colors = new List<string>();
            this.lang = new Lang();
        }

        //// -------------------------------
        //// these are nothing to do with the hichart, but get sent down the wire with the hichart
        //// so that if we ajax - we know where to get this charts details/config from
        //// -------------------------------

        /// <summary> Gets or sets Application key - CMP specific </summary>
        public string cmp_applicationKey { get; set; }

        /// <summary> Gets or sets Data provider key - CMP specific </summary>
        public string cmp_providerKey { get; set; }

        /// <summary> Gets or sets Data category key - CMP specific </summary>
        public string cmp_categoryKey { get; set; }

        /// <summary> Gets or sets Data category Url Key - CMP specific </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1056:UriPropertiesShouldNotBeStrings", Justification = "string required in json")]
        public string cmp_categoryUrl { get; set; }

        /// <summary> Gets or sets template configuration name - CMP specific </summary>
        public string cmp_templateName { get; set; }

        /// <summary> Gets or sets Chart title - CMP specific </summary>
        public string cmp_chartTitle { get; set; }

        /// <summary> Gets or sets viewName - CMP specific </summary>
        /// <remarks> unsure of use, never used, only set </remarks>
        public string cmp_viewName { get; set; }

        /// <summary> Gets or sets the id of the div in which to render the chart </summary>
        public string target_div_id { get; set; }

        /// <summary>
        ///   Gets or sets a string containing the html of a data table containing the data used to generate
        ///   the chart.
        /// </summary>
        public string htmlDataTable { get; set; }

        /// <summary> Gets or sets the id of a chart to target with updates. </summary>
        public string target_grid_config_chart_area_id { get; set; }

        /// <summary> Gets or sets a value indicating whether to use hi stocks - CMP specific </summary>
        public bool use_hi_stocks { get; set; }

        /// <summary> Gets or sets the key of a stored search. </summary>
        public string TargetStashedSearchKey { get; set; }

        /// <summary>
        ///   Gets or sets options regarding the chart area and plot area as well as general chart options.
        /// </summary>
        public ChartType chart { get; set; }

        /// <summary> Gets or sets the chart's main title. </summary>
        public Title title { get; set; }

        /// <summary> Gets or sets the chart's subtitle </summary>
        public Subtitle subtitle { get; set; }

        /// <summary>
        ///   Gets the X axis or category axis. Normally this is the horizontal axis, though if the chart is
        ///   inverted this is the vertical axis. In case of multiple axes, the xAxis node is an array of
        ///   configuration objects.
        /// </summary>
        public IList<XAxi> xAxis { get; private set; }

        /// <summary>
        ///   Gets the Y axis or value axis. Normally this is the vertical axis, though if the chart is
        ///   inverted this is the horizontal axis. In case of multiple axes, the yAxis node is an array of
        ///   configuration objects.
        /// </summary>
        public IList<YAxi> yAxis { get; private set; }

        /// <summary>
        ///   Gets or sets options for the tooltip that appears when the user hovers over a series or point.
        /// </summary>
        public Tooltip tooltip { get; set; }

        /// <summary>
        ///   Gets or sets the legend, a box containing a symbol and name for each series item or point item
        ///   in the chart.
        /// </summary>
        public Legend legend { get; set; }

        /// <summary>
        ///   Gets the actual series to append to the chart. In addition to the members listed below, any
        ///   member of the plotOptions for that specific type of plot can be added to a series individually.
        ///   For example, even though a general lineWidth is specified in plotOptions.series, an individual
        ///   lineWidth can be specified for each series.
        /// </summary>
        public IList<Series> series { get; set; }

        /// <summary>
        ///   Gets or sets the plotOptions. The plotOptions is a wrapper object for config objects for each
        ///   series type. The config objects for each series can also be overridden for each series item as
        ///   given in the series array. Configuration options for the series are given in three levels.
        ///   Options for all series in a chart are given in the plotOptions.series object. Then options for
        ///   all series of a specific type are given in the plotOptions of that type, for example
        ///   plotOptions.line. Next, options for one single series are given in the series array.
        /// </summary>
        public PlotOptions plotOptions { get; set; }

        /// <summary> Gets or sets options for the range selector. </summary>
        public RangeSelector rangeSelector { get; set; }

        /// <summary> Gets or sets options for the navigator. </summary>
        public Navigator navigator { get; set; }

        /// <summary> Gets or sets options for the scrollbar. </summary>
        public Scrollbar scrollbar { get; set; }

        /// <summary> Gets or sets options for the credits </summary>
        /// <remarks>
        ///   Highcharts by default puts a credits label in the lower right corner of the chart. This can be
        ///   changed using these options.
        /// </remarks>
        public Credits credits { get; set; }

        /// <summary> Gets or sets options for the exporting module. </summary>
        public Exporting exporting { get; set; }

        /// <summary> Gets or sets options for the language module. </summary>
        public Lang lang { get; set; }

		public double SpacingBottom { get; set; }

		/// <summary>
		///   Gets or sets a list containing a stored search. Used to pass the search back to the server.
		/// </summary>
		[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Public set required fro JSON deserialisation.")]
        public IList<StoredSearch> search { get; set; }

        /// <summary>
        ///   <p>
        ///     Gets an array containing the default colors for the chart's series. When all colors are used,
        ///     new colors are pulled from the start again. Defaults to: <pre> colors: ['#7cb5ec', '#434348',
        ///     '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'] </pre>
        ///     Default colors can also be set on a series or series.type basis, see <a
        ///     href="#plotOptions.column.colors"> column.colors </a>, <a href="#plotOptions.pie.colors">
        ///     pie.colors </a>.
        ///   </p> <h3> Legacy </h3> 
        ///   <p>
        ///     In Highcharts 3.x, the default colors were: <pre> colors: ['#2f7ed8', '#0d233a', '#8bbc21',
        ///     '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'] </pre>
        ///   </p>
        ///   <p>
        ///     In Highcharts 2.x, the default colors were: <pre> colors: ['#4572A7', '#AA4643', '#89A54E',
        ///     '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'] </pre>
        ///   </p>
        ///   Default: [ '#7cb5ec' , '#434348' , '#90ed7d' , '#f7a35c' , '#8085e9' , '#f15c80' , '#e4d354' ,
        ///            '#8085e8' , '#8d4653' , '#91e8e1']
        /// </summary>
        public IList<string> colors { get; private set; }

        /// <summary> Sets the list of colors used in the chart </summary>
        /// <param name="colorsList"> List of colors </param>
        public void SetColors(IList<string> colorsList)
        {
            this.colors = colorsList;
        }

        /// <summary> create the json from the Chart </summary>
        /// <returns> this chart object as a json string </returns>
        public string PrepareJSON()
        {
            var json = this.ToJson(int.MaxValue);
            return json;
        }

        /// <summary> Options regarding the chart area and plot area as well as general chart options. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class ChartType
        {
            /// <summary> Constructor initialises events. </summary>
            public ChartType()
            {
                this.events = new Events();
            }

            /// <summary> Gets or sets the zoom type is available. </summary>
            /// <remarks>
            ///   Decides in what dimensions the user can zoom by dragging the mouse. Can be one of 
            ///   <code>
            ///             x
            ///     </code> , 
            ///   <code>
            ///             y
            ///     </code> or 
            ///   <code>
            ///             xy
            ///     </code> . 
            /// </remarks>
            public string zoomType { get; set; }

            /// <summary> Gets or sets Event listeners for the chart. </summary>
            public Events events { get; set; }

            /// <summary>
            /// Gets or sets a value indicating whether we want to invert the chart.
            /// </summary>
            public bool inverted { get; set; }
        }

        /// <summary>
        ///   Highcharts by default puts a credits label in the lower right corner of the chart. This can be
        ///   changed using these options.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Credits
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public Credits()
            {
                this.enabled = true;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether to Enable or disable the credits text.
            ///   Default: true
            /// </summary>
            public bool enabled { get; set; }

            /// <summary>
            ///   Gets or sets the text for the credits label.
            ///   Default: Highcharts.com
            /// </summary>
            public string text { get; set; }

            /// <summary>
            ///   Gets or sets CSS styles for the credits label. Defaults to: 
            ///   <code>
            ///             style: { cursor: 'pointer', color: '#909090', fontSize: '10px'}
            ///     </code>
            /// </summary>
            public Style style { get; set; }

			/// <summary>
			/// Gets or sets the URL for the credits label.
			/// </summary>
			public string href { get; set; }

			public Position position { get; set; }
        }

        /// <summary>
        ///   Highcharts by default puts a "no data to display" message when no series are available. This allows you to override the message.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Lang
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public Lang()
            {
            }

            /// <summary>
            ///   Gets or sets the text for the no data label.
            ///   Default: "no data to display"
            /// </summary>
            public string noData { get; set; }
        }

        /// <summary>
        ///   Options for the exporting module. For an overview on the matter, see <a
        ///   href="http://docs.highcharts.com/#export-module"> the docs </a>.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Exporting
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public Exporting()
            {
                this.enabled = true;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether to enable the exporting module. Disabling the module
            ///   will hide the context button, but API methods will still be available.
            ///   Default: true
            /// </summary>
            public bool enabled { get; set; }
        }

        /// <summary> The chart's main title. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Title
        {
            /// <summary> Gets or sets the left margin of the chart title </summary>
            public int x { get; set; }

            /// <summary>
            ///   Gets or sets the title of the chart. To disable the title, set the 
            ///   <code>
            ///             text
            ///     </code> to 
            ///   <code>
            ///             null
            ///     </code>
            ///   .
            ///   Default: Chart title
            /// </summary>
            public string text { get; set; }

            /// <summary> Gets or sets the CSS styles for the title. </summary>
            public Style style { get; set; }
        }

        /// <summary> The chart's subtitle </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Subtitle
        {
            /// <summary> Gets or sets the subtitle of the chart. </summary>
            public string text { get; set; }
        }

        /// <summary>
        ///   <p>
        ///     The X axis or category axis. Normally this is the horizontal axis, though if the chart is
        ///     inverted this is the vertical axis. In case of multiple axes, the xAxis node is an array of
        ///     configuration objects.
        ///   </p>
        ///   <p>
        ///     See <a class="internal" href="#axis.object"> the Axis object </a> for programmatic access to
        ///     the axis.
        ///   </p>
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class XAxi
        {
            /// <summary>
            ///   Constructor initialises List of Categories, showLastLabel = true endOnTick = true
            /// </summary>
            public XAxi()
            {
                this.categories = new List<string>();
                this.showLastLabel = true;
                this.endOnTick = true;
            }

            /// <summary>
            ///   Gets a List of categories. 
            ///   <p>
            ///     If categories are present for the xAxis, names are used instead of numbers for that axis.
            ///     Since Highcharts 3.0, categories can also be extracted by giving each point a <a
            ///     href="#series.data"> name </a> and setting axis <a href="#xAxis.type"> type </a> to
            ///     <code>
            ///                   'category'
            ///       </code> . 
            ///   </p>
            ///   <p>
            ///     Example: <pre> categories: ['Apples', 'Bananas', 'Oranges'] </pre> Defaults to 
            ///     <code>
            ///                   null
            ///       </code>
            ///   </p>
            /// </summary>
            public IList<string> categories { get; private set; }

            /// <summary> Gets or sets the axis labels show the number or category for each tick. </summary>
            public Labels labels { get; set; }

            /// <summary>
            ///   Gets or sets the type of axis. Can be one of 
            ///   <code>
            ///             'linear'
            ///     </code> , 
            ///   <code>
            ///             'logarithmic'
            ///     </code> , 
            ///   <code>
            ///             'datetime'
            ///     </code> or 
            ///   <code>
            ///             'category'
            ///     </code>
            ///   . In a dateTime axis, the numbers are given in milliseconds, and tick marks are placed on
            ///   appropriate values like full hours or days. In a category axis, the <a href="#series.data">
            ///   point names </a> of the chart's series are used for categories, if not a <a
            ///   href="#xAxis.categories"> categories </a> array is defined.
            ///   Default: linear
            /// </summary>
            public string type { get; set; }

            /// <summary>
            ///   Gets or sets the dateTime Label Formats. For a dateTime axis, the scale will automatically
            ///   adjust to the appropriate unit. This member gives the default string representations used
            ///   for each unit. For an overview of the replacement codes, see dateFormat. Defaults to: <pre>
            ///   { millisecond: '%H:%M:%S.%L', second: '%H:%M:%S', minute: '%H:%M', hour: '%H:%M', day: '%e.
            ///   %b', week: '%e. %b', month: '%b \'%y', year: '%Y'} </pre>
            /// </summary>
            public DateTimeLabelFormats dateTimeLabelFormats { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to show the last tick label.
            ///   Default: true
            /// </summary>
            public bool showLastLabel { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to force the axis to end on a tick. Use this option
            ///   with the
            ///   <code>
            ///             maxPadding
            ///     </code>
            ///   option to control the axis end.
            ///   Default: false
            /// </summary>
            public bool endOnTick { get; set; }

            /// <summary>
            ///   Gets or sets the tickInterval. If tickInterval is 
            ///   <code>
            ///             null
            ///     </code>
            ///   this option sets the approximate pixel interval of the tick marks. Not applicable to
            ///   categorized axis. Defaults to
            ///   <code>
            ///             72
            ///     </code> for the Y axis and 
            ///   <code>
            ///             100
            ///     </code> for the X axis. 
            /// </summary>
            public double tickInterval { get; set; }

            /// <summary>
            /// Gets or sets the minimum range. This is like a zoom factor. 
            /// e.g. If showing date times on the axis and this value is 1 year (in milliseconds) then the chart will not zoom in any further than 1 year.
            /// </summary>
            public double minRange { get; set; }

            /// <summary> Gets or sets the axis title. showing next to the axis line. </summary>
            public Title title { get; set; }
        }

        /// <summary>
        ///   The scrollbar is a means of panning over the X axis of a chart. This is for HighStock only.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Scrollbar
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public Scrollbar()
            {
                this.enabled = false;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether the Scrollbar is enabled. Defaults to true.
            /// </summary>
            public bool enabled { get; set; }
        }

        /// <summary>
        ///   The navigator is a small series below the main series, displaying a view of the entire data set.
        ///   It provides tools to zoom in and out on parts of the data as well as panning across the dataset.
        ///   This is for HighStock only.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Navigator
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public Navigator()
            {
                this.enabled = false;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether the Navigator is enabled. Defaults to true.
            /// </summary>
            public bool enabled { get; set; }
        }

        /// <summary>
        ///   The range selector is a tool for selecting ranges to display within the chart. It provides
        ///   buttons to select preconfigured ranges in the chart, like 1 day, 1 week, 1 month etc. It also
        ///   provides input boxes where min and max dates can be manually input. This is for HighStock only.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class RangeSelector
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public RangeSelector()
            {
                this.enabled = false;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether the RangeSelector is enabled. Defaults to true.
            /// </summary>
            public bool enabled { get; set; }
        }

        /// <summary> Style settings for the object, use CSS styles </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Style
        {
            /// <summary> Gets or sets a css representation of a colour </summary>
            public string color { get; set; }

            /// <summary>
            ///   Gets or sets a css representation of cursor. See <see
            ///   cref="https://developer.mozilla.org/en-US/docs/Web/CSS/cursor"/> for full list.
            /// </summary>
            public string cursor { get; set; }

            /// <summary> Gets or sets a css representation of a font size. </summary>
            public string fontSize { get; set; }
        }

        /// <summary> Axis labels </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Labels
        {
            /// <summary>
            ///   Gets or sets what part of the string the given position is anchored to. Can be one of
            ///   "left", "center" or "right". Defaults to "left".
            /// </summary>
            public string align { get; set; }

            /// <summary>
            ///   Gets or sets a format string for the axis label. Defaults to 
            ///   <code>
            ///             {value}
            ///     </code> . 
            /// </summary>
            public string format { get; set; }

            /// <summary>
            ///   Gets or sets the CSS styles for the label. Use 
            ///   <code>
            ///             whiteSpace: 'nowrap'
            ///     </code>
            ///   to prevent wrapping of category labels. Defaults to: <pre> style: { color: '#6D869F',
            ///   fontWeight: 'bold'} </pre>
            /// </summary>
            public Style style { get; set; }

            /// <summary>
            ///   Gets or sets the rotation of the labels in degrees.
            ///   Default: 0
            /// </summary>
            public int? rotation { get; set; }

            /// <summary>
            ///   Gets or sets step value. 
            ///   <p>
            ///     To show only every <em> n </em> th label on the axis, set the step to <em> n </em>.
            ///     Setting the step to 2 shows every other label.
            ///   </p>
            ///   <p>
            ///     By default, the step is calculated automatically to avoid overlap. To prevent this, set it
            ///     to 1. This usually only happens on a category axis, and is often a sign that you have
            ///     chosen the wrong axis type. Read more at <a
            ///     href="http://www.highcharts.com/docs/chart-concepts/axes"> Axis docs </a> =&gt; What axis
            ///     should I use?
            ///   </p>
            /// </summary>
            public int? step { get; set; }

            /// <summary>
            ///   Gets or sets the x position offset of the label relative to the tick position on the axis.
            ///   Defaults to -15 for left axis, 15 for right axis.
            /// </summary>
            public int? x { get; set; }
        }

        /// <summary> Date Time Label Formats </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class DateTimeLabelFormats
        {
            /// <summary>
            ///   Gets or sets the Month Date format defaults to ' 
            ///   <code>
            ///             %b \'%y
            ///     </code> ' 
            /// </summary>
            public string month { get; set; }

            /// <summary>
            ///   Gets or sets the Year Date format defaults to ' 
            ///   <code>
            ///             %Y
            ///     </code> ' 
            /// </summary>
            public string year { get; set; }
        }

        /// <summary>
        ///   <p>
        ///     The Y axis or value axis. Normally this is the vertical axis, though if the chart is inverted
        ///     this is the horizontal axis. In case of multiple axes, the yAxis node is an array of
        ///     configuration objects.
        ///   </p>
        ///   <p>
        ///     See <a class="internal" href="#axis.object"> the Axis object </a> for programmatic access to
        ///     the axis.
        ///   </p>
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class YAxi
        {
            /// <summary>
            ///   Constructor initialises List of Categories, showLastLabel = true endOnTick = true
            /// </summary>
            public YAxi()
            {
                this.showLastLabel = true;
                this.endOnTick = true;
            }

            /// <summary> Gets or sets the axis labels show the number or category for each tick. </summary>
            public Labels labels { get; set; }

            /// <summary> Gets or sets the title of the YAxis </summary>
            public Title title { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to display the axis on the opposite side of the
            ///   normal. The normal is on the left side for vertical axes and bottom for horizontal, so the
            ///   opposite sides will be right and top respectively. This is typically used with dual or
            ///   multiple axes.
            ///   Default: false
            /// </summary>
            public bool? opposite { get; set; }

            /// <summary> Gets or sets the floor of the YAxis </summary>
            public int? floor { get; set; }

            /// <summary>
            ///   Gets or sets the type of axis. Can be one of 
            ///   <code>
            ///             'linear'
            ///     </code> , 
            ///   <code>
            ///             'logarithmic'
            ///     </code> , 
            ///   <code>
            ///             'datetime'
            ///     </code> or 
            ///   <code>
            ///             'category'
            ///     </code>
            ///   . In a dateTime axis, the numbers are given in milliseconds, and tick marks are placed on
            ///   appropriate values like full hours or days. In a category axis, the <a href="#series.data">
            ///   point names </a> of the chart's series are used for categories, if not a <a
            ///   href="#xAxis.categories"> categories </a> array is defined.
            ///   Default: linear
            /// </summary>
            public string type { get; set; }

            /// <summary>
            ///   Gets or sets the dateTime Label Formats. For a dateTime axis, the scale will automatically
            ///   adjust to the appropriate unit. This member gives the default string representations used
            ///   for each unit. For an overview of the replacement codes, see dateFormat. Defaults to: <pre>
            ///   { millisecond: '%H:%M:%S.%L', second: '%H:%M:%S', minute: '%H:%M', hour: '%H:%M', day: '%e.
            ///   %b', week: '%e. %b', month: '%b \'%y', year: '%Y'} </pre>
            /// </summary>
            public DateTimeLabelFormats dateTimeLabelFormats { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to show the last tick label.
            ///   Default: true
            /// </summary>
            public bool showLastLabel { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to force the axis to end on a tick. Use this option
            ///   with the
            ///   <code>
            ///             maxPadding
            ///     </code>
            ///   option to control the axis end.
            ///   Default: false
            /// </summary>
            public bool endOnTick { get; set; }

            /// <summary>
            ///   Gets or sets the tickInterval. If tickInterval is 
            ///   <code>
            ///             null
            ///     </code>
            ///   this option sets the approximate pixel interval of the tick marks. Not applicable to
            ///   categorized axis. Defaults to
            ///   <code>
            ///             72
            ///     </code> for the Y axis and 
            ///   <code>
            ///             100
            ///     </code> for the X axis. 
            /// </summary>
            public double? tickInterval { get; set; }

            /// <summary>
            /// Gets or sets the minimum range. This is like a zoom factor. 
            /// e.g. If showing date times on the axis and this value is 1 year (in milliseconds) then the chart will not zoom in any further than 1 year.
            /// </summary>
            public double minRange { get; set; }
        }

        /// <summary> Options for the tooltip that appears when the user hovers over a series or point. </summary>
        /// <remarks>Not initialised in chart constructor i.e. required to be created as required.</remarks>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Tooltip
        {
            /// <summary>
            ///   Gets or sets a value indicating whether the tooltip is shared. When the tooltip is shared,
            ///   the entire plot area will capture mouse movement or touch events. Tooltip texts for series
            ///   types with ordered data (not pie, scatter, flags etc) will be shown in a single bubble. This
            ///   is recommended for single series charts and for tablet/mobile optimized charts.
            ///   Default: false
            /// </summary>
            public bool shared { get; set; }

            /// <summary>
            /// Gets or sets a value indicating whether the chart floating tooltip is enabled or not.
            /// </summary>
            /// <remarks>HiChart defaults to <c>true</c> if no tooltip object is initialised; if tooltip is created then this will default to <c>false</c>.</remarks>
            public bool enabled { get; set; }
        }

        /// <summary> Style options for Legend options. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class ItemStyle
        {
            /// <summary> Gets or sets Legend Item width </summary>
            public int? width { get; set; }

            /// <summary> Gets or sets Legend Item font size </summary>
            public int? fontSize { get; set; }
        }

        /// <summary>
        ///   The legend is a box containing a symbol and name for each series item or point item in the chart.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Legend
        {
            /// <summary>
            ///   Constructor initialises default options: itemStyle = {fontStyle: 12} align = center enabled
            ///   = true layout = horizontal verticalAlign = bottom
            /// </summary>
            public Legend()
            {
                this.align = "center";
                this.enabled = true;
                this.layout = "horizontal";
                this.verticalAlign = "bottom";
                this.itemStyle = new ItemStyle()
                {
                    fontSize = 12
                };
            }

            /// <summary>
            ///   Gets or sets a value indicating whether to enable or disable the legend.
            ///   Default: true
            /// </summary>
            public bool enabled { get; set; }

            /// <summary>
            ///   Gets or sets the layout of the legend items. Can be one of 'horizontal' or 'vertical'.
            ///   Default: horizontal
            /// </summary>
            public string layout { get; set; } // horizontal

            /// <summary>
            ///   Gets or sets the horizontal alignment of the legend box within the chart area. Valid values are
            ///   <code>
            ///             'left'
            ///     </code> , 
            ///   <code>
            ///             'center'
            ///     </code> and 
            ///   <code>
            ///             'right'
            ///     </code>
            ///   .
            ///   Default: center
            /// </summary>
            public string align { get; set; } // center

            /// <summary>
            ///   Gets or sets the x offset of the legend relative to its horizontal alignment 
            ///   <code>
            ///             align
            ///     </code>
            ///   within chart.spacingLeft and chart.spacingRight. Negative x moves it to the left, positive x
            ///   moves it to the right.
            ///   Default: 0
            /// </summary>
            public int x { get; set; }

            /// <summary>
            ///   Gets or sets the vertical alignment of the legend box. Can be one of 'top', 'middle' or
            ///   'bottom'. Vertical position can be further determined by the
            ///   <code>
            ///             y
            ///     </code>
            ///   option.
            ///   Default: bottom
            /// </summary>
            public string verticalAlign { get; set; }

            /// <summary>
            ///   Gets or sets the vertical offset of the legend relative to it's vertical alignment 
            ///   <code>
            ///             verticalAlign
            ///     </code>
            ///   within chart.spacingTop and chart.spacingBottom. Negative y moves it up, positive y moves it down.
            ///   Default: 0
            /// </summary>
            public int? y { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether the legend is floating. When the legend is floating,
            ///   the plot area ignores it and is allowed to be placed below it.
            ///   Default: false
            /// </summary>
            public bool floating { get; set; }

            /// <summary> Gets or sets the background color of the legend. </summary>
            public string backgroundColor { get; set; }

            /// <summary> Gets or sets the title to be added on top of the legend. </summary>
            public Title title { get; set; }

            /// <summary>
            ///   Gets or sets the pixel bottom margin for each legend item.
            ///   Default: 0
            /// </summary>
            public int? itemMarginBottom { get; set; }

            //// /// <summary>
            //// /// The width for each legend item. This is useful in a horizontal layout with many items when you want the items to align vertically.  .
            //// /// </summary>
            //// public int? itemWidth { get; set; }

            /// <summary>
            ///   Gets or sets the CSS styles for each legend item. Only a subset of CSS is supported, notably
            ///   those options related to text. Default:
            ///   <code>
            ///             { "color": "#333333", "cursor": "pointer", "fontSize": "12px", "fontWeight": "bold" }
            ///     </code>
            /// </summary>
            public ItemStyle itemStyle { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to adjust the chart size to include the legend, or
            ///   to shrink the plot size to accommodate it.
            /// </summary>
            public bool adjustChartSize { get; set; }

	        /// <summary>
	        /// Gets or sets the plot area sized is calculated automatically and the legend is not floating, 
	        /// the legend margin is the space between the legend and the axis labels or plot area.
	        /// </summary>
	        public double Margin { get; set; }
		}

        /// <summary>
        ///   Alternative options for the tooltip that appears when the user hovers over a series or point.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Tooltip2
        {
            /// <summary>
            ///   Gets or sets a string to append to each series' y value. Overridable in each series' tooltip
            ///   options object.
            /// </summary>
            public string valueSuffix { get; set; }
        }

        /// <summary>
        ///   The actual series to append to the chart. In addition to the members listed below, any member of the
        ///   <code>
        ///             plotOptions
        ///     </code>
        ///   for that specific type of plot can be added to a series individually. For example, even though a general
        ///   <code>
        ///             lineWidth
        ///     </code> is specified in 
        ///   <code>
        ///             plotOptions.series
        ///     </code> , an individual 
        ///   <code>
        ///             lineWidth
        ///     </code> can be specified for each series. 
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Series
        {
            /// <summary> Constructor initialises List of data. </summary>
            public Series()
            {
                this.data = new List<object>();
            }

            /// <summary> Gets or sets the name of the series as shown in the legend, tooltip etc. </summary>
            public string name { get; set; }

            /// <summary> Gets or sets the ORD of the series as shown in the legend, tooltip etc. </summary>
            public int order { get; set; }


            /// <summary>
            ///   Gets or sets the main color of the series. In line type series it applies to the line and
            ///   the point markers unless otherwise specified. In bar type series it applies to the bars
            ///   unless a color is specified per point. The default value is pulled from the options.colors array.
            /// </summary>
            public string color { get; set; }

            /// <summary>
            ///   Gets or sets the type of series. Can be one of 
            ///   <code>
            ///             area
            ///     </code> , 
            ///   <code>
            ///             areaspline
            ///     </code> , 
            ///   <code>
            ///             bar
            ///     </code> , 
            ///   <code>
            ///             column
            ///     </code> , 
            ///   <code>
            ///             line
            ///     </code> , 
            ///   <code>
            ///             pie
            ///     </code> , 
            ///   <code>
            ///             scatter
            ///     </code> or 
            ///   <code>
            ///             spline
            ///     </code> . From version 2.3, 
            ///   <code>
            ///             arearange
            ///     </code> , 
            ///   <code>
            ///             areasplinerange
            ///     </code> and 
            ///   <code>
            ///             columnrange
            ///     </code> are supported with the 
            ///   <code>
            ///             highcharts-more.js
            ///     </code> component. 
            /// </summary>
            public string type { get; set; }

            /// <summary>
            ///   Gets or sets the series y-axis When using dual or multiple y axes, this number defines which
            ///   yAxis the particular series is connected to. It refers to either the <a href="#yAxis.id">
            ///   axis id </a> or the index of the axis in the yAxis array, with 0 being the first.
            ///   Default: 0
            /// </summary>
            public int yAxis { get; set; }

            /// <summary>
            ///   Gets a list of data points for the series. The points can be given in three ways: <ol> <li>
            ///   An array of numerical values. In this case, the numerical values will be interpreted as y
            ///   values, and x values will be automatically calculated, either starting at 0 and incrementing
            ///   by 1, or from
            ///   <code>
            ///             pointStart
            ///     </code> and 
            ///   <code>
            ///             pointInterval
            ///     </code>
            ///   given in the plotOptions. If the axis is has categories, these will be used. This option is
            ///   not available for range series. Example: <pre> data: [0, 5, 3, 5] </pre></li><li>
            ///   <p>
            ///     An array of arrays with two values. In this case, the first value is the x value and the
            ///     second is the y value. If the first value is a string, it is applied as the name of the
            ///     point, and the x value is incremented following the above rules.
            ///   </p>
            ///   <p>
            ///     For range series, the arrays will be interpreted as 
            ///     <code>
            ///                   [x, low, high]
            ///       </code> . In this cases, the X value can be skipped altogether to make use of 
            ///     <code>
            ///                   pointStart
            ///       </code> and 
            ///     <code>
            ///                   pointRange
            ///       </code> . 
            ///   </p> Example: <pre> data: [[5, 2], [6, 3], [8, 2]] </pre></li><li> 
            ///   <p>
            ///     An array of objects with named values. In this case the objects are point configuration
            ///     objects as seen below.
            ///   </p>
            ///   <p>
            ///     Range series values are given by 
            ///     <code>
            ///                   low
            ///       </code> and 
            ///     <code>
            ///                   high
            ///       </code> . 
            ///   </p>
            ///   Example: <pre> data: [{ name: 'Point 1', color: '#00FF00', y: 0}, { name: 'Point 2', color:
            ///            '#FF00FF', y: 5}] </pre></li></ol>
            ///   <p>
            ///     Note that line series and derived types like spline and area, require data to be sorted by
            ///     X because it interpolates mouse coordinates for the tooltip. Column and scatter series,
            ///     where each point has its own mouse event, does not require sorting.
            ///   </p>
            /// </summary>
            public IList<object> data { get; private set; }

            /// <summary> Gets or sets the series tooltip </summary>
            public Tooltip2 tooltip { get; set; }

            /// <summary>
            /// Sets the data to use.
            /// </summary>
            /// <param name="data">The data to use.</param>
            public void SetData(IList<object> data)
            {
                this.data = data;
            }
        }

        /// <summary> General options for all series types. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsSeries
        {
            /// <summary> Constructor initialises default option for: turboThreshold = 6000. </summary>
            public PlotOptionsSeries()
            {
                this.turboThreshold = 6000;
            }

            /// <summary>
            ///   Gets or sets a checking threshold. When a series contains a data array that is longer than
            ///   this, only one dimensional arrays of numbers, or two dimensional arrays with x and y values
            ///   are allowed. Also, only the first point is tested, and the rest are assumed to be the same
            ///   format. This saves expensive data checking and indexing in long series. Set it to
            ///   <code>
            ///             0
            ///     </code>
            ///   disable.
            ///   Default: 1000
            /// </summary>
            public int turboThreshold { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to stack the values of each series on top of each
            ///   other. Possible values are null to disable, 'normal' to stack by value or 'percent'.
            /// </summary>
            public string stacking { get; set; }

            /// <summary>
            ///   Gets or sets the cursor. You can set the cursor to 'pointer' if you have click events
            ///   attached to the series, to signal to the user that the points and lines can be clicked.
            /// </summary>
            public string cursor { get; set; }

            /// <summary> Gets or sets events related to all series </summary>
            public Events events { get; set; }
        }

        /// <summary> Options for Column charts </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsColumn
        {
            /// <summary>
            ///   Gets or sets the cursor. You can set the cursor to 'pointer' if you have click events
            ///   attached to the series, to signal to the user that the points and lines can be clicked.
            /// </summary>
            public string cursor { get; set; }

            /// <summary> Gets or sets events related to all series </summary>
            public Events events { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to stack the values of each series on top of each
            ///   other. Possible values are null to disable, 'normal' to stack by value or 'percent'.
            /// </summary>
            public string stacking { get; set; }
        }

        /// <summary> Options for Column charts </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsColumnRange
        {
            /// <summary> Constructor initialises default option for: turboThreshold = 6000. </summary>
            public PlotOptionsColumnRange()
            {
                this.dataLabels = new PlotOptionsColumnRangeDataLabels();
            }

            /// <summary> Gets or sets Pie Data label settings. </summary>
            public PlotOptionsColumnRangeDataLabels dataLabels { get; set; }

            /// <summary> Gets or sets the padding used between series. </summary>
            public decimal groupPadding { get; set; }

            /// <summary> Gets or sets the border width used for series. </summary>
            public int borderWidth { get; set; }
        }

        /// <summary> Options for Line charts </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsLine
        {
            /// <summary> Constructor initialises default option for: turboThreshold = 6000. </summary>
            public PlotOptionsLine()
            {
                this.turboThreshold = 6000;
            }

            /// <summary>
            ///   Gets or sets a checking threshold. When a series contains a data array that is longer than
            ///   this, only one dimensional arrays of numbers, or two dimensional arrays with x and y values
            ///   are allowed. Also, only the first point is tested, and the rest are assumed to be the same
            ///   format. This saves expensive data checking and indexing in long series. Set it to
            ///   <code>
            ///             0
            ///     </code>
            ///   disable.
            ///   Default: 1000
            /// </summary>
            public int turboThreshold { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to stack the values of each series on top of each
            ///   other. Possible values are null to disable, 'normal' to stack by value or 'percent'.
            /// </summary>
            public string stacking { get; set; }

            /// <summary>
            ///   Gets or sets the cursor. You can set the cursor to 'pointer' if you have click events
            ///   attached to the series, to signal to the user that the points and lines can be clicked.
            /// </summary>
            public string cursor { get; set; }

            /// <summary> Gets or sets events related to all series </summary>
            public Events events { get; set; }
        }

        /// <summary>
        ///   A pie chart is a circular chart divided into sectors, illustrating numerical proportion.
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsPie
        {
            /// <summary> Constructor initialises new dataLabels, allowPointSelect = false </summary>
            public PlotOptionsPie()
            {
                this.dataLabels = new PlotOptionsPieDataLabels();
                this.allowPointSelect = false;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether to Allow this series' points to be selected by
            ///   clicking on the markers, bars or pie slices.
            ///   Default: false
            /// </summary>
            public bool allowPointSelect { get; set; }

            /// <summary>
            ///   Gets or sets a value indicating whether to display this particular series or series type in
            ///   the legend. Since 2.1, pies are not shown in the legend by default.
            ///   Default: false
            /// </summary>
            public bool showInLegend { get; set; }

            /// <summary>
            ///   Gets or sets the cursor. You can set the cursor to 'pointer' if you have click events
            ///   attached to the series, to signal to the user that the points and lines can be clicked.
            /// </summary>
            public string cursor { get; set; }

            /// <summary> Gets or sets events related to all series </summary>
            public Events events { get; set; }

            /// <summary> Gets or sets Pie Data label settings. </summary>
            public PlotOptionsPieDataLabels dataLabels { get; set; }
        }

        /// <summary> Defines settings of the Pie chart data Labels. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsPieDataLabels
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public PlotOptionsPieDataLabels()
            {
                this.enabled = true;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether to Enable or disable the data labels.
            ///   Default: true
            /// </summary>
            public bool enabled { get; set; }
        }

        /// <summary> Defines settings of the Pie chart data Labels. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptionsColumnRangeDataLabels
        {
            /// <summary> Constructor initialises that enabled = true. </summary>
            public PlotOptionsColumnRangeDataLabels()
            {
                this.enabled = true;
            }

            /// <summary>
            ///   Gets or sets a value indicating whether to Enable or disable the data labels.
            ///   Default: true
            /// </summary>
            public bool enabled { get; set; }

            /// <summary>
            ///   Gets or sets the format.
            /// </summary>
            public string format { get; set; }
        }

        /// <summary>
        ///   <p>
        ///     The plotOptions is a wrapper object for config objects for each series type. The config
        ///     objects for each series can also be overridden for each series item as given in the series array.
        ///   </p>
        ///   <p>
        ///     Configuration options for the series are given in three levels. Options for all series in a
        ///     chart are given in the <a class="internal" href="#plotOptions.series"> plotOptions.series </a>
        ///     object. Then options for all series of a specific type are given in the plotOptions of that
        ///     type, for example plotOptions.line. Next, options for one single series are given in <a
        ///     class="internal" href="#series"> the series array </a>.
        ///   </p>
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class PlotOptions
        {
            /// <summary> Gets or sets standard Plot options. </summary>
            /// <remarks> General options for all series types. </remarks>
            public PlotOptionsSeries series { get; set; }

            /// <summary> Gets or sets Column Plot options. </summary>
            /// <remarks> A Column Based chart </remarks>
            public PlotOptionsColumn column { get; set; }

            /// <summary> Gets or sets Column range Plot options. </summary>
            /// <remarks> A Column range Based chart </remarks>
            public PlotOptionsColumnRange columnrange { get; set; }

            /// <summary> Gets or sets Pie Plot options. </summary>
            /// <remarks>
            ///   A pie chart is a circular chart divided into sectors, illustrating numerical proportion.
            /// </remarks>
            public PlotOptionsPie pie { get; set; }

            /// <summary> Gets or sets Line Plot options. </summary>
            /// <remarks> A Line Based chart </remarks>
            public PlotOptionsLine line { get; set; }
        }

        /// <summary> Event listeners for the chart. </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class Events
        {
            /// <summary> Gets or sets click event command. </summary>
            /// <remarks>
            ///   <p>
            ///     Fires when clicking on the plot background. The 
            ///     <code>
            ///                   this
            ///       </code> keyword refers to the chart object itself. One parameter, 
            ///     <code>
            ///                   event
            ///       </code>
            ///     , is passed to the function. This contains common event information based on jQuery or
            ///     MooTools depending on which library is used as the base for Highcharts.
            ///   </p>
            ///   <p>
            ///     Information on the clicked spot can be found through 
            ///     <code>
            ///                   event.xAxis
            ///       </code> and 
            ///     <code>
            ///                   event.yAxis
            ///       </code>
            ///     , which are arrays containing the axes of each dimension and each axis' value at the
            ///     clicked spot. The primary axes are
            ///     <code>
            ///                   event.xAxis[0]
            ///       </code> and 
            ///     <code>
            ///                   event.yAxis[0]
            ///       </code> . Remember the unit of a dateTime axis is milliseconds since 1970-01-01 00:00:00. 
            ///   </p>
            ///   <pre> click: function(e) { console.log( Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',
            ///   e.xAxis[0].value), e.yAxis[0].value )} </pre>
            /// </remarks>
            public string click { get; set; }
        }

        /// <summary> Contains Stored search info </summary>
        /// <remarks> This is like a KeyValuePair, but with greater flexibility. </remarks>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
        public class StoredSearch
        {
            /// <summary> Gets or sets the key of the stored search </summary>
            public string Key { get; set; }

            /// <summary> Gets or sets the value of the stored search </summary>
            public string Value { get; set; }

            /// <summary> Gets or sets the name of the stored search </summary>
            public string Name { get; set; }
        }

	    /// <summary> Contains Stored search info </summary>
	    /// <remarks> This is like a KeyValuePair, but with greater flexibility. </remarks>
	    [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1034:NestedTypesShouldNotBeVisible", Justification = "Nested types matches json it is mimicking")]
	    public class Position
	    {
			/// <summary> Gets or sets horizontal pixel offset of the credits. </summary>
			public int? X { get; set; }

			/// <summary> Gets or sets vertical pixel offset of the credits </summary>
			public int? Y { get; set; }

			/// <summary> Gets or sets the vertical alignment of the credits. </summary>
			public string VerticalAlign { get; set; }

			/// <summary> Gets or sets align. </summary>
			public string Align { get; set; }
		}
	}
}