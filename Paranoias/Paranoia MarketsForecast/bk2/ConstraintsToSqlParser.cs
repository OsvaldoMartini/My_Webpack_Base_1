// <copyright file="ConstraintsToSqlParser.cs" company="IHS">
//     Copyright © 2012 IHS Inc. and its affiliated and subsidiary companies, all rights reserved.
//     All other trademarks are the property of IHS Inc. and its affiliated and subsidiary companies.
//     
//     This product, including software, data and documentation are licensed to the user for its
//     internal business purposes only and may not be disclosed, disseminated, sold, licensed,
//     copied, reproduced, translated or transferred to any third party.
//     
//     IHS Inc. 15 Inverness Way East Englewood, Colorado 80112 USA
//     + 1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.DataProviders.Helpers
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using System.Globalization;
    using System.Linq;
    using System.Text;
    using System.Text.RegularExpressions;
    using IHS.Apps.CMP.Common;
    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;
    using IHS.Core.Common;

    /// <summary>
    /// Helper class designed to take help convert constraints objects into a SQL statement where clauses.
    /// </summary>
    public class ConstraintsToSqlParser
    {
        #region Constants

        /// <summary>
        /// Holds the name of the metadata item containing the entitlement product name.
        /// </summary>
        private const string FulltextAliasMetadataKey = "FullTextSearchAlias";

        #endregion

        #region Fields

        /// <summary>
        /// The attribute container (usually a category object).
        /// </summary>
        private IAttributeContainer attributeContainer;

        /// <summary>
        /// List of special adapters which need handling / mapping when evaluating constraints.
        /// </summary>
        private List<DualColumnAdapterParameter> dualColumnAdapters = new List<DualColumnAdapterParameter>();

        /// <summary>
        /// Holds the locale that the helper should use.
        /// </summary>
        private CultureInfo locale = null;

        /// <summary>
        /// The name of the query being built.
        /// </summary>
        /// <remarks>Not always required, configuration dependent.</remarks>
        private string queryKey;

        /// <summary>
        /// Holds the delegated method responsible for getting the correct column name to use in SQL statements.
        /// </summary>
        private GetSqlColumnName sqlColumnDelegate;

        #endregion

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the <see cref="ConstraintsToSqlParser"/> class.
        /// </summary>
        /// <param name="attributeContainer">The attribute container.</param>
        /// <param name="locale">The locale to use.</param>
        public ConstraintsToSqlParser(IAttributeContainer attributeContainer, CultureInfo locale)
        {
            this.attributeContainer = attributeContainer;
            this.locale = locale;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConstraintsToSqlParser"/> class.
        /// </summary>
        /// <param name="attributeContainer">The attribute container.</param>
        /// <param name="queryKey">The name of query being built.</param>
        /// <param name="sqlColumnNameDelegate">
        /// The delegate method responsible for getting the correct column name to use in SQL statements.
        /// </param>
        /// <param name="locale">The locale to use.</param>
        public ConstraintsToSqlParser(IAttributeContainer attributeContainer, string queryKey, GetSqlColumnName sqlColumnNameDelegate, CultureInfo locale)
            : this(attributeContainer, locale)
        {
            this.queryKey = queryKey;
            this.sqlColumnDelegate = sqlColumnNameDelegate;
        }

        #endregion

        #region Public Properties

        /// <summary>
        /// Gets the special adapters which need handling / mapping when evaluating constraints.
        /// </summary>
        public ICollection<DualColumnAdapterParameter> DualColumnAdapters
        {
            get
            {
                return this.dualColumnAdapters;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether we are dealing with an oracle server.
        /// </summary>
        public bool IsOracle { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether we want to use short date formats.
        /// </summary>
        public bool UseShortDates { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether we want to use "freetext" for the full text search or the default "contains".
        /// "Freetext" also strips out the "and" keyword from the search.
        /// </summary>
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
        public bool UseFreetextCommand { get; set; }

        #endregion

        #region Public Methods

        /// <summary>
        /// Processes the <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> objects from
        /// the incoming search request into a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="constraints">
        /// The <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> objects from the
        /// incoming search request.
        /// </param>
        /// <returns>
        /// The lowest number of items to return found in the
        /// <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> objects.
        /// </returns>
        public void ParseConstraints(ref StringBuilder queryString, NestedConstraint constraints)
        {
            int maxItems = int.MaxValue;
            string queryOperator = string.Empty;

            if (queryString == null)
            {
                throw new ArgumentNullException("queryString");
            }

            if (constraints == null)
            {
                throw new ArgumentNullException("constraints");
            }

            // determine if this is an OrNestedConstraint or an AndNestedConstraint
            
            if (constraints is OrNestedConstraint)
            {
                queryOperator = " or ";
            }
            else if (constraints is AndNestedConstraint)
            {
                queryOperator = " and ";
            }
                        
            // process each constraint
            foreach (ISearchConstraint constraint in constraints)
            {
                // is it a NESTED constraint?
                NestedConstraint nestedConstraint = constraint as NestedConstraint;
                if (nestedConstraint != null && nestedConstraint.Count > 0)
                {
                    AddQueryOperator(queryString, queryOperator);

                    // parse the nested constraint
                    this.ParseNestedConstraint(maxItems, ref queryString, nestedConstraint);
                    continue;
                }

                // is it an IN constraint?
                InConstraint inConstraint = constraint as InConstraint;
                if (inConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseInConstraint(queryString, inConstraint);
                    continue;
                }

                // is it an EQUALS constraint?
                EqualsConstraint equalsConstraint = constraint as EqualsConstraint;
                if (equalsConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseEqualsConstraint(queryString, equalsConstraint);
                    continue;
                }

                // is it a RANGE constraint?
                RangeConstraint rangeConstraint = constraint as RangeConstraint;
                if (rangeConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseRangeConstraint(queryString, rangeConstraint);
                    continue;
                }

                // is it an itemID constraint?
                ItemIDConstraint itemIDConstraint = constraint as ItemIDConstraint;
                if (itemIDConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseItemIdConstraint(queryString, itemIDConstraint);

                    continue;
                }

                // is it a NOT IN constraint?
                NotInConstraint notInConstraint = constraint as NotInConstraint;
                if (notInConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseNotInConstraint(queryString, notInConstraint);
                    continue;
                }

                // is it a NOT EQUALS constraint?
                NotEqualsConstraint notEqualsConstraint = constraint as NotEqualsConstraint;
                if (notEqualsConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseNotEqualsConstraint(queryString, notEqualsConstraint);
                    continue;
                }

                // is it a NOT IN RANGE constraint?
                NotInRangeConstraint notInRangeConstraint = constraint as NotInRangeConstraint;
                if (notInRangeConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseNotInRangeConstraint(queryString, notInRangeConstraint);
                    continue;
                }

                // is it a FULL TEXT SEARCH constraint?
                SearchBehaviorConstraint searchBehaviorConstraint = constraint as SearchBehaviorConstraint;
                if (searchBehaviorConstraint != null)
                {
                    if (!this.UseFreetextCommand || (this.UseFreetextCommand && searchBehaviorConstraint.SearchTextValue.ToString().ToUpperInvariant() != "AND"))
                    {
                        AddQueryOperator(queryString, queryOperator);
                        this.ParseSearchBehaviorConstraint(ref queryString, searchBehaviorConstraint, this.GetFulltextAlias(), this.UseFreetextCommand);
                    }

                    continue;
                }

                // is it a WILDCARD constraint?
                WildCardConstraint wildcardConstraint = constraint as WildCardConstraint;
                if (wildcardConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseWildcardConstraint(queryString, wildcardConstraint);
                    continue;
                }

                // is it a NOT WILDCARD constraint?
                NotWildCardConstraint notWildcardConstraint = constraint as NotWildCardConstraint;
                if (notWildcardConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseNotWildcardConstraint(queryString, notWildcardConstraint);
                    continue;
                }

                // is it an INDEXED SEARCH constraint?
                IndexedSearchBehaviorConstraint indexedSearchConstraint = constraint as IndexedSearchBehaviorConstraint;
                if (indexedSearchConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseIndexSearchConstraint(ref queryString, indexedSearchConstraint, this.GetFulltextAlias());
                    continue;
                }

                // is it a GEOBOX constraint?
                GeoBoxConstraint geoBoxConstraint = constraint as GeoBoxConstraint;
                if (geoBoxConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseGeoBoxConstraint(queryString, geoBoxConstraint);
                    continue;
                }

                // is it a GEOBOX constraint?
                GeoAreaConstraint geoAreaConstraint = constraint as GeoAreaConstraint;
                if (geoAreaConstraint != null)
                {
                    AddQueryOperator(queryString, queryOperator);
                    this.ParseGeoAreaConstraint(queryString, geoAreaConstraint);
                    continue;
                }
            }
        }

        /// <summary>
        /// Processes the <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> objects from
        /// the incoming search request into a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="constraints">
        /// The <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> objects from the
        /// incoming search request.
        /// </param>
        /// <returns>
        /// The lowest number of items to return found in the
        /// <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> objects.
        /// </returns>
        public int ParseOnlyBehaviorConstraints(StringBuilder queryString, NestedConstraint constraints)
        {
            int maxItems = int.MaxValue;
            
            if (queryString == null)
            {
                throw new ArgumentNullException("queryString");
            }

            if (constraints == null)
            {
                throw new ArgumentNullException("constraints");
            }

            // process each constraint
            foreach (ISearchConstraint constraint in constraints)
            {

                // is it a NESTED constraint?
                NestedConstraint nestedConstraint = constraint as NestedConstraint;
                if (nestedConstraint != null && nestedConstraint.Count > 0)
                {
                    // parse the nested constraint
                    this.ParseOnlyBehaviorConstraints(queryString, nestedConstraint);
                    continue;
                }

                // is it a FULL TEXT SEARCH constraint?
                SearchBehaviorConstraint searchBehaviorConstraint = constraint as SearchBehaviorConstraint;
                if (searchBehaviorConstraint != null)
                {
                    if (!this.UseFreetextCommand ||
                        (this.UseFreetextCommand && searchBehaviorConstraint.SearchTextValue.ToString().ToUpperInvariant() != "AND"))
                    {
                        maxItems = ConstraintsToSqlParser.GetSearchBehaviorConstraintWord(queryString, searchBehaviorConstraint, this.GetFulltextAlias(), this.UseFreetextCommand);
                    }

                    continue;
                }

            }

            return maxItems;
        }

        /// <summary>
        /// Updates the dual column adapter parameter list with new values.
        /// </summary>
        /// <param name="adapters">The dual column adapter parameters to set in the list.</param>
        public void UpdateDualColumnAdapters(IEnumerable<DualColumnAdapterParameter> adapters)
        {
            // remove existing adapters and add new ones supplied
            this.dualColumnAdapters.Clear();
            this.dualColumnAdapters.AddRange(adapters);
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Appends the correct query operator to the SQL string.
        /// </summary>
        /// <param name="queryString">The SQL string to append to.</param>
        /// <param name="queryOperator">The operator to append.</param>
        private static void AddQueryOperator(StringBuilder queryString, string queryOperator)
        {
            if (queryString.Length != 0)
            {
                queryString.Append(queryOperator);
            }
        }

        /// <summary>
        /// Creates a SQL query section containing words and phrases to be excluded as query search terms.
        /// </summary>
        /// <param name="excludeWordsAndPhrases">A list of words and/or phrases to be excluded.</param>
        /// <param name="fulltextAlias">The alias to use when referring to the full text search.</param>
        /// <param name="useFreetextCommand">A bool to indicate if we should use the "freetext" command as opposed to the default "contains".</param>
        /// <param name="columnNames">
        /// If supplied, holds the specific full text search columns the user would like to search in.
        /// </param>
        /// <returns>A SQL safe query section containing the words and phrases to be excluded.</returns>
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1115:ParameterMustFollowComma", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1116:SplitParametersMustStartOnLineAfterDeclaration", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1118:ParameterMustNotSpanMultipleLines", Justification = "LINQ statement in use")]
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
        private static StringBuilder BuildExcludeWordsSection(IEnumerable<string> excludeWordsAndPhrases, string fulltextAlias, bool useFreetextCommand, IEnumerable<string> columnNames = null)
        {
            // create a temporary store for the query string being generated
            StringBuilder localQueryString = new StringBuilder();

            // check words/phrases have been included
            if (excludeWordsAndPhrases.Count() > 0)
            {
                if (columnNames != null)
                {
                    fulltextAlias = fulltextAlias.Substring(0, fulltextAlias.LastIndexOf("*", StringComparison.OrdinalIgnoreCase) - 1);
                    fulltextAlias = string.Join(",", (from c in columnNames
                                                      select fulltextAlias + c).ToArray());
                }

                // now join exclude words & phrases back up together, escape quoted phrases
                localQueryString.Append(" AND NOT (");

                if (!fulltextAlias.Contains(".*"))
                {
                    localQueryString.Append(" " + fulltextAlias + " like '%");
                    localQueryString.Append(string.Join(" AND ", (from p in excludeWordsAndPhrases
                                                                  let word = string.Format(CultureInfo.InvariantCulture, "{0}", p.Trim())
                                                                  select word).ToArray()));
                    localQueryString.Append("%')");

                }
                else
                {
                    string containsKeyword = useFreetextCommand ? "freetext" : "(TEXTSEARCHALLCOLUMNS)";
                    if (containsKeyword.Equals("freetext"))
                    {
                        localQueryString.Append(" " + containsKeyword + "(" + fulltextAlias + ",'");

                        // now join exclude words & phrases back up together, escape quoted phrases
                        localQueryString.Append(string.Join(" AND ", (from p in excludeWordsAndPhrases
                                                                      let word = string.Format(CultureInfo.InvariantCulture, "\"{0}\"", Regex.Replace(p.Trim("\"".ToCharArray()), "([\"'])", "$1$1"))
                                                                      select word).ToArray()));

                        localQueryString.Append("'))");
                    }
                    else
                    {
                        localQueryString.Append(containsKeyword);
                    }
                }
            }

            return localQueryString;
        }

        /// <summary>
        /// Creates a SQL query section containing words and phrases to be included as query search terms.
        /// </summary>
        /// <param name="wordsAndPhrases">A list of words and/or phrases to be included.</param>
        /// <param name="fulltextAlias">The alias to use when referring to the full text search.</param>
        /// <param name="useFreetextCommand">A bool to indicate whether to use the default "contains" or "freetext".</param>
        /// <param name="columnNames">
        /// If supplied, holds the specific full text search columns the user would like to search in.
        /// </param>
        /// <returns>A SQL safe query section containing the words and phrases to be included.</returns>
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1115:ParameterMustFollowComma", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1116:SplitParametersMustStartOnLineAfterDeclaration", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1118:ParameterMustNotSpanMultipleLines", Justification = "LINQ statement in use")]
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
        private static StringBuilder BuildIncludeWordsSection(IEnumerable<string> wordsAndPhrases, string fulltextAlias, bool useFreetextCommand, IEnumerable<string> columnNames = null)
        {
            // create a temporary store for the query string being generated
            StringBuilder localQueryString = new StringBuilder();

            // check words/phrases have been included
            if (wordsAndPhrases.Count() > 0)
            {
                if (columnNames != null)
                {
                    fulltextAlias = fulltextAlias.Substring(0, fulltextAlias.LastIndexOf("*", StringComparison.OrdinalIgnoreCase));
                    fulltextAlias = "(" + string.Join(",", (from c in columnNames
                                                            select fulltextAlias + c).ToArray()) + ")";
                }

                if (!fulltextAlias.Contains(".*"))
                {
                    localQueryString.Append(" " + fulltextAlias + " like '%");
                    localQueryString.Append(string.Join(" AND ", (from p in wordsAndPhrases
                                                                  let word = string.Format(CultureInfo.InvariantCulture, "{0}", p.Trim())
                                                                  select word).ToArray()));
                    localQueryString.Append("%'");

                }
                else
                {
                    string containsKeyword = useFreetextCommand ? "freetext" : "(TEXTSEARCHALLCOLUMNS)";
                    if (containsKeyword.Equals("freetext"))
                    {
                        localQueryString.Append(" " + containsKeyword + "(" + fulltextAlias + ",'");

                        // now join include words & phrases back up together, escape quoted phrases
                        localQueryString.Append(string.Join(" AND ", (from p in wordsAndPhrases
                                                                      let word = string.Format(CultureInfo.InvariantCulture, "\"{0}\"", Regex.Replace(p.Trim("\"".ToCharArray()), "([\"'])", "$1$1"))
                                                                      select word).ToArray()));

                        localQueryString.Append("')");
                    }
                    else
                    {
                        localQueryString.Append(containsKeyword);
                    }

                }
            }

            return localQueryString;
        }

        /// <summary>
        /// Processes a <see cref="SearchBehaviorConstraint"/> to
        /// generate a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="searchBehaviorConstraint">
        /// The <see cref="SearchBehaviorConstraint"/> to process.
        /// </param>
        /// <param name="fulltextAlias">The alias to use when referring to the full text search.</param>
        /// <param name="useFreetextCommand">A bool to indicate whether to use the default "contains" full text search or the "freetext" command.</param>
        /// <returns>
        /// The maximum number of items to return as a result of executing the query being generated.
        /// </returns>
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
        [SuppressMessage("Microsoft.Performance", "CA1822:MarkMembersAsStatic")]
        private void ParseSearchBehaviorConstraint(ref StringBuilder queryString, SearchBehaviorConstraint searchBehaviorConstraint, string fulltextAlias, bool useFreetextCommand)
        {
            string searchText = searchBehaviorConstraint.SearchTextValue.ToStringSafe(string.Empty);
            IEnumerable<string> columnNames = null;

            // see if the search text contains a search column list
            if (searchText.Contains("||"))
            {
                string[] textAndColumns = searchText.Split(new string[] { "||" }, StringSplitOptions.RemoveEmptyEntries);
                searchText = textAndColumns[0];
                columnNames = textAndColumns.Skip(1);
            }

            // get all the parts from the text search string
            TextSearchStringParts parts = TextSearchStringHelper.GetTextSearchStringParts(searchText);

            // create SQL query sections for each text search part
            StringBuilder excludeWords = ConstraintsToSqlParser.BuildExcludeWordsSection(parts.ExcludeWordsAndPhrases, fulltextAlias, useFreetextCommand, columnNames);
            StringBuilder includeWords = ConstraintsToSqlParser.BuildIncludeWordsSection(parts.IncludeWordsAndPhrases, fulltextAlias, useFreetextCommand, columnNames);

            // add words/phrases that have been included (if any)
            queryString.Append(includeWords);

            // add the excludes ("and not"s) (if there are any) into the SQL search
            queryString.Append(excludeWords);
        }

        /// <summary>
        /// Processes a <see cref="IHS.Core.Catalog.Model.Search.SearchBehaviorConstraint"/> to
        /// generate a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="searchBehaviorConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.SearchBehaviorConstraint"/> to process.
        /// </param>
        /// <param name="fulltextAlias">The alias to use when referring to the full text search.</param>
        /// <param name="useFreetextCommand">A bool to indicate whether to use the default "contains" full text search or the "freetext" command.</param>
        /// <returns>
        /// The maximum number of items to return as a result of executing the query being generated.
        /// </returns>
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
        private static int GetSearchBehaviorConstraintWord(StringBuilder queryString, SearchBehaviorConstraint searchBehaviorConstraint, string fulltextAlias, bool useFreetextCommand)
        {
            int maxItems = int.MaxValue;
            string searchText = searchBehaviorConstraint.SearchTextValue.ToStringSafe(string.Empty);

            // get all the parts from the text search string
            TextSearchStringParts parts = TextSearchStringHelper.GetTextSearchStringParts(searchText);

            // add words/phrases that have been included (if any)
            if (parts.ExcludeWordsAndPhrases.Count() > 0)
            {
                queryString.Append(string.Join(" AND ", (from p in parts.ExcludeWordsAndPhrases
                                                         let word = string.Format(CultureInfo.InvariantCulture, "|{0}", p.Trim())
                                                         select word).ToArray()));
            }
            // add the excludes ("and not"s) (if there are any) into the SQL search
            if (parts.IncludeWordsAndPhrases.Count() > 0)
            {
                queryString.Append(string.Join(" AND ", (from p in parts.IncludeWordsAndPhrases
                                                         let word = string.Format(CultureInfo.InvariantCulture, "|{0}", p.Trim())
                                                         select word).ToArray()));
            }

            if (searchBehaviorConstraint.EnableMaxTextSearchHits)
            {
                maxItems = searchBehaviorConstraint.MaxTextSearchHits;
            }

            return maxItems;
        }

        /// <summary> Special SQL creation for this RangeConstraint as it needs to target 2 fields.
        /// </summary>
        /// <param name="queryString">The query string to add to.</param>
        /// <param name="dcap">The dual column adapter parameter to assist mapping.</param>
        /// <param name="indexerType">The type of the attributes (aka columns) being checked.</param>
        /// <param name="min">The minimum value to match / not match.</param>
        /// <param name="minInclusive"> A value indicating whether to include the minimum value in the check.</param>
        /// <param name="max">The maximum value to match / not match.</param>
        /// <param name="maxInclusive"> A value indicating whether to include the maximum value in the check.</param>
        /// <param name="isNotConstraint"> A value indicating whether the range is to be matched or not
        /// matched.</param>
        /// <remarks>
        /// ================================= PLEASE READ =================================
        /// <para>
        /// The logic in this method looks weird, backwards even. After much investigation we&apos;ve
        /// decided it is actually correct :)
        /// </para>
        /// <para>
        /// The functionality is thus: in this scenario TWO columns are being utilised to represent
        /// ONE range. Therefore, the logic applied is to allow the record to be returned if EITHER
        /// of the columns fall in the range specified. This WILL return records which look wrong 
        /// and customers may question them, this may need to be explained again in the future 
        /// ... hence this note.
        /// </para>
        /// <para>IF the logic is changed to be what you think it should be 
        /// i.e. SqlLowerName &gt;= min &amp;&amp; SqlUpperName &lt;= max then BOTH columns will need to be
        /// inside the range specified before the record is included in the result set, this is NOT
        /// the desired effect.
        /// </para>
        /// </remarks>
        private void ApplyDualColumAdapterScenarioToQuerystring(StringBuilder queryString, DualColumnAdapterParameter dcap, AttributeType indexerType, object min, bool minInclusive, object max, bool maxInclusive, bool isNotConstraint)
        {
            if (!isNotConstraint)
            {
                if (min != null && max != null && minInclusive && maxInclusive)
                {
                    queryString.Append(dcap.SqlLowerName + " <= " + this.GetConstraintValue(max, indexerType));
                    queryString.Append(" AND ");
                    queryString.Append(dcap.SqlUpperName + " >= " + this.GetConstraintValue(min, indexerType));
                }
                else if (min == null)
                {
                    queryString.Append(dcap.SqlLowerName + " <= " + this.GetConstraintValue(max, indexerType));
                }
                else if (max == null)
                {
                    queryString.Append(dcap.SqlUpperName + " >= " + this.GetConstraintValue(min, indexerType));
                }
            }
            else
            {
                if (min != null && max != null && minInclusive && maxInclusive)
                {
                    queryString.Append(dcap.SqlLowerName + " >= " + this.GetConstraintValue(max, indexerType));
                    queryString.Append(" AND ");
                    queryString.Append(dcap.SqlUpperName + " <= " + this.GetConstraintValue(min, indexerType));
                }
                else if (min == null)
                {
                    queryString.Append(dcap.SqlLowerName + " >= " + this.GetConstraintValue(max, indexerType));
                }
                else if (max == null)
                {
                    queryString.Append(dcap.SqlUpperName + " <= " + this.GetConstraintValue(min, indexerType));
                }
            }
        }

        /// <summary>
        /// Gets the value from an object to use as a constraint value.
        /// </summary>
        /// <param name="value">The object value to use.</param>
        /// <param name="type">The <see cref="IHS.Core.Catalog.Model.AttributeType"/> of the object.</param>
        /// <returns>A safe and valid constraint value.</returns>
        private string GetConstraintValue(object value, AttributeType type)
        {
            StringBuilder builder = new StringBuilder();

            // web services may pass a ConstraintParameter not just a value, check for this
            ConstraintParameter cp = value as ConstraintParameter;
            if (cp != null)
            {
                value = cp.GetParameterValue();
            }

            switch (type)
            {
                case AttributeType.DATE_TYPE:

                    if (value == null)
                    {
                        builder.Append("NULL");
                    }
                    else
                    {
                        // have to ensure the correct format
                        DateTime dt = DateTime.MinValue;

                        if (this.locale == null)
                        {
                            dt = Convert.ToDateTime(value, CultureInfo.InvariantCulture);
                        }
                        else
                        {
                            dt = Convert.ToDateTime(value, this.locale);
                        }

                        if (this.IsOracle)
                        {
                            builder.Append("TO_DATE('");
                            builder.Append(dt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));
                            builder.Append("','YYYY-MM-DD HH24:MI:SS')");
                        }
                        else
                        {
                            builder.Append("'");

                            if (UseShortDates)
                            {
                                builder.Append(dt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
                            }
                            else
                            {
                                builder.Append(dt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));
                            }

                            builder.Append("'");
                        }
                    }

                    break;

                case AttributeType.LONG_STRING_TYPE:
                case AttributeType.STRING_TYPE:
                case AttributeType.UNASSIGNED_TYPE:

                    // assume "UNASSIGNED_TYPE" are strings in case string has apostrophes
                    if (this.IsOracle && value == null)
                    {
                        builder.Append(" null ");
                    }
                    else
                    {
                        string valueString = value.ToStringSafe(string.Empty);
                        builder.AppendFormat("'{0}'", valueString.Replace("'", "''"));
                    }
                    break;

                case AttributeType.BOOLEAN_TYPE:
                case AttributeType.COMPOSITE_TYPE:
                case AttributeType.INDEX_ONLY_ATTRIBUTE:
                case AttributeType.NUMERIC_TYPE:
                case AttributeType.RELATION_TYPE:
                case AttributeType.URL_TYPE:
                default:
                    builder.Append(value);
                    break;
            }

            return builder.ToString();
        }

        /// <summary>
        /// Gets the name of the indexer which is valid to use for a SQL query.
        /// </summary>
        /// <param name="indexer">The indexer to retrieve the name of.</param>
        /// <returns>The valid name to use in the query.</returns>
        /// <remarks>
        /// First checks to see if there are any <see cref="Parameters"/> available for the codename.
        /// </remarks>
        private string GetFieldName(IMetadataProvider indexer)
        {
            if (indexer == null)
            {
                throw new ArgumentNullException("indexer");
            }

            if (this.sqlColumnDelegate != null && this.attributeContainer != null)
            {
                return this.sqlColumnDelegate(indexer.ObjectKey, this.attributeContainer.ObjectKey, this.queryKey);
            }
            else
            {
                return indexer.ObjectKey;
            }
        }

        /// <summary>
        /// Gets the alias to use when referring to full text search on the SQL Server.
        /// </summary>
        /// <returns>The SQL Server full text search alias for instance attribute container.</returns>
        /// <remarks>Default value is " <c>c.*</c>".</remarks>
        private string GetFulltextAlias()
        {
            string alias = "c.*";

            if (this.attributeContainer != null)
            {
                alias = this.attributeContainer.GetMetaDataValue(ConstraintsToSqlParser.FulltextAliasMetadataKey);
                if (string.IsNullOrEmpty(alias))
                {
                    alias = "c.*"; // default value
                }
            }

            return alias;
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.EqualsConstraint"/> to generate a
        /// SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="equalsConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.EqualsConstraint"/> to process.
        /// </param>
        private void ParseEqualsConstraint(StringBuilder queryString, EqualsConstraint equalsConstraint)
        {
            queryString.Append(this.GetFieldName(equalsConstraint.Indexer));

            string constraintValue = this.GetConstraintValue(equalsConstraint.AttributeValue, equalsConstraint.Indexer.Type);

            if (equalsConstraint.Indexer.Type == AttributeType.DATE_TYPE && constraintValue.Equals("NULL", StringComparison.OrdinalIgnoreCase))
            {
                queryString.Append(" IS ");
            }
            else
            {
                queryString.Append("=");
            }

            queryString.Append(constraintValue);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.InConstraint"/> to generate a SQL
        /// query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="inConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.InConstraint"/> to process.
        /// </param>
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1115:ParameterMustFollowComma", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1116:SplitParametersMustStartOnLineAfterDeclaration", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1118:ParameterMustNotSpanMultipleLines", Justification = "LINQ statement in use")]
        private void ParseInConstraint(StringBuilder queryString, InConstraint inConstraint)
        {
            this.ProcessInAndNotInConstraint(queryString, inConstraint.Indexer, inConstraint.AttributeValues, false);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.ItemIDConstraint"/> to generate a
        /// SQL statement segment.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="itemIDConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.ItemIDConstraint"/> to process.
        /// </param>
        private void ParseItemIdConstraint(StringBuilder queryString, ItemIDConstraint itemIDConstraint)
        {
            if (itemIDConstraint.ItemIDs.Count == 0)
            {
                throw new ArgumentException("itemIDConstraint has no values when >0 are expected.");
            }

            string itemIDValue = "itemID";
            if (this.sqlColumnDelegate != null && this.attributeContainer != null)
            {
                itemIDValue = this.sqlColumnDelegate(itemIDValue, this.attributeContainer.ObjectKey, this.queryKey);
            }

            queryString.AppendFormat(
                itemIDValue + " in({0}) ",
                string.Join(",", (from id in itemIDConstraint.ItemIDs select "'" + id.ToString() + "'").ToArray()));
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> to generate a
        /// SQL query string.
        /// </summary>
        /// <param name="maxItems">
        /// The current maximum number of items to return as a results of executing the query being generated.
        /// </param>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="nestedConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.NestedConstraint"/> to process.
        /// </param>
        /// <returns>
        /// The new maximum number of items to return as a result of executing the query being generated.
        /// </returns>
        /// <remarks>NOTE: This method is recursive back into ParseConstraints.</remarks>
        private void ParseNestedConstraint(int maxItems, ref StringBuilder queryString, NestedConstraint nestedConstraint)
        {
            // NOTE: recursive constraint parsing!
            StringBuilder nestedQuery = new StringBuilder();
            this.ParseConstraints(ref nestedQuery, nestedConstraint);
            
            // add the SQL into the query string
            if (nestedQuery.Length > 0)
            {
                queryString.Append("(");
                queryString.Append(nestedQuery);
                queryString.Append(")");
            }
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.NotEqualsConstraint"/> to generate
        /// a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="notEqualsConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.NotEqualsConstraint"/> to process.
        /// </param>
        private void ParseNotEqualsConstraint(StringBuilder queryString, NotEqualsConstraint notEqualsConstraint)
        {
            
            queryString.Append(this.GetFieldName(notEqualsConstraint.Indexer));
            queryString.Append(this.IsOracle? " is not ":" != ");
            queryString.Append(this.GetConstraintValue(notEqualsConstraint.AttributeValue, notEqualsConstraint.Indexer.Type));
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.NotInConstraint"/> to generate a
        /// SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="notInConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.NotInConstraint"/> to process.
        /// </param>
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1115:ParameterMustFollowComma", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1116:SplitParametersMustStartOnLineAfterDeclaration", Justification = "LINQ statement in use")]
        [SuppressMessage("Microsoft.StyleCop.CSharp.ReadabilityRules", "SA1118:ParameterMustNotSpanMultipleLines", Justification = "LINQ statement in use")]
        private void ParseNotInConstraint(StringBuilder queryString, NotInConstraint notInConstraint)
        {
            this.ProcessInAndNotInConstraint(queryString, notInConstraint.Indexer, notInConstraint.AttributeValues, true);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.RangeConstraint"/> to generate a
        /// SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="notInRangeConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.RangeConstraint"/> to process.
        /// </param>
        private void ParseNotInRangeConstraint(StringBuilder queryString, NotInRangeConstraint notInRangeConstraint)
        {
            this.ProcessInAndNotInRangeConstraint(queryString, notInRangeConstraint.Indexer, notInRangeConstraint.Min, notInRangeConstraint.MinInclusive, notInRangeConstraint.Max, notInRangeConstraint.MaxInclusive, true);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.WildCardConstraint"/> to generate
        /// a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="notWildcardConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.WildCardConstraint"/> to process.
        /// </param>
        private void ParseNotWildcardConstraint(StringBuilder queryString, NotWildCardConstraint notWildcardConstraint)
        {
            this.ProcessInAndNotInWildcardConstraint(queryString, notWildcardConstraint.Indexer, notWildcardConstraint.WildCardPatternValue, true);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.RangeConstraint"/> to generate a
        /// SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="rangeConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.RangeConstraint"/> to process.
        /// </param>
        private void ParseRangeConstraint(StringBuilder queryString, RangeConstraint rangeConstraint)
        {
            this.ProcessInAndNotInRangeConstraint(queryString, rangeConstraint.Indexer, rangeConstraint.Min, rangeConstraint.MinInclusive, rangeConstraint.Max, rangeConstraint.MaxInclusive, false);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.WildCardConstraint"/> to generate
        /// a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="wildcardConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.WildCardConstraint"/> to process.
        /// </param>
        private void ParseWildcardConstraint(StringBuilder queryString, WildCardConstraint wildcardConstraint)
        {
            this.ProcessInAndNotInWildcardConstraint(queryString, wildcardConstraint.Indexer, wildcardConstraint.WildCardPatternValue, false);
        }

        /// <summary>
        /// Parses both IN and NOT IN constraints to generate a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string being generated.</param>
        /// <param name="indexer">The attribute (aka column) to check against.</param>
        /// <param name="attributeValues">The list of values to match / not match.</param>
        /// <param name="isNotConstraint">
        /// A value indicating whether the values are to be matched or not matched.
        /// </param>
        private void ProcessInAndNotInConstraint(StringBuilder queryString, IIndexer indexer, ObservableList<object> attributeValues, bool isNotConstraint)
        {
            // really special case for date attributes whereby the value is an integer representing
            // a number of days.
            bool processAsRange = false;
            string attributeValue = string.Empty;

            if (indexer.Type == AttributeType.DATE_TYPE && attributeValues.Count == 1)
            {
                attributeValue = attributeValues[0].ToStringSafe(string.Empty);

                if (attributeValue.Equals("(TODAY)", StringComparison.OrdinalIgnoreCase))
                {
                    processAsRange = true;
                    attributeValue = DateTime.Now.ToString(CMPConfiguration.DateCoreCatalogFormat, CultureInfo.InvariantCulture);
                }
                else
                {
                    int attributeValAsInteger;
                    if (int.TryParse(attributeValue, out attributeValAsInteger))
                    {
                        processAsRange = true;
                        attributeValue = DateTime.Now.AddDays(attributeValAsInteger).ToString(CMPConfiguration.DateCoreCatalogFormat, CultureInfo.InvariantCulture);
                    }
                }
            }

            if (processAsRange && !string.IsNullOrEmpty(attributeValue))
            {
                if (isNotConstraint)
                {
                    NotInRangeConstraint nirc = new NotInRangeConstraint(indexer, attributeValue, null);
                    this.ParseNotInRangeConstraint(queryString, nirc);
                }
                else
                {
                    // pass this on to a range processor
                    RangeConstraint rc = new RangeConstraint(indexer, attributeValue, null);
                    this.ParseRangeConstraint(queryString, rc);
                }
            }
            else
            {
                queryString.Append(this.GetFieldName(indexer));
                if (isNotConstraint)
                {
                    queryString.Append(" not");
                }

                queryString.Append(" in(");

                // IN constraints can arrive as literals or parameters; a parameter as supplied may
                // include several IN-match values separated by commas. This code converts the
                // supplied values to strings before splitting supplied *parameters only* at commas
                // then making each individual value query string safe
                var queryValues = from values in attributeValues
                                  let valueString = values.ToString()
                                  let items = values is ConstraintParameter ? valueString.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries) : new string[] { valueString }
                                  from value in items
                                  select this.GetConstraintValue(value, indexer.Type);
                queryString.Append(string.Join(",", queryValues.ToArray()));
                queryString.Append(")");
            }
        }

        /// <summary>
        /// Parses both IN and NOT IN RANGE constraints to generate a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string being generated.</param>
        /// <param name="indexer">The attribute (aka column) to check against.</param>
        /// <param name="min">The minimum value to match / not match.</param>
        /// <param name="minInclusive">
        /// A value indicating whether to include the minimum value in the check.
        /// </param>
        /// <param name="max">The maximum value to match / not match.</param>
        /// <param name="maxInclusive">
        /// A value indicating whether to include the maximum value in the check.
        /// </param>
        /// <param name="isNotConstraint">
        /// A value indicating whether the range is to be matched or not matched.
        /// </param>
        private void ProcessInAndNotInRangeConstraint(StringBuilder queryString, IIndexer indexer, object min, bool minInclusive, object max, bool maxInclusive, bool isNotConstraint)
        {
            // is this a dual Column Range constraint?
            if (this.dualColumnAdapters != null && this.dualColumnAdapters.Count > 0)
            {
                DualColumnAdapterParameter dcap = this.dualColumnAdapters.FirstOrDefault(a => a.CodeName == indexer.ObjectKey);
                if (dcap != null)
                {
                    this.ApplyDualColumAdapterScenarioToQuerystring(queryString, dcap, indexer.Type, min, minInclusive, max, maxInclusive, isNotConstraint);
                    return;
                }
            }

            if (min == null && max == null)
            {
                return;
            }

            queryString.Append(this.GetFieldName(indexer));

            // can only do a BETWEEN if all values are present and to be included
            if (min != null && max != null && minInclusive && maxInclusive)
            {
                if (isNotConstraint)
                {
                    queryString.Append(" NOT");
                }

                queryString.Append(" BETWEEN ");
                queryString.Append(this.GetConstraintValue(min, indexer.Type));
                queryString.Append(" AND ");
                queryString.Append(this.GetConstraintValue(max, indexer.Type));
            }
            else if (min == null)
            {
                if (!isNotConstraint)
                {
                    queryString.Append(" <");
                }
                else
                {
                    queryString.Append(" >");
                }

                if (maxInclusive)
                {
                    queryString.Append("=");
                }

                queryString.Append(" ");
                queryString.Append(this.GetConstraintValue(max, indexer.Type));
            }
            else if (max == null)
            {
                if (!isNotConstraint)
                {
                    queryString.Append(" >");
                }
                else
                {
                    queryString.Append(" <");
                }

                if (minInclusive)
                {
                    queryString.Append("=");
                }

                queryString.Append(" ");
                queryString.Append(this.GetConstraintValue(min, indexer.Type));
            }
        }

        /// <summary>
        /// Parses both IN and NOT IN WILDCARD constraints to generate a SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string being generated.</param>
        /// <param name="indexer">The attribute (aka column) to check against.</param>
        /// <param name="wildcardPatternValue">The pattern to match / not match against.</param>
        /// <param name="isNotConstraint">
        /// A value indicating whether the value is to be matched or not matched.
        /// </param>
        private void ProcessInAndNotInWildcardConstraint(StringBuilder queryString, IIndexer indexer, object wildcardPatternValue, bool isNotConstraint)
        {
            string fieldName = this.GetFieldName(indexer);

            if (this.IsOracle)
            {
                fieldName = "UPPER(" + fieldName + ")";
            }

            queryString.Append(fieldName);

            if (isNotConstraint)
            {
                queryString.Append(" NOT");
            }

            queryString.Append(" like ");

            string wildcardValue = wildcardPatternValue.ToString();

            string constVal = this.GetConstraintValue(wildcardValue, indexer.Type);

            if (this.IsOracle)
            {
                constVal = "UPPER(" + constVal + ")";
            }

            queryString.Append(constVal);
        }

        /// <summary>
        /// Processes an <see cref="IHS.Core.Catalog.Model.Search.IndexedSearchBehaviorConstraint"/> to generate a
        /// SQL query string.
        /// </summary>
        /// <param name="queryString">The SQL query string begin generated.</param>
        /// <param name="indexedSearchConstraint">
        /// The <see cref="IHS.Core.Catalog.Model.Search.IndexedSearchBehaviorConstraint"/> to process.
        /// </param>
        /// <param name="fulltextAlias">The alias to use when referring to the full text search.</param>
        private void ParseIndexSearchConstraint(ref StringBuilder queryString, IndexedSearchBehaviorConstraint indexedSearchConstraint, string fulltextAlias)
        {
            SearchBehaviorConstraint searchConstraint = indexedSearchConstraint.Constraint as SearchBehaviorConstraint;
            if (searchConstraint == null)
            {
                return;
            }

            if (indexedSearchConstraint.Indexer == null)
            {
                return;
            }

            string idx = fulltextAlias.ToStringSafe(string.Empty).Replace("*", string.Empty) + this.GetFieldName(indexedSearchConstraint.Indexer);
            string searchText = searchConstraint.SearchTextValue.ToStringSafe(string.Empty);
            IEnumerable<string> columnNames = null;

            // see if the search text contains a search column list
            if (searchText.Contains("||"))
            {
                string[] textAndColumns = searchText.Split(new string[] { "||" }, StringSplitOptions.RemoveEmptyEntries);
                searchText = textAndColumns[0];
                columnNames = textAndColumns.Skip(1);
            }

            // get all the parts from the text search string
            TextSearchStringParts parts = TextSearchStringHelper.GetTextSearchStringParts(searchText);

            // create SQL query sections for each text search part
            StringBuilder excludeWords = ConstraintsToSqlParser.BuildExcludeWordsSection(parts.ExcludeWordsAndPhrases, idx, this.UseFreetextCommand, columnNames);
            StringBuilder includeWords = ConstraintsToSqlParser.BuildIncludeWordsSection(parts.IncludeWordsAndPhrases, idx, this.UseFreetextCommand, columnNames);

            // add words/phrases that have been included (if any)
            queryString.Append(includeWords);

            // add the excludes ("and not"s) (if there are any) into the SQL search
            queryString.Append(excludeWords);
        }

        /// <summary>
        /// Process Geo box Constrained into SQL constraint/
        /// </summary>
        /// <param name="queryString">The SQL query builder.</param>
        /// <param name="geoBoxConstraint">The geo box constraint to parse. </param>
        private void ParseGeoBoxConstraint(StringBuilder queryString, GeoBoxConstraint geoBoxConstraint)
        {
            string fieldName = this.GetFieldName(geoBoxConstraint.Indexer);
            string[] parts = fieldName.Split(new[] { '|' }, StringSplitOptions.None);
            if (parts.Length == 2)
            {
                string latitude = parts[0];
                string longitude = parts[1];

                queryString.Append('(');

                queryString.AppendFormat("({0} >= {1}) AND ", latitude, geoBoxConstraint.SouthWest.Latitude);
                queryString.AppendFormat("({0} <= {1}) AND ", latitude, geoBoxConstraint.NorthEast.Latitude);
                queryString.AppendFormat("({0} >= {1}) AND ", longitude, geoBoxConstraint.SouthWest.Longitude);
                queryString.AppendFormat("({0} <= {1})", longitude, geoBoxConstraint.NorthEast.Longitude);

                queryString.Append(')');
            }
            else if (parts.Length == 1 && fieldName == "STIntersects")
            {
                queryString.Append("feature.STIntersects(")
                    .Append("geography::STGeomFromText('POLYGON((")
                    .AppendFormat(
                        "{0} {1}, {2} {1}, {2} {3}, {0} {3}, {0} {1}",
                        geoBoxConstraint.SouthWest.Longitude,
                        geoBoxConstraint.SouthWest.Latitude,
                        geoBoxConstraint.NorthEast.Longitude,
                        geoBoxConstraint.NorthEast.Latitude)
                    .Append("))', 4326)) = 1");
            }
            else
            {
                queryString.Append("0=0");
            }
        }

        /// <summary>
        /// Process Geo area Constrained into SQL constraint/
        /// </summary>
        /// <param name="queryString">The SQL query builder.</param>
        /// <param name="geoAreaConstraint">The geo area constraint to parse. </param>
        private void ParseGeoAreaConstraint(StringBuilder queryString, GeoAreaConstraint geoAreaConstraint)
        {
            string fieldName = this.GetFieldName(geoAreaConstraint.Indexer);
            string[] parts = fieldName.Split(new[] { '|' }, StringSplitOptions.None);
            if (parts.Length == 2)
            {
                string latitude = parts[0];
                string longitude = parts[1];

                queryString.Append('(');                    
                queryString.AppendFormat("({0} IS NOT NULL AND {0} BETWEEN -90 AND 90) AND ", latitude);
                queryString.AppendFormat("({0} IS NOT NULL AND {0} BETWEEN -180 AND 180) AND ", longitude);
                queryString.AppendFormat("(Geography::Point({0}, {1}, 4326).STIntersects(", latitude, longitude);
                queryString.AppendFormat("geography::STGeomFromText('{0}',4326)", geoAreaConstraint.WellKnownText);
                queryString.Append(") = 1) ");

                queryString.Append(')');
            }
            else if (parts.Length == 1)
            {
                queryString.AppendFormat("({0}.STIntersects(", fieldName);
                queryString.AppendFormat("geography::STGeomFromText('{0}',4326)", geoAreaConstraint.WellKnownText);
                queryString.Append(") = 1) ");
            }
            else
            {
                queryString.Append("0=0");
            }
        }
        #endregion
    }
}