// <copyright file="GeoAreaConstraint.cs" company="IHS">
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

namespace IHS.Core.Catalog.Model.Search
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    using IHS.Apps.CMP.Models.Struct;
    using IHS.Apps.CMP.Models.ViewModels.Map;

    /// <summary>
    /// Represents a constraint which tests for equality for a specific attribute.
    /// </summary>
    [Serializable]
    public class GeoAreaConstraint : IndexerConstraint, ICloneable
    {
        /// <summary>
        /// The Well Known Text representation of the area constraint.
        /// </summary>
        private string wellKnownText;

        /// <summary>
        /// Geometry, Polygon, representation of the area constraint.
        /// </summary>
        private Geometry geography;

        /// <summary>
        /// get Coordinates of the map.
        /// </summary>
        private List<GeoCoordinate> coordinates;

        /// <summary>
        /// Builds an Geo Area constraint.
        /// </summary>
        /// <param name="indexer">An indexer</param>
        /// <param name="wellKnownText">The well know text representing the polygon area.</param>
        public GeoAreaConstraint(IIndexer indexer, string wellKnownText)
            : base(indexer)
        {
            this.WellKnownText = wellKnownText;
        }

        /// <summary>
        /// Builds an Geo Area constraint.
        /// </summary>
        /// <param name="indexer">An indexer</param>
        /// <param name="geography">The geometry polygon representation the area.</param>
        /// <param name="wellKnownText">The wellKnownText polygon representation the area.</param>
        public GeoAreaConstraint(IIndexer indexer, Geometry geography, string wellKnownText)
            : base(indexer)
        {
            this.geography = geography;
            this.WellKnownText = wellKnownText;
        }

        /// <summary>
        /// Base Constructor.
        /// </summary>
        /// <param name="indexer">The indexer. </param>
        public GeoAreaConstraint(IIndexer indexer)
            : base(indexer)
        {
            this.WellKnownText = "FullGlobe";
        }

        /// <summary>
        /// Gets or sets the well known text representation of the area
        /// </summary>
        public string WellKnownText
        {
            get
            {
                return this.wellKnownText;
            }

            set
            {
                this.wellKnownText = value;
            }
        }

        /// <summary>
        /// Gets or sets the Geometry Polygon representation of the search area.
        /// </summary>
        public Geometry Geography
        {
            get
            {
                return this.geography;
            }

            set
            {
                this.geography = value;
            }
        }

        /// <summary>
        /// Gets the points of the polygon.
        /// </summary>
        /// <returns>List of <see cref="GeoCoordinate"/> representing the points of the polygon.</returns>
        public IEnumerable<GeoCoordinate> GetCoordinates()
        {
            this.coordinates = new List<GeoCoordinate>();
            if (!(this.geography is Polygon))
            {
                if (this.geography is Multipolygon)
                {
                    Multipolygon multipolygonCollection = (Multipolygon)this.geography;
                    foreach (var itemCoord in multipolygonCollection.coordinates)
                    {
                        for (var i = 0; i < itemCoord.Count(); i++)
                        {
                            for (var c = 0; c < itemCoord.ElementAt(i).Count(); c++)
                            {
                                coordinates.Add(new GeoCoordinate(itemCoord.ElementAt(i).ElementAt(c).ElementAt(1), itemCoord.ElementAt(i).ElementAt(c).ElementAt(0)));
                            }
                        }
                    }

                    return this.coordinates;

                }

                if (this.geography is GeometryCollection)
                {
                    GeometryCollection geometryCollection = (GeometryCollection)this.geography;
                    int geometriesCount = (int)geometryCollection.geometries.Count();
                    for (int g = 0; g < geometriesCount; g++)
                    {
                        var geoObject = geometryCollection.geometries.ElementAt(g);
                        switch (geoObject.type)
                        {
                            case "point":
                                Geometry geoEsriPoint = (EsriPoint)geoObject;
                                var points = (EsriPoint)geoEsriPoint;
                                coordinates.Add(new GeoCoordinate(points.y, points.x));
                                continue;
                            case "polyline":
                                Polyline geoPolyline = (Polyline)geoObject;
                                if (geoPolyline != null)
                                {
                                    if (geoPolyline.paths != null || geoPolyline.paths.Count() > 0)
                                    {
                                        var pathsCount = geoPolyline.paths.Count();
                                        foreach (var itemPath in geoPolyline.paths)
                                        {
                                            var itemCount = itemPath.Count();
                                            //List<IEnumerable<IEnumerable<double>>> path = geoPolyline.paths;
                                            for (int p = 0; p < itemCount; p++)
                                            {
                                                var pathElement = itemPath.ElementAt(p);
                                                this.coordinates.Add(new GeoCoordinate(pathElement.ElementAt(1), pathElement.ElementAt(0)));
                                            }
                                        }
                                    }
                                }
                                continue;
                            case "polygon":
                                Polygon geometryPolygon = (Polygon)geoObject;
                                if (geometryPolygon != null)
                                {
                                    var geometryRing = geometryPolygon.rings.First();

                                    if (geometryRing != null || geometryRing.Count() > 0)
                                    {
                                        int geometryPointCount = (int)geometryRing.Count();
                                        for (int p = 0; p < geometryPointCount; p++)
                                        {
                                            var geometryPoint = geometryRing.ElementAt(p);
                                            this.coordinates.Add(new GeoCoordinate(geometryPoint.ElementAt(1), geometryPoint.ElementAt(0)));
                                        }
                                    }
                                }
                                continue;
                            default:
                                continue;
                        }
                    }
                }
                return this.coordinates;
            }

            Polygon polygon = (Polygon)this.geography;
            var ring = polygon.rings.First();

            if (ring == null || ring.Count() == 0)
            {
                return this.coordinates;
            }

            int pointCount = (int)ring.Count();
            for (int i = 0; i < pointCount; i++)
            {
                var point = ring.ElementAt(i);
                this.coordinates.Add(new GeoCoordinate(point.ElementAt(1), point.ElementAt(0)));
            }

            return this.coordinates;
        }

        /// <summary>
        /// Creates a new object that is a copy of the current instance.
        /// </summary>
        /// <returns>
        /// A new object that is a copy of this instance.
        /// </returns>
        object ICloneable.Clone()
        {
            var clone = new GeoAreaConstraint(this.Indexer, this.Geography, this.WellKnownText);
            IndexerConstraint.CopyCommonMembers(this, clone);
            return clone;
        }

        /// <summary>
        /// Determines whether this instance is valid.
        /// </summary>
        /// <returns>
        /// <c>true</c> if this instance is valid; otherwise, <c>false</c>.
        /// </returns>
        public override bool IsValid()
        {
            return !string.IsNullOrEmpty(this.WellKnownText);
        }

        /// <summary>
        /// Converts the object to a textual representation.
        /// </summary>
        /// <returns>The text representation of this item.</returns>
        public override string ToString()
        {
            var builder = new StringBuilder();
            builder.Append(base.ToString());
            builder.Append(this.WellKnownText);

            return builder.ToString();
        }

        /// <summary>
        /// Gets a list of the ConstraintParameter objects that have been set as values on the constraint.
        /// </summary>
        /// <returns>Null value</returns>
        public override List<ConstraintParameter> GetParametersForConstraint()
        {
            return null;
        }

        /// <summary>
        /// Indicates whether the current object is equal to another object of the same type.
        /// </summary>
        /// <param name="other">An object to compare with this object.</param>
        /// <returns>
        /// true if the current object is equal to the other parameter; otherwise, false.
        /// </returns>
        public override bool Equals(ISearchConstraint other)
        {
            return base.Equals(other) &&
                   object.Equals(this.WellKnownText, ((GeoAreaConstraint)other).WellKnownText);
        }

        /// <summary>
        /// Serves as a hash function for a particular type. <see cref="M:System.Object.GetHashCode"></see> is suitable for use in hashing algorithms and data structures like a hash table.
        /// </summary>
        /// <returns>
        /// A hash code for the current <see cref="T:System.Object"></see>.
        /// </returns>
        public override int GetHashCode()
        {
            var hashCode = 0;

            hashCode ^= this.WellKnownText.GetHashCode();

            return hashCode;
        }

        /// <summary>
        /// Used by the Builder to filter out items. 
        /// </summary>
        /// <param name="indexer">Usually an attribute</param>
        /// <param name="value">Value of the attribute</param>
        /// <returns>bool if it satisfies the constraint</returns>
        public override bool ValueSatisfiesConstraint(IIndexer indexer, object value)
        {
            var satisfies = true;

            // Could convert the value lat long to SQL Geography and run a STIntersects on the geography search.
            return satisfies;
        }

        /// <summary>
        /// Determines whether [has null constraint].
        /// </summary>
        /// <returns>
        /// <c>true</c> if [has null constraint]; otherwise, <c>false</c>.
        /// </returns>
        internal override bool HasNullConstraint()
        {
            return false;
        }

        /// <summary>
        /// Has Anycoordinates.
        /// </summary>
        /// <returns>
        /// A valid states if have any coordinates.
        /// </returns>
        public bool HasAnyCoordinates()
        {
            foreach(var coord in this.coordinates)
            {
                return true;
            }
            return false;
        }

    }
}