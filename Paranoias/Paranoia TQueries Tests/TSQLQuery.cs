// <copyright file="TSQLQuery.cs" company="IHS">
//     © 2014, IHS Inc. and its affiliated and subsidiary companies, all rights reserved. All other
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
    using System;
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using System.Xml.Serialization;

    /// <summary>
    /// Holds T-SQL query details.
    /// </summary>
    public class TSQLQuery : ICloneable
    {
        #region Public Properties

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
        /// Gets or sets a value indicating whether to ignore authorisations.
        /// </summary>
        [XmlAttribute]
        public bool IgnoreAuths
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets a value indicating whether to ignore constraints.
        /// </summary>
        [XmlAttribute]
        public bool IgnoreConstraints
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the query metadata list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1006:DoNotNestGenericTypesInMemberSignatures", Justification = "List of metadata items is required."),
        SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<MetadataEntry<string, string>> Metadata
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the query name.
        /// </summary>
        [XmlAttribute]
        public string Name
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the query adapter parameter list.
        /// </summary>
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "List used for performance."),
        SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Read/Write required as this is a serialisation object.")]
        public List<AdapterParameter> Parameters
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets a value indicating whether to run the query as part of the pre-fetch
        /// routine used to populate category attributes.
        /// </summary>
        [XmlAttribute]
        public bool RunInPreFetch
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the SQL command text.
        /// </summary>
        [XmlAttribute]
        public string SqlCommand
        {
            get;
            set;
        }

        /// <summary>
        /// Clnoe.
        /// </summary>
        public object Clone()
        {
            return this.MemberwiseClone();
        }

        #endregion
    }
}