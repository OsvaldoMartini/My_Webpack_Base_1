// <copyright file="QueryStringParser.cs" company="IHS">
//   © 2016, IHS Inc. and its affiliated and subsidiary companies, all rights reserved. All other trademarks
//   are the property of IHS Inc. and its affiliated and subsidiary companies.
//
//   This product, including software, data and documentation are licensed to the user for its internal
//   business purposes only and may not be disclosed, disseminated, sold, licensed, copied, reproduced,
//   translated or transferred to any third party.
//
//   IHS Inc. 15 Inverness Way East Englewood, Colorado 80112 USA
//   +1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.Utilities.URLParsers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;

    using IHS.Apps.CMP.Common;
    using IHS.Apps.CMP.DataProviders;
    using IHS.Apps.CMP.Models.ViewModels.Facets;
    using IHS.Apps.CMP.Utilities.CMPQuery;
    using IHS.Core.Catalog.Model.Search;

    /// <summary>
    ///   Parser to Create a search constraints based on the free text search portion of the url.
    /// </summary>
    public class QueryStringParser : UrlParser
    {
        /// <summary> The not. </summary>
        private const string NOT = "not";

        /// <summary> The or. </summary>
        private const string OR = "or";

        /// <summary> The and. </summary>
        private const string AND = "and";

        /// <summary> The current provider. </summary>
        private readonly AbstractDataProvider currentProvider;

        /// <summary>
        /// A collection of simple facets.
        /// </summary>
        private List<SimpleFacet> simpleFacets = new List<SimpleFacet>();

        /// <summary>
        ///   Initialises a new instance of the <see cref="QueryStringParser"/> class. Initialises a new
        ///   instance of the <see cref="QueryStringParser"/> class. Constructs a query string parser
        /// </summary>
        /// <param name="parserCfg"> The configuration to use with the parser. </param>
        public QueryStringParser(ParserConfigObject parserCfg)
            : base("q")
        {
            this.currentProvider = parserCfg.CurrentProvider;
        }

        /// <summary>Gets the simple facets.</summary>
        public IEnumerable<SimpleFacet> SimpleFacets
        {
            get { return this.simpleFacets; }
        }

        /// <summary> Parses the query string and amends the supplied iSearch object </summary>
        /// <param name="queryString"> the query string to parse </param>
        /// <param name="search">      the Search object </param>
        public override void Parse(string queryString, ISearch search)
        {
            //Looks for advanced search terms with the query string. i.e. [x]
            var regexPattern = @"(<[^>]+>)?\[(([a-zA-Z|]+)\(([^\]]+)\)|[^\]]+)\]";
            var regex = new Regex(regexPattern);
            var matches = regex.Matches(queryString);

            //Checks if the querystring contains the title operator.
            var regexTitle = new Regex(@"([a-zA-Z|]+)\(.*\)");

            ISearchConstraint constraint = null;

            if (matches.Count == 0 && !string.IsNullOrEmpty(queryString))
            {
                //If there are no advanced search terms.
                constraint = this.GetConstraintViaQueryParser(search, queryString);
                this.AddSimpleFacet("FullText", queryString, false);
            }
            else if (!string.IsNullOrEmpty(queryString) && matches.Count == 1 && !regexTitle.IsMatch(queryString))
            {
                //If there is one advanced search term.
                var q = queryString.Substring(1, queryString.Length - 2);
                constraint = this.GetConstraintViaQueryParser(search, q);
                this.AddSimpleFacet("FullText", q, false);
            }
            else
            {
                //If there are multiple advanced search terms.
                constraint = this.ProcessAdvancedSearch(search, matches);
            }

            if (constraint != null)
            {
                search.Constraints.Add(constraint);
            }
        }

        /// <summary>
        ///   Add Text Search Constraint, if there is a problem When Parsing the query String the message will
        ///   be added to the global message resource so that it can be fed back to the user, In this case the
        ///   search text constraint will be removed from the search object.
        ///   <para>
        ///     The searchTextConstraint is always re-evaluated - if no searchText is available I.e. a null
        ///     text search is performed the searchTextConstraint will be removed.
        ///   </para>
        /// </summary>
        /// <param name="search"> The search Object to add and remove constraints </param>
        /// <param name="query">  The query. </param>
        /// <returns> The <see cref="ISearchConstraint"/>. </returns>
        public ISearchConstraint GetConstraintViaQueryParser(ISearch search, QueryStruct query)
        {
            if (query == null || string.IsNullOrEmpty(query.Value))
            {
                return null;
            }

            // Set up the Text Search Constraint
            var constraint = this.GetConstraintViaQueryParser(search, query.Value);

            var textConstraint = UIObjectHelper.GetTextConstraint(search.Constraints);
            if (textConstraint != null)
            {
                search.Constraints.Remove(textConstraint);
            }

            if (query.Filters != null && query.Filters.Length > 1)
            {
                foreach (string filter in query.Filters)
                {
                    var filterIndexer = ParserHelper.CreateIndexer(this.currentProvider, search, filter.ToUpper());
                    var cons = new IndexedSearchBehaviorConstraint(constraint, filterIndexer);
                }
            }

            if (!string.IsNullOrEmpty(query.Filter))
            {
                var titleIndexer = ParserHelper.CreateIndexer(this.currentProvider, search, query.Filter.ToUpper());
                var cons = new IndexedSearchBehaviorConstraint(constraint, titleIndexer);
                return cons;
            }

            if (constraint != null)
            {
                constraint.Identifier = Guid.NewGuid().ToString();
            }

            return constraint;
        }

        /// <summary> Get Text Search Constraint using query parser </summary>
        /// <param name="search">     The Search object </param>
        /// <param name="searchText"> the search text </param>
        /// <returns> The constraint to add to the search </returns>
        public ISearchConstraint GetConstraintViaQueryParser(ISearch search, string searchText)
        {
            ISearchConstraint constraint = null;

            // Set up the Text Search Constraint
            if (string.IsNullOrEmpty(searchText))
            {
                return null;
            }
            
            var qp = new QueryParser(search);
            constraint = qp.Parse(searchText);
            
            return constraint;
        }

        /// <summary> Gets the correct nested constraint base on the operator. </summary>
        /// <param name="queryOperator"> The advanced search query operator. </param>
        /// <returns> The <see cref="NestedConstraint"/>. </returns>
        private static NestedConstraint GetWrappingConstraint(object queryOperator)
        {
            NestedConstraint wrappingConstraint = null;
            if (queryOperator.Equals(AND) || queryOperator.Equals(NOT))
            {
                wrappingConstraint = new AndNestedConstraint();
            }
            else if (queryOperator.Equals(OR))
            {
                wrappingConstraint = new OrNestedConstraint();
            }

            return wrappingConstraint;
        }

        /// <summary> Processes the advanced search query. </summary>
        /// <param name="search">  The search. </param>
        /// <param name="matches"> The matches. </param>
        /// <returns> The <see cref="ISearchConstraint"/>. </returns>
        private ISearchConstraint ProcessAdvancedSearch(ISearch search, MatchCollection matches)
        {
            var queryStructs = (from Match element in matches select new QueryStruct(element)).ToList();
            queryStructs.Reverse();
            //Root of the NestedConstraint
            NestedConstraint wrappingConstraint = QueryStringParser.GetWrappingConstraint("and");
            ISearchConstraint constraint = null;
            foreach (var item in queryStructs)
            {
                this.CreateConstraintsFromQuery(search, item, ref wrappingConstraint, true);
            }

            if (wrappingConstraint == null)
            {
                return constraint;
            }

            return wrappingConstraint;
        }

        /// <summary>
        /// Creates search constrains from query string.
        /// </summary>
        /// <param name="search">The current search object.</param>
        /// <param name="item">The structured query item.</param>
        /// <param name="wrappingConstraint">The current wrapping constraint</param>
        /// <param name="createSimpleFacet">A value indicating whether to create simple facet.</param>
        /// <returns>The search constraint.</returns>
        private void CreateConstraintsFromQuery(ISearch search, QueryStruct item, ref NestedConstraint wrappingConstraint, bool createSimpleFacet)
        {
            if (item == null || item.Filter == null)
                return;
                
            if (createSimpleFacet)
            {
                this.AddSimpleFacet(item.Filter, item.Value, item.Operator == NOT);
            }

            if (item.Filters != null && item.Filters.Length > 1)
            {
                var tempWrappConstraint = GetWrappingConstraint("or");
                
                QueryStruct subItem = item.Clone();

                foreach (var subFilter in item.Filters)
                {
                    subItem.Filters = new string[0];
                    subItem.Filter = subFilter;
                    subItem.Operator = "";

                    //To Create Well Organized
                    this.CreateConstraintsFromQuery(search, subItem, ref tempWrappConstraint, false);
                }
                this.AddOrInsertConstraint(ref wrappingConstraint, tempWrappConstraint);

                return;
            }

            ISearchConstraint constraint = null;
            item.Operator = item.Filter.Equals("FullText") ? "and" : "";
            if (item.Filter.Equals("FullText"))
            {
                if (item.Operator.Equals(NOT))
                {
                    constraint = new NotConstraint(constraint);
                    this.AddOrInsertConstraint(ref wrappingConstraint, constraint);
                }
                //To Keep any AndNestedConstraint in Separated Brackets/Parentheses
                var tempConstraint = GetWrappingConstraint(item.Operator);
                tempConstraint.Add(this.GetConstraintViaQueryParser(search, item.Value));

                this.AddOrInsertConstraint(ref wrappingConstraint, tempConstraint);

                //Not it Does "GetWrappingConstraint"
                item.Operator = "";
            }
            else
            {
                //It Creates OrNestedConstraint for use to search any value on the filters
                constraint = this.GetConstraintViaQueryParser(search, item);
            }

            bool justCreated = false;

            if (wrappingConstraint == null && !string.IsNullOrEmpty(item.Operator))
            {
                justCreated = true;
                wrappingConstraint = QueryStringParser.GetWrappingConstraint(item.Operator);
            }

            if (item.Operator.Equals(NOT))
            {
                constraint = new NotConstraint(constraint);
            }

            this.AddOrInsertConstraint(ref wrappingConstraint, constraint);

            if (!justCreated && !string.IsNullOrEmpty(item.Operator))
            {
                var tempConstraint = GetWrappingConstraint(item.Operator);
                tempConstraint.Add(wrappingConstraint);
                wrappingConstraint = tempConstraint;
            }

        }

        /// <summary>
        /// Add or Insert into the Object list.
        /// </summary>
        /// <param name="wrappingConstraint">NestedConstraint Object</param>
        /// <param name="constraint">Constraint value</param>
        private void AddOrInsertConstraint(ref NestedConstraint wrappingConstraint, ISearchConstraint constraint)
        {
            if (wrappingConstraint != null && constraint != null)
            {
                if (wrappingConstraint.Any())
                {
                    wrappingConstraint.Insert(0, constraint);
                }
                else
                {
                    wrappingConstraint.Add(constraint);
                }
            }
        }



        /// <summary>
        /// Create Simple Facet and add it to the list.
        /// </summary>
        /// <param name="name">Facet Name</param>
        /// <param name="value">Facet value</param>
        /// <param name="invert">A value indicating whether the facet is inverted.</param>
        private void AddSimpleFacet(string name, string value, bool invert)
        {
            SimpleFacet simpleFacet = new SimpleFacet()
            {
                Invert = invert,
                Name = name,
                Values = new[] { value },
                DisplayName = string.Empty
            };

            this.simpleFacets.Add(simpleFacet);
        }

        /// <summary> The query structure. </summary>
        public class QueryStruct
        {
            /// <summary> Initialises a new instance of the <see cref="QueryStruct"/> class. </summary>
            /// <param name="item"> The item. </param>
            public QueryStruct(Match item)
            {
                var groups = item.Groups;
                var opr = groups[1].Value;
                if (!string.IsNullOrEmpty(opr))
                {
                    opr = opr.Trim('<', '>');
                }

                this.Operator = opr;
                this.Filter = groups[3].Value;
                this.Filters = groups[3].Value.ToStringSafe(string.Empty).Split('|');
                this.Value = string.IsNullOrEmpty(groups[4].Value) ? groups[2].Value : groups[4].Value;
            }

            /// <summary> Initialises a new instance of the <see cref="QueryStruct"/> class. </summary>
            private QueryStruct()
            {
            }

            /// <summary> Gets or sets the operator. </summary>
            public string Operator { get; set; }

            /// <summary> Gets or sets the filter. </summary>
            public string Filter { get; set; }

            /// <summary> Gets or sets the value. </summary>
            public string Value { get; set; }

            /// <summary> Gets or sets the Filters. </summary>
            public string[] Filters { get; set; }

            /// <summary>
            /// Clones the current <see cref="QueryStruct"/>.
            /// </summary>
            /// <returns>A new <see cref="QueryStruct"/> object.</returns>
            public QueryStruct Clone()
            {
                return new QueryStruct()
                {
                    Operator = this.Operator,
                    Filter = this.Filter,
                    Filters = this.Filters,
                    Value = this.Value
                };
            }
        }
    }
}