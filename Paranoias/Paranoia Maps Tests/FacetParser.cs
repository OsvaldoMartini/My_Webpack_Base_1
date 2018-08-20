// <copyright file="FacetParser.cs" company="IHS">
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

namespace IHS.Apps.CMP.Utilities.URLParsers
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Web;

    using IHS.Apps.CMP.Common;
    using IHS.Apps.CMP.DatabaseAccess.DataFacade;
    using IHS.Apps.CMP.DataProviders;
    using IHS.Apps.CMP.DataProviders.FastProviderObjects;
    using IHS.Apps.CMP.Logging;
    using IHS.Apps.CMP.Models.Configuration;
    using IHS.Apps.CMP.Models.Struct;
    using IHS.Apps.CMP.Models.ViewModels.Facets;
    using IHS.Apps.CMP.Models.ViewModels.Map.Utilities;
    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;

    /// <summary> The facet parser. </summary>
    public class FacetParser : UrlParser
    {
        /// <summary>The preamble to identify the facet part of the query</summary>
        private const string FacetIdentifier = "f";

        /// <summary> Logging service </summary>
        private static readonly ILog Log = LogManager.GetLogger<FacetParser>();

        /// <summary>The cat config.</summary>
        private readonly category catConfig;

        /// <summary>The control config.</summary>
        private readonly control_config controlConfig;

        /// <summary>The current provider.</summary>
        private readonly AbstractDataProvider currentProvider;

        /// <summary>
        /// Stores the value of a facet that is currently expanding.
        /// </summary>
        private readonly string expandingFacet;

        /// <summary>
        /// A collection of simple facets.
        /// </summary>
        private List<SimpleFacet> simpleFacets = new List<SimpleFacet>();

        /// <summary>Initialises a new instance of the <see cref="FacetParser"/> class. Initialises a new instance of the <see cref="FacetParser"/> class. Constructs a facet parser</summary>
        /// <param name="parserCfg">The configuration to use with the parser.</param>
        public FacetParser(ParserConfigObject parserCfg)
        {
            this.QueryStringIdentifier = FacetIdentifier;
            this.currentProvider = parserCfg.CurrentProvider;
            this.catConfig = parserCfg.CurrentCategoryControlConfig;
            this.controlConfig = parserCfg.ControlConfig;
            this.expandingFacet = parserCfg.ExpandingFacet;
        }

        /// <summary>Gets the simple facets.</summary>
        public IEnumerable<SimpleFacet> SimpleFacets
        {
            get { return this.simpleFacets; }
        }

        /// <summary>The convert to simple facet.</summary>
        /// <param name="facet">The facet.</param>
        /// <returns>The <see cref="SimpleFacet"/>.</returns>
        public SimpleFacet ConvertToSimpleFacet(string facet)
        {
            var f = facet.Replace(QueryConstants.Not, string.Empty);
            var facetValue = ParserHelper.GetFacetValue(f);

            var facetName = ParserHelper.GetFacetName(f);
            var facetValues = HttpUtility.UrlDecode(facetValue).Split(new[] { QueryConstants.Or }, StringSplitOptions.RemoveEmptyEntries);

            var simpleFacet = new SimpleFacet
            {
                Invert = facet.Contains(QueryConstants.Not),
                Name = facetName,
                Values = facetValues,
                DisplayName = this.FigureOutDisplayName(facetName)
            };

            return simpleFacet;
        }

        /// <summary>The create expression constraint.</summary>
        /// <param name="node">The node.</param>
        /// <param name="theSearch">The the search.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        public ISearchConstraint CreateExpresionConstraint(ExpressionItem node, ISearch theSearch)
        {
            if (node is ExpressionOperator)
            {
                return this.CreateWrappedConstraint(node, theSearch);
            }

            var facetN = node as ExpressionVariable;
            var simpleFacet = this.ConvertToSimpleFacet(facetN.Value);
            this.simpleFacets.Add(simpleFacet);

            var constraint = this.ChangeFacetForExpander(simpleFacet, theSearch);
            if (constraint == null)
            {
                constraint = this.ParseQuery(simpleFacet.Name, simpleFacet.Values, simpleFacet.Invert, theSearch);
            }

            return constraint;
        }

        /// <summary>Converts a post fix search expression into a binary tree. </summary>
        /// <param name="expression">The post fix (Reverse Polish Notation) expression to convert into a binary tree.</param>
        /// <returns>The <see cref="ExpressionItem"/>.</returns>
        public ExpressionItem GenerateTree(string expression)
        {
            var stack = new Stack<ExpressionItem>();
            var operators = new[] { QueryConstants.LogicalAnd, QueryConstants.LogicalOr };

            //Pick apart the expression into individual components.
            var expressionParts = expression.Split('¬');

            foreach (var part in expressionParts)
            {
                //If the part is an operator...
                if (operators.Contains(part))
                {
                    var rightChild = stack.Pop();
                    var leftChild = stack.Pop();
                    var n = new ExpressionOperator(part, leftChild, rightChild);

                    stack.Push(n);
                }
                else
                {
                    var n = new ExpressionVariable(part);
                    stack.Push(n);
                }
            }

            //We should only have one item left on the stack.
            if (stack.Count != 1)
            {
                throw new Exception("Something has gone wrong with the expression tree generation!");
            }

            var result = stack.Pop();
            return result;
        }

        /// <summary>Parses a given query into a collection of simple facets.</summary>
        /// <param name="queryString">The query string. </param>
        /// <returns>The list of <see cref="SimpleFacet"/>.</returns>
        public ExpressionItem GetFacetsOutOfQuery(string queryString)
        {
            var value = URLToSearchParser.GetQueryStringValue(queryString, this.QueryStringIdentifier);

            if (string.IsNullOrEmpty(value))
            {
                return null;
            }

            return this.GenerateTree(this.ToPostfix(value));
        }

        /// <summary>Parses the given facets into a collection of constraints and adds them to the search object.</summary>
        /// <param name="facetNode">The facet Node.</param>
        /// <param name="search">The search. </param>
        public void Parse(ExpressionItem facetNode, ISearch search)
        {
            var constraint = this.CreateExpresionConstraint(facetNode, search);

            search.Constraints.AddIfNotNull(constraint);
        }

        /// <summary>Parses the query string and returns a constraint.  query right now cam have either all AND i.e ".." operators or
        /// all OR i.e "||" operators but not both </summary>
        /// <param name="facetKey">The facet Key.</param>
        /// <param name="facetValues">A collection of all of the values associated with the facet</param>
        /// <param name="inverse">If set to true it will wrap the query in 'not' statement</param>
        /// <param name="search">The search.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        public ISearchConstraint ParseQuery(string facetKey, IEnumerable<string> facetValues, bool inverse, ISearch search)
        {
            var indexerKey = FacetHelper.GetFacetName(facetKey, this.controlConfig, this.catConfig, false);
            var indexer = ParserHelper.CreateIndexer(this.currentProvider, search, indexerKey);

            if (indexer == null)
            {
                return null;
            }

            if (indexer.ObjectKey.Equals("CATEGORYKEY", StringComparison.OrdinalIgnoreCase))
            {
                facetValues = this.GetCategoryConstraintValues(this.currentProvider, this.controlConfig, facetValues);
            }

            if (indexer.ObjectKey == Taxonomy.COUNTRYREGIONTAXONOMY.ToString())
            {
                facetValues = facetValues.Select(this.GetCountryHierarchy).ToArray();
            }

            if (indexer.ObjectKey == "LATLONGS")
            {
                var boxConstraint = CreateMapConstraint(indexer, facetValues);
                return boxConstraint;
            }

            if (indexer.ObjectKey == "GEOAREA")
            {
                var geoAreaConstraint = CreateGeoAreaConstraint(indexer, facetValues);
                return geoAreaConstraint;
            }

            if (facetValues.Any(p => p.Contains(QueryConstants.Sub)) || facetValues.Any(p => p.Contains(QueryConstants.ShowParentSub)))
            {
                var childIndexerKey = FacetHelper.GetFacetName(facetKey, this.controlConfig, this.catConfig, true);
                var childIndexer = ParserHelper.CreateIndexer(this.currentProvider, search, childIndexerKey);

                return CreateSubConstraint(indexer, childIndexer, facetValues, inverse);
            }

            // Not inversing ranges and the sub is dealing with the inversion itself.
            if (inverse && (!facetValues.Any(p => p.Contains(QueryConstants.Range)) || !facetValues.Any(p => p.Contains(QueryConstants.Sub)) || !facetValues.Any(p => p.Contains(QueryConstants.ShowParentSub))))
            {
                return CreateNotConstraint(indexer, facetValues);
            }

            if (facetValues.Any(p => p.Contains(QueryConstants.Range)))
            {
                if (facetValues.Count() > 1)
                {
                    var orRangeConstraint = new OrNestedConstraint();
                    foreach (var rangeVal in facetValues)
                    {
                        orRangeConstraint.Add(CreateRangeConstraint(indexer, rangeVal));
                    }

                    return orRangeConstraint;
                }

                var rangeFacetValue = facetValues.Single(p => p.Contains(QueryConstants.Range));
                return CreateRangeConstraint(indexer, rangeFacetValue);
            }

            var retConstraint = CreateOrNestedConstraint(indexer, facetValues);

            return retConstraint;
        }

        /// <summary>Creates constraints based around the facets mentioned in the query string and adds 
        /// them to the search object. </summary>
        /// <param name="queryString">The query string</param>
        /// <param name="search">The search.</param>
        public override void Process(string queryString, ISearch search)
        {
            var facets = this.GetFacetsOutOfQuery(queryString);
            if (facets != null && !string.IsNullOrWhiteSpace(facets.Value))
            {
                this.Parse(facets, search);
            }
        }

        /// <summary>
        /// Parse the query string to a list of simple facets.
        /// </summary>
        /// <param name="queryString">The query string to parse.</param>
        /// <returns>List of simple facet representing the facets defined in the query string.</returns>
        public IEnumerable<SimpleFacet> ParseToSimpleFacets(string queryString)
        {
            IEnumerable<SimpleFacet> simpleFacets = new List<SimpleFacet>();
            var facets = this.GetFacetsOutOfQuery(queryString);
            if (facets != null && !string.IsNullOrWhiteSpace(facets.Value))
            {
                simpleFacets = this.CreateSimpleFacets(facets);
            }

            return simpleFacets;
        }

        /// <summary>The create expression constraint.</summary>
        /// <param name="node">The node.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        public IEnumerable<SimpleFacet> CreateSimpleFacets(ExpressionItem node)
        {
            var simpleFacets = new List<SimpleFacet>();
            if (node is ExpressionOperator)
            {
                var op = node as ExpressionOperator;

                if (op.LeftChild != null)
                {
                    simpleFacets.AddRange(this.CreateSimpleFacets(op.LeftChild));
                }

                if (op.RightChild != null)
                {
                    simpleFacets.AddRange(this.CreateSimpleFacets(op.RightChild));
                }

                return simpleFacets;
            }

            var facetN = node as ExpressionVariable;
            var simpleFacet = this.ConvertToSimpleFacet(facetN.Value);
            simpleFacets.Add(simpleFacet);

            return simpleFacets;
        }

        /// <summary>Converts a search expression into post fix (Reverse Polish Notation) order. e.g. "A + B" would become "A B +".</summary>
        /// <param name="infix">The infix expression to convert.</param>
        /// <returns>The <see cref="string"/>.</returns>
        public string ToPostfix(string infix)
        {
            //in order of importance
            var operators = new[] { QueryConstants.LogicalOr, QueryConstants.LogicalAnd };

            //split by operators
            var items = Regex.Split(infix, @"(?=\<[and|or])|(?<=\>)", RegexOptions.IgnoreCase).ToList();

            //starting with the most important operator
            foreach (var searchOperator in operators)
            {
                var stack = new Stack<string>();

                foreach (var item in items)
                {
                    //If it is the operator we are currently processing...
                    if (item == searchOperator)
                    {
                        stack.Push(item);
                    }
                    else
                    {
                        var isTopItemOperator = stack.Count > 0 && stack.Peek() == searchOperator;

                        //Add the currently processed item to the stack.
                        stack.Push(item);

                        if (isTopItemOperator)
                        {
                            //stack.Push(item);

                            //Convert the top three items in the stack into a single item. e.g. ["A", "+", "B"] will become ["A B +"]
                            var rightChild = stack.Pop();
                            var processedOperator = stack.Pop();
                            var leftChild = stack.Pop();

                            //Create the item in Post Fix (Reverse Polish) format.
                            var postFixItem = leftChild + "¬" + rightChild + "¬" + processedOperator;

                            //And add the new item back into the stack.
                            stack.Push(postFixItem);
                        }
                    }
                }

                //After all items have been processed, make the stacked items the new process list.
                items = stack.ToArray().ToList();

                //A stack converted to an array is in reverse order.
                items.Reverse();
            }

            return string.Join(" ", items);
        }

        /// <summary>Really horrible method that will go through the panels for a category and try to figure out which panel contains 
        /// the category key provided, when/if it find a match it will return the first appropriate panel_title_key</summary>
        /// <param name="name">The control key for the panel</param>
        /// <returns>The display_key, or if one cant be found the original indexer name</returns>
        protected string FigureOutDisplayName(string name)
        {
            if (this.catConfig == null || this.catConfig.panel == null)
            {
                return name;
            }

            panel facetPanel = null;

            if (this.catConfig.panel_group != null)
            {
                foreach (var group in this.catConfig.panel_group)
                {
                    foreach (var p in group.panel.Where(x => x.tree_control != null))
                    {
                        var treeDef = this.controlConfig.tree_definitions.tree.FirstOrDefault(t => t.tree_key.Equals(p.tree_control.control_key));
                        if (treeDef != null && treeDef.tree_node.key.Equals(this.expandingFacet))
                        {
                            facetPanel = p;
                            break;
                        }
                    }

                    if (facetPanel != null)
                    {
                        break;
                    }
                }
            }

            if (facetPanel == null && this.catConfig.panel != null)
            {
                foreach (var p in this.catConfig.panel.Where(x => x.tree_control != null))
                {
                    var treeDef = this.controlConfig.tree_definitions.tree.FirstOrDefault(t => t.tree_key.Equals(p.tree_control.control_key));
                    if (treeDef != null && treeDef.tree_node.key.Equals(name))
                    {
                        facetPanel = p;
                        break;
                    }
                }
            }

            if (facetPanel == null)
            {
                facetPanel = this.catConfig.panel.Where(x => x.link_tree_control != null)
                    .FirstOrDefault(p => p.link_tree_control.control_key.Equals(name, StringComparison.InvariantCultureIgnoreCase));
            }

            if (facetPanel == null)
            {
                facetPanel = this.catConfig.panel.Where(x => x.range_nav != null)
                    .FirstOrDefault(p => p.range_nav.key.Equals(name, StringComparison.InvariantCultureIgnoreCase));
            }

            if (facetPanel != null)
            {
                return facetPanel.title_resource_key;
            }

            var fixedLinkPanels = this.catConfig.panel.Where(x => x.fixed_link != null);
            foreach (var flp in from flp in fixedLinkPanels
                                let fl = flp.fixed_link.Where(p => p.target_category_key != null)
                                    .FirstOrDefault(p => p.target_category_key.Equals(name, StringComparison.InvariantCultureIgnoreCase))
                                where fl != null
                                select flp)
            {
                return flp.title_resource_key;
            }

            return name;
        }

        /// <summary>The set constraint. </summary>
        /// <param name="values">The values. </param>
        /// <returns>The <see cref="AndNestedConstraint"/>.</returns>
        private static AndNestedConstraint CreateAndNestedConstraint(List<KeyValuePair<IIndexer, string>> values)
        {
            var constraint = new AndNestedConstraint();

            var separator = CMPConfiguration.SpaceText + LanguageUtils.GetGlobalResourceString(CMPConfiguration.EqualsText) + CMPConfiguration.SpaceText;

            var metaData = MetaData.CreateCrumbMetaData(string.Empty, separator, string.Empty, string.Empty, true, true, true, true, false);

            foreach (var item in values)
            {
                var inConstraint = new InConstraint(item.Key, item.Value) { Name = metaData };
                constraint.Add(inConstraint);
            }

            return constraint;
        }

        /// <summary>
        /// Create map area constraints from encoded polygon
        /// </summary>
        /// <param name="indexer">The lat long indexer.</param>
        /// <param name="facetValues">The facet values.</param>
        /// <returns>Geo Area Constraint.</returns>
        private static ISearchConstraint CreateGeoAreaConstraint(IIndexer indexer, IEnumerable<string> facetValues)
        {
            var areas = new List<GeoAreaConstraint>();

            foreach (var value in facetValues)
            {
                var janesConnectionString = CMPConfiguration.JanesContentConnectionString;
                var cmpConnectionString = CMPConfiguration.CmpConnectionString;
                var cache = new MapLayerCacheFacade(new MapLayerFacade(CMPConfiguration.CmpConnectionString, CMPConfiguration.JanesContentConnectionString));

                var wkt = cache.GetGeoFeatures("CountryOutline", value).First().Feature;
                
                var geo = WellKnownText.ToGeometry(wkt);
                wkt = WellKnownText.FromGeometry(geo);
                areas.Add(new GeoAreaConstraint(indexer, geo, wkt));
            }

            if (areas.Count == 1)
            {
                return areas.First();
            }

            var orConstraint = new OrNestedConstraint();
            orConstraint.AddRange(areas);

            return orConstraint;
        }

        /// <summary>
        /// Create map constraints from lat long facets
        /// </summary>
        /// <param name="indexer">The lat long indexer.</param>
        /// <param name="facetValues">The facet values.</param>
        /// <returns>Geo Box constraint.</returns>
        private static ISearchConstraint CreateMapConstraint(IIndexer indexer, IEnumerable<string> facetValues)
        {
            var points = new List<GeoCoordinate>();
            foreach (var value in facetValues)
            {
                var temp = value.Split(',');
                var lat = Convert.ToDouble(temp.First());
                var lon = Convert.ToDouble(temp.Last());
                points.Add(new GeoCoordinate(lat, lon));
            }

            if (points.Count != 2)
            {
                return null;
            }

            var first = points.First();
            var last = points.Last();
            if (last.Longitude - first.Longitude > 360)
            {
                last = new GeoCoordinate(last.Latitude, first.Longitude + 360);
            }

            first = first.Normalize();
            last = last.Normalize();

            if (Math.Round(last.Longitude, 5) > Math.Round(first.Longitude, 5))
            {
                var boxConstraint = new GeoBoxConstraint(indexer, first, last);
                return boxConstraint;
            }

            var orConstraint = new OrNestedConstraint();
            var boxConstraint1 = new GeoBoxConstraint(indexer, new GeoCoordinate(first.Latitude, -180), new GeoCoordinate(last.Latitude, last.Longitude));
            var boxConstraint2 = new GeoBoxConstraint(indexer, new GeoCoordinate(first.Latitude, first.Longitude), new GeoCoordinate(last.Latitude, 180));

            orConstraint.Add(boxConstraint1);
            orConstraint.Add(boxConstraint2);

            return orConstraint;
        }

        /// <summary>Creates the "not in constraint".</summary>
        /// <param name="indexer">The indexer.</param>
        /// <param name="values">The values.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        private static ISearchConstraint CreateNotConstraint(IIndexer indexer, IEnumerable<string> values)
        {
            var notConstraint = new NotInConstraint(indexer, values);
            return notConstraint;
        }

        /// <summary>Creates the "not equals constraint".</summary>
        /// <param name="indexer">The indexer.</param>
        /// <param name="value">The value.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        private static ISearchConstraint CreateNotEqualsConstraint(IIndexer indexer, string value)
        {
            var notConstraint = new NotEqualsConstraint(indexer, value);
            return notConstraint;
        }

        /// <summary>The set constraint. </summary>
        /// <param name="indexer">The indexer. </param>
        /// <param name="values">The values. </param>
        /// <returns>The <see cref="OrNestedConstraint"/>.</returns>
        private static OrNestedConstraint CreateOrNestedConstraint(IIndexer indexer, IEnumerable<string> values)
        {
            var constraint = new OrNestedConstraint();

            if (indexer == null)
            {
                return constraint;
            }

            var separator = CMPConfiguration.SpaceText + LanguageUtils.GetGlobalResourceString(CMPConfiguration.EqualsText) + CMPConfiguration.SpaceText;

            var metaData = MetaData.CreateCrumbMetaData(string.Empty, separator, string.Empty, string.Empty, true, true, true, true, false);

            if (values.Count() == 1 && values.First().StartsWith("~"))
            {
                metaData += "|IgnoreBoundary";
            }

            if (indexer.Type == AttributeType.NUMERIC_TYPE)
            {
                var newValues = new List<string>();
                foreach (var value in values)
                {
                    newValues.AddRange(value.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries));
                }

                values = newValues;
            }

            if (values.Count() == 1 && !values.First().StartsWith("~"))
            {
                var val = values.FirstOrDefault();
                if (val != null && val.EndsWith("*"))
                {
                    val = val.Replace("*", "%");
                    var wildConstraint = new WildCardConstraint(indexer, val)
                    {
                        Identifier = string.Format("{0}|WILD", indexer.ObjectKey),
                        Name = metaData
                    };
                    constraint.Add(wildConstraint);
                }
                else
                {
                    var inConstraint = new EqualsConstraint(indexer, val)
                    {
                        Identifier = string.Format("{0}|EQUALS", indexer.ObjectKey),
                        Name = metaData
                    };
                    constraint.Add(inConstraint);
                }
            }
            else
            {
                if (values.Any(v => v.EndsWith("*")))
                {
                    // create wildcards for each value
                    var wilds = values.Where(v => v.EndsWith("*"));
                    var num = 0;
                    foreach (var wild in wilds)
                    {
                        var w = wild.Replace("*", "%");
                        var wildConstraint = new WildCardConstraint(indexer, w)
                        {
                            Identifier = string.Format("{0}|WILD{1}", indexer.ObjectKey, num),
                            Name = metaData
                        };
                        constraint.Add(wildConstraint);
                        num++;
                    }
                }

                var nonWilds = values.Where(v => !v.EndsWith("*"));
                if (nonWilds != null && nonWilds.Count() > 0)
                {
                    var inConstraint = new InConstraint(indexer, nonWilds)
                    {
                        Identifier = string.Format("{0}|IN", indexer.ObjectKey),
                        Name = metaData
                    };
                    constraint.Add(inConstraint);
                }
            }

            return constraint;
        }

        /// <summary>The set range constraint.</summary>
        /// <param name="indexer">The indexer.</param>
        /// <param name="query">The query.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        private static ISearchConstraint CreateRangeConstraint(IIndexer indexer, string query)
        {
            var rangeValues = GetRangeItems(query);
            string minValue = null;
            string maxValue = null;

            if (rangeValues.Count() == 2)
            {
                minValue = rangeValues.First();
                maxValue = rangeValues.Last();
            }
            else if (rangeValues.Count() == 1)
            {
                if (query.StartsWith(QueryConstants.Range))
                {
                    maxValue = rangeValues.First();
                }
                else
                {
                    minValue = rangeValues.First();
                }
            }

            var rangeConstraint = new RangeConstraint(indexer) { Identifier = indexer.ObjectKey, Min = minValue, Max = maxValue };
            return rangeConstraint;
        }

        /// <summary>The create sub constraint or inverse it if necessary.</summary>
        /// <param name="indexer">The indexer.</param>
        /// <param name="childIndexer">The child indexer.</param>
        /// <param name="facetOrItems">The facet or items.</param>
        /// <param name="inverse">The inverse.</param>
        /// <returns>The <see cref="ISearchConstraint"/>.</returns>
        private static ISearchConstraint CreateSubConstraint(IIndexer indexer, IIndexer childIndexer, IEnumerable<string> facetOrItems, bool inverse)
        {
            var subItems = facetOrItems.Where(p => p.Contains(QueryConstants.Sub) || p.Contains(QueryConstants.ShowParentSub)).Select(p => p.Replace(QueryConstants.ShowParentSub, QueryConstants.Sub));
            var orItems = facetOrItems.Where(p => !p.Contains(QueryConstants.Sub) && !p.Contains(QueryConstants.ShowParentSub));

            NestedConstraint constraint = new OrNestedConstraint();
            ISearchConstraint orConstraints;
            if (inverse)
            {
                constraint = new AndNestedConstraint();
                orConstraints = CreateNotConstraint(indexer, orItems);
            }
            else
            {
                orConstraints = CreateOrNestedConstraint(indexer, orItems);
            }

            if (orItems.Count() > 0)
            {
                constraint.Add(orConstraints);
            }

            foreach (var subItem in subItems)
            {
                var temp = subItem.Split(new[] { QueryConstants.Sub }, StringSplitOptions.RemoveEmptyEntries);
                if (temp.Count() == 2)
                {
                    var parentValue = temp.First();
                    var childValue = temp.Last();

                    if (inverse)
                    {
                        var orNotConstraint = new OrNestedConstraint();
                        var notParent = CreateNotEqualsConstraint(indexer, parentValue);
                        var notChild = CreateNotEqualsConstraint(childIndexer, childValue);

                        orNotConstraint.Add(notParent);
                        orNotConstraint.Add(notChild);

                        constraint.Add(orNotConstraint);
                    }
                    else
                    {
                        var subConstraints = new List<KeyValuePair<IIndexer, string>>
                        {
                            new KeyValuePair<IIndexer, string>(indexer, parentValue),
                            new KeyValuePair<IIndexer, string>(childIndexer, childValue)
                        };

                        var andConstraint = CreateAndNestedConstraint(subConstraints);
                        constraint.Add(andConstraint);
                    }
                }
            }

            return constraint;
        }

        /// <summary>The get range.</summary>
        /// <param name="query">The query.</param>
        /// <returns>The <see cref="string[]"/>.</returns>
        private static string[] GetRangeItems(string query)
        {
            var values = query
                .Split(new[] { QueryConstants.Range }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim('(', ')')).ToArray();

            return values;
        }

        /// <summary>The get facet pairs. </summary>
        /// <param name="query">The query. </param>
        /// <returns>The <see cref="object"/>. </returns>
        private static string[] GetSubItems(string query)
        {
            var items = query
                .Split(new[] { QueryConstants.Sub }, StringSplitOptions.None)
                .Select(p => p.Trim('(', ')')).ToArray();

            return items;
        }

        /// <summary>The get country hierarchy.</summary>
        /// <param name="country">The country.</param>
        /// <returns>The <see cref="string"/>.</returns>
        private string GetCountryHierarchy(string country)
        {
            if (country.Contains("¶"))
            {
                return country;
            }

            if (country.Contains("/") && this.currentProvider is JanesDocumentProvider)
            {
                return country.Replace('/', '¶');
            }

            country = Regex.Replace(country, "[ ,-]", string.Empty);

            CountryRegion countryEnum;

            if (!Enum.TryParse(country, true, out countryEnum))
            {
                Log.Debug("Default Country LookupFailed, using Fallback");
                countryEnum = CountryRegionConverterFallback.LastChanceConverter(country);
            }

            var countryHierarchy = CountryRegionConverter.GetCountryRegionHierarchy(countryEnum);

            if (this.currentProvider is JanesDocumentProvider)
            {
                countryHierarchy = countryHierarchy.Replace('/', '¶');
            }

            return countryHierarchy;
        }

        /// <summary>
        /// Reworks category names into category ids ready for searching.
        /// </summary>
        /// <param name="provider">The provider.</param>
        /// <param name="controlConfig">The control configuration.</param>
        /// <param name="values">The values.</param>
        /// <returns>The category ids.</returns>
        private IEnumerable<string> GetCategoryConstraintValues(AbstractDataProvider provider, control_config controlConfig, IEnumerable<string> values)
        {
            var catKeys = new Collection<string>();

            foreach (var val in values)
            {
                var cat = UIObjectHelper.GetCategoryKeyByName(provider, val, controlConfig);
                if (cat != null)
                {
                    catKeys.Add(cat.ObjectKey);
                }
            }

            return catKeys;
        }

        /// <summary>
        /// If The parser is for an expanding facet then it is possibly manipulated here.
        /// </summary>
        /// <param name="simpleFacet">The simple facet to change.</param>
        /// <param name="theSearch">The current search object.</param>
        /// <returns>null if the simple facet has been changed, else an <see cref="ISearchConstraint"/>.</returns>
        private ISearchConstraint ChangeFacetForExpander(SimpleFacet simpleFacet, ISearch theSearch)
        {
            if (string.IsNullOrEmpty(this.expandingFacet) || !simpleFacet.Name.Equals(this.expandingFacet, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            // We have an expanding facet trying to find values.
            // Invert the search IF the simple facet matches the expanding one AND the configuration for the facet says its not a taxonomy style facet.
            panel expandingPanel = null;

            if (FacetHelper.IsTreeControl(this.controlConfig, this.catConfig, this.expandingFacet, out expandingPanel))
            {
                if (expandingPanel.tree_control.show_all_values)
                {
                    var constraint1 = this.ParseQuery(simpleFacet.Name, simpleFacet.Values, simpleFacet.Invert, theSearch);
                    var constraint2 = this.ParseQuery(simpleFacet.Name, simpleFacet.Values, !simpleFacet.Invert, theSearch);

                    return this.WrapConstraints(new[] { constraint1, constraint2 }, QueryConstants.LogicalOr);
                }

                if (!expandingPanel.tree_control.is_taxonomy_tree)
                {
                    simpleFacet.Invert = true;
                }
            }
            else if (FacetHelper.IsDropdownControl(this.catConfig, this.expandingFacet, out expandingPanel))
            {
                simpleFacet.Invert = true;
            }
            else if (FacetHelper.IsTypeAheadControl(this.catConfig, this.expandingFacet, out expandingPanel))
            {
                simpleFacet.Invert = true;
            }

            return null;
        }

        /// <summary>
        /// Creates nested constraints from the Expression Item node.
        /// </summary>
        /// <param name="node">The node to create Constraints from.</param>
        /// <param name="theSearch">The current search object.</param>
        /// <returns>The nested constraint <see cref="ISearchConstraint"/>, .</returns>
        private ISearchConstraint CreateWrappedConstraint(ExpressionItem node, ISearch theSearch)
        {
            var op = node as ExpressionOperator;

            var expressionConstraint = new List<ISearchConstraint>();
            if (op.LeftChild != null)
            {
                expressionConstraint.AddIfNotNull(this.CreateExpresionConstraint(op.LeftChild, theSearch));
            }

            if (op.RightChild != null)
            {
                expressionConstraint.AddIfNotNull(this.CreateExpresionConstraint(op.RightChild, theSearch));
            }

            return this.WrapConstraints(expressionConstraint, op.Value);
        }

        /// <summary>
        /// Wraps constraints into an nested constraint.
        /// </summary>
        /// <param name="constraints">Constraints to nest.</param>
        /// <param name="queryOperator">The type of nested constraint to return.</param>
        /// <returns>New Nested Constraint containing the constraints, or null if the number of constraints is 0.</returns>
        private ISearchConstraint WrapConstraints(IEnumerable<ISearchConstraint> constraints, string queryOperator)
        {
            if (constraints.Count() == 0)
            {
                return null;
            }

            NestedConstraint wrappingConstraint = null;
            if (queryOperator == QueryConstants.LogicalOr)
            {
                wrappingConstraint = new OrNestedConstraint();
            }
            else if (queryOperator == QueryConstants.LogicalAnd)
            {
                wrappingConstraint = new AndNestedConstraint();
            }

            wrappingConstraint.AddRange(constraints);

            return wrappingConstraint;
        }

        /// <summary>
        /// An abstract class to represent a specific component of the expression. As are 'A', '+' and 'B' in the expression "A + B".
        /// </summary>
        public abstract class ExpressionItem
        {
            #region Public Properties

            /// <summary>
            /// Gets or sets the value of the expression.
            /// </summary>
            public string Value { get; set; }
        }

        /// <summary>
        /// This class represents a search expression operator. Such as "AND" and "OR". Note the "NOT" is currently not supported.
        /// </summary>
        public class ExpressionOperator : ExpressionItem
        {
            #region Public Constructors

            /// <summary>Initialises a new instance of the <see cref="ExpressionOperator"/> class.</summary>
            /// <param name="value">The value.</param>
            /// <param name="leftChild">The left child.</param>
            /// <param name="rightChild">The right child.</param>
            public ExpressionOperator(string value, ExpressionItem leftChild, ExpressionItem rightChild)
            {
                this.Value = value;
                this.LeftChild = leftChild;
                this.RightChild = rightChild;
            }

            #endregion Public Constructors

            #region Public Properties

            /// <summary>
            /// Gets the left child of the expression. This could be another operator or a variable.
            /// </summary>
            public ExpressionItem LeftChild { get; private set; }

            /// <summary>
            /// Gets the right child of the expression. This could be another operator or a variable.
            /// </summary>
            public ExpressionItem RightChild { get; private set; }

            #endregion Public Properties
        }

        /// <summary>
        /// This class represents a search expression value. As are 'A' and 'B' in the expression "A + B".
        /// </summary>
        public class ExpressionVariable : ExpressionItem
        {
            #region Public Constructors

            /// <summary>Initialises a new instance of the <see cref="ExpressionVariable"/> class.</summary>
            /// <param name="value">The value.</param>
            public ExpressionVariable(string value)
            {
                this.Value = value;
            }

            #endregion Public Constructors
        }

        #endregion Public Classes
    }
}