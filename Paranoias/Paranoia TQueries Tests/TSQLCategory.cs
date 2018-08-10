// <copyright file="TSQLCategory.cs" company="IHS">
//     © 2011, IHS Inc. and its affiliated and subsidiary companies, all rights reserved. All other
//     trademarks are the property of IHS Inc. and its affiliated and subsidiary companies.
//     
//     This product, including software, data and documentation are licensed to the user for its
//     internal business purposes only and may not be disclosed, disseminated, sold, licensed,
//     copied, reproduced, translated or transferred to any third party.
//     
//     IHS Inc. 15 Inverness Way East Englewood, Colorado 80112 USA
//     + 1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.DataProviders
{
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using System.Xml.Serialization;

    /// <summary>
    /// Holds T-SQL category details.
    /// </summary>
    public class TSQLCategory
    {
        #region Public Properties

        /// <summary>
        /// Gets or sets the domain name.
        /// </summary>
        [XmlAttribute]
        public string DomainName
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets a value indicating whether we should use the default command for full text search. False results in the default "contains", true give "freetext".
        /// </summary>
        [XmlAttribute]
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", Justification = "Reviewed.")]
        public bool UseFreetextFTSCommand
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the dual column adapter parameter list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<Entitlement> Entitlements
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the dual column adapter parameter list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<DualColumnAdapterParameter> DualColumnAdapterParameters
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the unique identifier.
        /// </summary>
        [XmlAttribute]
        public string Guid
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the hint replacement list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<HintReplacement> HintReplacements
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the query to add prior to all queries.
        /// </summary>
        [XmlElement]
        public string PreQueryStatement
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the join condition text.
        /// </summary>
        [XmlElement]
        public string JoinConditions
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the region count text.
        /// </summary>
        [XmlElement]
        public string JoinRegion
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the result table text.
        /// </summary>
        [XmlElement]
        public string ResultTable
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the region count text.
        /// </summary>
        [XmlElement]
        public string RegionCount
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the metadata list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object."),
        SuppressMessage("Microsoft.Design", "CA1006:DoNotNestGenericTypesInMemberSignatures", Justification = "List of metadata items is required.")]
        public List<MetadataEntry<string, string>> Metadata
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the category name.
        /// </summary>
        [XmlAttribute]
        public string Name
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the adapter parameter list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<AdapterParameter> Parameters
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the list of T-SQL queries.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<TSQLQuery> TSQLQueries
        {
            get;
            set;
        }

        #endregion
    }
}