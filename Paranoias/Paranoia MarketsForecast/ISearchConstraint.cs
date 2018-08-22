using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace IHS.Core.Catalog.Model.Search {
    /// <summary>
    /// Represents a constraint on catalog searches.
    /// </summary>
    public interface ISearchConstraint : ICloneable, IEquatable<ISearchConstraint> {
        /// <summary>
        /// The constraint identifier.   
        /// This can be used to remove / get a handle to the constraint based on an application 
        /// specified name. 
        /// </summary>
        string Identifier
        {
            get;
            set;
        }

        /// <summary>
        /// The constraint name.   
        /// This can be used by the application to the name the constraint for diaply later in Breadcrumbs, etc. 
        /// It may not be a displayable name, but could also be a resource key. 
        /// </summary>
        string Name
        {
            get;
            set;
        }

        /// <summary>
        /// Gets a list of the ConstraintParameter objects that have been set as values on the constraint.
        /// </summary>
        /// <returns></returns>
        List<ConstraintParameter> GetParametersForConstraint();

        /// <summary>
        /// Fill the parameters in the constraints using the values in the dictionary.
        /// </summary>
        /// <param name="parameterValues"></param>
        void FillParameters(Dictionary<string, object> parameterValues);

        /// <summary>
        /// Used by the Builder to filter out items. Solves the following example involving mv and groupdatatables:
        /// Company {A, B} Color {Red, Blue, Yellow}
        /// Datatable has the above attributes with a constraint company = A.  But the groupdatatable results will  
        /// still return Company B because both companies are associated with the mv color.  This will fix that so
        /// only company A appears in the results.
        /// </summary>
        /// <param name="indexer">Usually an attribute</param>
        /// <param name="value">Value of the attribute</param>
        /// <returns>bool if it satisfies the constraint</returns>
        bool ValueSatisfiesConstraint(IIndexer indexer, Object value);

    }
}
