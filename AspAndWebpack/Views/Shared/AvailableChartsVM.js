var AvailableChartsVM = function (addfunction) {

    var self = this;
    self.charts = ko.observableArray([]);
    self.allowMultipleCharts = true; // maybe get this from the config

    $.get("Chart/GetAvailableCharts", function (result) {
        for (var i = 0; i < result.length; i++) {

            self.charts.push(new availableChart(result[i].Item1, result[i].Item2, result[i].Item3, clicker));
        }

        //Check the first one while we are here.
        self.charts()[0].isChecked(true);
        addfunction(self.charts()[0].id, false);
    });

   

    function clicker(f) {
        for (var i = 0; i < self.charts().length; i++) {
            if (self.charts()[i].id == f.id)
            {
                // this happens before the observable changes so we check for NOT checked
                if (self.charts()[i].isChecked() == false) {
                    addfunction(self.charts()[i].id, false);
                }
                else {
                    addfunction(self.charts()[i].id, true);//remove
                }
            }
            else
            {
                if (! self.allowMultipleCharts) {
                    self.charts()[i].isChecked(false);
                    addfunction(self.charts()[i].id, true);//remove
                }
            }

        }
        return true;
    }
}
 
function availableChart (title, id, type, onclick)
{
    var self = this;
    self.title = title;
    self.isChecked = ko.observable(false);
    self.id = id;
    self.chartType = (type === "Pie" ? "icon-chart-pie" : (type === "Area" ? "icon-chart-area" : (type === "Line" ? "icon-chart-line" : "icon-chart-bar")));
    self.onclick = onclick;

}

 