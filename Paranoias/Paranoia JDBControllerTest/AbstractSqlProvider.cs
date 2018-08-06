// <copyright file="AbstractSqlProvider.cs" company="IHS">
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
namespace IHS.Apps.CMP.DataProviders
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Collections.Specialized;
    using System.Configuration;
    using System.Data;
    using System.Data.Common;
    using System.Diagnostics.CodeAnalysis;
    using System.Globalization;
    using System.Linq;
    using System.Runtime.CompilerServices;
    using System.Security.Cryptography;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Web;
    using System.Xml;
    using System.Xml.Linq;
    using System.Xml.Serialization;

    using IHS.Apps.CMP.Common;
    using IHS.Apps.CMP.DatabaseAccess;
    using IHS.Apps.CMP.DataProviders.Helpers;
    using IHS.Apps.CMP.DataProviders.Model;
    using IHS.Apps.CMP.Logging;
    using IHS.Apps.CMP.Models.Security;
    using IHS.Core.Catalog.Data;
    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;

    /// <summary>
    /// Abstract class holding methods for access SQL data.
    /// </summary>
    [SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Justification = "This is just as complex as this has to be at the moment.")]
    [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message."), System.Runtime.InteropServices.GuidAttribute("69933575-6599-4FB5-B455-93E441EEB31B")]
    public abstract class AbstractSqlProvider : AbstractDataProvider
    {
        #region Constants

        /// <summary>
        /// Holds the pattern to match when looking Item Id inserts hint.
        /// </summary>
        protected const string AddItemIDPattern = "(ADD_ITEM_ID)";

        /// <summary>
        /// Holds the pattern to match when looking for the don't add order by clause hint.
        /// </summary>
        protected const string DontAddOrderByPattern = "(DONT_ADD_ORDERBY)";

        /// <summary>
        /// Holds the pattern to match when looking for the don't add order by clause hint.
        /// </summary>
        protected const string DontPageDataPattern = "(DONT_PAGE_DATA)";

        /// <summary>
        /// Holds the pattern to match when looking for the search signature hint.
        /// The search signature will hash up the indexers, constraints and auths
        /// </summary>
        protected const string SearchSignaturePattern = "(SEARCH_SIGNATURE)";

        /// <summary>
        /// Do we want to ignore the entitlement filters.
        /// </summary>
        protected const string IgnoreEntitlementFilters = "(IGNORE_ENTITLEMENT_FILTERS)";

        /// <summary>
        /// Holds the pattern to match when looking for the indexers hint.
        /// </summary>
        protected const string IndexersSqlGroupByPattern = "(INDEXERS_GROUPBY_SQL)";

        /// <summary>
        /// Holds the pattern to match when looking for the indexers hint. Don't add the alias to
        /// the column definition.
        /// </summary>
        protected const string IndexersSqlNoAliasNoMappingPattern = "(INDEXERS_SQL_NO_ALIASING)";

        /// <summary>
        /// Holds the pattern to match when looking for the indexers hint.
        /// </summary>
        protected const string IndexersSqlPattern = "(INDEXERS_SQL)";

        /// <summary>
        /// Holds the pattern to match when looking for the hint to use a MAX on the paging order by
        /// code clause hint.
        /// </summary>
        protected const string MaxPagingOrderByPattern = "(MAX_PAGING_ORDER_CLAUSE)";

        /// <summary>
        /// Holds the pattern to match when looking for the observe max items hint.
        /// </summary>
        protected const string ObserveMaxItems = "(OBSERVE_MAX_ITEMS)";

        /// <summary>
        /// Holds the pattern to match when looking for the order by end hint.
        /// </summary>
        protected const string OrderByEndPattern = "(END_ORDER_BY)";

        /// <summary>
        /// Holds the pattern to match when looking for the order by hint.
        /// </summary>
        protected const string OrderByStartPattern = "(ORDER_BY)";

        /// <summary>
        /// Add INTO #results clause for paging, assume query handles the temp table further down in
        /// the query.
        /// </summary>
        protected const string PagedDataIntoResultsTablePattern = "(PAGED_DATA_INTO_RESULTS_TABLE)";

        /// <summary>
        /// Holds the pattern to match when looking for the stop paging hint.
        /// </summary>
        protected const string PagingEndPattern = "(END_PAGING)";

        /// <summary>
        /// Holds the pattern to match when looking for the start paging hint.
        /// </summary>
        protected const string PagingStartPattern = "(START_PAGING)";

        /// <summary>
        /// Holds the pattern to match when looking for the where clause placement hint.
        /// </summary>
        protected const string WherePattern = "WHERE 1=1";

        /// <summary>
        /// Holds the pattern to match when looking for the where clause placement hint.
        /// </summary>
        /// <remarks>NB: This replacement will NOT apply entitlements.</remarks>
        protected const string WherePatternWithoutAuths = "WHERE 9=9";

        /// <summary>
        /// Holds the pattern to match when looking for the where clause placement hint. 
        /// Similar to WherePatternWithoutAuths but without the WHERE keyword, useful for stringing
        /// together multiple where clauses. Reduces the need for unions in join conditions.
        /// </summary>
        /// <remarks>NB: This replacement will NOT apply entitlements.</remarks>
        protected const string ConstraintsOnlyNoAuths = "ConstraintsOnlyNoAuths";

        /// <summary>
        /// Holds the name of the metadata item containing the category name override flag for
        /// entitling a product.
        /// </summary>
        private const string CategoryKeyEntitlementOverride = "useCategoryKeyAsEntitlementProductName";

        /// <summary>
        /// Holds the pattern to match when looking for the end of the count SQL select hint wrapper.
        /// </summary>
        private const string CountHintEndPattern = "(END_COUNT_HINT)";

        /// <summary>
        /// Holds the pattern to match when looking for the start of the count SQL select hint wrapper.
        /// </summary>
        private const string CountHintStartPattern = "(COUNT_HINT)";

        /// <summary>
        /// Some query configurations will have specific queries for COUNT only, if you specify a
        /// query with queryName + _COUNTQUERY, this will get used for count.
        /// </summary>
        private const string CountQuery = "_COUNTQUERY";

        /// <summary>
        /// Holds the name of the metadata item containing the entitlement product name.
        /// </summary>
        private const string EntitlementMetadataKey = "entitlementProductName";

        /// <summary>
        /// Holds the pattern to match when looking for join conditions hint.
        /// </summary>
        private const string JoinConditionsPattern = "(JOIN_CONDITIONS)";

        #endregion Constants

        #region Fields

        private static readonly ILog Log = LogManager.GetLogger<AbstractSqlProvider>();

        /// <summary>
        /// Holds the pattern to match when looking for the order by hint and its contents, used to
        /// remove order by clause from count(*) selects.
        /// </summary>
        private static readonly string OrderByHintsAndClausePattern = Regex.Escape(OrderByStartPattern) + ".*?" + Regex.Escape(OrderByEndPattern);

        /// <summary>
        /// Holds the defaults for all hint replacements.
        /// </summary>
        private ConcurrentDictionary<string, string> allDefaultHintReplacements = new ConcurrentDictionary<string, string>();

        /// <summary>
        /// Holds a list of categories cached for this provider.
        /// </summary>
        private ConcurrentDictionary<string, ProviderCategory> categoryCache = new ConcurrentDictionary<string, ProviderCategory>();

        /// <summary>
        /// Holds the connection string for this provider.
        /// </summary>
        private string connectionString = string.Empty;

        /// <summary>
        /// Holds a list of domains cached for this provider.
        /// </summary>
        private ConcurrentDictionary<string, ProviderDomain> domainCache = new ConcurrentDictionary<string, ProviderDomain>();

        /// <summary>
        /// Holds a value indicting whether this provider has been successfully initialized.
        /// </summary>
        private bool isInitialised = false;

        /// <summary>
        /// Holds the product dependency for this provider.
        /// </summary>
        private string productDependency = string.Empty;

        /// <summary>
        /// Holds the attributes available across all categories for this provider.
        /// </summary>
        private ConcurrentDictionary<string, ProviderAttribute> providerAttributes = new ConcurrentDictionary<string, ProviderAttribute>();

        /// <summary>
        /// Holds the configuration object for this provider.
        /// </summary>
        private TSQLConfig providerConfig = null;

        /// <summary>
        /// Holds the locale that the provider should use with its data.
        /// </summary>
        private CultureInfo providerLocale = null;

        /// <summary>
        /// Holds the boolean of whether we want to use short dates or not.
        /// </summary>
        private bool useShortDates = false;

        /// <summary>
        /// Holds the SQL config file for this provider.
        /// </summary>
        private string sqlFile = string.Empty;

        /// <summary>
        /// An indicator to use uppercase names for indexer creation. If false just use the case
        /// that's in the SQL configuration file.
        /// </summary>
        private bool useUpperCaseIndexerNames = true;

        #endregion Fields

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the <see cref="AbstractSqlProvider"/> class.
        /// </summary>
        protected AbstractSqlProvider()
            : base()
        {
        }

        #endregion Constructors

        #region Properties

        /// <summary>
        /// Gets the connection string associated with this provider.
        /// </summary>
        public override string ConnectionString
        {
            get { return this.connectionString; }
        }

        /// <summary>
        /// Gets a value indicating whether this provider has been successfully initialized.
        /// </summary>
        public override bool IsInitialised
        {
            get { return this.isInitialised; }
        }

        /// <summary>
        /// Gets the access control product dependency name being used for this provider.
        /// </summary>
        public override string ProductDependency
        {
            get { return this.productDependency; }
        }

        #endregion Properties

        #region Public Methods

        /// <summary>
        /// Retrieves a constraint from a supplied constraint (which may be nested constraints that
        /// need to be searched) based on a key.
        /// </summary>
        /// <param name="constraint">The constraint to search.</param>
        /// <param name="constraintKey">The key to locate.</param>
        /// <returns>The matching constraint if the key is found.</returns>
        /// <remarks>Note: this method is recursive due to searching nested constraints.</remarks>
        public static ISearchConstraint GetConstraintByKey(ISearchConstraint constraint, string constraintKey)
        {
            ISearchConstraint returnConstraint = null;

            if ((constraint is SearchBehaviorConstraint || constraint is IndexedSearchBehaviorConstraint) &&
                constraintKey.Equals("FULLTEXT", StringComparison.OrdinalIgnoreCase))
            {
                return constraint;
            }

            IndexerConstraint ic = constraint as IndexerConstraint;
            if ((ic != null) && ic.Indexer.Attribute.Key.Equals(constraintKey, StringComparison.OrdinalIgnoreCase))
            {
                return constraint;
            }

            OrNestedConstraint onc = constraint as OrNestedConstraint;
            if (onc != null)
            {
                foreach (ISearchConstraint itemConst in onc)
                {
                    returnConstraint = GetConstraintByKey(itemConst, constraintKey);
                    if (returnConstraint != null)
                    {
                        return returnConstraint;
                    }
                }
            }

            AndNestedConstraint anc = constraint as AndNestedConstraint;
            if (anc != null)
            {
                foreach (ISearchConstraint itemConst in anc)
                {
                    returnConstraint = GetConstraintByKey(itemConst, constraintKey);
                    if (returnConstraint != null)
                    {
                        return returnConstraint;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// Removes all constraints containing a specific attribute from the supplied nested constraint.
        /// </summary>
        /// <param name="constraints">The nested constraint to search.</param>
        /// <param name="attribute">The attribute to use to select constraints to remove.</param>
        public static void RemoveConstraint(NestedConstraint constraints, IIndexer attribute)
        {
            if (attribute != null)
            {
                bool exists;

                Collection<ISearchConstraint> constraintsToRemove = new Collection<ISearchConstraint>();

                foreach (ISearchConstraint constraint in constraints)
                {
                    exists = CheckIndexerExistsInConstraints(constraint, attribute);
                    if (exists)
                    {
                        constraintsToRemove.Add(constraint);
                    }
                }

                if (constraintsToRemove.Count > 0)
                {
                    foreach (ISearchConstraint constraint in constraintsToRemove)
                    {
                        if (!constraints.Remove(constraint))
                        {
                            constraints.RemoveRecursive(constraint.Identifier);
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Add a provider attribute to this, sometimes they need to be generated on the fly.
        /// </summary>
        /// <param name="key">Name of attribute to be created.</param>
        /// <param name="categoryName">Category name to associated with.</param>
        /// <param name="attributeType">The type of attribute to add.</param>
        /// <param name="metadata">Metadata to sample.</param>
        public void AddProviderAttribute(string key, string categoryName, AttributeType attributeType, TSQLMetadata metadata)
        {
            var cat = this.GetCategory(categoryName);
            ProviderCategory pc = this.categoryCache[categoryName];

            ProviderAttribute pa = new ProviderAttribute(
              Guid.NewGuid().ToString(),
              key,
              attributeType,
              cat);

            IndexerList indexers = new IndexerList();
            foreach (var ixr in pc.Indexers)
            {
                indexers.Add(ixr);
            }

            if (!this.providerAttributes.ContainsKey(key))
            {
                if (metadata != null)
                {
                    if (metadata.AttributeMetadata == null)
                    {
                        metadata.AttributeMetadata = new List<TSQLMetadataItem>();
                    }

                    if (metadata.SpecificAttributeMetadata == null)
                    {
                        metadata.SpecificAttributeMetadata = null;
                    }
                }

                this.providerAttributes.AddOrUpdate(key, pa, (k, v) => pa);
                this.AssignAttributeToProviderCategory(pc, indexers, pa, pa.DisplayName, metadata);
            }

            pc.SetIndexers(new ReadOnlyIndexerList(indexers));
        }

        /// <summary>
        /// Add a provider attribute to this, sometimes they need to be generated on the fly.
        /// </summary>
        /// <param name="keys">Names of attribute to be created.</param>
        /// <param name="categoryName">Category name to associated with.</param>
        /// <param name="attributeType">The type of attribute to add.</param>
        /// <param name="listMetadata">Metadata to sample.</param>
        public void AddProviderAttributes(string[] keys, string categoryName, AttributeType attributeType, Dictionary<string, TSQLMetadata> listMetadata)
        {
            var cat = this.GetCategory(categoryName);
            ProviderCategory pc = this.categoryCache[categoryName];

            IndexerList indexers = new IndexerList();
            foreach (var ixr in pc.Indexers)
            {
                indexers.Add(ixr);
            }

            foreach (var key in keys)
            {
                ProviderAttribute pa = new ProviderAttribute(
                    Guid.NewGuid().ToString(),
                    key,
                    attributeType,
                    cat);

                if (!this.providerAttributes.ContainsKey(key))
                {
                    TSQLMetadata thisMeta =
                        listMetadata.FirstOrDefault(m => m.Key.Equals(key, StringComparison.OrdinalIgnoreCase)).Value;

                    this.providerAttributes.AddOrUpdate(key, pa, (k, v) => pa);
                    this.AssignAttributeToProviderCategory(pc, indexers, pa, pa.DisplayName, thisMeta);
                }
            }

            pc.SetIndexers(new ReadOnlyIndexerList(indexers));
        }

        /// <summary>
        /// Changes the category on the supplied search. Not implemented.
        /// </summary>
        /// <param name="search">The search to use.</param>
        /// <param name="targetCategory">The new category to use.</param>
        /// <remarks>Not implemented, but does not raise exception.</remarks>
        public override void ChangeSearchSource(Search search, ICategory targetCategory)
        {
            // nothing to do
        }

        /// <summary>
        /// Returns a count of the number of items matching a supplied query.
        /// </summary>
        /// <param name="search">The query to perform.</param>
        /// <param name="authorisations">The AC authorization restrictions to apply.</param>
        /// <returns>A count of the items matching the query.</returns>
        public override int CountItems(ISearch search, AaaAuthorisation authorisations)
        {
            return this.CountItems(search, authorisations, 0);
        }

        /// <summary>
        /// Returns a count of the number of items matching a supplied query.
        /// </summary>
        /// <param name="search">The query to perform.</param>
        /// <param name="authorisations">The AC authorization restrictions to apply.</param>
        /// <param name="cacheExpiryInMinutes">
        /// The number of minutes to cache the output for. If 0 or less then do not cache.
        /// </param>
        /// <returns>A count of the items matching the query.</returns>
        public override int CountItems(ISearch search, AaaAuthorisation authorisations, int cacheExpiryInMinutes)
        {
            if (search == null)
            {
                throw new ArgumentNullException("search");
            }

            ICategory category = AbstractSqlProvider.GetCategoryFromSearch(search);

            int? results = null;

            // get from cache??
            CacheHashInfo info = new CacheHashInfo()
            {
                ExpiryInMinutes = cacheExpiryInMinutes,
                Category = category,
                Auths = authorisations,
                ProductDependency = this.productDependency,
                ProviderKey = this.Name,
                Search = search
            };
            CacheHashDetails cacheHashDetails = new CacheHashDetails(info);
            if (cacheHashDetails.Enabled)
            {
                results = CMPCacheManger.GetFromCache<int?>(cacheHashDetails);
            }

            if (results == null)
            {
                string queryName = AbstractSqlProvider.GetQueryName(search);

                Search searchClone = (Search)search.Clone();
                TSQLCategory tsqlCat = this.GetCategoryConfig(category.Name);

                string sql = this.GetSql(category, queryName, searchClone, authorisations, true);

                sql = AbstractSqlProvider.CheckHintReplacements(sql, tsqlCat, queryName, authorisations, ref searchClone);

                sql = AbstractSqlProvider.CreateCountSQL(sql);
                sql = AbstractSqlProvider.RemovePagingHints(sql);
                sql = AbstractSqlProvider.RemoveHint(sql, AddItemIDPattern);

                results = this.FetchCount(sql);

                if (cacheHashDetails.Enabled)
                {
                    CMPCacheManger.StoreInDBCache(cacheHashDetails, results);
                }
            }

            return results.Value;
        }

        /// <summary>
        /// Retrieves a suggestions list intended for use in auto-complete functionality.
        /// </summary>
        /// <param name="prefixText">The text that the user has already entered.</param>
        /// <param name="count">A maximum count of items to retrieve.</param>
        /// <param name="context">The context information required to make the call.</param>
        /// <returns>A list of suggestions.</returns>
        /// <exception cref="System.NotImplementedException">
        /// This method is not implemented for this provider.
        /// </exception>
        public override Collection<string> GetAutoCompletionList(string prefixText, int count, string context)
        {
            Collection<string> resultsList = new Collection<string>();
            Search search = null;

            if (HttpContext.Current.Session != null && HttpContext.Current.Session["CoreCatalogSearch"] != null)
            {
                Search baseSearch = (Search)HttpContext.Current.Session["CoreCatalogSearch"];
                search = (Search)baseSearch.Clone();
            }

            // this sets up the query name in get grouped results
            search.Name = context;
            var idx = search.Indexers.FirstOrDefault(i => i.DisplayName == context);
            var ic = new WildCardConstraint(idx, "%" + prefixText + "%");

            search.Constraints.Add(ic);
            search.SelectedIndexers.Add(idx);
            search.MaxItems = (uint)count;

            var auths = (AaaAuthorisation)HttpContext.Current.Session["Authorization"];
            var results = this.GetGroupedResults(new GroupedDataTableBuildResults(), search, false, auths);

            if (results != null && results.Rows.Count > 0)
            {
                foreach (DataRow row in results.Rows)
                {
                    resultsList.Add(row[0].ToString());
                }
            }

            return resultsList;
        }

        /// <summary>
        /// Retrieves an <see cref="IHS.Core.Catalog.Model.ICategory"/> from the list of categories
        /// available through this provider given a Guid.
        /// </summary>
        /// <param name="id">The Guid to search for in the list of available categories.</param>
        /// <returns>An <see cref="IHS.Core.Catalog.Model.ICategory"/> .</returns>
        /// <exception cref="System.Configuration.ConfigurationErrorsException">
        /// The Guid is not found in the list of available categories.
        /// </exception>
        public override ICategory GetCategory(Guid id)
        {
            ProviderCategory category = this.categoryCache.Values.FirstOrDefault(c => c.ID.Equals(id.ToString(), StringComparison.OrdinalIgnoreCase));
            if (category == null)
            {
                // abstract SQL provider has a 1 domain to 1 cat (at least at the moment) it is a
                // last port of call before throwing an exception!
                category = (from d in this.domainCache.Values
                            from c in this.categoryCache.Values
                            where d.ID.Equals(id.ToString(), StringComparison.OrdinalIgnoreCase)
                                && c.Domain.ID.Equals(id.ToString(), StringComparison.OrdinalIgnoreCase)
                            select c).FirstOrDefault();

                if (category == null)
                {
                    throw new ConfigurationErrorsException("No category found in cache for " + id.ToString());
                }
            }

            return category.Clone() as ICategory;
        }

        /// <summary>
        /// Retrieves an <see cref="IHS.Core.Catalog.Model.ICategory"/> from the list of categories
        /// available through this provider given a category key.
        /// </summary>
        /// <param name="key">The key to search for in the list of available categories.</param>
        /// <returns>An <see cref="IHS.Core.Catalog.Model.ICategory"/> .</returns>
        /// <exception cref="System.Configuration.ConfigurationErrorsException">
        /// The key is not found in the list of available categories.
        /// </exception>
        public override ICategory GetCategory(string key)
        {
            ProviderCategory category = null;

            if (this.categoryCache.ContainsKey(key))
            {
                category = this.categoryCache[key];
            }
            else if (this.categoryCache.ContainsKey(key.ToUpperInvariant()))
            {
                category = this.categoryCache[key.ToUpperInvariant()];
            }
            else
            {
                this.BuildCache(this.providerConfig, false, key);
                category = this.categoryCache[key];
                if (category == null)
                {
                    throw new ConfigurationErrorsException("No category found in cache for " + key);
                }
            }

            return category.Clone() as ICategory;
        }

        /// <summary>
        /// Gets a valid category entitlement product name using a key.
        /// </summary>
        /// <param name="key">The category key to search for.</param>
        /// <returns> category entitlements if found. </returns>
        public override IEnumerable<string> GetCategoryEntitlementProductNames(string key)
        {
            var cat = this.providerConfig.Categories.SingleOrDefault(c => c.Name == key || c.Name.Split(',').Contains(key));
            var result = new List<string>();

            if (cat == null || cat.Metadata == null || cat.Metadata.Count <= 0)
            {
                return result;
            }

            var prodName = cat.Metadata.SingleOrDefault(p => p.Key.Equals(AbstractSqlProvider.EntitlementMetadataKey, StringComparison.InvariantCultureIgnoreCase));
            var subProds = cat.Metadata.SingleOrDefault(p => p.Key.Equals("entitlementSubProducts", StringComparison.InvariantCultureIgnoreCase));

            if (!string.IsNullOrEmpty(prodName.Key))
            {
                result.AddRange(prodName.Value.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries));
            }
            else
            {
                // ... and an instruction to use the category key exists
                var useCatKey = cat.Metadata.FirstOrDefault(m => m.Key.Equals(AbstractSqlProvider.CategoryKeyEntitlementOverride, StringComparison.OrdinalIgnoreCase));
                if (Convert.ToBoolean(useCatKey.Value, CultureInfo.InvariantCulture))
                {
                    result.Add(key);
                }
            }

            if (!string.IsNullOrEmpty(subProds.Key))
            {
                result.AddRange(subProds.Value.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries));
            }

            return result;
        }

        /// <summary>
        /// Retrieves an <see cref="IHS.Core.Catalog.Model.ICategory"/> from the list of categories
        /// available through this provider given a category abbreviation.
        /// </summary>
        /// <param name="catAbbreviation">
        /// The abbreviation to search for in the list of available categories.
        /// </param>
        /// <returns>
        /// A list of categories where either the category abbreviation or the name match the
        /// abbreviation supplied.
        /// </returns>
        [Obsolete("This method should no longer be used, full category names should be used instead.")]
        public override IList<ICategory> GetCategoryByAbbreviation(string catAbbreviation)
        {
            List<ICategory> categories = new List<ICategory>();
            if (!string.IsNullOrEmpty(catAbbreviation))
            {
                if (this.categoryCache.Count == 0)
                {
                    //force a hard get to ensure we get all the ixrs for the dashboards if coming from a nims login link (default.aspx).
                    this.BuildCache(this.providerConfig, false, null);
                }

                var matchingCategories = from c in this.categoryCache.Values
                                         let abbrev = c.GetMetaDataValue("abbreviation")
                                         where
                                             (!string.IsNullOrEmpty(abbrev) && abbrev.Equals(catAbbreviation, StringComparison.OrdinalIgnoreCase))
                                             || c.Name.Equals(catAbbreviation, StringComparison.OrdinalIgnoreCase)
                                         select c.Clone() as ProviderCategory;

                categories.AddRange(matchingCategories.ToArray());
            }

            return categories;
        }

        /// <summary>
        /// Retrieves a list of alternative text search strings given a supplied
        /// <see cref="IHS.Core.Catalog.Model.Search"/> object.
        /// </summary>
        /// <param name="search">The <see cref="IHS.Core.Catalog.Model.Search"/> object to use.</param>
        /// <param name="text">The search text string.</param>
        /// <returns>A collection of alternative search text strings.</returns>
        public override Collection<string> GetDidYouMeanExpansion(Search search, string text)
        {
            return new Collection<string>();
        }

        /// <summary>
        /// Retrieves the <see cref="IHS.Core.Catalog.Model.IDomain"/> from this provider given a Guid.
        /// </summary>
        /// <param name="id">The Guid to search for in the list of available domains.</param>
        /// <returns>An <see cref="IHS.Core.Catalog.Model.IDomain"/> .</returns>
        /// <exception cref="System.Configuration.ConfigurationErrorsException">
        /// The Guid is not found in the list of available domains.
        /// </exception>
        public override IDomain GetDomain(Guid id)
        {
            ProviderDomain domain = this.domainCache.Values.FirstOrDefault(d => d.ID.Equals(id.ToString(), StringComparison.OrdinalIgnoreCase));
            if (domain == null)
            {
                throw new ConfigurationErrorsException("No domain found in cache for " + id.ToString());
            }

            return domain;
        }

        /// <summary>
        /// Retrieves the <see cref="IHS.Core.Catalog.Model.IDomain"/> from this provider given a
        /// domain key.
        /// </summary>
        /// <param name="key">The key to search for in the list of available domains.</param>
        /// <returns>An <see cref="IHS.Core.Catalog.Model.IDomain"/> .</returns>
        /// <exception cref="System.ArgumentException">
        /// The key provided is null or an empty string or does not match the FAST provider domain key.
        /// </exception>
        /// <exception cref="System.Configuration.ConfigurationErrorsException">
        /// The Guid is not found in the list of available domains.
        /// </exception>
        public override IDomain GetDomain(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                throw new ArgumentException("Parameter cannot be null or empty.", "key");
            }

            ProviderDomain domain = null;
            if (this.domainCache.ContainsKey(key))
            {
                domain = this.domainCache[key];
            }
            else if (this.domainCache.ContainsKey(key.ToUpperInvariant()))
            {
                domain = this.domainCache[key.ToUpperInvariant()];
            }
            else
            {
                throw new ConfigurationErrorsException("No domain found in cache for " + key);
            }

            return domain;
        }

        /// <summary>
        /// Retrieves a <see cref="IHS.Core.Catalog.Model.Search.GenerousDomainSource"/> object for
        /// the supplied <see cref="IHS.Core.Catalog.Model.IDomain"/> .
        /// </summary>
        /// <param name="theDomain">
        /// The <see cref="IHS.Core.Catalog.Model.IDomain"/> to get the
        /// <see cref="IHS.Core.Catalog.Model.Search.GenerousDomainSource"/> for.
        /// </param>
        /// <returns>A <see cref="IHS.Core.Catalog.Model.Search.GenerousDomainSource"/> .</returns>
        /// <remarks>
        /// As this provider contains exactly one domain, so does the
        /// <see cref="IHS.Core.Catalog.Model.Search.GenerousDomainSource"/> object.
        /// </remarks>
        public override GenerousDomainSource GetGenerousDomainSource(IDomain theDomain)
        {
            return new GenerousDomainSource(new Collection<IDomain>() { (IDomain)theDomain });
        }

        /// <summary>
        /// Retrieves navigation data list(s) found when a query is executed against the database instance.
        /// </summary>
        /// <typeparam name="T">The results object.</typeparam>
        /// <param name="resultBuilder">
        /// The <see cref="IHS.Core.Catalog.Data.IBuildResults"/> object which can be used to build
        /// the results.
        /// </param>
        /// <param name="search">The <see cref="IHS.Core.Catalog.Model.Search.ISearch"/> to perform.</param>
        /// <param name="returnCounts">A flag to indicate whether a result count is required.</param>
        /// <param name="authorisations">
        /// The authentication and authorization information for the user.
        /// </param>
        /// <returns>A result object of type <typeparamref name="T"/> .</returns>
        public override T GetGroupedResults<T>(IBuildResults<T> resultBuilder, ISearch search, bool returnCounts, AaaAuthorisation authorisations)
        {
            return this.GetGroupedResults(resultBuilder, search, returnCounts, authorisations, 0);
        }

        /// <summary>
        /// Retrieves navigation data list(s) found when a query is executed against the database instance.
        /// </summary>
        /// <typeparam name="T">The results object.</typeparam>
        /// <param name="resultBuilder">
        /// The <see cref="IHS.Core.Catalog.Data.IBuildResults"/> object which can be used to build
        /// the results.
        /// </param>
        /// <param name="search">The <see cref="IHS.Core.Catalog.Model.Search.ISearch"/> to perform.</param>
        /// <param name="returnCounts">A flag to indicate whether a result count is required.</param>
        /// <param name="authorisations">
        /// The authentication and authorization information for the user.
        /// </param>
        /// <param name="cacheExpiryInMinutes">
        /// The number of minutes to cache the output for. If 0 or less then do not cache.
        /// </param>
        /// <returns>A result object of type <typeparamref name="T"/> .</returns>
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "GetGroupedResults", Justification = "This is the method name.")]
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        public override T GetGroupedResults<T>(IBuildResults<T> resultBuilder, ISearch search, bool returnCounts, AaaAuthorisation authorisations, int cacheExpiryInMinutes)
        {
            bool pageData = false;
            T results = default(T);

            Log.Debug("Begin GetGroupedResults");
            if (search == null)
            {
                throw new ArgumentNullException("search");
            }

            Search searchClone = (Search)search.Clone();
            ICategory cat = AbstractSqlProvider.GetCategoryFromSearch(searchClone);

            // get from cache??
            CacheHashInfo info = new CacheHashInfo()
            {
                ExpiryInMinutes = cacheExpiryInMinutes,
                Category = cat,
                Auths = authorisations,
                ProductDependency = this.productDependency,
                ProviderKey = this.Name,
                Search = search
            };
            CacheHashDetails cacheHashDetails = new CacheHashDetails(info);
            if (cacheHashDetails.Enabled)
            {
                results = CMPCacheManger.GetFromCache<T>(cacheHashDetails);
            }

            if (results == null)
            {
                bool applySort = false;
                if (searchClone.Sorts != null && searchClone.Sorts.Count > 0)
                {
                    applySort = true;
                }

                // if the search's name has been set then the dev intends a specific predefined
                // named query to be used, otherwise use the indexers
                string queryKey = searchClone.Name;

                bool isWebServiceCall = searchClone.Name != null && searchClone.Name.Equals("$sys_WebServicesSearch$", StringComparison.OrdinalIgnoreCase);

                if (string.IsNullOrEmpty(queryKey) || isWebServiceCall)
                {
                    ReadOnlyIndexerList indexers = searchClone.Indexers;
                    string key = null;

                    if (!isWebServiceCall)
                    {
                        var indexer = (indexers.Count == 1 ? indexers.Last() : indexers.LastOrDefault(i => i.Type != AttributeType.UNASSIGNED_TYPE)) ??
                                      indexers.Last();

                        key = indexer.ObjectKey;
                    }
                    else
                    {
                        string[] indexerNames = (from i in indexers
                                                 select i.DisplayName).ToArray();
                        key = string.Join(",", indexerNames);
                        pageData = true;
                    }

                    queryKey = key;
                }

                Log.Debug("GetGroupedResults key: " + queryKey);

                string sql = this.GetSql(cat, queryKey, searchClone, authorisations, false);

                results = this.GetData(sql, cat, searchClone, authorisations, resultBuilder, pageData, applySort, queryKey, returnCounts);

                if (cacheHashDetails.Enabled)
                {
                    CMPCacheManger.StoreInDBCache(cacheHashDetails, results);
                }

                Log.Debug("End GetGroupedResults");
            }

            return results;
        }

        /// <summary>
        /// Retrieves the data found when a query is executed against the database instance.
        /// </summary>
        /// <typeparam name="T">The results object.</typeparam>
        /// <param name="resultBuilder">
        /// The <see cref="IHS.Core.Catalog.Data.IBuildResults"/> object which can be used to build
        /// the results.
        /// </param>
        /// <param name="search">The <see cref="IHS.Core.Catalog.Model.Search.ISearch"/> to perform.</param>
        /// <param name="authorisations">
        /// The authentication and authorization information for the user.
        /// </param>
        /// <returns>A result object of type <typeparamref name="T"/> .</returns>
        public override T GetResults<T>(IBuildResults<T> resultBuilder, ISearch search, AaaAuthorisation authorisations)
        {
            return this.GetResults(resultBuilder, search, authorisations, 0);
        }

        /// <summary>
        /// Retrieves the data found when a query is executed against the database instance.
        /// </summary>
        /// <typeparam name="T">The results object.</typeparam>
        /// <param name="resultBuilder">
        /// The <see cref="IHS.Core.Catalog.Data.IBuildResults"/> object which can be used to build
        /// the results.
        /// </param>
        /// <param name="search">The <see cref="IHS.Core.Catalog.Model.Search.ISearch"/> to perform.</param>
        /// <param name="authorisations">
        /// The authentication and authorization information for the user.
        /// </param>
        /// <param name="cacheExpiryInMinutes">
        /// The number of minutes to cache the output for. If 0 or less then do not cache.
        /// </param>
        /// <returns>A result object of type <typeparamref name="T"/> .</returns>
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "GetResults", Justification = "This is the method name.")]
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        public override T GetResults<T>(IBuildResults<T> resultBuilder, ISearch search, AaaAuthorisation authorisations, int cacheExpiryInMinutes)
        {
            if (search == null)
            {
                throw new ArgumentNullException("search");
            }

            T results = default(T);
            string queryName = AbstractSqlProvider.GetQueryName(search);

            Log.Debug("Begin GetResults for query: " + queryName);

            Search searchClone = (Search)search.Clone();
            ICategory category = AbstractSqlProvider.GetCategoryFromSearch(searchClone);

            // get from cache??
            CacheHashInfo info = new CacheHashInfo()
            {
                ExpiryInMinutes = cacheExpiryInMinutes,
                Category = category,
                Auths = authorisations,
                ProductDependency = this.productDependency,
                ProviderKey = this.Name,
                BuilderType = resultBuilder.GetType().ToString(),
                Search = search
            };
            CacheHashDetails cacheHashDetails = new CacheHashDetails(info);
            if (cacheHashDetails.Enabled)
            {
                results = CMPCacheManger.GetFromCache<T>(cacheHashDetails);
            }

            if (results == null)
            {
                // normally we will always page data, but sometimes a category may not want to do
                // this, so we may not want to add paging code
                bool pageData = (from kvp in this.categoryCache
                                 where kvp.Value.DisplayName.Equals(category.DisplayName, StringComparison.OrdinalIgnoreCase)
                                 let abbrev = kvp.Value.GetMetaDataValue("DontPageData")
                                 select string.IsNullOrEmpty(abbrev)).First();

                string sql = this.GetSql(category, queryName, searchClone, authorisations, false);
                results = this.GetData<T>(sql, category, searchClone, authorisations, resultBuilder, pageData, true, queryName, false);

                Log.Debug("End GetResults");

                if (cacheHashDetails.Enabled)
                {
                    CMPCacheManger.StoreInDBCache(cacheHashDetails, results);
                }
            }

            return results;
        }

        /// <inheritdoc />
        public override IEnumerable<XDocument> GetDocuments(ISearch search, AaaAuthorisation authorisations, int cacheExpiryInMinutes)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Get search behavior(s) for the provided category.
        /// </summary>
        /// <param name="entityKey">The category to get the search behaviors for.</param>
        /// <returns>A list of available search behaviors.</returns>
        public override Collection<SearchBehavior> GetSearchBehaviors(string entityKey)
        {
            Collection<SearchBehavior> behaviors = new Collection<SearchBehavior>();

            // if the category implements full text searching, get a behavior for the caller
            ProviderCategory c = this.GetCategory(entityKey) as ProviderCategory;
            if (c != null && !string.IsNullOrWhiteSpace(c.GetMetaDataValue("FullTextSearchAlias")))
            {
                SearchBehavior sb = new ProviderSearchBehavior()
                {
                    Key = string.Format(CultureInfo.InvariantCulture, "{0}_SEARCH_BEHAVIOR", entityKey),
                    ID = Guid.NewGuid().ToString(),
                    ISOLanguage = CultureInfo.CurrentCulture.Name,
                    Name = string.Format(CultureInfo.InvariantCulture, "{0} Search Behavior", entityKey),
                    TargetDomainID = this.GetCategory(entityKey).Domain.ID
                };
                behaviors.Add(sb);
            }

            return behaviors;
        }

        /// <summary>
        /// Initializes an instance of this data provider using details supplied by the caller which
        /// have been read from configuration.
        /// </summary>
        /// <param name="name">The name associated with this data provider.</param>
        /// <param name="config">
        /// The provider attribute name/value pairs read from the configuration file.
        /// </param>
        [SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Justification = "Specifically want to catch and consume ALL exceptions at this point."),
        SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        [MethodImpl(MethodImplOptions.Synchronized)]
        public override void Initialize(string name, NameValueCollection config)
        {
            if (this.IsInitialised)
            {
                // Double check in case something has been waiting for the synchronise block.
                return;
            }

            try
            {
                Log.Debug("Begin Initialize " + name);
                if (config == null || config.Count == 0)
                {
                    throw new ConfigurationErrorsException("Config values not supplied.");
                }

                base.Initialize(name, config);

                this.sqlFile = config["SQLConfig"];
                if (string.IsNullOrEmpty(this.sqlFile))
                {
                    throw new ConfigurationErrorsException("SQL file must be set to the appropriate value.");
                }
                else
                {
                    this.sqlFile = AppDomain.CurrentDomain.BaseDirectory + this.sqlFile;

                    if (CMPConfiguration.DeveloperAlwaysRefreshDataProviderConfig)
                    {
                        // rework the sql location to point to the file in the dataprovider project
                        this.sqlFile = this.sqlFile.Replace("bin/", string.Empty);
                        this.sqlFile = this.sqlFile.Replace("Web\\UI", "SharedProjects\\DataProviders");
                        this.sqlFile = this.sqlFile.Replace("Services\\ExportServices\\ExportServices", "SharedProjects\\DataProviders");
                    }
                }

                string connectionStringKey = config["connectionStringKey"];
                if (string.IsNullOrEmpty(connectionStringKey))
                {
                    throw new ConfigurationErrorsException("Connection string key must be set to the appropriate value.");
                }
                else
                {
                    this.connectionString = System.Configuration.ConfigurationManager.ConnectionStrings[connectionStringKey].ConnectionString;
                }

                this.productDependency = config["productDependency"];
                if (string.IsNullOrEmpty(this.productDependency))
                {
                    throw new ConfigurationErrorsException("Product dependency must be set to the appropriate value.");
                }

                this.providerConfig = AbstractSqlProvider.GetConfig(this.sqlFile);

                if (this.providerConfig == null)
                {
                    throw new ConfigurationErrorsException("Cannot get configuration file.");
                }

                string locale = config["locale"];
                if (string.IsNullOrEmpty(locale))
                {
                    throw new ConfigurationErrorsException("Locale must be set to the appropriate value.");
                }
                else
                {
                    this.providerLocale = new CultureInfo(locale);
                }

                string shortDates = config["UseShortDates"];
                if (!string.IsNullOrEmpty(shortDates))
                {
                    bool shortDatesOut;
                    if (bool.TryParse(shortDates, out shortDatesOut))
                    {
                        this.useShortDates = shortDatesOut;
                    }
                }

                string useUpper = config["UseUpperCaseIndexerNames"];
                if (!string.IsNullOrEmpty(useUpper))
                {
                    bool upperCaseOut;
                    if (bool.TryParse(useUpper, out upperCaseOut))
                    {
                        this.useUpperCaseIndexerNames = upperCaseOut;
                    }
                }

                this.isInitialised = true;
                Log.Debug("End Initialize : " + name);
            }
            catch (Exception)
            {
                // just throw and let the data provider manager handle and log the issue
                throw;
            }
        }

        #endregion Public Methods

        #region Protected Methods

        /// <summary>
        /// Remove a hint from the supplied SQL statement.
        /// </summary>
        /// <param name="sql">The SQL statement to remove the hints from.</param>
        /// <param name="hint">The hint to remove.</param>
        /// <returns>The SQL statement with the hints removed.</returns>
        protected static string RemoveHint(string sql, string hint)
        {
            return AbstractSqlProvider.ValidatedReplace(sql, Regex.Escape(hint));
        }

        /// <summary>
        /// Remove whole order by clause from the supplied SQL statement.
        /// </summary>
        /// <remarks>Used when running a count as order by should not exist in such case.</remarks>
        /// <param name="sql">The SQL statement to remove the order by clause from.</param>
        /// <returns>The SQL statement with the order by clause removed.</returns>
        [SuppressMessage("StyleCop.CSharp.OrderingRules", "SA1202:ElementsMustBeOrderedByAccess", Justification = "Reviewed. Want to keep IDisposable together so placing this method here.")]
        protected static string RemoveOrderByClause(string sql)
        {
            // NOTE: match pattern used DO NOT Regex escape this pattern
            return AbstractSqlProvider.ValidatedReplace(sql, AbstractSqlProvider.OrderByHintsAndClausePattern);
        }

        /// <summary>
        /// Remove "ConstraintsOnlyNoAuths" hint from sql.
        /// </summary>
        /// <remarks>Used when running a count as order by should not exist in such case.</remarks>
        /// <param name="sql">The SQL statement to remove the order by clause from.</param>
        /// <returns>The SQL statement with the order by clause removed.</returns>
        [SuppressMessage("StyleCop.CSharp.OrderingRules", "SA1202:ElementsMustBeOrderedByAccess", Justification = "Reviewed. Want to keep IDisposable together so placing this method here.")]
        protected static string RemoveConstraintsOnlyNoAuthsClause(string sql)
        {
            // NOTE: match pattern used DO NOT Regex escape this pattern
            // We remove the pattern plus AND in case it has been used to add constraints - if we do not remove 
            // the 'And' we will get a sql parse error.
            return AbstractSqlProvider.ValidatedReplace(sql, AbstractSqlProvider.ConstraintsOnlyNoAuths, " 2=2 ");
        }

        /// <summary>
        /// Builds a cache of the category and domain objects read from the configuration file.
        /// </summary>
        /// <param name="config">The configuration object.</param>
        /// <param name="ignorePrefetch">Do we want to ignore the prefetching of queries.</param>
        /// <param name="optionalCategoryKey">A category key to filter on if required.</param>
        protected virtual void BuildCache(TSQLConfig config, bool ignorePrefetch, string optionalCategoryKey)
        {
            List<TSQLCategory> categories = null;
            if (string.IsNullOrWhiteSpace(optionalCategoryKey))
            {
                categories = config.Categories.ToList();
            }
            else
            {
                categories = config.Categories.Where(c => c.Name == optionalCategoryKey ||
                    c.Name.Split(',').Contains(optionalCategoryKey)).ToList();
            }

            foreach (TSQLCategory tsqlConfig in categories)
            {
                try
                {
                    if (tsqlConfig.TSQLQueries.Count == 0)
                    {
                        throw new ConfigurationErrorsException("No queries found for " + tsqlConfig.Name);
                    }

                    // allow a comma delimited list of category keys & GUIDs to be used
                    string[] categoryKeys = tsqlConfig.Name.Split(",".ToCharArray());
                    string[] categoryGuids = tsqlConfig.Guid.Split(",".ToCharArray());

                    // check the array lengths match
                    if (categoryGuids.Length != categoryKeys.Length)
                    {
                        string error = string.Format(
                            CultureInfo.InvariantCulture,
                            "Mismatching number of categories and GUIDs: '{0}', '{1}'",
                            tsqlConfig.Name,
                            tsqlConfig.Guid);
                        throw new ConfigurationErrorsException(error);
                    }

                    // process the category definitions into cache
                    for (int count = 0; count < categoryKeys.Length; count++)
                    {
                        // setup category, domain and attributes
                        ProviderCategory providerCategory = new ProviderCategory(
                            categoryGuids[count],
                            categoryKeys[count],
                            categoryKeys[count],
                            tsqlConfig.DomainName,
                            categoryGuids[count]);
                        ProviderDomain domain = new ProviderDomain(categoryGuids[count], tsqlConfig.DomainName, tsqlConfig.DomainName);

                        // setup metadata
                        Dictionary<string, string> metadata = new Dictionary<string, string>();
                        if (tsqlConfig.Metadata != null && tsqlConfig.Metadata.Count > 0)
                        {
                            foreach (MetadataEntry<string, string> entry in tsqlConfig.Metadata)
                            {
                                metadata.Add(entry.Key, entry.Value);
                            }

                            providerCategory.SetMetadata(metadata);
                        }

                        // if entitlement metadata has not been defined ...
                        if (string.IsNullOrEmpty(metadata.FirstOrDefault(m => m.Key.Equals(AbstractSqlProvider.EntitlementMetadataKey, StringComparison.OrdinalIgnoreCase)).Key))
                        {
                            // ... and an instruction to use the category key exists
                            KeyValuePair<string, string> useCatKey = metadata.FirstOrDefault(m => m.Key.Equals(AbstractSqlProvider.CategoryKeyEntitlementOverride, StringComparison.OrdinalIgnoreCase));
                            if (Convert.ToBoolean(useCatKey.Value, CultureInfo.InvariantCulture))
                            {
                                // add a metadata entry for entitlementProductName based on the
                                // category key
                                providerCategory.SetMetaDataValue(AbstractSqlProvider.EntitlementMetadataKey, providerCategory.ObjectKey);
                            }
                        }

                        CommonIndexerList<IIndexer> indexers = new CommonIndexerList<IIndexer>();

                        if (tsqlConfig.HintReplacements != null && tsqlConfig.HintReplacements.Count > 0)
                        {
                            foreach (HintReplacement replacement in tsqlConfig.HintReplacements)
                            {
                                if (replacement.UserIdHintReplacement != null)
                                {
                                    if (!this.allDefaultHintReplacements.ContainsKey(replacement.Hint))
                                    {
                                        this.allDefaultHintReplacements.AddOrUpdate(replacement.Hint, replacement.UserIdHintReplacement.Sql, (k, v) => replacement.UserIdHintReplacement.Sql);
                                    }
                                }

                                if (replacement.YearHintReplacement != null)
                                {
                                    if (!this.allDefaultHintReplacements.ContainsKey(replacement.Hint))
                                    {
                                        this.allDefaultHintReplacements.AddOrUpdate(replacement.Hint, replacement.YearHintReplacement.Sql, (k, v) => replacement.YearHintReplacement.Sql);
                                    }
                                }

                                if (!this.allDefaultHintReplacements.ContainsKey(replacement.Hint))
                                {
                                    this.allDefaultHintReplacements.AddOrUpdate(replacement.Hint, replacement.DefaultReplacement, (k, v) => replacement.DefaultReplacement);
                                }

                                foreach (IndexerHintReplacement idxReplacement in replacement.IndexerHintReplacement)
                                {
                                    this.CreateProviderAttribute(providerCategory, indexers, idxReplacement, config.MetaData);
                                }
                            }
                        }

                        if (tsqlConfig.DualColumnAdapterParameters != null && tsqlConfig.DualColumnAdapterParameters.Count > 0)
                        {
                            foreach (DualColumnAdapterParameter parameter in tsqlConfig.DualColumnAdapterParameters)
                            {
                                this.CreateProviderAttribute(providerCategory, indexers, parameter, config.MetaData);
                            }
                        }

                        if (tsqlConfig.Parameters != null && tsqlConfig.Parameters.Count > 0)
                        {
                            foreach (AdapterParameter parameter in tsqlConfig.Parameters)
                            {
                                this.CreateProviderAttribute(providerCategory, indexers, parameter, config.MetaData);
                            }
                        }

                        foreach (TSQLQuery query in tsqlConfig.TSQLQueries)
                        {
                            AbstractSqlProvider.SubstituteReplaceableJoinConditions(query, tsqlConfig);

                            // if this is the generic Tree query, dont bother as we wont find data
                            if (query.Name == "GENERIC_TREE")
                            {
                                // create a COUNT indexer so queries can return distinct counts
                                string indexerPrefix = GetDefaultIndexerPrefix(providerCategory);

                                AttributeType attribType = this.GetAttributeType("INT");
                                ProviderAttribute pa = new ProviderAttribute(Guid.NewGuid().ToString(), indexerPrefix + "COUNT", attribType, providerCategory);
                                indexers.Add(new CategoryAttributeAssignment(providerCategory, pa));
                                this.AssignAttributeToProviderCategory(providerCategory, indexers, pa, pa.DisplayName, config.MetaData);
                                continue;
                            }

                            if (query.HintReplacements != null && query.HintReplacements.Count > 0)
                            {
                                foreach (HintReplacement replacement in query.HintReplacements)
                                {
                                    if (!this.allDefaultHintReplacements.ContainsKey(replacement.Hint))
                                    {
                                        this.allDefaultHintReplacements.AddOrUpdate(replacement.Hint, replacement.DefaultReplacement, (k, v) => replacement.DefaultReplacement);
                                    }

                                    foreach (IndexerHintReplacement idxReplacement in replacement.IndexerHintReplacement)
                                    {
                                        this.CreateProviderAttribute(providerCategory, indexers, idxReplacement, config.MetaData);
                                    }

                                    if (replacement.YearHintReplacement != null)
                                    {
                                        this.allDefaultHintReplacements.AddOrUpdate(replacement.Hint, replacement.YearHintReplacement.Sql, (k, v) => replacement.YearHintReplacement.Sql);
                                    }
                                }
                            }

                            foreach (AdapterParameter parameter in query.Parameters)
                            {
                                this.CreateProviderAttribute(providerCategory, indexers, parameter, config.MetaData);
                            }

                            foreach (DualColumnAdapterParameter parameter in query.DualColumnAdapterParameters)
                            {
                                this.CreateProviderAttribute(providerCategory, indexers, parameter, config.MetaData);
                            }

                            if (!ignorePrefetch && query.RunInPreFetch)
                            {
                                // get the query and add all the columns as indexers also - this
                                // makes sure the hints are in the right place string sql =
                                // query.SqlCommand.Replace(Environment.NewLine, string.Empty);
                                string sql = query.SqlCommand;

                                if (!string.IsNullOrEmpty(tsqlConfig.PreQueryStatement))
                                {
                                    sql = tsqlConfig.PreQueryStatement + Environment.NewLine + sql;
                                }

                                var isOracle = this is OracleTSQLProvider;
                                sql = UpdateSqlConstraintIfExistsHints(sql, null, true, isOracle);
                                this.PreFetchData(sql, providerCategory, indexers, config.MetaData);
                            }
                        }

                        providerCategory.SetIndexers(new ReadOnlyIndexerList(indexers));

                        // cache the domain
                        if (!this.domainCache.ContainsKey(tsqlConfig.DomainName))
                        {
                            this.domainCache.AddOrUpdate(tsqlConfig.DomainName, domain, (k, v) => domain);
                        }

                        // cache the category
                        if (!this.categoryCache.ContainsKey(providerCategory.ObjectKey))
                        {
                            this.categoryCache.AddOrUpdate(providerCategory.ObjectKey, providerCategory, (k, v) => providerCategory);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Log.Debug(ex);
                    throw;
                }
            }
        }

        /// <summary>
        /// An opportunity to take a look at and edit the indexers entering the fetch call.
        /// </summary>
        /// <param name="list">The indexers to review.</param>
        /// <param name="search">The search to review.</param>
        protected virtual void ReviewIndexerList(IndexerList list, Search search)
        {
        }

        #endregion Protected Methods

        #region IDisposable

        /// <summary>
        /// Disposes of resources used by this provider.
        /// </summary>
        /// <param name="disposing">
        /// A flag indicating whether managed resources should be disposed or not.
        /// </param>
        protected override void Dispose(bool disposing)
        {
            if (!this.Disposed && disposing)
            {
                // dispose managed resources here
            }

            //// dispose native resources here

            base.Dispose(disposing);
        }

        #endregion IDisposable

        #region Abstract Methods

        /// <summary>
        /// When overridden in a derived class alters the provided SQL statement to limit the number
        /// of retrieved records to maximum allowed by search.
        /// </summary>
        /// <param name="search">Search to derive maximum number of items from.</param>
        /// <param name="sql">The SQL statement to alter.</param>
        /// <returns>Altered SQL select statement.</returns>
        protected abstract string AddMaxItems(Search search, string sql);

        /// <summary>
        /// When overridden in a derived class alters the provided SQL statement to include PL-SQL
        /// specific paging.
        /// </summary>
        /// <param name="sql">The SQL statement to add the paging statements into.</param>
        /// <param name="sortColumn">The column used to sort the results.</param>
        /// <param name="min">The page lower boundary.</param>
        /// <param name="maxItems">The number of items to include in the page.</param>
        /// <returns>A SQL select statement alter to return the correct page of data.</returns>
        protected abstract string AddSqlPaging(string sql, string sortColumn, int min, int maxItems);

        /// <summary>
        /// When overridden in a derived class creates a database specific
        /// <see cref="System.Data.Common.DbConnection">connection</see> object.
        /// </summary>
        /// <returns>A <see cref="System.Data.OracleClient.OracleConnection"/> object.</returns>
        protected abstract DbConnection CreateDBConnection();

        /// <summary>
        /// Gets the <see cref="IHS.Core.Catalog.Model.AttributeType"/> for the supplied provider
        /// specific data type.
        /// </summary>
        /// <param name="dataTypeName">The provider specific data type.</param>
        /// <returns>An AttributeType object.</returns>
        protected abstract AttributeType GetAttributeType(string dataTypeName);

        #endregion Abstract Methods

        #region Private Methods

        /// <summary>
        /// Adds entitlements into the SQL statement.
        /// </summary>
        /// <param name="sqlCommand">The SQL statement to add entitlements into.</param>
        /// <param name="authorisation">The list of entitlements.</param>
        /// <param name="queryConfig">The query configuration.</param>
        /// <param name="queryName">The name of the query being generated.</param>
        /// <param name="entitlementFilterMetaDataVal">
        /// If set then only apply filters that have this value set in the metadata property.
        /// </param>
        /// <returns>A SQL statement including entitlements.</returns>
        private static string AppendAuthsToQuery(string sqlCommand, AaaAuthorisation authorisation, SqlQueryConfig queryConfig, string queryName, string entitlementFilterMetaDataVal)
        {
            string entitlementProducts = queryConfig.Product;
            string entitlementSubproducts = queryConfig.SubProducts;
            TSQLCategory category = queryConfig.Category;
            string entitlementColumnName = queryConfig.EntitlementColumnName;

            if (authorisation == null)
            {
                return sqlCommand;
            }

            StringBuilder authstring = new StringBuilder();
            List<string> auths = new List<string>();

            if (queryConfig.Entitlements != null && queryConfig.Entitlements.Count > 0)
            {
                bool hasSomeAccess = false;

                foreach (Entitlement entitlement in queryConfig.Entitlements)
                {
                    foreach (CategoryAuthorisation auth in authorisation.Authorisations.Where(a => a.Name.Equals(entitlement.AuthName, StringComparison.OrdinalIgnoreCase)))
                    {
                        hasSomeAccess = true;
                        List<string> categoryAuths = new List<string>();

                        if (!string.IsNullOrEmpty(entitlement.AuthNameColumnName))
                        {
                            categoryAuths.Add(string.Format("{0}={1}", entitlement.AuthNameColumnName, !string.IsNullOrEmpty(entitlement.AuthNameValue) ? entitlement.AuthNameValue : entitlement.AuthName));
                        }

                        if (!string.IsNullOrEmpty(entitlement.TrialSql) && auth.Trial)
                        {
                            categoryAuths.Add(entitlement.TrialSql);
                        }

                        if (!sqlCommand.Contains(AbstractSqlProvider.IgnoreEntitlementFilters) && entitlement.Filters != null && entitlement.Filters.Count > 0)
                        {
                            List<string> authFilters = new List<string>();
                            foreach (EntitlementFilter entFilter in entitlement.Filters)
                            {
                                List<string> myFilters = new List<string>();
                                foreach (CategoryFilter filter in auth.Filters.Where(f => f.Type.Equals(entFilter.Name, StringComparison.OrdinalIgnoreCase)))
                                {
                                    if (string.IsNullOrEmpty(entitlementFilterMetaDataVal) || (filter.MetaData != null && filter.MetaData.Contains(entitlementFilterMetaDataVal)))
                                    {
                                        myFilters.Add(string.Format("'{0}'", filter.Value.Replace("'", "''")));
                                    }
                                }

                                if (myFilters.Count > 0)
                                {
                                    authFilters.Add(string.Format("({0} IN ({1}))", entFilter.ColumnName, string.Join(",", myFilters)));
                                }
                                else if (myFilters.Count == 0 && !string.IsNullOrWhiteSpace(entitlementFilterMetaDataVal)
                                    && auth.Filters.Count(f => f.Type.Equals(entFilter.Name, StringComparison.OrdinalIgnoreCase)) > 0)
                                {
                                    // We are expecting entitlementFilterMetaDataVal in the filters else they are not allowed in.
                                    authFilters.Add(string.Format("( 399=499 )"));
                                }
                            }

                            if (authFilters.Count > 0)
                            {
                                categoryAuths.Add(string.Join(" OR ", authFilters));
                            }
                        }

                        if (categoryAuths.Count > 0)
                        {
                            auths.Add(string.Format("({0})", string.Join(" AND ", categoryAuths.ToArray())));
                        }
                    }
                }

                if (!hasSomeAccess)
                {
                    auths.Clear();
                    auths.Add("100=200");
                }
            }
            else
            {
                //// TODO - Please use the new entitlement element configuration in your XML files. Below is the old way of doing entitlements.

                if (string.IsNullOrEmpty(entitlementProducts))
                {
                    throw new ArgumentException("Product entitlement must be supplied.");
                }

                // get the sub-products as well, as they will impact the query created.
                if (!string.IsNullOrEmpty(entitlementSubproducts))
                {
                    entitlementProducts += "," + entitlementSubproducts;
                }

                string[] productList = entitlementProducts.Split(",".ToArray(), StringSplitOptions.RemoveEmptyEntries);

                string authPattern = "{0}{1}";
                string filterPattern = "{0}";
                if (productList.Length > 1 && !string.IsNullOrEmpty(entitlementColumnName))
                {
                    authPattern = "(" + entitlementColumnName + " like '%{0}%'{1})";
                    filterPattern = " AND ({0})";
                }

                // loop through all the products to entitle against for each product, create an OR'ed
                // where clause in between each product where clause, add an OR then put ALL these in an AND
                foreach (string entitlementProductName in productList)
                {
                    foreach (CategoryAuthorisation auth in authorisation.Authorisations.Where(a => a.Name.Equals(entitlementProductName, StringComparison.OrdinalIgnoreCase)))
                    {
                        // might want to config for the column name which is currently set to 'product'
                        StringBuilder filterString = new StringBuilder();
                        if (auth.Filters.Count > 0)
                        {
                            List<string> filters = new List<string>();
                            foreach (CategoryFilter filter in auth.Filters)
                            {
                                if (string.IsNullOrEmpty(entitlementFilterMetaDataVal) || (filter.MetaData != null && filter.MetaData.Contains(entitlementFilterMetaDataVal)))
                                {
                                    if (filter.Value.Contains(","))
                                    {
                                        string[] splitArr = filter.Value.Split(',');
                                        for (int i = 0; i < splitArr.Length; i++)
                                        {
                                            string sqlFilter = string.Format(
                                            CultureInfo.InvariantCulture,
                                            "{0} = '{1}'",
                                            (!string.IsNullOrEmpty(entitlementColumnName)) ? entitlementColumnName : AbstractSqlProvider.MapCodeNameToSqlName(filter.Type, category, queryName),
                                            splitArr[i].Replace("'", "''"));
                                            filters.Add(sqlFilter);
                                        }
                                    }
                                    else
                                    {
                                        string sqlFilter = string.Format(
                                            CultureInfo.InvariantCulture,
                                            "{0} = '{1}'",
                                            (!string.IsNullOrEmpty(entitlementColumnName)) ? entitlementColumnName : AbstractSqlProvider.MapCodeNameToSqlName(filter.Type, category, queryName),
                                            filter.Value.Replace("'", "''"));
                                        filters.Add(sqlFilter);
                                    }
                                }
                            }

                            /** Make sure we check if NONE of the filters qualify, we need to ensure we AND the filters once a NOT is applied to it. **/
                            if (!string.IsNullOrEmpty(entitlementFilterMetaDataVal) && filters.Count == 0)
                            {
                                foreach (CategoryFilter filter in auth.Filters)
                                {
                                    if (filter.MetaData != null && !filter.MetaData.Contains(entitlementFilterMetaDataVal))
                                    {
                                        string sqlFilter = "100 = 200";
                                        filters.Add(sqlFilter);
                                        filterString.AppendFormat(CultureInfo.InvariantCulture, filterPattern, string.Join(" AND ", filters.ToArray()));
                                        break;
                                    }
                                }
                            }
                            else
                            {
                                if (filters.Count > 0)
                                {
                                    filterString.AppendFormat(CultureInfo.InvariantCulture, filterPattern, string.Join(" OR ", filters.ToArray()));
                                }
                            }
                        }

                        // if we have multiple products specified with this config, we need to link
                        // filters to products
                        string sqlAuth = string.Format(
                            CultureInfo.InvariantCulture,
                            authPattern,
                            (productList.Length > 1) ? entitlementProductName : string.Empty,
                            filterString);

                        if (!string.IsNullOrEmpty(sqlAuth))
                        {
                            auths.Add(sqlAuth);
                        }
                    }
                }
            }

            authstring.Append(string.Join(" OR ", auths.ToArray()));

            if (authstring.Length > 0)
            {
                authstring.Insert(0, Environment.NewLine);
                authstring.Insert(0, "AND (");
                authstring.Insert(0, Environment.NewLine);
                authstring.AppendLine(") ");
            }

            return Regex.Replace(sqlCommand, AbstractSqlProvider.WherePattern, AbstractSqlProvider.WherePattern + " " + authstring.ToString(), RegexOptions.IgnoreCase);
        }

        /// <summary>
        /// Replaces hint text placed in the SQL with supplied hint text.
        /// </summary>
        /// <param name="sql">The SQL to have replacements made.</param>
        /// <param name="search">The supplied search.</param>
        /// <param name="authorisations">The caller authorisations.</param>
        /// <param name="unassignedIdx">An output list of indexers not used in the search.</param>
        /// <param name="replacement">The replacements object.</param>
        /// <returns>
        /// SQL with the hint text replaced, also generates a list of unused indexers for the caller.
        /// </returns>
        private static string CheckHintReplacement(string sql, ISearch search, AaaAuthorisation authorisations, List<IIndexer> unassignedIdx, HintReplacement replacement)
        {
            bool replaced = false;

            if ((replacement.EntitlementHintReplacement != null) && (authorisations != null))
            {
                foreach (EntitlementHintReplacement ehr in replacement.EntitlementHintReplacement)
                {
                    CategoryAuthorisation catAuth = authorisations.Authorisations.FirstOrDefault(n => n.Name.Equals(ehr.AuthName, StringComparison.OrdinalIgnoreCase));
                    if (catAuth != null)
                    {
                        sql = sql.Replace(replacement.Hint, ehr.Sql);
                        replaced = true;
                    }
                }
            }

            // first check if we are talking about a userid replacement
            if (replacement.UserIdHintReplacement != null)
            {
                sql = sql.Replace(replacement.Hint, replacement.UserIdHintReplacement.Sql);
            }

            if (replacement.UserGroupIdHintReplacement != null)
            {
                string groupId = replacement.UserGroupIdHintReplacement.Sql;
                if (!string.IsNullOrEmpty(groupId))
                {
                    sql = sql.Replace(replacement.Hint, replacement.UserGroupIdHintReplacement.Sql);
                    replaced = true;
                }
            }

            // check if we are talking about a yearReplacement
            if (replacement.YearHintReplacement != null)
            {
                sql = sql.Replace(replacement.Hint, replacement.YearHintReplacement.Sql);
            }

            if (replacement.IndexerHintConstraintReplacement != null && replacement.IndexerHintConstraintReplacement.Count > 0 && sql.Contains(replacement.Hint))
            {
                bool done = false;
                string seperator = "','"; //TODO: When required, refactor to handle non-strings also
                var newSql = string.Empty;

                // check the indexerObjectKey, if it exists in selectedindexers then loop through
                // inner indexerHintReplacements. for each of the inners, check the search
                // constraints for ITS objectkey, if it exists get the constraint value and update sql
                foreach (var constraintReplacementHint in replacement.IndexerHintConstraintReplacement)
                {
                    if (!done)
                    {
                        bool doProcess = false;
                        if (constraintReplacementHint.IndexerObjectKey.Equals("*"))
                        {
                            doProcess = true;
                        }
                        else
                        {
                            foreach (var ixr in search.SelectedIndexers)
                            {
                                if (ixr.ObjectKey.Equals(constraintReplacementHint.IndexerObjectKey))
                                {
                                    doProcess = true;
                                    break;
                                }
                            }
                        }

                        if (doProcess)
                        {
                            foreach (var ihr in constraintReplacementHint.IndexerHintReplacement)
                            {
                                var constraint = GetConstraintByKey(search.Constraints, ihr.IndexerObjectKey);
                                if (constraint != null)
                                {
                                    //As and when people use this functionality more and more, we will cover more types of constraint
                                    var inConstraint = constraint as InConstraint;
                                    if (inConstraint != null)
                                    {
                                        string sep = "**SEPERATOR**"; //the real seperator has quotes so escape until we have escape quotes
                                        string values = string.Join("**SEPERATOR**", inConstraint.AttributeValues);
                                        newSql += ihr.Sql.Replace("[CONSTRAINT_VALUES]", values.Replace("'", "''").Replace(sep, seperator));
                                        done = true;
                                    }

                                    var equalsConstraint = constraint as EqualsConstraint;
                                    if (equalsConstraint != null)
                                    {
                                        newSql += ihr.Sql.Replace("[CONSTRAINT_VALUES]",
                                            equalsConstraint.AttributeValue.ToString().Replace("'", "''"));
                                        done = true;
                                    }
                                }
                            }
                        }
                    }
                }

                if (string.IsNullOrWhiteSpace(newSql))
                {
                    newSql = replacement.DefaultReplacement;
                }

                sql = sql.Replace(replacement.Hint, newSql);
                replaced = true;
            }

            foreach (var ixr in search.SelectedIndexers)
            {
                if (!replaced)
                {
                    // look them up in the column parameter list and replace the hint.
                    IndexerHintReplacement idxReplacement = replacement.IndexerHintReplacement.FirstOrDefault(f => f.IndexerObjectKey == ixr.ObjectKey);
                    if (idxReplacement != null)
                    {
                        sql = sql.Replace(replacement.Hint, idxReplacement.Sql);
                        replaced = true;
                    }
                }

                if (ixr.Type == AttributeType.UNASSIGNED_TYPE || !string.IsNullOrEmpty(ixr.GetMetaDataValue("treatasUnassigned")))
                {
                    unassignedIdx.Add(ixr);
                }
            }

            if (!replaced)
            {
                foreach (var ixr in search.SelectedIndexers)
                {
                    // are we looking for an indexer which begins with the specifiec BeginsWith
                    // attribute in the xml?
                    IndexerHintReplacement idxReplacement = replacement.IndexerHintReplacement.FirstOrDefault(f => f.BeginsWith != null &&
                            ixr.ObjectKey.ToUpperInvariant().StartsWith(f.BeginsWith, StringComparison.OrdinalIgnoreCase));
                    if (idxReplacement != null)
                    {
                        string endsWith = ixr.ObjectKey.Replace(idxReplacement.BeginsWith, string.Empty);
                        sql = sql.Replace(replacement.Hint, idxReplacement.Sql.Replace("{0}", endsWith));
                        replaced = true;
                    }
                }
            }

            if (!replaced)
            {
                // replace with the default
                sql = sql.Replace(replacement.Hint, replacement.DefaultReplacement);
            }

            return sql;
        }

        /// <summary>
        /// Replaces hint text placed in the SQL with supplied hint text. Removes unused indexers
        /// from the supplied search.
        /// </summary>
        /// <param name="sql">The SQL to have replacements made.</param>
        /// <param name="tsqlCategory">The T-SQL category object.</param>
        /// <param name="queryKey">The key to a specific query to check.</param>
        /// <param name="authorisations">The caller authorisations.</param>
        /// <param name="search">The supplied search.</param>
        /// <returns>SQL with the hint text replaced.</returns>
        private static string CheckHintReplacements(string sql, TSQLCategory tsqlCategory, string queryKey, AaaAuthorisation authorisations, ref Search search)
        {
            // look for UNASSIGNED indexers and map these to column parameters
            List<IIndexer> unassignedIdx = new List<IIndexer>();

            if (tsqlCategory.HintReplacements != null && tsqlCategory.HintReplacements.Count > 0)
            {
                foreach (HintReplacement replacement in tsqlCategory.HintReplacements)
                {
                    sql = CheckHintReplacement(sql, search, authorisations, unassignedIdx, replacement);
                }
            }

            if (tsqlCategory.TSQLQueries != null && tsqlCategory.TSQLQueries.Count > 0)
            {
                foreach (TSQLQuery query in tsqlCategory.TSQLQueries)
                {
                    if (query.Name.Equals(queryKey, StringComparison.OrdinalIgnoreCase) && query.HintReplacements != null && query.HintReplacements.Count > 0)
                    {
                        foreach (HintReplacement replacement in query.HintReplacements)
                        {
                            sql = CheckHintReplacement(sql, search, authorisations, unassignedIdx, replacement);
                        }
                    }
                }
            }

            // don't remove unassigned - they have dual use
            if (!sql.Contains("DONT_REMOVE_UNASSIGNEDIDX"))
            {
                foreach (IIndexer ixr in unassignedIdx)
                {
                    // remove unassigned indexers off the search in case we are using the indexers
                    // for the select.
                    search.SelectedIndexers.Remove(ixr);
                }
            }

            return sql;
        }

        /// <summary>
        /// Checks for the existence of the passed in indexer identifier within the supplied constraint.
        /// </summary>
        /// <param name="constraint">The constraint to search, may be a nested constraint.</param>
        /// <param name="indexer">The indexer to locate.</param>
        /// <returns>A value indicating whether the indexer was found.</returns>
        private static bool CheckIndexerExistsInConstraints(ISearchConstraint constraint, IIndexer indexer)
        {
            bool exists = false;

            CategoryConstraint cc = constraint as CategoryConstraint;
            if (cc != null)
            {
                if (cc.CategoryIDList.Contains(indexer.ID))
                {
                    exists = true;
                }
            }

            if (!exists)
            {
                // Deal with indexer constraints
                IndexerConstraint ic = constraint as IndexerConstraint;
                if (ic != null)
                {
                    if (ic.AttributeId.Equals(indexer.AttributeID, StringComparison.OrdinalIgnoreCase))
                    {
                        exists = true;
                    }
                    else if (ic.Indexer.ObjectKey.Equals(indexer.ObjectKey))
                    {
                        exists = true;
                    }
                }
            }

            if (!exists)
            {
                OrNestedConstraint onc = constraint as OrNestedConstraint;
                if (onc != null)
                {
                    foreach (ISearchConstraint itemConst in onc)
                    {
                        exists = CheckIndexerExistsInConstraints(itemConst, indexer);
                        if (exists)
                        {
                            break;
                        }
                    }
                }
            }

            if (!exists)
            {
                AndNestedConstraint anc = constraint as AndNestedConstraint;
                if (anc != null)
                {
                    foreach (ISearchConstraint itemConst in anc)
                    {
                        exists = CheckIndexerExistsInConstraints(itemConst, indexer);
                        if (exists)
                        {
                            break;
                        }
                    }
                }
            }

            return exists;
        }

        /// <summary>
        /// Adjust the SQL string to do a count instead of a select.
        /// </summary>
        /// <param name="sql">The SQL statement to be altered.</param>
        /// <returns>A SQL statement which will perform a count of items.</returns>
        /// <remarks>
        /// NOTE: if there is a count hint specified this directs the parser to the correct
        ///       location, it is intended to be used if we use more than 1 select in a SQL query.
        /// </remarks>
        private static string CreateCountSQL(string sql)
        {
            string countSql = string.Empty;

            // try to match with count hint first
            Regex expression = new Regex(Regex.Escape(CountHintStartPattern) + ".*?" + Regex.Escape(CountHintEndPattern), RegexOptions.IgnoreCase | RegexOptions.Singleline);
            if (expression.IsMatch(sql))
            {
                countSql = expression.Replace(sql, " SELECT COUNT(*) FROM ", 1);
            }
            else
            {
                // fall back to trying to find the **first** select statement, ensure the "FROM"
                // we're looking for is followed by whitespace & not for instance in the middle of a
                // column name!!
                expression = new Regex(@"SELECT.*?FROM\s", RegexOptions.IgnoreCase | RegexOptions.Singleline);
                if (expression.IsMatch(sql))
                {
                    countSql = expression.Replace(sql, " SELECT COUNT(*) FROM ", 1);
                }
            }

            return countSql;
        }

        /// <summary>
        /// Retrieves all possible indexer prefixes from category metadata.
        /// </summary>
        /// <param name="category">The category to get the indexer prefixes for.</param>
        /// <returns>A list of the indexer prefixes from category metadata.</returns>
        /// <remarks>NOTE: not all indexers may use the same prefix.</remarks>
        private static List<string> GetAllIndexerPrefixes(ICategory category)
        {
            string defaultPrefix = GetDefaultIndexerPrefix(category);
            string morePrefixes = category.GetMetaDataValue("AdditionalIndexerPrefixes");
            if (morePrefixes == null)
            {
                morePrefixes = string.Empty;
            }

            return new List<string>((defaultPrefix + "," + morePrefixes).Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries));
        }

        /// <summary>
        /// Retrieves the category that the search is working for.
        /// </summary>
        /// <param name="search">The search to get the category from.</param>
        /// <returns>The category the search uses.</returns>
        private static ICategory GetCategoryFromSearch(ISearch search)
        {
            ICategory category = null;
            CategorySource source = search.SearchSource as CategorySource;
            if (source != null)
            {
                category = source.Categories[0];
            }
            else
            {
                category = search.SearchSource as ProviderCategory;
            }

            if (category == null)
            {
                throw new NotSupportedException("Only category searching valid at this point.");
            }

            return category;
        }

        /// <summary>
        /// De-serializes the configuration.
        /// </summary>
        /// <param name="fileLocation">The full qualified file name.</param>
        /// <returns>A configuration object.</returns>
        private static TSQLConfig GetConfig(string fileLocation)
        {
            TSQLConfig config = null;
            XmlSerializer s = new XmlSerializer(typeof(TSQLConfig));
            using (XmlTextReader r = new XmlTextReader(fileLocation))
            {
                config = (TSQLConfig)s.Deserialize(r);
            }

            return config;
        }

        /// <summary>
        /// Retrieves the default indexer prefix from category metadata.
        /// </summary>
        /// <param name="category">The category to get the default indexer prefix for.</param>
        /// <returns>The default indexer prefix from category metadata.</returns>
        /// <remarks>
        /// NOTE: not all indexers may use the same prefix, this method gets the default one!
        /// </remarks>
        private static string GetDefaultIndexerPrefix(ICategory category)
        {
            string indexerPrefix = category.GetMetaDataValue("IndexerPrefix");
            if (indexerPrefix == null)
            {
                indexerPrefix = string.Empty;
            }

            return indexerPrefix;
        }

        /// <summary>
        /// Retrieves the item identifier indexer, if one is defined, from category metadata.
        /// </summary>
        /// <param name="category">The category to get the item identifier indexer for.</param>
        /// <returns>The item identifier indexer from category metadata.</returns>
        private static string GetItemIdIndexer(ICategory category)
        {
            string itemIdIndexer = category.GetMetaDataValue("ItemIdIndexer");
            if (string.IsNullOrWhiteSpace(itemIdIndexer))
            {
                itemIdIndexer = string.Empty;
            }

            return itemIdIndexer;
        }

        /// <summary>
        /// Gets a column ordinal from the supplied field ordinal map for the supplied indexer name.
        /// </summary>
        /// <param name="fieldOrdinalMap">The field ordinal map.</param>
        /// <param name="indexerName">The name of the indexer to find.</param>
        /// <returns>
        /// If the indexer name can be found in the field ordinal map returns the associated
        /// ordinal, otherwise returns -1.
        /// </returns>
        private static int GetOrdinalForIndexer(Dictionary<string, int> fieldOrdinalMap, string indexerName)
        {
            int output = -1;

            KeyValuePair<string, int> fieldOrdinal = fieldOrdinalMap.FirstOrDefault(f => f.Key.Equals(indexerName, StringComparison.OrdinalIgnoreCase));
            if (fieldOrdinal.Key != null)
            {
                output = fieldOrdinal.Value;
            }

            return output;
        }

        /// <summary>
        /// Determines the name of the query to use.
        /// </summary>
        /// <param name="search">The search being performed.</param>
        /// <returns>The name of the query to use.</returns>
        /// <remarks>Defaults to "default" if no name is supplied.</remarks>
        private static string GetQueryName(ISearch search)
        {
            if (search == null)
            {
                throw new ArgumentNullException("search");
            }

            return string.IsNullOrEmpty(search.Name) ? "default" : search.Name;
        }

        /// <summary>
        /// Gets the indexer names for using in the SELECT statement from the search indexers.
        /// </summary>
        /// <param name="category">The category being searched.</param>
        /// <param name="search">The search object.</param>
        /// <returns>A comma separated string of indexer names.</returns>
        /// <remarks>
        /// If the indexer used to identifier the item is not included in the search this code will
        /// attempt to add it and create an error log entry if it cannot do that.
        /// </remarks>
        private static string GetWebServiceQueryIndexerNames(ICategory category, ISearch search)
        {
            // get the indexer names from the supplied search
            var indexerNames = from i in search.Indexers
                               select i.DisplayName;

            // ensure that an ITEMID column is included, if possible
            string indexerPrefix = GetDefaultIndexerPrefix(category);
            string itemIdIndexer = GetItemIdIndexer(category);
            string itemIndexerName = indexerPrefix + itemIdIndexer;
            IIndexer itemIndexer = (from si in search.Indexers
                                    where si.DisplayName.Equals(itemIndexerName, StringComparison.OrdinalIgnoreCase)
                                    select si).FirstOrDefault();

            if (itemIndexer == null)
            {
                // indicates the indexer used for ITEMID is not included in the search, need to add
                // it. Try to find it on the category
                itemIndexer = (from ci in category.Indexers
                               where ci.DisplayName.Equals(itemIndexerName, StringComparison.OrdinalIgnoreCase)
                               select ci).FirstOrDefault();
                if (itemIndexer == null)
                {
                    // the configuration must be incorrect, flag an error message for development
                    string message = string.Format(
                        CultureInfo.InvariantCulture,
                        "Unable to locate ITEMID indexer '{0}' for category '{1}'. Query results may be shipping without an ITEM element id attribute value.",
                        itemIndexerName,
                        category.ObjectKey);
                    Log.Error(message);
                }
                else
                {
                    indexerNames = indexerNames.Concat(new List<string> { itemIndexer.DisplayName });
                }
            }

            return string.Join(",", indexerNames);
        }

        /// <summary>
        /// Maps an indexer name into a column name in the database if they are different.
        /// </summary>
        /// <param name="codename">The name of the indexer.</param>
        /// <param name="category">The search category.</param>
        /// <param name="queryName">The name of the query.</param>
        /// <returns>Either the <paramref name="codename"/> or the SQL name read from configuration.</returns>
        private static string MapCodeNameToSqlName(string codename, TSQLCategory category, string queryName)
        {
            string sqlName = (from q in category.TSQLQueries
                              from p in q.Parameters
                              where q.Name.Equals(queryName, StringComparison.OrdinalIgnoreCase)
                                && p.CodeName.Equals(codename, StringComparison.OrdinalIgnoreCase)
                              select p.SqlName).FirstOrDefault();

            // check the category parameters collection to see if it exists there also
            if (string.IsNullOrEmpty(sqlName))
            {
                sqlName = (from p in category.Parameters
                           where p.CodeName.Equals(codename, StringComparison.OrdinalIgnoreCase)
                           select p.SqlName).FirstOrDefault();
            }

            // what about a beginsWith attribute? Notice that specific matches on the attributeName
            // come first
            if (string.IsNullOrEmpty(sqlName))
            {
                sqlName = UpdateSqlNameForBeginsWithScenarios(codename, category, sqlName);
            }

            return string.IsNullOrEmpty(sqlName) ? codename : sqlName;
        }

        /// <summary>
        /// Maps an indexer name into a column name in the database if they are different.
        /// </summary>
        /// <param name="codenames">The name of the indexer.</param>
        /// <param name="category">The search category.</param>
        /// <param name="queryName">The name of the query.</param>
        /// <param name="delimeter">The string used to delimit indexer names.</param>
        /// <param name="includeAliasing">A value indicating whether to alias the SQL column name.</param>
        /// <param name="includeSQLSelectString">A value indicating whether to use the SQLSelectString property if it exists.</param>
        /// <returns>Either the <paramref name="codenames"/> or the SQL name read from configuration.</returns>
        /// <example>
        /// Using indexers 'indexer1, indexer2, indexer3' if indexer2 &amp; indexer3 had diff SQL names:
        /// <para>
        /// With aliasing enabled it would be something like 'indexer1, SQLIndexer2 as indexer2,
        /// SQLIndexer3 as indexer3'.
        /// </para>
        /// <para>Without aliasing enabled it would be something like 'indexer1, SQLIndexer2, SQLIndexer3'.</para>
        /// </example>
        private static string MapMultipleCodeNameToSqlNameWithAliasing(string codenames, TSQLCategory category, string queryName, string delimeter, bool includeAliasing, bool includeSQLSelectString)
        {
            List<string> values = new List<string>();
            foreach (string codename in codenames.Split(new string[] { delimeter }, StringSplitOptions.RemoveEmptyEntries))
            {
                // check the query first for specific mapping
                string sqlName = (from q in category.TSQLQueries
                                  from p in q.Parameters
                                  where q.Name.Equals(queryName, StringComparison.OrdinalIgnoreCase)
                                    && p.CodeName.Equals(codename, StringComparison.OrdinalIgnoreCase)
                                  select includeSQLSelectString ? p.SQLSelectString : p.SqlName).FirstOrDefault();

                // check the category parameters collection to see if it exists there also
                if (string.IsNullOrEmpty(sqlName))
                {
                    sqlName = (from p in category.Parameters
                               where p.CodeName.Equals(codename, StringComparison.OrdinalIgnoreCase)
                               select p.SqlName).FirstOrDefault();
                }

                // what about a beginsWith attribute? Notice that specific matches on the
                // attributeName come first
                if (string.IsNullOrEmpty(sqlName))
                {
                    sqlName = UpdateSqlNameForBeginsWithScenarios(codename, category, sqlName);
                }

                values.Add(string.IsNullOrEmpty(sqlName) ? codename : sqlName + (includeAliasing ? " as " + codename : string.Empty));
            }

            return string.Join(",", values);
        }

        /// <summary>
        /// Removes the count hint from the supplied SQL statement.
        /// </summary>
        /// <param name="sql">The SQL statement to remove the count hint from.</param>
        /// <returns>The SQL statement with the count hint removed.</returns>
        private static string RemoveCountHints(string sql)
        {
            return AbstractSqlProvider.ValidatedReplace(
                AbstractSqlProvider.ValidatedReplace(sql, Regex.Escape(AbstractSqlProvider.CountHintEndPattern)),
                Regex.Escape(AbstractSqlProvider.CountHintStartPattern));
        }

        /// <summary>
        /// Rip through the constraints specified and remove any which are specified as Ignore=true
        /// in the T-SQL xml query adapter parameters collection.
        /// </summary>
        /// <param name="nestedConstraint">The nested constraint to search through.</param>
        /// <param name="ignoreableAdaptersParams">The list of ignorable parameters.</param>
        /// <param name="category">The category object.</param>
        [SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Justification = "Indexers are lower cased.")]
        private static void RemoveIgnoreableConstraints(NestedConstraint nestedConstraint, List<AdapterParameter> ignoreableAdaptersParams, ICategory category)
        {
            if (ignoreableAdaptersParams == null || ignoreableAdaptersParams.Count == 0)
            {
                return;
            }

            foreach (AdapterParameter adp in ignoreableAdaptersParams)
            {
                IIndexer indexer = category.Indexers.Get(adp.CodeName, Core.Common.IdentifierType.KEY);
                if (indexer == null)
                {
                    indexer = category.Indexers.Get(adp.CodeName.ToLowerInvariant(), Core.Common.IdentifierType.KEY);
                }

                if (indexer != null)
                {
                    nestedConstraint.RemoveRecursive(indexer.ObjectKey);
                }
            }
        }

        /// <summary>
        /// Removes the <c>IndexersSqlPattern</c> and <c>IndexersSqlGroupByPattern</c> from the
        /// supplied SQL.
        /// </summary>
        /// <param name="sql">The SQL query to alter.</param>
        /// <returns>The updated SQL query string.</returns>
        private static string RemoveIndexerHints(string sql)
        {
            return sql.Replace(AbstractSqlProvider.IndexersSqlPattern, string.Empty).Replace(AbstractSqlProvider.IndexersSqlGroupByPattern, string.Empty).Replace(AbstractSqlProvider.IndexersSqlNoAliasNoMappingPattern, string.Empty);
        }

        /// <summary>
        /// Remove the order by hints from the supplied SQL statement.
        /// </summary>
        /// <param name="sql">The SQL statement to remove the order by hints from.</param>
        /// <returns>The SQL statement with the hints removed.</returns>
        private static string RemoveOrderByHints(string sql)
        {
            return AbstractSqlProvider.ValidatedReplace(
                AbstractSqlProvider.ValidatedReplace(sql, Regex.Escape(AbstractSqlProvider.OrderByEndPattern)),
                Regex.Escape(AbstractSqlProvider.OrderByStartPattern));
        }

        /// <summary>
        /// Removes the paging hints from the supplied SQL statement.
        /// </summary>
        /// <param name="sql">The SQL statement to remove the paging hints from.</param>
        /// <returns>The SQL statement with the paging hints removed.</returns>
        private static string RemovePagingHints(string sql)
        {
            return AbstractSqlProvider.ValidatedReplace(
                AbstractSqlProvider.ValidatedReplace(
                AbstractSqlProvider.ValidatedReplace(sql, Regex.Escape(AbstractSqlProvider.PagingStartPattern)),
                Regex.Escape(AbstractSqlProvider.PagingEndPattern)),
                Regex.Escape(AbstractSqlProvider.DontPageDataPattern));
        }

        /// <summary>
        /// Replaces the supplied hints with the provided values in the supplied SQL statement.
        /// </summary>
        /// <param name="sql">The SQL statement to replace hints in.</param>
        /// <param name="allHintReplacements">The key value pair hints.</param>
        /// <returns>The SQL statement with the hints replaced.</returns>
        private static string RemoveReplacementHints(string sql, ConcurrentDictionary<string, string> allHintReplacements)
        {
            foreach (KeyValuePair<string, string> hint in allHintReplacements)
            {
                sql = sql.Replace(hint.Key, hint.Value);
            }

            return sql;
        }

        /// <summary>
        /// Get the last part of an indexer and inject into <paramref name="injectionString"/> ,
        /// used for aliasing with joining to the same table many times first used in JDSF.
        /// </summary>
        /// <param name="ixrPrefix">
        /// The part of the indexer object key to remove before doing the replace.
        /// </param>
        /// <param name="injectionString">The bit to find {0} to replace.</param>
        /// <param name="ixrObjectKey">
        /// The object key of the indexer; replace <paramref name="ixrPrefix"/> with empty string to
        /// get the unique string to inject into <paramref name="injectionString"/> .
        /// </param>
        /// <returns>The updated <paramref name="injectionString"/> .</returns>
        private static string ReplaceAttributeSuffix(string ixrPrefix, string injectionString, string ixrObjectKey)
        {
            return Environment.NewLine + injectionString.Replace("{0}", ixrObjectKey.Replace(ixrPrefix, string.Empty));
        }

        /// <summary>
        /// Replace a join conditions hint in the SQL command with a category level join conditions
        /// element text - reduces duplication.
        /// </summary>
        /// <param name="query">Query to edit.</param>
        /// <param name="tsqlConfig">Category to use to get the conditions.</param>
        private static void SubstituteReplaceableJoinConditions(TSQLQuery query, TSQLCategory tsqlConfig)
        {
            query.SqlCommand = AbstractSqlProvider.ValidatedReplace(
                query.SqlCommand,
                Regex.Escape(AbstractSqlProvider.JoinConditionsPattern),
                string.IsNullOrEmpty(tsqlConfig.JoinConditions) ? string.Empty : tsqlConfig.JoinConditions);
        }

        /// <summary>
        /// SIMPLE PRE SQL TEXT PARSER IF_USED hint is in the following format
        /// (IF_USED::CUSTOMUSERSEGMENT1::A::B) IF CUSTOMUSERSEGMENT1 is either a selected indexer
        /// OR in a constraint then write out A else B it is initially intended to comment out joins
        /// to tables when they are not required but does have more applications.
        /// </summary>
        /// <param name="sql">Pre-SQL from the xml file.</param>
        /// <param name="search">Current search Constraints to parse.</param>
        /// <returns>Updated SQL statement.</returns>
        private static string UpdateIfUsedHints(string sql, ISearch search)
        {
            const string IfUsedHint = "(IF_USED::";
            const string RightBracket = ")";
            IIndexer idx = null;
            bool constraintIfExistsHintPresent = false;
            NestedConstraint nestedConstraint = null;
            if (search != null && search.Constraints != null)
            {
                nestedConstraint = search.Constraints;
            }

            bool isUsed = false;

            if (sql.Contains(IfUsedHint))
            {
                constraintIfExistsHintPresent = true;
            }

            while (constraintIfExistsHintPresent)
            {
                isUsed = false;
                int start = sql.IndexOf(IfUsedHint, StringComparison.Ordinal);
                int end = sql.IndexOf(RightBracket, start, StringComparison.OrdinalIgnoreCase);

                string constraintSpecified = sql.Substring(start + 1, end - 1 - start);
                string[] bits = constraintSpecified.Split(new string[] { "::" }, StringSplitOptions.None);

                if (search != null)
                {
                    idx = search.Indexers.FirstOrDefault(i => i.ObjectKey == bits[1]);
                    if (idx == null)
                    {
                        idx = search.SearchSource.Indexers.FirstOrDefault(i => i.ObjectKey == bits[1]);
                    }

                    if (idx != null)
                    {
                        // is it a selected indexer?
                        if (search.SelectedIndexers.Contains(idx))
                        {
                            isUsed = true;
                        }
                        else
                        {
                            isUsed = CheckIndexerExistsInConstraints(nestedConstraint, idx);
                        }
                    }

                    if (!isUsed && idx != null)
                    {
                        isUsed = CheckIndexerExistsInConstraints(nestedConstraint, idx);
                    }
                }

                if (isUsed)
                {
                    sql = sql.Substring(0, start) + bits[2] + sql.Substring(end + 1);
                }
                else
                {
                    sql = sql.Substring(0, start) + bits[3] + sql.Substring(end + 1);
                }

                if (!sql.Contains(IfUsedHint))
                {
                    constraintIfExistsHintPresent = false;
                }
            }

            return sql;
        }

        /// <summary>
        /// Updates the SQL query so far with the generated constraints statement.
        /// </summary>
        /// <param name="sql">The SQL statement being generated.</param>
        /// <param name="constraintsSQL">The generated constraints statement.</param>
        /// <param name="replacementPattern">The pattern to be replaced.</param>
        /// <returns>The SQL statement with the constraints integrated.</returns>
        private static string UpdateSqlConstraintClauses(string sql, string constraintsSQL, string replacementPattern)
        {
            if (constraintsSQL == null)
            {
                throw new ArgumentNullException("constraintsSQL");
            }

            string replacement = string.Format(
                CultureInfo.InvariantCulture,
                " {0} {1}{2} ",
                replacementPattern,
                string.IsNullOrEmpty(constraintsSQL) ? string.Empty : "AND ",
                constraintsSQL);
            return Regex.Replace(sql, replacementPattern, replacement, RegexOptions.IgnoreCase);
        }

        /// <summary>
        /// If (CONSTRAINT_IF_EXISTS::A::B::C::D) exists in SQL, will replace the WHOLE constraint
        /// part with the value of A if it exists as a search constraint, else write out B to
        /// replace the WHOLE constraint part as a string, C replace if not exists, D Boolean to
        /// remove the constraint from the search.
        /// </summary>
        /// <param name="sql">The SQL statement to update.</param>
        /// <param name="search">The search object being used.</param>
        /// <param name="prefetching">
        /// Set to true in pre-fetch function - always returns the last part, doesn't check.
        /// </param>
        /// <param name="isOracle">Indicates if it's a oracle provider</param>
        /// <returns>The updated SQL statement.</returns>
        private static string UpdateSqlConstraintIfExistsHints(string sql, ISearch search, bool prefetching, bool isOracle)
        {
            NestedConstraint nestedConstraint = null;
            if (search != null && search.Constraints != null)
            {
                nestedConstraint = search.Constraints;
            }

            sql = UpdateIfUsedHints(sql, search);

            MatchCollection matches = Regex.Matches(sql, @"\(CONSTRAINT_IF_EXISTS::.*?::.*?::.*?(?:::.*)?\)", RegexOptions.IgnoreCase);
            for (int i = matches.Count; i > 0; i--)
            {
                Match match = matches[i - 1];
                string[] bits = match.Value.Split(new string[] { "::" }, StringSplitOptions.None);
                int start = match.Index;
                int end = start + match.Length;

                // replace special keywords in bits[3] with SQL, designed to be an escape route for
                // brackets in SQL
                if (isOracle)
                {
                    bits[3] = bits[3].Replace("**THISYEAR**", "extract(year from SYSDATE)");
                }
                else
                {
                    bits[3] = bits[3].Replace("**THISYEAR**", "datepart(yyyy,getdate())");
                }

                if (prefetching)
                {
                    // we have no constraint with this name, time to inject the second part of the hint.
                    sql = sql.Substring(0, start) + bits[3] + sql.Substring(end);
                }
                else
                {
                    var constraint = GetConstraintByKey(nestedConstraint, bits[1]);
                    if (constraint == null)
                    {
                        sql = sql.Substring(0, start) + bits[3] + sql.Substring(end);
                    }
                    else
                    {
                        bool first = true;
                        string newsql = string.Empty;
                        bool addParantheses = true;

                        while (constraint != null)
                        {
                            if (!first)
                            {
                                newsql += " OR ";
                            }

                            if (!string.IsNullOrEmpty(bits[2]))
                            {
                                newsql += "(";
                            }

                            RangeConstraint range;
                            EqualsConstraint equalsConstraint;
                            NotEqualsConstraint notEqualsConstraint;
                            InConstraint inConstraint;
                            NotInConstraint notInConstraint;
                            WildCardConstraint wildcardConstraint;
                            GeoBoxConstraint geoBoxConstraint;
                            if ((range = constraint as RangeConstraint) != null)
                            {
                                string rangeSql = string.Empty;

                                bool hasMin = range.MinInclusive && range.Min != null;
                                bool hasMax = range.MaxInclusive && range.Max != null;

                                if (hasMin && hasMax)
                                {
                                    rangeSql = " between '" + range.Min.ToString() + "' and '" + range.Max.ToString() + "' ";
                                }

                                if (!hasMin && hasMax)
                                {
                                    rangeSql = " <= '" + range.Max.ToString() + "' ";
                                }

                                if (hasMin && !hasMax)
                                {
                                    rangeSql = " >= '" + range.Min.ToString() + "' ";
                                }

                                newsql += bits[2] + rangeSql;
                            }
                            else if ((equalsConstraint = constraint as EqualsConstraint) != null)
                            {
                                // TODO: use quotes if needed here
                                if (!string.IsNullOrEmpty(bits[2]))
                                {
                                    newsql += bits[2];
                                    if (equalsConstraint.AttributeValue == null)
                                    {
                                        newsql += " is null";
                                    }
                                    else
                                    {
                                        newsql += " = '" + equalsConstraint.AttributeValue.ToString() + "'";
                                    }
                                }
                                else
                                {
                                    newsql += equalsConstraint.AttributeValue.ToStringSafe(string.Empty);
                                }
                            }
                            else if ((notEqualsConstraint = constraint as NotEqualsConstraint) != null)
                            {
                                // TODO: use quotes if needed here
                                if (!string.IsNullOrEmpty(bits[2]))
                                {
                                    newsql += bits[2];
                                    if (notEqualsConstraint.AttributeValue == null)
                                    {
                                        newsql += " is not null";
                                    }
                                    else
                                    {
                                        newsql += " <> '" + notEqualsConstraint.AttributeValue.ToString() + "'";
                                    }
                                }
                                else
                                {
                                    newsql += notEqualsConstraint.AttributeValue.ToStringSafe(string.Empty);
                                }
                            }
                            else if ((wildcardConstraint = constraint as WildCardConstraint) != null)
                            {
                                newsql += bits[2] + " LIKE '%" + wildcardConstraint.WildCardPatternValue.ToStringSafe(string.Empty) + "%'";
                            }
                            else if ((inConstraint = constraint as InConstraint) != null)
                            {
                                newsql += bits[2] + " IN (";
                                foreach (var val in inConstraint.AttributeValues)
                                {
                                    newsql += "'" + val + "',";
                                }

                                if (newsql.Length > 0)
                                {
                                    newsql = newsql.Chop(1);
                                }

                                newsql += ")";
                            }
                            else if ((notInConstraint = constraint as NotInConstraint) != null)
                            {
                                newsql += bits[2] + " NOT IN (";
                                foreach (var val in notInConstraint.AttributeValues)
                                {
                                    newsql += "'" + val + "',";
                                }

                                if (newsql.Length > 0)
                                {
                                    newsql = newsql.Chop(1);
                                }

                                newsql += ")";
                            }
                            else if (constraint is SearchBehaviorConstraint || constraint is IndexedSearchBehaviorConstraint)
                            {
                                // special case for this one. we don't put meta data in just the part
                                // A from the hint
                                newsql = bits[2];
                                addParantheses = false;
                            }
                            else if ((geoBoxConstraint = constraint as GeoBoxConstraint) != null)
                            {
                                StringBuilder geographySB = new StringBuilder();
                                geographySB.AppendFormat("'POLYGON(({0} {1},", geoBoxConstraint.SouthWest.Longitude, geoBoxConstraint.SouthWest.Latitude);
                                double interpolation = (geoBoxConstraint.NorthEast.Longitude - geoBoxConstraint.SouthWest.Longitude) / 10;
                                for (double lon = geoBoxConstraint.SouthWest.Longitude; lon < geoBoxConstraint.NorthEast.Longitude; lon += interpolation)
                                {
                                    geographySB.AppendFormat("{0} {1},", lon, geoBoxConstraint.SouthWest.Latitude);
                                }

                                geographySB.AppendFormat("{0} {1},", geoBoxConstraint.NorthEast.Longitude, geoBoxConstraint.SouthWest.Latitude);
                                geographySB.AppendFormat("{0} {1},", geoBoxConstraint.NorthEast.Longitude, geoBoxConstraint.NorthEast.Latitude);
                                for (double lon = geoBoxConstraint.NorthEast.Longitude; lon > geoBoxConstraint.SouthWest.Longitude; lon -= interpolation)
                                {
                                    geographySB.AppendFormat("{0} {1},", lon, geoBoxConstraint.NorthEast.Latitude);
                                }

                                geographySB.AppendFormat("{0} {1},", geoBoxConstraint.SouthWest.Longitude, geoBoxConstraint.NorthEast.Latitude);
                                geographySB.AppendFormat("{0} {1}))'", geoBoxConstraint.SouthWest.Longitude, geoBoxConstraint.SouthWest.Latitude);

                                if (first)
                                {
                                    newsql = newsql.Substring(0, newsql.Length - 1);
                                }
                                else
                                {
                                    newsql = newsql.Substring(0, newsql.Length - 5);
                                }

                                newsql += string.Format(bits[2], geographySB.ToString());
                                addParantheses = false;
                            }

                            if (constraint != null && bits.Length > 4 && bits[4].StartsWith("true", StringComparison.OrdinalIgnoreCase))
                            {
                                nestedConstraint.RemoveRecursive(constraint.Identifier);
                                constraint = GetConstraintByKey(nestedConstraint, bits[1]);
                            }
                            else
                            {
                                constraint = null;
                            }

                            first = false;

                            if (!string.IsNullOrEmpty(bits[2]) && addParantheses)
                            {
                                newsql += ")";
                            }
                        }

                        sql = sql.Substring(0, start) + newsql + sql.Substring(end);
                    }
                }
            }

            return sql;
        }

        /// <summary>
        /// Get a hash of a string.
        /// </summary>
        /// <param name="md5Hash">The hash function.</param>
        /// <param name="input">The string to hash.</param>
        /// <returns>A hashed string.</returns>
        private static string GetMd5Hash(MD5 md5Hash, string input)
        {
            // Convert the input string to a byte array and compute the hash.
            byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(input));

            // Create a new Stringbuilder to collect the bytes
            // and create a string.
            StringBuilder builder = new StringBuilder();

            // Loop through each byte of the hashed data
            // and format each one as a hexadecimal string.
            for (int i = 0; i < data.Length; i++)
            {
                builder.Append(data[i].ToString("x2"));
            }

            // Return the hexadecimal string.
            return builder.ToString();
        }

        /// <summary>
        /// Mechanism to deal with dynamic attributes
        /// (FOREACHUSED::CUSTOMUSERSEGMENTATTRIBUTE::FunctionToRun) this is the hint.
        /// </summary>
        /// <param name="sql">Sql to update.</param>
        /// <param name="search">Search to parse.</param>
        /// <param name="prefetching">Flag to indicate we are prefetching(loading attributes).</param>
        /// <returns>Corrected sql.</returns>
        private string UpdateSqlForEachUsedHints(string sql, ICategory category, TSQLCategory tsqlCat, ISearch search, bool prefetching)
        {
            NestedConstraint nestedConstraint = null;
            if (search != null && search.Constraints != null)
            {
                nestedConstraint = search.Constraints;
            }
        
            const string ForEachUsedHint = "|(FOREACHUSED::";
            const string RightBracketAndPipe = ")|";
            bool isUsed = false;
            bool forEachUsedHintPresent = false;
            string newSql = string.Empty;
            if (sql.Contains(ForEachUsedHint))
            {
                forEachUsedHintPresent = true;
            }

            while (forEachUsedHintPresent)
            {
                newSql = string.Empty;

                // find the first right bracket after hint - then we have the full constraint string
                int start = sql.IndexOf(ForEachUsedHint, StringComparison.InvariantCultureIgnoreCase);
                int end = sql.IndexOf(RightBracketAndPipe, start, StringComparison.InvariantCultureIgnoreCase);
                string fullhinttext = sql.Substring(start + 1, end - 1 - start);
                string[] bits = fullhinttext.Split(new string[] { "::" }, StringSplitOptions.None);

                if (prefetching)
                {
                    // ignore while pre-fetching, all the customUserSegmentAttributes get created elsewhere.
                    sql = sql.Substring(0, start) + bits[3] + sql.Substring(end + 1);
                }
                else
                {
                    // Loop Through all selectedIndexers and Constraint indexers if any being used
                    // start with bits[1] then run bits[2]. bits[2] might be reflected if we need
                    // more stuff. try in the smaller collection first
                    if (search != null)
                    {
                        foreach (var ixr in search.SearchSource.Indexers)
                        {
                            if (ixr.ObjectKey.StartsWith(bits[1], StringComparison.OrdinalIgnoreCase))
                            {
                                isUsed = false;

                                // is it a selected indexer?
                                if (search.SelectedIndexers.Contains(ixr))
                                {
                                    isUsed = true;
                                }
                                else
                                {
                                    isUsed = CheckIndexerExistsInConstraints(nestedConstraint, ixr);
                                }

                                // if this is used, we want to update the sql with the desired function name
                                if (isUsed)
                                {
                                    var constraint = GetConstraintByKey(nestedConstraint, "FULLTEXT");
                                    if (ixr.ObjectKey.Equals("LIKE_VW_SEARCH") && ((constraint != null) && constraint is SearchBehaviorConstraint))
                                    {
                                        newSql = ReplaceAttributeSuffix(bits[1], "(LIKE_VW_SEARCH)", ixr.ObjectKey);
                                        Search searchClone = (Search)search.Clone();
                                        newSql = AbstractSqlProvider.CheckHintReplacements(newSql, tsqlCat, bits[1], null, ref searchClone);
                                        newSql = newSql.Replace("{0}", "'" + bits[2].Trim() + "'");
                                        // process each constraint
                                        ConstraintsToSqlParser parser = new ConstraintsToSqlParser(category, newSql, this.FindSqlnameMapping, this.providerLocale);
                                        StringBuilder sqlExtra = new StringBuilder();
                                        parser.ParseOnlyBehaviorConstraints(sqlExtra, nestedConstraint);
                                        sqlExtra.Replace("(", "").Replace(")", "");
                                        string[] arraLike = sqlExtra.ToString().Split(new string[] { "|" }, StringSplitOptions.RemoveEmptyEntries);
                                        if (arraLike.Length > 0)
                                        {
                                            IndexerList indexers = new IndexerList();
                                            ProviderAttribute pa = new ProviderAttribute(Guid.NewGuid().ToString(), "LIKE_VW_SEARCH", AttributeType.STRING_TYPE, category);
                                            this.AssignAttributeToProviderCategory(category as ProviderCategory, indexers, pa, "LIKE_VW_SEARCH", null);

                                            if (indexers != null && indexers.Count > 0)
                                            {
                                                StringBuilder queryResult = new StringBuilder();
                                                var searchWords = string.Empty;
                                                searchWords = String.Join("|", arraLike);
                                                if (!string.IsNullOrEmpty(searchWords) && newSql.Contains("[dbo].[fn_Columns_Search_Builder]"))
                                                {
                                                    Log.Debug("Doing fetch-data for fn_View_RecordsID_Return.");

                                                    newSql = newSql.Replace("{1}", "'" + searchWords + "'");
                                                    newSql = newSql.Replace("{2}", "'|'"); //Delimiter

                                                    //this.PreFetchData(newSql, category, indexers, null, true);
                                                    DataTable dt = null;
                                                    IBuildResults<DataTable> builder = new DataTableBuildResults();

                                                    dt = this.FetchData(newSql, category, indexers, builder);
                                                    if (dt != null)
                                                    {
                                                        try
                                                        {
                                                            var moreThenOnce = string.Empty;
                                                            foreach (DataRow dr in dt.Rows)
                                                            {

                                                                var srtLike = dr["JDSF14*LIKE_VW_SEARCH"].ToString();
                                                                if (!string.IsNullOrEmpty(srtLike))
                                                                {
                                                                    queryResult.AppendFormat(moreThenOnce + " (" + srtLike + " ) \r\n", Environment.NewLine);
                                                                    moreThenOnce = " AND ";
                                                                }
                                                            }
                                                        }
                                                        catch (Exception ex)
                                                        {
                                                            queryResult.Clear();
                                                            Log.Debug("Catch Erro: queryResult for SQL: " + ex);
                                                            throw;
                                                        }
                                                    }
                                                    else
                                                    {
                                                        newSql = string.Empty;
                                                        break;
                                                    }
                                                }
                                                else
                                                {
                                                    newSql = string.Empty;
                                                    break;
                                                }
                                                //}
                                                newSql = queryResult.ToString();
                                            }
                                        }
                                        else
                                        {
                                            newSql = string.Empty;
                                        }

                                    }
                                    else
                                    {
                                        //newSql += ReplaceAttributeSuffix(bits[1], "(LIKE_VW_SEARCH)", ixr.ObjectKey);
                                        newSql = string.Empty;
                                    }
                                }
                            }
                        }
                    }
                }

                if (!string.IsNullOrEmpty(newSql))
                {
                    sql = sql.Substring(0, start) + newSql + sql.Substring(end + 2);
                }
                else
                {
                    sql = sql.Substring(0, start) + string.Empty + sql.Substring(end + 2);
                }

                // update the flag to see if there is more stuff to do.
                if (sql.Contains(ForEachUsedHint))
                {
                    forEachUsedHintPresent = true;
                }
                else
                {
                    forEachUsedHintPresent = false;
                }
            }

            return sql;
        }

        /// <summary>
        /// Update sql column names when an adapter parameter with 'BeginsWith' exists.
        /// </summary>
        /// <param name="codename">The name of the code.</param>
        /// <param name="category">The category to use.</param>
        /// <param name="sqlName">The initial column.</param>
        /// <returns>A string which matches the 'begins with' requirement.</returns>
        private static string UpdateSqlNameForBeginsWithScenarios(string codename, TSQLCategory category, string sqlName)
        {
            if (string.IsNullOrWhiteSpace(codename) || category == null || category.Parameters == null)
            {
                return sqlName;
            }

            sqlName = (from p in category.Parameters
                       where p.BeginsWith != null && codename.StartsWith(p.BeginsWith, StringComparison.OrdinalIgnoreCase)
                       select p.SqlName.Replace("{0}", codename.Replace(p.BeginsWith, string.Empty))).FirstOrDefault();
            return sqlName;
        }

        /// <summary>
        /// Adjusts the query to ensure 0 records are returned.
        /// </summary>
        /// <param name="input">The SQL statement to be modified.</param>
        /// <param name="replacementPattern">The pattern to be replaced.</param>
        /// <returns>The modified SQL statement.</returns>
        /// <remarks>Utilises the WHERE 1=1 command.</remarks>
        private static string UpdateSQLStringToEnsureZeroRowsAreReturned(string input, string replacementPattern)
        {
            if (replacementPattern.ToUpperInvariant().Contains("WHERE"))
            {
                return Regex.Replace(input, replacementPattern, " WHERE 1=0 ", RegexOptions.IgnoreCase);
            }
            else
            {
                return Regex.Replace(input, replacementPattern, " 1=0 ", RegexOptions.IgnoreCase);
            }
        }

        /// <summary>
        /// Replaces all occurrences of a specified string in a supplied string with the empty
        /// string. Uses Regex so meaningful characters in the pattern must be escaped.
        /// </summary>
        /// <param name="input">The string to replace the values in.</param>
        /// <param name="oldValue">The value to replace.</param>
        /// <exception cref="System.ArgumentException">
        /// The supplied input string is null or empty.
        /// </exception>
        /// <returns>The supplied string with replacements made.</returns>
        private static string ValidatedReplace(string input, string oldValue)
        {
            return AbstractSqlProvider.ValidatedReplace(input, oldValue, string.Empty);
        }

        /// <summary>
        /// Replaces all occurrences of a specified string in a supplied string with another
        /// specified string. Uses Regex so meaningful characters in the pattern must be escaped.
        /// </summary>
        /// <param name="input">The string to replace the values in.</param>
        /// <param name="oldValue">The value to replace.</param>
        /// <param name="newValue">The replacement value.</param>
        /// <exception cref="System.ArgumentException">
        /// The supplied input string is null or empty.
        /// </exception>
        /// <returns>The supplied string with replacements made.</returns>
        private static string ValidatedReplace(string input, string oldValue, string newValue)
        {
            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException("Input string cannot be null or empty.");
            }

            return Regex.Replace(input, oldValue, newValue, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        }

        /// <summary>
        /// Mechanism to insert the search signature into the query should we need it.
        /// </summary>
        /// <param name="sql">The sql to change.</param>
        /// <param name="search">The search to use in generating the signature.</param>
        /// <param name="authorisations">The authorisations to use in generating the signature.</param>
        /// <returns>The updated sql with the search signature replaced.</returns>
        private string UpdateSearchSignatureHints(string sql, ISearch search, AaaAuthorisation authorisations)
        {
            CacheHashInfo info = new CacheHashInfo()
            {
                ExpiryInMinutes = -1,
                Category = search.SearchSource as ICategory,
                Auths = authorisations,
                ProductDependency = this.productDependency,
                ProviderKey = this.Name,
                Search = search
            };

            CacheHashDetails cacheHashDetails = new CacheHashDetails(info);
            cacheHashDetails.GenerateSignature(info);
            string signature = string.Empty;
            using (MD5 md5Hash = MD5.Create())
            {
                signature = GetMd5Hash(md5Hash, cacheHashDetails.Signature);
            }

            return sql.Replace("(SEARCH_SIGNATURE)", signature);
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

        /// <summary>
        /// Creates a <see cref="IHS.Apps.CMP.DataProviders.Model.ProviderAttribute"/> from a
        /// supplied <see cref="IHS.Apps.CMP.DataProviders.AdapterParameter"/> before assigning it
        /// to the provided category.
        /// </summary>
        /// <param name="providerCategory">The category to assign the attribute to.</param>
        /// <param name="indexers">The indexer list to add the attribute to.</param>
        /// <param name="parameter">The column parameter to use.</param>
        /// <param name="metaData">Attribute metadata to be added as assigned.</param>
        private void CreateProviderAttribute(ProviderCategory providerCategory, CommonIndexerList<IIndexer> indexers, IndexerHintReplacement parameter, TSQLMetadata metaData)
        {
            ProviderAttribute a = new ProviderAttribute(
                Guid.NewGuid().ToString(),
                this.useUpperCaseIndexerNames ? parameter.IndexerObjectKey.ToUpperInvariant() : parameter.IndexerObjectKey,
                AttributeType.UNASSIGNED_TYPE,
                providerCategory);

            this.AssignAttributeToProviderCategory(providerCategory, indexers, a, parameter.IndexerObjectKey, metaData);
        }

        /// <summary>
        /// Creates a <see cref="IHS.Apps.CMP.DataProviders.Model.ProviderAttribute"/> from a
        /// supplied <see cref="IHS.Apps.CMP.DataProviders.AdapterParameter"/> before assigning it
        /// to the provided category.
        /// </summary>
        /// <param name="providerCategory">The category to assign the attribute to.</param>
        /// <param name="indexers">The indexer list to add the attribute to.</param>
        /// <param name="parameter">The adapter parameter to use.</param>
        /// <param name="metaData">Attribute metadata to be added as assigned.</param>
        private void CreateProviderAttribute(ProviderCategory providerCategory, CommonIndexerList<IIndexer> indexers, AdapterParameter parameter, TSQLMetadata metaData)
        {
            ProviderAttribute a = new ProviderAttribute(
                Guid.NewGuid().ToString(),
                this.useUpperCaseIndexerNames ? parameter.CodeName.ToUpperInvariant() : parameter.CodeName,
                parameter.DataType,
                providerCategory);

            this.AssignAttributeToProviderCategory(providerCategory, indexers, a, parameter.CodeName, metaData);
        }

        /// <summary>
        /// Creates a <see cref="IHS.Apps.CMP.DataProviders.Model.ProviderAttribute"/> from a
        /// supplied <see cref="IHS.Apps.CMP.DataProviders.DualColumnAdapterParameter"/> before
        /// assigning it to the provided category.
        /// </summary>
        /// <param name="providerCategory">The category to assign the attribute to.</param>
        /// <param name="indexers">The indexer list to add the attribute to.</param>
        /// <param name="parameter">The dual-column adapter parameter to use.</param>
        /// <param name="metaData">Attribute metadata to be added as assigned.</param>
        private void CreateProviderAttribute(ProviderCategory providerCategory, CommonIndexerList<IIndexer> indexers, DualColumnAdapterParameter parameter, TSQLMetadata metaData)
        {
            ProviderAttribute a = new ProviderAttribute(
                Guid.NewGuid().ToString(),
                this.useUpperCaseIndexerNames ? parameter.CodeName.ToUpperInvariant() : parameter.CodeName,
                parameter.DataType,
                providerCategory);

            this.AssignAttributeToProviderCategory(providerCategory, indexers, a, parameter.CodeName, metaData);
        }

        /// <summary>
        /// Counts how many records are returned by a supplied query.
        /// </summary>
        /// <param name="sql">The SQL query.</param>
        /// <returns>The count of matching records.</returns>
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "FetchCount", Justification = "This is the method name.")]
        [SuppressMessage("Microsoft.Security", "CA2100:Review SQL queries for security vulnerabilities", Justification = "This is the way CMP works.")]
        private int FetchCount(string sql)
        {
            Log.Debug("Begin FetchCount for SQL: " + sql);
            int count;
            sql = AbstractSqlProvider.RemoveCountHints(sql);
            sql = AbstractSqlProvider.RemoveOrderByClause(sql);
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.DontAddOrderByPattern);
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.MaxPagingOrderByPattern);
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.PagedDataIntoResultsTablePattern);

            using (DbConnection conn = this.CreateDBConnection())
            {
                using (DbCommand objCmd = conn.CreateCommand())
                {
                    objCmd.Connection = conn;
                    objCmd.CommandType = CommandType.Text;
                    objCmd.CommandText = sql;
                    objCmd.CommandTimeout = 1000;

                    if (conn.State == ConnectionState.Closed)
                    {
                        conn.Open();
                    }

                    count = Convert.ToInt32(objCmd.ExecuteScalar(), CultureInfo.InvariantCulture);
                }
            }

            return count;
        }

        /// <summary>
        /// Fetches the actual data from the database and uses the results builder to process the
        /// data into a result object.
        /// </summary>
        /// <typeparam name="T">The results object.</typeparam>
        /// <param name="sql">The SQL query.</param>
        /// <param name="category">The query category.</param>
        /// <param name="indexers">The query indexer list.</param>
        /// <param name="builder">
        /// The <see cref="IHS.Core.Catalog.Data.IBuildResults"/> object which can be used to build
        /// the results.
        /// </param>
        /// <returns>A results data object.</returns>
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Error(System.String)", Justification = "This is an error message for developers.")]
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "ItemId", Justification = "This is the required column name.")]
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "FetchData", Justification = "This is the method name.")]
        [SuppressMessage("Microsoft.Security", "CA2100:Review SQL queries for security vulnerabilities", Justification = "This is the way CMP works.")]
        private T FetchData<T>(string sql, ICategory category, IndexerList indexers, IBuildResults<T> builder)
        {
            Dictionary<string, int> columnOrdinals = new Dictionary<string, int>();

            try
            {
                using (DbConnection conn = this.CreateDBConnection())
                {
                    using (DbCommand objCmd = conn.CreateCommand())
                    {
                        objCmd.Connection = conn;
                        objCmd.CommandType = CommandType.Text;
                        objCmd.CommandText = sql;
                        System.Diagnostics.Debug.WriteLine(Environment.NewLine + "Executing SQL FetchData  *************" + Environment.NewLine + sql + Environment.NewLine + "********************");
                        objCmd.CommandTimeout = 1000;

                        if (conn.State == ConnectionState.Closed)
                        {
                            conn.Open();
                        }

                        using (DbDataReader dr = objCmd.ExecuteReader())
                        {
                            // cache the column ordinals once for increased performance get the data
                            // reader field map
                            Dictionary<string, int> fieldOrdinals = new Dictionary<string, int>();
                            for (int i = 0; i < dr.FieldCount; i++)
                            {
                                string key = dr.GetName(i);

                                if (!fieldOrdinals.ContainsKey(key))
                                {
                                    fieldOrdinals.Add(key, i);
                                }
                            }

                            // work out the indexer map
                            Log.Debug("Indexer count: " + indexers.Count);
                            int ordinal;
                            foreach (IIndexer indexer in indexers)
                            {
                                ordinal = -1;
                                if (indexer.Attribute != null && !string.IsNullOrEmpty(indexer.Attribute.Alias))
                                {
                                    ordinal = AbstractSqlProvider.GetOrdinalForIndexer(fieldOrdinals, indexer.Attribute.Alias);
                                }
                                else
                                {
                                    const string Dollar = "$";

                                    ordinal = AbstractSqlProvider.GetOrdinalForIndexer(fieldOrdinals, indexer.ObjectKey);

                                    if (ordinal == -1 && indexer.ObjectKey.Contains(Dollar))
                                    {
                                        int dollarIndex = indexer.ObjectKey.LastIndexOf(Dollar, StringComparison.OrdinalIgnoreCase);
                                        ordinal = AbstractSqlProvider.GetOrdinalForIndexer(fieldOrdinals, indexer.ObjectKey.Substring(dollarIndex + 1));
                                    }
                                }

                                // if the indexer was found, cache the ordinal value
                                if (ordinal > -1)
                                {
                                    columnOrdinals.Add(indexer.ObjectKey, ordinal);
                                }
                            }

                            // ItemId does not appear as an indexer so get the ordinal here
                            int itemIdOrdinal = AbstractSqlProvider.GetOrdinalForIndexer(fieldOrdinals, "ItemId");
                            if (itemIdOrdinal == -1)
                            {
                                Log.Debug("Could not find a column called ItemId, going to try metadata column 'ItemIdIndexer'.");
                                string itemIdIndexer = GetItemIdIndexer(category);
                                if (!string.IsNullOrWhiteSpace(itemIdIndexer))
                                {
                                    itemIdOrdinal = AbstractSqlProvider.GetOrdinalForIndexer(fieldOrdinals, itemIdIndexer);
                                }

                                if (itemIdOrdinal == -1)
                                {
                                    Log.Debug("Could not find a column from metadata 'ItemIdIndexer', going to assume column 0.");
                                    itemIdOrdinal = 0;
                                }
                            }

                            // process each result row into a builder item
                            Log.Debug("Builder in use: " + builder.ToString());
                            builder.StartResults();
                            this.ReviewIndexerList(indexers, builder.Search as Search);
                            builder.SetColumns(indexers);
                            int counter = 0;
                            while (dr.Read())
                            {
                                builder.StartItem();

                                // allow for a Guid to be supplied as ItemId
                                object itemIdValue = dr.GetValue(itemIdOrdinal);
                                if (itemIdValue.GetType().Equals(typeof(byte[])))
                                {
                                    itemIdValue = new Guid((byte[])itemIdValue);
                                }

                                builder.SetItemID(itemIdValue.ToString());
                                builder.SetCategory(category);

                                int value;
                                foreach (IIndexer indexer in indexers)
                                {
                                    if (columnOrdinals.TryGetValue(indexer.ObjectKey, out value))
                                    {
                                        builder.AddValue(indexer, dr.GetValue(value));
                                    }
                                }

                                builder.EndItem();
                                counter++;
                            }

                            Log.Debug(counter + " items retrieved.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                string msg = "SQL Provider FetchData :" +
                    ex.Message + Environment.NewLine +
                    ex.StackTrace + Environment.NewLine +
                    "SQL = " + Environment.NewLine +
                    sql + Environment.NewLine +
                    "Category = " + category.DisplayName;

                Log.Error(msg);
                throw;
            }

            return builder.GetResults();
        }

        /// <summary>
        /// Uses <see cref="IHS.Apps.CMP.DataProviders.AdapterParameter">Adapter Parameters</see> to
        /// map a configured category column name into a database column name.
        /// </summary>
        /// <param name="columnName">The name of the database column.</param>
        /// <param name="categoryName">The search category name.</param>
        /// <param name="queryKey">The name of the query.</param>
        /// <returns>Either the <paramref name="codename"/> or the SQL name read from configuration.</returns>
        private string FindSqlnameMapping(string columnName, string categoryName, string queryKey)
        {
            TSQLCategory tsqlCat = this.GetCategoryConfig(categoryName);

            return AbstractSqlProvider.MapCodeNameToSqlName(columnName, tsqlCat, queryKey);
        }

        /// <summary>
        /// Gets the provider category configuration when supplied with a category name.
        /// </summary>
        /// <param name="categoryName">The name of the category to get the configuration for.</param>
        /// <returns>A provider category configuration object.</returns>
        private TSQLCategory GetCategoryConfig(string categoryName)
        {
            return this.providerConfig.Categories.FirstOrDefault(c => Regex.IsMatch(c.Name, "\\b,?" + categoryName + ",?\\b", RegexOptions.IgnoreCase));
        }

        /// <summary>
        /// Determines the indexers required to perform the search and adds sorting to the SQL
        /// statement before calling FetchData to retrieve the actual data.
        /// </summary>
        /// <typeparam name="T">The results object.</typeparam>
        /// <param name="sql">The SQL query.</param>
        /// <param name="category">The query category.</param>
        /// <param name="search">The search object.</param>
        /// <param name="authorisations">The list of authorisations for the caller.</param>
        /// <param name="builder">
        /// The <see cref="IHS.Core.Catalog.Data.IBuildResults"/> object which can be used to build
        /// the results.
        /// </param>
        /// <param name="pageData">A value indicating whether the results should be paged.</param>
        /// <param name="includeSorts">A value indicating whether the results should be sorted.</param>
        /// <param name="queryKey">The name of the query being executed.</param>
        /// <param name="returnCounts">A value indicating whether to return group totals.</param>
        /// <returns>The data retrieved by executing the query.</returns>
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "GetData", Justification = "This is the method name.")]
        private T GetData<T>(string sql, ICategory category, ISearch search, AaaAuthorisation authorisations, IBuildResults<T> builder, bool pageData, bool includeSorts, string queryKey, bool returnCounts)
        {
            Log.Debug("Begin GetData for " + queryKey);

            Search searchClone = (Search)search.Clone();
            TSQLCategory tsqlCat = this.GetCategoryConfig(category.Name);

            StringBuilder sorts = new StringBuilder();

            // has user put a specific (DONT_ADD_ORDERBY) into the query? if a (DONT_ADD_ORDERBY)
            // has been found then the assumption is that the query already has it's own order by
            // clause and so paging can continue
            if (Regex.IsMatch(sql, Regex.Escape(AbstractSqlProvider.DontAddOrderByPattern), RegexOptions.IgnoreCase))
            {
                includeSorts = false;
            }

            if (includeSorts)
            {
                // this local list ensures sorts only get added once to the SQL
                List<string> addedSorts = new List<string>();
                foreach (Sort sort in searchClone.Sorts.Cast<Sort>().Where(s => s.Indexer != null))
                {
                    string sqlsortcolumnName = AbstractSqlProvider.MapCodeNameToSqlName(sort.Indexer.DisplayName, tsqlCat, queryKey);

                    if (!addedSorts.Contains(sqlsortcolumnName))
                    {
                        addedSorts.Add(sqlsortcolumnName);
                        sorts.AppendFormat("{0} {1}, ", sqlsortcolumnName, sort.Order == SortOrder.Descending ? " DESC " : " ASC ");
                    }
                }

                if (sorts.Length > 0)
                {
                    sorts.Remove(sorts.Length - 2, 2);
                }
                else
                {
                    // if we have a default use that
                    MetadataEntry<string, string> defaultSort = tsqlCat.Metadata.FirstOrDefault(m => m.Key.Equals("DefaultSort", StringComparison.OrdinalIgnoreCase));
                    if (defaultSort.Key != null)
                    {
                        string sortOrder = " ASC ";
                        if (defaultSort.Value.Contains("|DESC"))
                        {
                            sortOrder = " DESC ";
                            defaultSort.Value = defaultSort.Value.Replace("|DESC", string.Empty);
                        }

                        string sqlsortcolumnName = AbstractSqlProvider.MapCodeNameToSqlName(defaultSort.Value, tsqlCat, queryKey);

                        if (!addedSorts.Contains(sqlsortcolumnName))
                        {
                            addedSorts.Add(sqlsortcolumnName);
                            sorts.AppendFormat(CultureInfo.InvariantCulture, "{0} {1}", sqlsortcolumnName, sortOrder);
                        }
                    }
                }
            }

            if (pageData && !sql.Contains(AbstractSqlProvider.DontPageDataPattern))
            {
                sql = AbstractSqlProvider.RemoveCountHints(sql);

                string pagingSorts = sorts.ToString();

                sql = this.AddSqlPaging(sql, pagingSorts, (int)searchClone.BeginItemIndex, (int)searchClone.MaxItems);
            }
            else
            {
                sql = AbstractSqlProvider.RemovePagingHints(AbstractSqlProvider.RemoveCountHints(sql));

                if (sql.Contains(AbstractSqlProvider.ObserveMaxItems) && !searchClone.MaxItems.Equals(0) && !searchClone.MaxItems.Equals(uint.MinValue) && !searchClone.MaxItems.Equals(uint.MaxValue))
                {
                    sql = this.AddMaxItems(searchClone, sql);
                }

                if (includeSorts)
                {
                    sql = sql + " ORDER BY " + sorts;
                }
            }

            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.ObserveMaxItems);
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.DontAddOrderByPattern);
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.MaxPagingOrderByPattern);
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.PagedDataIntoResultsTablePattern);
            sql = AbstractSqlProvider.RemoveOrderByHints(sql);

            sql = AbstractSqlProvider.CheckHintReplacements(sql, tsqlCat, queryKey, authorisations, ref searchClone);

            // if this is present then we assume the user has passed the indexers in on the search.selectedindexers
            if (sql.Contains(AbstractSqlProvider.IndexersSqlPattern) || sql.Contains(AbstractSqlProvider.IndexersSqlNoAliasNoMappingPattern))
            {
                bool addAliasesAndMappings = !sql.Contains(AbstractSqlProvider.IndexersSqlNoAliasNoMappingPattern);
                string columnList = string.Empty;
                string groupList = string.Empty;

                List<string> ignoreTheseGroupTypes = new List<string>() { "ForecastType", "GroupOtherSeries", "TimeSeries", "CAGR", "ForecastType", "Inflate", "Pgo", "APPLY_COMM_ACFT_DSCT", "Currency", "APPLY_COMM_ACFT_DSCT" };

                foreach (var ixr in searchClone.SelectedIndexers)
                {
                    string columnsql;
                    var idxGroup = ixr.GetMetaDataValue("idxGroup");
                    if (!string.IsNullOrEmpty(idxGroup) && ignoreTheseGroupTypes.Contains(idxGroup))
                    {
                        continue;
                    }

                    if (addAliasesAndMappings)
                    {
                        columnsql = MapCodeNameToSqlName(ixr.DisplayName, tsqlCat, queryKey);
                    }
                    else
                    {
                        columnsql = ixr.DisplayName;
                    }

                    // if this is an aggregate (SUM) then dont add to group by clause
                    if (ixr.GetMetaDataValue("isAggregate") == "true")
                    {
                        columnsql = "SUM(" + columnsql + ") ";
                    }
                    else if (ixr.GetMetaDataValue("isCount") == "true")
                    {
                        columnsql = "COUNT(*) ";
                    }
                    else
                    {
                        groupList += columnsql + " ,";
                    }

                    if (addAliasesAndMappings)
                    {
                        columnList += columnsql + " as " + ixr.DisplayName + ",";
                    }
                    else
                    {
                        columnList += columnsql + ",";
                    }
                }

                groupList = groupList.Chop(1);
                columnList = columnList.Chop(1);

                sql = sql.Replace(AbstractSqlProvider.IndexersSqlPattern, columnList);
                sql = sql.Replace(AbstractSqlProvider.IndexersSqlNoAliasNoMappingPattern, columnList);

                if (sql.Contains(AbstractSqlProvider.IndexersSqlGroupByPattern))
                {
                    sql = sql.Replace(AbstractSqlProvider.IndexersSqlGroupByPattern, groupList);
                }
            }

            sql = AbstractSqlProvider.RemoveIndexerHints(sql);

            // figure out which indexers to pass to the fetch
            IndexerList indexers = new IndexerList();
            if (searchClone.SelectedIndexers != null && searchClone.SelectedIndexers.Count > 0)
            {
                Log.Debug("Using selected indexers.");
                indexers.AddRange(searchClone.SelectedIndexers);
            }
            else if (!queryKey.Equals("default", StringComparison.CurrentCulture))
            {
                Log.Debug("Doing pre-fetch for indexers.");
                this.PreFetchData(sql, category, indexers, null, true);
            }
            else if (searchClone.Indexers != null && searchClone.Indexers.Count > 0)
            {
                Log.Debug("Using search indexers.");
                indexers.AddRange(searchClone.Indexers);
            }
            else
            {
                // no indexers specified on search and search is "default" so set indexers to be any
                // available on the category
                Log.Debug("Using category indexers.");
                indexers.AddRange(category.Indexers);
            }

            if (returnCounts)
            {
                string indexerPrefix = GetDefaultIndexerPrefix(category);

                IIndexer countIdx = category.Indexers.FirstOrDefault(i => i.ObjectKey.Equals(indexerPrefix + "COUNT", StringComparison.OrdinalIgnoreCase));
                if (countIdx != null)
                {
                    indexers.Add(countIdx);
                }
            }

            T data = this.FetchData(sql, category, indexers, builder);

            Log.Debug("End GetData");

            return data;
        }

        /// <summary>
        /// Retrieves the required SQL statement from configuration then adds entitlements and constraints.
        /// </summary>
        /// <param name="category">The category the query belongs to.</param>
        /// <param name="queryKey">The name of the query, as defined in configuration.</param>
        /// <param name="search">The supplied search object.</param>
        /// <param name="authorisations">The supplied authorisations object.</param>
        /// <param name="isCountQuery">If true, tries to find queryKey + "_COUNTRYQUERY" firs.</param>
        /// <returns>
        /// A SQL query statement which has had entitlements and constraints added into it.
        /// </returns>
        /// <remarks>NOTE: SQL is appended later in the stack as well for paging.</remarks>
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "GetSQL", Justification = "This is the method name.")]
        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "IHS.Apps.CMP.Common.Log.Debug(System.String)", Justification = "This is a debug message.")]
        private string GetSql(ICategory category, string queryKey, ISearch search, AaaAuthorisation authorisations, bool isCountQuery)
        {
            string sql = string.Empty;
            string configQuerySqlCommand = string.Empty;
            bool isWebServicesQuery = queryKey.Equals("$sys_WebServicesSearch$", StringComparison.OrdinalIgnoreCase);

            // if this is a count query, try the query name with _COUNTQUERY first to see if there
            // is a specific query to count otherwise this will look for the named query
            Log.Debug("Begin GetSQL for Category: " + category.DisplayName + " Query:" + (isCountQuery ? queryKey + CountQuery : queryKey));
            SqlQueryConfig config = this.GetSqlQueryConfig(category, isCountQuery ? queryKey + CountQuery : queryKey);

            if (config != null)
            {
                configQuerySqlCommand = config.Query.SqlCommand;

                if (isWebServicesQuery)
                {
                    //// we need to append the indexers to the correct part of this unusual flexible, webservices query.

                    string find = "\\(COUNT_HINT\\).*\\(END_COUNT_HINT\\)";
                    Regex rgx = new Regex(find, RegexOptions.IgnoreCase | RegexOptions.Singleline);
                    var indexers = GetWebServiceQueryIndexerNames(category, search);
                    var mappedAliasedQueryKey = MapMultipleCodeNameToSqlNameWithAliasing(indexers, config.Category, queryKey, ",", true, true);
                    configQuerySqlCommand = rgx.Replace(configQuerySqlCommand, "(COUNT_HINT) SELECT " + mappedAliasedQueryKey + " (END_COUNT_HINT)FROM ");
                }
            }
            else
            {
                // doing a count & not found a specific count query try without _CountQUery
                if (isCountQuery)
                {
                    // try again for the true queryKey
                    Log.Debug("Begin GetSQL for Category: " + category.DisplayName + " Query:" + queryKey);
                    config = this.GetSqlQueryConfig(category, queryKey);
                }

                if (config != null)
                {
                    configQuerySqlCommand = config.Query.SqlCommand;
                }
                else
                {
                    // the UI should have found a named match by this point unless the query is for
                    // a generic tree; specifically do *not* do this check for user defined web
                    // service searches as they must be generated using the code lower in the
                    // method; additionally some products do not define a generic tree search so
                    // will also drop to the query generation code lower down too
                    if (!isWebServicesQuery)
                    {
                        Log.Debug("Begin GetSQL for Category: " + category.DisplayName + " Query:GENERIC_TREE");
                        config = this.GetSqlQueryConfig(category, "GENERIC_TREE");
                    }
                }
            }

            if (config != null)
            {
                // only do the next bit if we're actually dealing with a generic tree otherwise do nothing
                if (config.Query.SqlCommand.Contains("GENERIC_TREE_ATTRIBUTE"))
                {
                    // try and use a generic query and replace the attribute name(s) with the
                    // desired attribute(s)
                    // NOTE: web services may send many attributes to be tallied
                    string mappedQueryKey = MapMultipleCodeNameToSqlNameWithAliasing(queryKey, config.Category, null, ",", true, false);
                    string unaliased = MapMultipleCodeNameToSqlNameWithAliasing(queryKey, config.Category, null, ",", false, false);

                    // ensure we don't get an "identifier too long" error from Oracle by removing
                    // any indexer prefixes that are present
                    List<string> prefixes = GetAllIndexerPrefixes(category);
                    if (prefixes.Count > 0)
                    {
                        foreach (string prefix in prefixes)
                        {
                            mappedQueryKey = mappedQueryKey.Replace(prefix, string.Empty);
                            unaliased = unaliased.Replace(prefix, string.Empty);
                        }
                    }

                    // next line will replace the query key with the SQL name (if diff) BUT keep the
                    // results alias as the query key so it is found in indexers etc.
                    configQuerySqlCommand = config.Query.SqlCommand.ReplaceFirst("GENERIC_TREE_ATTRIBUTE", mappedQueryKey);
                    configQuerySqlCommand = configQuerySqlCommand.Replace("GENERIC_TREE_ATTRIBUTE", unaliased);
                    configQuerySqlCommand = configQuerySqlCommand.Replace("GENERIC_TREE_QUERYKEY", queryKey.ToUpperInvariant());
                }
            }
            else
            {
                // CODE ONLY REACHABLE WHERE NO GENERIC_TREE QUERY EXISTS OR FOR USER DEFINED WEB
                // SERVICE QUERIES get the default configuration and make a query
                config = this.GetSqlQueryConfig(category, "default");

                // get the indexer list from the search, this will become our retrieved column list
                if (isWebServicesQuery)
                {
                    queryKey = GetWebServiceQueryIndexerNames(category, search);
                }

                // query key needs to have its attributes matched to any SQL fields
                var mappedAliasedQueryKey = MapMultipleCodeNameToSqlNameWithAliasing(queryKey, config.Category, "default", ",", true, false);

                // ensure we don't get an "identifier too long" error from Oracle by removing any
                // indexer prefixes that are present
                List<string> prefixes = GetAllIndexerPrefixes(category);
                if (prefixes.Count > 0)
                {
                    foreach (string prefix in prefixes)
                    {
                        mappedAliasedQueryKey = mappedAliasedQueryKey.Replace(prefix, string.Empty);
                    }
                }

                // try and make a generic query using JOIN_CONDITIONS
                string genericQuery = "SELECT " + (isWebServicesQuery ? string.Empty : "distinct ") +
                                        mappedAliasedQueryKey + AbstractSqlProvider.JoinConditionsPattern;

                var jc = (from c in this.providerConfig.Categories
                          from q in c.TSQLQueries
                          where c == this.GetCategoryConfig(category.Name)
                          select new { JoinConditions = c.JoinConditions }).FirstOrDefault();

                if (jc == null || jc.JoinConditions == null || jc.JoinConditions.Length < 4)
                {
                    throw new ConfigurationErrorsException("No required joinconditions found for category=" + category.ObjectKey);
                }

                genericQuery = genericQuery.Replace(AbstractSqlProvider.JoinConditionsPattern, jc.JoinConditions);
                if (!jc.JoinConditions.Contains("WHERE 1=1"))
                {
                    genericQuery += " WHERE 1=1 ";
                }

                if (!isWebServicesQuery)
                {
                    if (!genericQuery.Contains("(DONT_ADD_ORDERBY)"))
                    {
                        genericQuery += " (DONT_ADD_ORDERBY) ";
                    }

                    genericQuery += " Order By " + queryKey;
                }

                configQuerySqlCommand = genericQuery;
            }

            if (!config.Query.IgnoreAuths && !search.DisableAccessControl)
            {
                string entitlementFilterMetaDataVal = string.Empty;
                if (config.Query.Metadata != null)
                {

                    MetadataEntry<string, string> meta = config.Query.Metadata.FirstOrDefault(m => m.Key.Equals("ObserveEntitlementFilterMetadata"));
                    if (meta != null)
                    {
                        entitlementFilterMetaDataVal = meta.Value;
                    }
                }

                sql = AbstractSqlProvider.AppendAuthsToQuery(configQuerySqlCommand, authorisations, config, queryKey, entitlementFilterMetaDataVal);
            }
            else
            {
                sql = configQuerySqlCommand;
            }

            StringBuilder sqlExtra = new StringBuilder();

            // Make a new bucket as these exist at the query level AND/OR the category level
            List<DualColumnAdapterParameter> dualColumnAdapters = new List<DualColumnAdapterParameter>();
            if (config.Category.DualColumnAdapterParameters != null && config.Category.DualColumnAdapterParameters.Count > 0)
            {
                dualColumnAdapters.AddRange(config.Category.DualColumnAdapterParameters);
            }

            if (config.Query.DualColumnAdapterParameters != null && config.Query.DualColumnAdapterParameters.Count > 0)
            {
                dualColumnAdapters.AddRange(config.Query.DualColumnAdapterParameters);
            }

            // Make a new bucket as these exist at the query level AND/OR the category level
            List<AdapterParameter> ignoreableAdaptersParams = new List<AdapterParameter>();
            if (config.Query.Parameters != null && config.Query.Parameters.Count > 0)
            {
                foreach (AdapterParameter adp in config.Query.Parameters)
                {
                    if (ignoreableAdaptersParams.Where(aa => aa.CodeName == adp.CodeName).Count() == 0)
                    {
                        if (adp.Ignore)
                        {
                            ignoreableAdaptersParams.Add(adp);
                        }
                    }
                }
            }

            if (config.Category.Parameters != null && config.Category.Parameters.Count > 0)
            {
                foreach (AdapterParameter adp in config.Category.Parameters)
                {
                    if (ignoreableAdaptersParams.Where(aa => aa.CodeName == adp.CodeName).Count() == 0)
                    {
                        if (adp.Ignore)
                        {
                            ignoreableAdaptersParams.Add(adp);
                        }
                    }
                }
            }

            if (!config.Query.IgnoreConstraints)
            {
                ConstraintsToSqlParser parser = new ConstraintsToSqlParser(category, queryKey, this.FindSqlnameMapping, this.providerLocale);
                parser.UseShortDates = this.useShortDates;
                parser.UseFreetextCommand = config.UseFreetextFTSCommand || false;

                if (this is OracleTSQLProvider)
                {
                    parser.IsOracle = true;
                }

                parser.UpdateDualColumnAdapters(dualColumnAdapters);

                TSQLCategory tsqlCat = this.GetCategoryConfig(category.Name);

                RemoveIgnoreableConstraints(search.Constraints, ignoreableAdaptersParams, category);
                sql = UpdateSqlConstraintIfExistsHints(sql, search, false, parser.IsOracle);
                sql = this.UpdateSearchSignatureHints(sql, search, authorisations);
                parser.ParseConstraints(sqlExtra, search.Constraints);
                sql = AbstractSqlProvider.UpdateSqlConstraintClauses(sql, sqlExtra.ToString(), AbstractSqlProvider.WherePattern);
                sql = AbstractSqlProvider.UpdateSqlConstraintClauses(sql, sqlExtra.ToString(), AbstractSqlProvider.WherePatternWithoutAuths);
                sql = AbstractSqlProvider.UpdateSqlConstraintClauses(sql, sqlExtra.ToString(), AbstractSqlProvider.ConstraintsOnlyNoAuths);

                if (sql.Contains("contains(z.*,"))
                {
                    MetadataEntry<string, string> meta = config.Query.Metadata.FirstOrDefault(m => m.Key.Equals("AllCollumnsToSearch"));
                    if (meta != null && !string.IsNullOrEmpty(meta.Value))
                    {
                        sql = AbstractSqlProvider.UpdateSqlConstraintClauses(sql, $"|(FOREACHUSED::LIKE_VW_SEARCH::{meta.Value})|", AbstractSqlProvider.WherePattern);
                        //I have created the same type of the main SelectedIndexers to be compared inside of "UpdateSqlForEachUsedHints"
                        Search searchClone = (Search)search.Clone();
                        searchClone.SelectedIndexers.Add(search.SearchSource.Indexers.FirstOrDefault(ix => ix.ObjectKey.StartsWith("LIKE_VW_SEARCH", true, CultureInfo.InvariantCulture)));
                        sql = UpdateSqlForEachUsedHints(sql, category, tsqlCat, searchClone, false);

                    }
                }
                                
                //Note we have to remove this as its nonsense and is not a "WHERE" clause.
                sql = AbstractSqlProvider.RemoveConstraintsOnlyNoAuthsClause(sql);
            }

            if (!string.IsNullOrEmpty(config.Category.PreQueryStatement))
            {
                sql = config.Category.PreQueryStatement + Environment.NewLine + sql;
            }

            Log.Debug("End GetSQL");

            return sql;
        }

        /// <summary>
        /// Retrieves a base SQL query string along with entitlement data from the configuration file.
        /// </summary>
        /// <param name="category">The category to search for/in.</param>
        /// <param name="queryKey">The name of the query to search for.</param>
        /// <returns>A populated <see cref="SqlQueryConfig"/> object.</returns>
        private SqlQueryConfig GetSqlQueryConfig(ICategory category, string queryKey)
        {
            if (CMPConfiguration.DeveloperAlwaysRefreshDataProviderConfig)
            {
                this.providerConfig = AbstractSqlProvider.GetConfig(this.sqlFile);

                this.BuildCache(this.providerConfig, true, category.Key);
            }

            return (from c in this.providerConfig.Categories
                    from q in c.TSQLQueries
                    where c == this.GetCategoryConfig(category.Name)
                    && q.Name.Equals(queryKey, StringComparison.OrdinalIgnoreCase)
                    let product = category.GetMetaDataValue(EntitlementMetadataKey)
                    let subproducts = category.GetMetaDataValue("EntitlementSubProducts")
                    let entitlementColumnName = category.GetMetaDataValue("EntitlementColumnName")
                    select new SqlQueryConfig
                    {
                        Entitlements = c.Entitlements,
                        EntitlementColumnName = entitlementColumnName,
                        Product = product,
                        SubProducts = subproducts,
                        Category = c,
                        Query = q,
                        UseFreetextFTSCommand = c.UseFreetextFTSCommand
                    }).FirstOrDefault();
        }

        /// <summary>
        /// Gets all the indexers from the query and adds them to the provider category, so they are
        /// ready and available to be used when querying the provider.
        /// <para/>It doesn't really pre-fetch any data, just fetches the indexers.
        /// <para/>Handles duplicates by ignoring them.
        /// </summary>
        /// <param name="sql">The generated SQL query.</param>
        /// <param name="category">The category the query belongs to.</param>
        /// <param name="indexers">The indexer list to add to.</param>
        /// <param name="metadata">The T-SQL metadata.</param>
        /// <param name="ignoreItemId">
        /// A value indicating whether to disregard the lack of an item identifier column.
        /// </param>
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "PreFetchData", Justification = "This is the method name.")]
        [SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "ItemId", Justification = "This is the required column name.")]
        [SuppressMessage("Microsoft.Security", "CA2100:Review SQL queries for security vulnerabilities", Justification = "This is the way CMP works.")]
        private void PreFetchData(string sql, ICategory category, CommonIndexerList<IIndexer> indexers, TSQLMetadata metadata, bool ignoreItemId = false)
        {
            // Cleans ups queries to simplest form (remove hint placeholders)
            sql = AbstractSqlProvider.RemoveHint(sql, AbstractSqlProvider.ObserveMaxItems);
            sql = RemovePagingHints(sql);
            sql = RemoveCountHints(sql);
            sql = RemoveHint(sql, DontAddOrderByPattern);
            sql = RemoveOrderByHints(sql);
            sql = RemoveHint(sql, MaxPagingOrderByPattern);

            sql = RemoveReplacementHints(sql, this.allDefaultHintReplacements);
            sql = UpdateSqlForEachUsedHints(sql, null, null, null, false);
            sql = UpdateSQLStringToEnsureZeroRowsAreReturned(sql, AbstractSqlProvider.WherePattern);
            sql = UpdateSQLStringToEnsureZeroRowsAreReturned(sql, AbstractSqlProvider.WherePatternWithoutAuths);
            sql = UpdateSQLStringToEnsureZeroRowsAreReturned(sql, AbstractSqlProvider.ConstraintsOnlyNoAuths);

            string indexerPrefix = GetDefaultIndexerPrefix(category);

            // Log.Debug("Begin PreFetchData: " + sql);
            try
            {
                using (DbConnection connection = this.CreateDBConnection())
                {
                    using (DbCommand command = connection.CreateCommand())
                    {
                        command.Connection = connection;
                        command.CommandType = CommandType.Text;
                        command.CommandText = sql;
                        System.Diagnostics.Debug.WriteLine(Environment.NewLine + "Executing SQL Pre-FetchData *************" + Environment.NewLine + sql + Environment.NewLine + "********************");
                        command.CommandTimeout = 1000;

                        if (connection.State == ConnectionState.Closed)
                        {
                            connection.Open();
                        }

                        using (DbDataReader reader = command.ExecuteReader())
                        {
                            // add any indexers which are not already present
                            for (int field = 0; field < reader.FieldCount; field++)
                            {
                                string columnName = reader.GetName(field);

                                // only add the indexer prefix if it's not already included as part
                                // of the column name
                                string indexerName = string.Empty;
                                if (!columnName.StartsWith(indexerPrefix, StringComparison.OrdinalIgnoreCase))
                                {
                                    indexerName = indexerPrefix;
                                }

                                indexerName += this.useUpperCaseIndexerNames ? columnName.ToUpperInvariant() : columnName;

                                // has this column already been added to the indexer list?
                                IIndexer indexer = indexers.FirstOrDefault(i => i.ObjectKey.Equals(indexerName, StringComparison.OrdinalIgnoreCase));
                                if (indexer == null)
                                {
                                    AttributeType attribType = this.GetAttributeType(reader.GetDataTypeName(field));

                                    ProviderAttribute pa = new ProviderAttribute(Guid.NewGuid().ToString(), indexerName, attribType, category);

                                    this.AssignAttributeToProviderCategory(category as ProviderCategory, indexers, pa, indexerName, metadata);
                                }
                            }
                        }

                        if (!ignoreItemId && indexers.FirstOrDefault(i => i.DisplayName.Equals("itemid", StringComparison.OrdinalIgnoreCase)) == null)
                        {
                            var message = string.Format(
                                CultureInfo.InvariantCulture,
                                "A column called ItemId must be defined on category '{0}'.",
                                category.ObjectKey);
                            throw new ConfigurationErrorsException(message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                var message = string.Format(
                    CultureInfo.InvariantCulture,
                    "An error has occurred in PreFetchData for category '{0}' with SQL: {1}.",
                    category.ObjectKey,
                    sql);

                Log.Error(message);
                Log.Error(sql);

                throw new ConfigurationErrorsException(message, ex);
            }
        }

        #endregion Private Methods

        #region Private Classes

        /// <summary>
        /// A private class to hold configuration details.
        /// </summary>
        private class SqlQueryConfig
        {
            #region Public Properties

            /// <summary>
            /// Gets or sets the category.
            /// </summary>
            public TSQLCategory Category { get; set; }

            /// <summary>
            /// Gets or sets the entitlement column name.
            /// </summary>
            public string EntitlementColumnName { get; set; }

            /// <summary>
            /// Gets or sets the entitlement product.
            /// </summary>
            public string Product { get; set; }

            /// <summary>
            /// Gets or sets a value indicating whether to to use the default term in full text search. If false then we deafult to "contains" otherwise "freetext".
            /// </summary>
            [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
            public bool UseFreetextFTSCommand { get; set; }

            /// <summary>
            /// Gets or sets the SQL query string.
            /// </summary>
            public TSQLQuery Query { get; set; }

            /// <summary>
            /// Gets or sets the entitlement sub-product.
            /// </summary>
            public string SubProducts { get; set; }

            /// <summary>
            /// Gets or sets the entitlements to use.
            /// </summary>
            public List<Entitlement> Entitlements
            {
                get;
                set;
            }

            #endregion Public Properties
        }

        #endregion Private Classes
    }
}