// <copyright file="GridUtil.cs" company="IHS">
//     Copyright © 2016 IHS Inc. and its affiliated and subsidiary companies, all rights reserved.
//     All other trademarks are the property of IHS Inc. and its affiliated and subsidiary companies.
//    
//     This product, including software, data and documentation are licensed to the user for its
//     internal business purposes only and may not be disclosed, disseminated, sold, licensed,
//     copied, reproduced, translated or transferred to any third party.
//    
//     IHS Inc. 15 Inverness Way East Englewood, Colorado 80112 USA
//     +1 303-736-3000
// </copyright>

namespace IHS.Apps.CMP.Utilities.Config
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Configuration;
    using System.Diagnostics.CodeAnalysis;
    using System.Linq;
    using System.Web;

    using IHS.Apps.CMP.Logging;

    using IHS.Apps.CMP.Common;
    using IHS.Apps.CMP.Models.Configuration;
    using IHS.Apps.CMP.Profile;
    using IHS.Core.Catalog.Model;

    /// <summary>
    /// Grid utility class used to handle loading of configuration information.
    /// </summary>
    public static class GridUtil
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GridUtil));

        /// <summary>
        /// Gets or sets the session current selected template.
        /// WARNING! This is a hack fix, the code using this is terrible so for now it uses the
        /// session to store the variable until the code can be "cleansed". Otherwise is a user
        /// changes their template everyone's template changes!!!! - G.H
        /// </summary>
        public static string SelectedTemplate
        {
            get
            {
                string result = HttpContext.Current.Session["SelectedGridTemplate"] as string;

                if (string.IsNullOrEmpty(result))
                {
                    HttpContext.Current.Session["SelectedGridTemplate"] = result = string.Empty;
                }

                return result;
            }

            set
            {
                HttpContext.Current.Session["SelectedGridTemplate"] = value;
            }
        }

        /// <summary>
        /// Takes clone of the grid configuration.
        /// </summary>
        /// <param name="original">The original configuration to clone.</param>
        /// <returns>A new grid configuration object.</returns>
        public static gridconfigCategory Clone(gridconfigCategory original)
        {
            byte[] b = CommonUtilities.GetBinary(original);
            return CommonUtilities.GetObject<gridconfigCategory>(b);
        }

        /// <summary>
        /// Get category configuration and do extra bits for ArcGIS Live Map.
        /// </summary>
        /// <param name="config">The grid configuration.</param>
        /// <param name="category">The category you wish to retrieve configuration for.</param>
        /// <returns>The grid configuration for the category.</returns>
        public static gridconfigCategory GetArcGisConfigForCategory(gridconfig config, IAttributeContainer category)
        {
            gridconfigCategory gridConfig = GetConfigForCategory(config, category.ObjectKey, null);

            // 1. assign each service unique ID so we can easily refer to it client side
            // 2. build full URLs for services
            for (int serviceCounter = 0; serviceCounter < gridConfig.live_map_arcgis.services.service.Length; serviceCounter++)
            {
                live_map_arcgisServicesService arcgisService = gridConfig.live_map_arcgis.services.service[serviceCounter];

                //if not manually assigned, assign counter
                if (string.IsNullOrEmpty(arcgisService.id))
                {
                    arcgisService.id = serviceCounter.ToString("000");
                }

                string homeURL = string.Empty;
                if (string.IsNullOrEmpty(arcgisService.home_url_key))
                {
                    homeURL = ConfigurationManager.ConnectionStrings[gridConfig.live_map_arcgis.services.home_url_key].ConnectionString;
                }
                else
                {
                    homeURL = ConfigurationManager.ConnectionStrings[arcgisService.home_url_key].ConnectionString;
                }

                arcgisService.url = homeURL + "/" + arcgisService.relative_path;
            }

            if (gridConfig.live_map_arcgis.label_service != null)
            {
                live_map_arcgisLabel_service labelService = gridConfig.live_map_arcgis.label_service;
                labelService.url = ConfigurationManager.ConnectionStrings[labelService.home_url_key].ConnectionString + "/" + labelService.relative_path;
            }

            return gridConfig;
        }

        /// <summary>
        /// Gets configuration information for a given category.
        /// </summary>
        /// <param name="config">The grid configuration.</param>
        /// <param name="category">The category you wish to retrieve configuration for.</param>
        /// <returns>The grid configuration for the category.</returns>
        public static gridconfigCategory GetConfigForCategory(gridconfig config, IAttributeContainer category)
        {
            return GetConfigForCategory(config, category.ObjectKey, null);
        }

        /// <summary>
        /// Gets configuration information for a given category.
        /// </summary>
        /// <param name="config">The navigator configuration object</param>
        /// <param name="category">The category you wish to retrieve configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <returns>The grid configuration for the category.</returns>
        public static gridconfigCategory GetConfigForCategory(gridconfig config, IAttributeContainer category, string viewName)
        {
            return GetConfigForCategory(config, category.ObjectKey, viewName);
        }

        /// <summary>
        /// Gets configuration information for a given category.
        /// </summary>
        /// <param name="config">The navigator configuration object</param>
        /// <param name="categoryKey">The category key you wish to retrieve configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <returns>The grid configuration for the category.</returns>
        public static gridconfigCategory GetConfigForCategory(gridconfig config, string categoryKey, string viewName)
        {
            gridconfigCategory retVal = null;
            Collection<gridconfigCategory> grids = new Collection<gridconfigCategory>();

            //add all grids for the category to a collection
            foreach (gridconfigCategory configCat in config.Items)
            {
                if (!string.IsNullOrEmpty(configCat.key))
                {
                    string[] keys = configCat.key.Split(new string[] { CMPConfiguration.CommaDelimiter.ToString() }, StringSplitOptions.RemoveEmptyEntries);
                    int keyIndex = Array.IndexOf(keys, categoryKey);
                    if (keyIndex > -1)
                    {
                        grids.Add(configCat);
                    }
                }
            }

            if (grids.Count > 0)
            {
                if (grids.Count.Equals(1))
                {
                    retVal = grids[0];
                }
                else
                {
                    foreach (gridconfigCategory gridConfig in grids)
                    {
                        if ((string.IsNullOrEmpty(gridConfig.view_name) && string.IsNullOrEmpty(viewName)) || (!string.IsNullOrEmpty(gridConfig.view_name) && !string.IsNullOrEmpty(viewName) && gridConfig.view_name.Equals(viewName, StringComparison.OrdinalIgnoreCase)))
                        {
                            retVal = gridConfig;
                            break;
                        }
                    }

                    if (retVal == null)
                    {
                        //if its still null then default to the first grid
                        retVal = grids[0];
                    }
                }
            }

            return retVal;
        }

        /// <summary>
        /// Get category configuration and do extra bits for ArcGIS Feature Map.
        /// </summary>
        /// <param name="config">The navigator configuration object</param>
        /// <param name="category">The category you wish to retrieve configuration for.</param>
        /// <returns>The grid configuration for the category.</returns>
        public static gridconfigCategory GetFeatureMapArcGisConfigForCategory(gridconfig config, IAttributeContainer category)
        {
            gridconfigCategory gridConfig = GetConfigForCategory(config, category.ObjectKey, null);

            return gridConfig;
        }

        /// <summary>
        /// Retrieves a specific grid template configuration from category grid configuration.
        /// </summary>
        /// <param name="gridCategoryConfig">The grid configuration for the category.</param>
        /// <param name="templateName">The name of the required template.</param>
        /// <returns>The grid template configuration.</returns>
        public static template GetTemplateForCategory(gridconfigCategory gridCategoryConfig, string templateName)
        {
            template retVal = null;

            if (gridCategoryConfig.template != null && gridCategoryConfig.template.Length > 0)
            {
                foreach (template temp in gridCategoryConfig.template)
                {
                    if (temp.name.Equals(templateName, StringComparison.InvariantCultureIgnoreCase))
                    {
                        retVal = temp;
                        break;
                    }
                }
            }

            return retVal;
        }

        /// <summary>
        /// Loads the grid configuration.
        /// </summary>
        /// <param name="application">The application name.</param>
        /// <param name="configCacheKey">The key to the configuration cache.</param>
        /// <returns>The grid configuration.</returns>
        public static gridconfig LoadConfig(string application, string configCacheKey)
        {
            return LoadConfig(HttpContext.Current != null ? HttpContext.Current : null, application, configCacheKey, null, null, false);
        }

        /// <summary>
        /// Loads the grid configuration.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="application">The application name.</param>
        /// <param name="configCacheKey">The key to the configuration cache.</param>
        /// <param name="category">The category you wish to retrieve grid configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <returns>The grid configuration.</returns>
        public static gridconfig LoadConfig(HttpContext context, string application, string configCacheKey, IAttributeContainer category, string viewName)
        {
            return LoadConfig(context, application, configCacheKey, category, viewName, false);
        }

        /// <summary>
        /// Loads the grid configuration.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="application">The application name.</param>
        /// <param name="configCacheKey">The key to the configuration cache.</param>
        /// <param name="category">The category you wish to retrieve grid configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <param name="exporting">A value indicating whether an export is being done or not.</param>
        /// <returns>The grid configuration.</returns>
        public static gridconfig LoadConfig(HttpContext context, string application, string configCacheKey, IAttributeContainer category, string viewName, bool exporting)
        {
            gridconfig gridConfig = null;

            // Get the configuration from the User Profile
            gridConfig = LoadUserConfig(context, application, configCacheKey, category, viewName, exporting);

            return gridConfig;
        }

        #region User Grid Config Utilities

        /// <summary>
        /// Get the User Grid Config.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="applicationKey">The application name.</param>
        /// <param name="category">The category you wish to retrieve grid configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <returns>The user specific grid configuration.</returns>
        public static GridUserConfig GetUserGridConfig(HttpContext context, string applicationKey, IAttributeContainer category, string viewName)
        {
            return ((BaseProfile)context.Profile).GetUserGridConfig(applicationKey, category.ID, viewName);
        }

        /// <summary>
        /// Get the User Grid Config.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="applicationKey">The application name.</param>
        /// <param name="category">The category you wish to retrieve grid configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <returns>A collection of grid user configuration. Collection is empty if no user grid configurations found.</returns>
        public static GridUserConfigContainer GetUserGridConfigs(HttpContext context, string applicationKey, IAttributeContainer category, string viewName)
        {
            return ((BaseProfile)context.Profile).GetUserGridConfigs(applicationKey, category.ID, viewName);
        }

        /// <summary>
        /// Load the User Grid Config.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="application">The application name.</param>
        /// <param name="gridCacheKey">The key to the configuration cache.</param>
        /// <param name="category">The category you wish to retrieve grid configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <param name="exporting">A value indicating whether an export is being done or not.</param>
        /// <returns>The grid configuration.</returns>
        public static gridconfig LoadUserConfig(HttpContext context, string application, string gridCacheKey, IAttributeContainer category, string viewName, bool exporting)
        {
            return LoadUserConfig(context, application, gridCacheKey, category, viewName, null, exporting);
        }

        /// <summary>
        /// Load the User Grid Config.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="application">The application name.</param>
        /// <param name="gridCacheKey">The key to the configuration cache.</param>
        /// <param name="category">The category you wish to retrieve grid configuration for.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <param name="templateName">The name of the required template.</param>
        /// <param name="exporting">A value indicating whether an export is being done or not.</param>
        /// <returns>The grid configuration object.</returns>
        public static gridconfig LoadUserConfig(HttpContext context, string application, string gridCacheKey, IAttributeContainer category, string viewName, string templateName, bool exporting)
        {
            bool mergeSuccessful = true;
            gridconfig userConfig = null;

            // Get the default config
            gridconfig defaultConfig = (gridconfig)CmpConfigManager.GetConfig(context!=null?context.Cache:null,
                                                        CmpConfigManager.ConfigType.GridConfig,
                                                        context!=null? context.Request.PhysicalApplicationPath: @"..\..\..\Web\UI", application);

            // Check whether a User Config exists
            if (category != null && ((BaseProfile)context.Profile).UserGridConfigExists(application, category.ID, viewName, templateName))
            {
                // Clone the default config
                userConfig = GenericUtilities.DeepClone<gridconfig>(defaultConfig);

                //insert any duplicate columns
                InjectDuplicateColumns(userConfig, category);

                // Merge the user config with the default config
                MergeConfig(context, userConfig, application, category, viewName, templateName, ref mergeSuccessful, exporting);
            }
            else
            {
                mergeSuccessful = false;
            }

            if (!mergeSuccessful)
            {
                //use the default configuration
                userConfig = defaultConfig;
            }

            return userConfig;
        }

        /// <summary>
        /// Reset the User Grid Config.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="applicationKey">The application name.</param>
        /// <param name="categoryId">The identifier for the category to be reset.</param>
        /// <param name="viewName">The name of the grid to target - categories can have more than one grid configuration.</param>
        public static void ResetUserGridConfig(HttpContext context, string applicationKey, string categoryId, string viewName)
        {
            ((BaseProfile)context.Profile).ResetUserGridConfig(applicationKey, categoryId, viewName);

            return;
        }

        /// <summary>
        /// Remove the User Grid Config
        /// </summary>
        /// <param name="context">The HTTP context. Use when using asychronous calls.</param>
        /// <param name="applicationKey">The application name.</param>
        /// <param name="categoryId">The identifier for the category which the config belongs to.</param>
        /// <param name="templateName">The template name of the user grid that will be removed from the user profile.</param>
        public static void RemoveUserGrid(HttpContext context, string applicationKey, string categoryId, string templateName)
        {
            ((BaseProfile)context.Profile).RemoveUserGridConfig(applicationKey, categoryId, templateName);
        }

        /// <summary>
        /// Set the User Grid Config.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="gridUserConfig">The user specific grid configuration.</param>
        public static void SetUserGridConfig(HttpContext context, GridUserConfig gridUserConfig)
        {
            ((BaseProfile)context.Profile).SetUserGridConfig(gridUserConfig);
        }

        /// <summary>
        /// Configures a users display columns.
        /// </summary>
        /// <param name="category">The category being configured.</param>
        /// <param name="gridUserConfig">The user specific grid configuration.</param>
        /// <param name="originalColumns">The originally displayed columns.</param>
        /// <param name="newColumns">The user configured display columns.</param>
        private static void ConfigureUserDisplayColumns(IAttributeContainer category, GridUserConfig gridUserConfig, Dictionary<string, column> originalColumns, Dictionary<string, column> newColumns)
        {
            int count = 0;
            foreach (string displayColumn in gridUserConfig.DisplayColumns)
            {
                string colKey = GetColumnKey(category, displayColumn);

                if (!string.IsNullOrEmpty(colKey) && originalColumns.ContainsKey(colKey))
                {
                    if (newColumns.ContainsKey(colKey))
                    {
                        //modify the already existing column
                        newColumns[colKey].is_displayed = true;

                        //If a break has been configured to be inserted before this entry but it is now the first in the list move the break to the end
                        if (count == 0 && originalColumns[colKey].apply_column_breakSpecified && originalColumns[colKey].apply_column_break == break_type.before)
                        {
                            newColumns[colKey].apply_column_break = break_type.after;
                        }
                    }
                    else
                    {
                        //add a new column
                        column newCol = originalColumns[colKey];
                        newCol.is_displayed = true;
                        newCol.is_exportable = false;

                        //If a break has been configured to be inserted before this entry but it is now the first in the list move the break to the end
                        if (count == 0 && originalColumns[colKey].apply_column_breakSpecified && originalColumns[colKey].apply_column_break == break_type.before)
                        {
                            newCol.apply_column_break = break_type.after;
                        }

                        newColumns.Add(colKey, newCol);
                    }

                    count++;
                }
            }
        }

        /// <summary>
        /// Configures a users export columns
        /// </summary>
        /// <param name="category">The category being configured.</param>
        /// <param name="gridUserConfig">The user specific grid configuration.</param>
        /// <param name="originalColumns">The originally export columns.</param>
        /// <param name="newColumns">The user configured export columns.</param>
        private static void ConfigureUserExportColumns(IAttributeContainer category, GridUserConfig gridUserConfig, Dictionary<string, column> originalColumns, Dictionary<string, column> newColumns)
        {
            //make sure we run through the export columns first so they are in the correct order
            foreach (string exportColumn in gridUserConfig.ExportColumns)
            {
                string colKey = GetColumnKey(category, exportColumn);

                if (!string.IsNullOrEmpty(colKey) && originalColumns.ContainsKey(colKey))
                {
                    if (newColumns.ContainsKey(colKey))
                    {
                        //modify the already existing column
                        newColumns[colKey].is_exportable = true;
                    }
                    else
                    {
                        //add a new column
                        column newCol = originalColumns[colKey];
                        newCol.is_exportable = true;
                        newCol.is_displayed = false;
                        newColumns.Add(colKey, newCol);
                    }
                }
            }
        }

        /// <summary>
        /// Gets the column key for a supplied column entry, handles old column being defined using GUIDs not keys.
        /// </summary>
        /// <param name="category">The category to get the column from.</param>
        /// <param name="exportColumn">The column key / GUID.</param>
        /// <returns>The column key.</returns>
        private static string GetColumnKey(IAttributeContainer category, string exportColumn)
        {
            string colKey = exportColumn;
            if (exportColumn.Length == 36)
            {
                // before the change to 3x customised columns were stored as GUIDs they are now keys but we must check
                try
                {
                    Guid temp = new Guid(exportColumn);
                    IIndexer idx = category.Indexers.Get(exportColumn, IHS.Core.Common.IdentifierType.GUID);
                    if (idx != null)
                    {
                        colKey = idx.ObjectKey;
                    }
                    else
                    {
                        throw new ArgumentException("Custom column configuration error");
                    }
                }
                catch (FormatException)
                {
                    //its not a GUID so assume its a key
                }
            }

            return colKey;
        }

        /// <summary>
        /// Duplicates tagged columns in all templates for the supplied category.
        /// </summary>
        /// <param name="userConfig">The grid configuration.</param>
        /// <param name="category">The category to duplicate columns for.</param>
        private static void InjectDuplicateColumns(gridconfig userConfig, IAttributeContainer category)
        {
            column[] cols = null;

            for (int item = 0; item < userConfig.Items.Length; item++)
            {
                if (userConfig.Items[item].key == category.ObjectKey)
                {
                    for (int template = 0; template < userConfig.Items[item].template.Length; template++)
                    {
                        if (userConfig.Items[item].template[template].column != null)
                        {
                            for (int i = userConfig.Items[item].template[template].column.Length - 1; i >= 0; i--)
                            {
                                var duplicator = userConfig.Items[item].template[template].column[i].column_duplicator;
                                if (duplicator != null)
                                {
                                    string duplicatorMethod = duplicator.target_method;

                                    object result = GenericUtilities.RunMethod(duplicator.assembly, duplicator.target_method,
                                        new object[] { userConfig.Items[item].template[template].column[i] });

                                    if (result != null)
                                    {
                                        cols = result as column[];
                                    }

                                    if (cols != null && cols.Length > 0)
                                    {
                                        ArrayList newColumnsToAdd = new ArrayList();

                                        // add the existing cols
                                        newColumnsToAdd.AddRange(userConfig.Items[item].template[template].column);

                                        // add the new cols
                                        newColumnsToAdd.AddRange(cols);

                                        userConfig.Items[item].template[template].column = newColumnsToAdd.ToArray(typeof(column)) as column[];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Merge a user grid configuration with the default grid configuration.
        /// </summary>
        /// <param name="context">The HTTP context. Used when using asynchronous calls</param>
        /// <param name="defaultConfig">The default grid configuration.</param>
        /// <param name="application">The application name.</param>
        /// <param name="category">The category being configured.</param>
        /// <param name="viewName">
        /// The name of the grid to target - categories can have more than one grid configuration.
        /// </param>
        /// <param name="templateName">The name of the required template.</param>
        /// <param name="mergeSuccesful">A value indicating whether the merge has been successful.</param>
        /// <param name="exporting">A value indicating whether an export is being done.</param>
        private static void MergeConfig(HttpContext context, gridconfig defaultConfig, string application, IAttributeContainer category, string viewName, string templateName, ref bool mergeSuccesful, bool exporting)
        {
            try
            {
                // Get the user grid config
                GridUserConfig gridUserConfig = GetUserGridConfig(context, application, category, viewName);

                if ((gridUserConfig != null) && (defaultConfig != null))
                {
                    // Get the default Config for the supplied Category
                    gridconfigCategory defaultCategoryconfig = GetConfigForCategory(defaultConfig, category.ObjectKey, viewName);

                    if (defaultCategoryconfig != null)
                    {
                        bool usingSystemTemplate = true;

                        //decide if we are looking for the user specific template
                        if (defaultCategoryconfig.allow_customisation)
                        {
                            usingSystemTemplate = defaultCategoryconfig.template.Any(t => t.name == templateName);
                        }

                        if (usingSystemTemplate)
                        {
                            //User is looking at a template
                            template usingTemplate = GetTemplateForCategory(defaultCategoryconfig, gridUserConfig.TemplateName);
                            if (usingTemplate == null)
                            {
                                // ********************************************EXIT
                                mergeSuccesful = false;
                                return;

                                //throw new ArgumentException("usingTemplate");
                            }

                            if (usingTemplate.column != null && usingTemplate.column.Length > 0)
                            {
                                // take the query name, columns and sorts from the parent of the
                                // template HACK - New MVC templates need the name set whereas the
                                // old grid doesn't
                                if (context.Request != null && !string.IsNullOrEmpty(context.Request.CurrentExecutionFilePath) && !context.Request.CurrentExecutionFilePath.Contains(".aspx"))
                                {
                                    defaultCategoryconfig.template[0].name = usingTemplate.name;
                                }

                                defaultCategoryconfig.template[0].view = usingTemplate.view;
                                defaultCategoryconfig.template[0].queryName = usingTemplate.queryName;
                                defaultCategoryconfig.template[0].column = usingTemplate.DeepCloneColumns();
                                if (usingTemplate.sort != null)
                                {
                                    defaultCategoryconfig.template[0].sort = usingTemplate.DeepCloneSorts();
                                }
                                else
                                {
                                    defaultCategoryconfig.template[0].sort = null;
                                }
                            }
                        }
                        else
                        {
                            //deep clone so we have a copy to work off
                            template templateToUse = defaultCategoryconfig.template.FirstOrDefault(t => t.use_for_customise_grid_screen.Equals(true));
                            if (templateToUse == null)
                            {
                                templateToUse = defaultCategoryconfig.template[0];
                            }

                            column[] savedColumns = templateToUse.DeepCloneColumns();

                            //store a keyed list of available columns to make things easier later
                            Dictionary<string, column> originalColumns = new Dictionary<string, column>();
                            foreach (column col in savedColumns)
                            {
                                if (!string.IsNullOrEmpty(col.key) && !originalColumns.ContainsKey(col.key))
                                {
                                    originalColumns.Add(col.key, col);
                                }
                                else if (string.IsNullOrEmpty(col.key) && col.type == column_type.fixed_text)
                                {
                                    originalColumns.Add(col.fixed_text, col);
                                }
                            }

                            Dictionary<string, column> newColumns = new Dictionary<string, column>();

                            //the order of the columns might change depending on the type of columns we need so process in a different order
                            if (exporting)
                            {
                                ConfigureUserExportColumns(category, gridUserConfig, originalColumns, newColumns);
                                ConfigureUserDisplayColumns(category, gridUserConfig, originalColumns, newColumns);
                            }
                            else
                            {
                                ConfigureUserDisplayColumns(category, gridUserConfig, originalColumns, newColumns);
                                ConfigureUserExportColumns(category, gridUserConfig, originalColumns, newColumns);
                            }

                            //ensure any hidden columns are also added
                            foreach (KeyValuePair<string, column> entry in originalColumns)
                            {
                                if (!newColumns.ContainsKey(entry.Key))
                                {
                                    if (entry.Value.hiddenSpecified && entry.Value.hidden)
                                    {
                                        //This IF will be removed once all grids go to MVC. We don't want unexpected export columns.
                                        if (!entry.Value.is_exportable)
                                        {
                                            newColumns.Add(entry.Key, entry.Value);
                                        }
                                    }
                                }
                            }

                            //sorts
                            Collection<sort> newSorts = new Collection<sort>();
                            int count = 0;
                            foreach (GridUserConfigSorts userSort in gridUserConfig.Sorts)
                            {
                                bool addSort = true;
                                sort newSort = new sort();
                                if (!string.IsNullOrEmpty(userSort.AttributeId))
                                {
                                    try
                                    {
                                        Guid temp = new Guid(userSort.AttributeId);
                                        IIndexer idx = category.Indexers.Get(userSort.AttributeId, IHS.Core.Common.IdentifierType.GUID);
                                        if (idx != null)
                                        {
                                            newSort.key = idx.ObjectKey;
                                        }
                                        else
                                        {
                                            //Log
                                            Log.Warn("Custom column configuration error");
                                            addSort = false;
                                        }
                                    }
                                    catch (FormatException)
                                    {
                                        //its not a GUID so assume its a key
                                    }
                                }
                                else
                                {
                                    IIndexer idx = category.Indexers.Get(userSort.Key, IHS.Core.Common.IdentifierType.KEY);
                                    if (idx != null)
                                    {
                                        newSort.key = userSort.Key;
                                    }
                                    else
                                    {
                                        //Log
                                        Log.Warn("Custom sort column configuration error");
                                        addSort = false;
                                    }
                                }

                                if (addSort == true && !string.IsNullOrEmpty(newSort.key))
                                {
                                    var originalSort = templateToUse.sort.FirstOrDefault(p => p.key == newSort.key);

                                    if (originalSort != null)
                                    {
                                        newSort.ascending_text = originalSort.ascending_text;
                                        newSort.descending_text = originalSort.descending_text;
                                    }

                                    if (userSort.SortOrder == GridUserConfigSortOrder.Ascending)
                                    {
                                        newSort.direction = sort_direction.ascending;
                                    }
                                    else
                                    {
                                        newSort.direction = sort_direction.descending;
                                    }

                                    //Do not the same ID twice
                                    for (int i = 0; i < newSorts.Count; i++)
                                    {
                                        if (newSort.key == newSorts[i].key)
                                        {
                                            addSort = false;
                                            break;
                                        }
                                    }

                                    if (addSort)
                                    {
                                        newSorts.Add(newSort);
                                    }
                                }

                                count++;
                            }

                            //trim up the arrays to ensure no null values
                            TrimNulls(ref newColumns);
                            TrimNulls(ref newSorts);
                            defaultCategoryconfig.template[0].name = gridUserConfig.TemplateName ?? "Custom View";
                            defaultCategoryconfig.template[0].column = new column[newColumns.Count];
                            defaultCategoryconfig.template[0].sort = new sort[newSorts.Count];
                            defaultCategoryconfig.template[0].view = templateToUse.view;
                            newColumns.Values.CopyTo(defaultCategoryconfig.template[0].column, 0);
                            newSorts.CopyTo(defaultCategoryconfig.template[0].sort, 0);
                        }
                    }
                }

                mergeSuccesful = true;
            }
            catch
            {
                mergeSuccesful = false;
            }
        }

        /// <summary>
        /// Trims null values from a name|value pair list.
        /// </summary>
        /// <param name="cols">The name|value pairs to remove null values from.</param>
        private static void TrimNulls(ref Dictionary<string, column> cols)
        {
            foreach (KeyValuePair<string, column> col in cols)
            {
                if (col.Value == null || string.IsNullOrEmpty(col.Key))
                {
                    cols.Remove(col.Key);
                }
            }
        }

        /// <summary>
        /// Trims null values from a sort list.
        /// </summary>
        /// <param name="sorts">The sort list to remove null values from.</param>
        private static void TrimNulls(ref Collection<sort> sorts)
        {
            foreach (sort s in sorts)
            {
                if (s == null || string.IsNullOrEmpty(s.key))
                {
                    sorts.Remove(s);
                }
            }
        }

        #endregion

        #region History Utilities

        /// <summary>
        /// Provide a dictionary look-up from category identifier to a list of history columns as <c>IAttributes</c>.
        /// </summary>
        /// <param name="item">The item to be searched.</param>
        /// <param name="gridConfig">The grid configuration for the category.</param>
        /// <returns>A list of sorted attributes.</returns>
        [SuppressMessage("StyleCop.CSharp.OrderingRules", "SA1202:ElementsMustBeOrderedByAccess", Justification = "Keeping methods grouped helps maintenance.")]
        public static SortedDictionary<int, IIndexer> GetHistoryColumns(IItem item, gridconfigCategory gridConfig)
        {
            SortedDictionary<int, IIndexer> sortedAttributes = new SortedDictionary<int, IIndexer>();

            foreach (column configColumn in gridConfig.template[0].column)
            {
                GridUtil.PopulateHistoryDictionary(ref sortedAttributes, configColumn, item);
            }

            return sortedAttributes;
        }

        /// <summary>
        /// Populates the relevant information for history columns and any child columns they have.
        /// </summary>
        /// <param name="sortedAttributes">The sorted attributes.</param>
        /// <param name="configColumn">The template column being checked..</param>
        /// <param name="binder">The item being searched.</param>
        private static void PopulateHistoryDictionary(ref SortedDictionary<int, IIndexer> sortedAttributes, column configColumn, IBindable binder)
        {
            if (configColumn.history_orderSpecified)
            {
                sortedAttributes.Add(configColumn.history_order, UIObjectHelper.GetIndexer(binder, configColumn.key));
            }

            if (configColumn.column1 != null && configColumn.column1.Length > 0)
            {
                foreach (column childCol in configColumn.column1)
                {
                    GridUtil.PopulateHistoryDictionary(ref sortedAttributes, childCol, binder);
                }
            }
        }

        #endregion
    }
}