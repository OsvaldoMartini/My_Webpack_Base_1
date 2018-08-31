// <copyright file="MapLayerCacheFacade.cs" company="IHS">
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

namespace IHS.Apps.CMP.DatabaseAccess.DataFacade
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using IHS.Apps.CMP.Common;
    using IHS.Apps.CMP.Common.Cache;
    using IHS.Apps.CMP.Models.ViewModels;
    using IHS.Apps.CMP.Models.ViewModels.Map;
    using IHS.Apps.CMP.Models.ViewModels.Map.Utilities;

    /// <summary> The dashboard cache facade. </summary>
    public class MapLayerCacheFacade : IMapLayerFacade
    {
        /// <summary> The map layer facade. </summary>
        private readonly IMapLayerFacade mapLayerFacade;

        /// <summary>The cache to store results within</summary>
        private readonly ICacheService cache;

        /// <summary>
        ///   Initialises a new instance of the <see cref="MapLayerCacheFacade"/> class. Initializes a new
        ///   instance of the <see cref="MapLayerCacheFacade"/> class.
        /// </summary>
        /// <param name="mapLayerFacade"> The map layer facade. </param>
        public MapLayerCacheFacade(IMapLayerFacade mapLayerFacade)
        {
            this.mapLayerFacade = mapLayerFacade;
            this.cache = CacheFactory.Instance.CreateCache("MapLayerCache", CacheFactory.CacheScope.Volatile);
        }

        /// <summary>
        /// Get KMLMapLayers from date to date.
        /// </summary>
        /// <param name="from">Date to search from</param>
        /// <param name="to">Date to search to.</param>
        /// <param name="type">The type of layer to select.</param>
        /// <returns>
        /// Collection of KML Map Layers.
        /// </returns>
        public IEnumerable<MapKmlLayer> GetKMLLayer(DateTime from, DateTime to, KmlMaplayerType type)
        {
            var key = this.cache.GenerateKey("Map", from.ToString("s"), to.ToString("s"), type.ToString());
            return this.cache.GetOrSet(key, () => this.mapLayerFacade.GetKMLLayer(from, to, type));
        }

        /// <inheritdoc />
        public void Insert(KmlGroup group)
        {
            this.mapLayerFacade.Insert(group);
        }

        /// <inheritdoc />
        public void Insert(KmlFeature feature)
        {
            this.mapLayerFacade.Insert(feature);
        }

        /// <summary>
        /// Insert MapArea into the database.
        /// </summary>
        /// <param name="area">The area to save.</param>
        public void Insert(MapArea area)
        {
            this.mapLayerFacade.Insert(area);
        }

        /// <summary>
        /// Update MapArea in the database.
        /// </summary>
        /// <param name="area">The area to update.</param>
        public void Update(MapArea area)
        {
            this.mapLayerFacade.Update(area);
        }

        /// <summary>
        /// Delete MapArea from the database.
        /// </summary>
        /// <param name="area">The area to delete.</param>
        public void Delete(MapArea area)
        {
            this.mapLayerFacade.Delete(area);
        }

        /// <summary>
        /// Gets Map ares belonging to userId with optional name search.
        /// </summary>
        /// <param name="userId">The unique is of the user.</param>
        /// <param name="name">The name of the </param>
        /// <returns>List of map areas.</returns>
        public IEnumerable<MapArea> GetGeoAreas(string userId, string name)
        {
            return this.mapLayerFacade.GetGeoAreas(userId, name);
        }

        /// <summary>
        /// Gets Map ares belonging to userId with optional name search.
        /// </summary>
        /// <param name="category">The name of the category to search for</param>
        /// <returns>List of map areas.</returns>
        public IEnumerable<MapArea> GetGeoFeatures(string category)
        {
            var key = this.cache.GenerateKey("Map", "geoFeatures", category);

            var regions = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatures(category));

            return regions;
        }

       /// <inheritdoc />
        public IEnumerable<MapArea> GetGeoFeatures(string category, string name)
        {
            var key = this.cache.GenerateKey("Map", "geoFeatures", category, name);

            var regions = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatures(category, name));

            return regions;
        }

        /// <summary>
        /// Gets a set of feature names that are associated with the map.
        /// </summary>
        /// <param name="category">The name of the category to search for</param>
        /// <returns>List of map feature ids and names.</returns>
        public IEnumerable<string> GetGeoFeatureNames(string category)
        {
            var key = this.cache.GenerateKey("Map", "GetGeoFeatureNames", category);

            var features = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatureNames(category));

            return features;
        }

        /// <inheritdoc />
        public void MergeCountries(string mainCountry, string otherCountry)
        {
            this.mapLayerFacade.MergeCountries(mainCountry, otherCountry);
        }

        /// <summary>
        /// Gets all the regions and countries lat longs from the database.
        /// </summary>
        /// <returns>
        /// Collection of name, lat, long
        /// </returns>
        public ICollection<GeoLocation> GetRegions()
        {
            var key = this.cache.GenerateKey("Map", "regions");

            var regions = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetRegions());

            return regions;
        }

        /// <summary>
        /// Get Files that have already been processed from a list of filenames.
        /// </summary>
        /// <param name="filenames">Filenames to search for.</param>
        /// <returns>
        /// A List of filenames.
        /// </returns>
        public IEnumerable<string> GetFilesProcessed(IEnumerable<string> filenames)
        {
            var key = this.cache.GenerateKey("Map", filenames.OrderBy(p => p).ToArray());

            return this.cache.GetOrSet(key, () => this.mapLayerFacade.GetFilesProcessed(filenames));
        }

        /// <inheritdoc />
        public GeoLocation GetGeoRegion(string name)
        {
            var regions = this.GetRegions();

            if (regions == null)
            {
                return null;
            }

            var requested = regions.FirstOrDefault(p => p.Name == name);

            if (requested != null)
            {
                return requested;
            }

            var key = this.cache.GenerateKey("Map", name);

            return this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoRegion(name));
        }

        /// <inheritdoc />
        public GeoLocation GetGeoRegion(IsoCode code)
        {
            var regions = this.GetRegions();

            if (regions == null)
            {
                return null;
            }

            var requested = regions.SingleOrDefault(p => p.Iso2 == code.Code);

            if (requested != null)
            {
                return requested;
            }

            var key = this.cache.GenerateKey("Map", code.Code);

            return this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoRegion(code.Code));
        }

        /// <inheritdoc />
        public IEnumerable<MapArea> GetGeoFeatures(IEnumerable<string> category)
        {
            var key = this.cache.GenerateKey("Map", "GetGeoFeatures", category.Implode("|"));

            var features = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatures(category));

            return features;
        }

        /// <inheritdoc />
        public IEnumerable<MapArea> GetGeoFeatures(IEnumerable<string> category, Geometry geometry)
        {
            var key = this.cache.GenerateKey("Map", "GetGeoFeatures", category.Implode("|"), geometry.ToWellKnownText());

            var features = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatures(category, geometry));

            return features;
        }

        /// <inheritdoc />
        public IEnumerable<MapArea> GetGeoFeatures(IEnumerable<string> category, Geometry geometry, bool fetchDetails)
        {
            var key = this.cache.GenerateKey("Map", "GetGeoFeatures", category.Implode("|"), geometry.ToWellKnownText(), fetchDetails.ToString());

            var features = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatures(category, geometry, fetchDetails));

            return features;
        }

        /// <inheritdoc />
        public IEnumerable<MapArea> GetGeoFeatures(IEnumerable<string> category, Geometry geometry, double tolerance, bool fetchDetails)
        {
            var key = this.cache.GenerateKey("Map", "GetGeoFeatures", category.Implode("|"), geometry.ToWellKnownText(), tolerance.ToString(CultureInfo.InvariantCulture), fetchDetails.ToString());

            var features = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetGeoFeatures(category, geometry, tolerance, fetchDetails));

            return features;
        }

        /// <inheritdoc />
        public Polygon GetCountryExtent(string category, string country)
        {
            var key = this.cache.GenerateKey("Map", "GetCountryExtent", country);

            var polygon = this.cache.GetOrSet(key, () => this.mapLayerFacade.GetCountryExtent(category, country));

            return polygon;
        }
    }
}