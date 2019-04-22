//  Purpose: To implement a 'Find' within a <select> list of options
//
//
//  There are 2 ways to use this script the first allows only a single 'find' per document the second (which
//  is ever-so-slightly more complicated to use) allows any number.
//
//  Use:  1.   In onLoad event call setUp(form_name, select_list_name, find_input_text_item_name)
//
//           where... 
//                 form_name is the name of the form containing the <select> list and field that contains 
//                           the seach string.
//
//                 select_list_name is the name of the <select> object to be searched
//
//                 find_input_text_item_name is the name of the <input> object that the user types his
//                                           search string into.
//
//           In the find event (ususally onClick on a button beside the Find string) call obj1.bldUpdate();
//
// eg 	<body onLoad="javascript:setUp('reportitems', 'ptColumnList', 'entry');">
//
//      <form name="reportitems">
//
//      <select name="ptColumnList" multiple>
//      <option value="123">ABC
//      ...
//      </select>
//
//	<input type="text" name="entry">
//	<input type="button" value="Find" onClick="javascript:obj1.bldUpdate();">
//
//      </form>
//
//
//  Use:   2.	In onload event create 'select' objects to represent each of the lists of options that
//              you'll be manipulating.
//
//		<body onLoad="javascript:your_list_object=new SelObj(form_name, select_list_name, find_input_text_item_name);">');
//
//           	In the find event (ususally onClick on a button beside the Find string) call your_list_object.bldUpdate();
//		
//	eg
//		<body onLoad="javascript:SessList=new SelObj('Sessions','pnSessionId','pvFind');"
//
//		<form name="Sessions">
//		<select name="ptColumnList" multiple>
//      	<option value="123">ABC
//      	...
//      	</select>
//
//      	<input type="text" name="pvFind">
//      	<input type="button" value="Find" onClick="javascript:SessList.bldUpdate();">
//
//      	</form>
//
// Notes:  The script preserves any selected elements from the previous search.
//
//         Remember that the find_input_text_item_name ('entry' and 'pvFind' in the examples above) is a field in the
//         form that contains the list item. So, if the form is submitted, the processing code must accept it
//         as an input argument even though it will not need it.
//
//
var usingIt = false;

function startUsing() {
    usingIt = true;
    return;
}

function endUsing() {
    usingIt = false;
    return;
}

function SelObj(formname,selname,textname,str) {
    this.formname = formname;
    this.selname = selname;
    this.textname = textname;
    this.selectArr = new Array();
    this.valueArr = new Array();
    this.textArr = new Array();
    this.selectedArr = new Array();
    this.indexArr = new Array();
    this.initialize = initialize;
    this.bldInitial = bldInitial;
    this.bldUpdate = bldUpdate;
}
function initialize() {
    startUsing();
    if (this.valueArr.length == 0) {

        //
        // Store <select> list options in javascript arrays
        //
        for (var i=0;i<document.forms[this.formname][this.selname].options.length;i++) {
            this.selectArr[i] = document.forms[this.formname][this.selname].options[i];
            this.valueArr[i]  = document.forms[this.formname][this.selname].options[i].value;
            this.textArr[i]   = document.forms[this.formname][this.selname].options[i].text;
            this.selectedArr[i]   = document.forms[this.formname][this.selname].options[i].selected;
            this.indexArr[i] = i;
        }
    }
    else {

        //
        // Mark all options as NOT selected
        //
        for (var i=0;i<this.valueArr.length;i++) {
            this.selectArr[i] = new Option(this.textArr[i],this.valueArr[i]);
            this.selectedArr[i] = false;
        }

        // 
        // Loop through all current (displayed) options and remember those selected
        //
        for (var j=0; j<this.indexArr.length; j++) {
            if (document.forms[this.formname][this.selname].options[j].selected) {
                this.selectedArr[this.indexArr[j]] = true;
            }
        }
    }
    endUsing();
    return;
}
function bldInitial() {
    startUsing();
    self.status = "working...";
    this.initialize();

    //
    // Build the complete <select> list
    //
    for (var i=0;i<this.selectArr.length;i++) {
        document.forms[this.formname][this.selname].options[i] = this.selectArr[i];
        document.forms[this.formname][this.selname].options[i].selected = this.selectedArr[i];
    }
    document.forms[this.formname][this.selname].options.length = this.selectArr.length;
    self.status = "";
    endUsing();
    return;
}
function bldUpdate() {
    if (usingIt) {
        return;
    }

    //
    // Using RegExp so remove * which is not a wildcard in a regular expression
    //
    var str = document.forms[this.formname][this.textname].value.replace(/[\s%*]/g,'');
 

    //
    // If empty search string then simply return the complete list
    //
    if (str == '') {
        this.bldInitial();
        return;
    }

    startUsing();
    this.bldInitial();
    self.status = "working...";
    this.indexArr.length = 0;
    var j = 0;
    pattern1 = new RegExp(str,"i");

    //
    // Loop through all options keeping those that match the search string or are already
    // selected
    //
    for (var i=0;i<this.selectArr.length;i++) {
        if (pattern1.test(this.selectArr[i].text) || this.selectedArr[i]) {

// doesn't work in ie5       document.forms[this.formname][this.selname].options[j] = this.selectArr[i];
            document.forms[this.formname][this.selname].options[j] = new Option(this.textArr[i],this.valueArr[i]);

            //
            // Store this element's position in the complete list
            //
            this.indexArr[j] = i;

            if (this.selectedArr[i]) {
              document.forms[this.formname][this.selname].options[j].selected=true;
            }
            j++;
        }
    }
    
    //
    // Truncate <select> to correct length
    //
    document.forms[this.formname][this.selname].options.length = j;

    //
    // Pre-select option if there's only one
    //
    //if (j==1){
    //    document.forms[this.formname][this.selname].options[0].selected = true;
    //}
    self.status = "";
    endUsing();
}
function setUp(Form,List,Entry) {
    self.focus();
    obj1 = new SelObj(Form,List,Entry);
    obj1.initialize();
    if (document.forms[Form][Entry].value != '') {
        obj1.bldUpdate();
    }
}
function setUpSelObj() {
   this.initialize();
   if (document.forms[Form][Entry].value != '') {
        this.bldUpdate();
    }
}