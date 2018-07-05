/**


NameSearch.js

Purpose : Run js functions for the Namesearch (save search) modal window



**/

//ddlPrgFrequency

 
var debug = false;
var offset = new Date().getTimezoneOffset();
//offset = -600;
if (debug)
    alert('offset = ' + offset);
// now we have the offset which means how does GMT compare to this time zone
// thus, if current time is BST (+1) then the offset will be -60 meaning GMT is 60 minutes less.

//initally the dropdowns are set in 
$(document).ready(function() {
        $('#trHourlyRange').toggle();
        $('#trHourlyRangeTitle').toggle();

        $('#ddlPreviousSearches').click(function() {
                $("#radioExisting").prop("checked", true);
            }
        );

    $('#lblTimeZoneHours').html("<b>When should we send emails to you?</b><br/><br/>Your time = <b>UTC" + (offset >= 0 ? "-" : "+") + ((parseInt(-1 * offset) / 60)).toString() + "</b>");
    $('#ddlPrgFrequency').change(function () {

         

        if ($(this).val() == "60") { // hourly
            $('#trHourlyRangeTitle').show();
            $('#trHourlyRange').show();
            
            //update the values on the hour dropdowns to reflect users time not GMT
            $("#namesearchComboStart > option").each(function () {

                if (debug)
                    this.text = this.text + " : " + this.value + " GMT " + (parseInt(this.value) + parseInt(offset));

                this.value = (parseInt(this.value) + parseInt(offset));

            });
            $("#namesearchComboStop > option").each(function () {

                if (debug)
                    this.text = this.text + " : " + this.value + " GMT " + (parseInt(this.value) + parseInt(offset));

                this.value = (parseInt(this.value) + parseInt(offset));


            });

        }
        else {
            $('#trHourlyRange').hide();
            $('#trHourlyRangeTitle').hide();

        }
    });

});
 
 