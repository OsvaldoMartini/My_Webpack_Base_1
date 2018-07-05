/*
 * An abstract class to represent a widget on the dashboard. Allows for specific methods to be called if overridden
 */
var WidgetBase = function () {
    this.widgetId = -1;
};

WidgetBase.prototype.onDashboardResize = function () {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetExpand = function (container) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetMinify = function (container) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetResize = function (container) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetLoaded = function (widgetVM) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetMoveStart = function (container) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetMoveEnd = function (container) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onWidgetRemove = function () {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.onSubjectChange = function () {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.updateSettings = function (key, value) {
    // Sub class should override this method in order to implement it.
};

WidgetBase.prototype.getContainer = function () {
    // Sub class should override this method in order to implement it.
};