// Copyright © IHS Energy 2010

// -------------------------------------------------------------------------------
// NOTE: Modified from EdinList.js to prevent duplicate entries in the target list
// -------------------------------------------------------------------------------

// Copies all selected options from source to destination list
// (source and destination can be the same - options will be appended to the end)
//
//The following variables are generated in the pre-render event
//_hidSortField);
//_hidRemoveSortButton
    
function AddToList(Source, Dest)
{
 var l = Dest.length;

 for (i = 0; i < Source.length; i++)
 {
  if (Source.options[i].selected)
  {
    // Check whether the entry already exists in the target list
    var exists = false;
    
    for (j = 0; j < Dest.length; j++)
    {
        if (Source.options[i].value == Dest.options[j].value || Source.options[i].text == Dest.options[j].text)
        {
            alert("Column '" + Source.options[i].text + "' is already in the list.");
            exists = true;
            break;
        }
    }
    
    //
    // Create new option in destination list
    //
    if(!exists)
    {
      if (navigator.appVersion.indexOf("MSIE",0) == -1) {
          var oOption = new Option();
      } else {
          var oOption = document.createElement("OPTION");
    }
      oOption.value = Source.options[i].value;
      oOption.text  = Source.options[i].text;
      Dest.options.add(oOption, l);
    }
  }

    l++;
 }
}

// Removes selected options from the specified list object
//
function RemoveFromList(List)
{
    var fixed = GetObject(List.id + "Fixed");

    var l = List.length;
    var found;

    for (i = 0; i < l; i++)
    {
        if (List.options[i].selected)
        {
            // Check whether the entry already exists in the fixed list
            var exists = false;

            for (j = 0; j < fixed.length; j++)
            {
                if (List.options[i].value == fixed.options[j].value)
                {
                    exists = true;
                    break;
                }
            }

            if(exists)
            {
                alert("Column '" + List.options[i].text + "' cannot be removed.");
            }
            else
            {
                List.options[i] = null;
                i--;
                l--;
            }
        }
    }
}

// Moves any selected options up one in the specified list object
//
function moveUp(List) {
for (i=1; i<=List.length-1; i++) {
    if (List.options[i].selected) {
        if (!List.options[i-1].selected) {
            lvOptionValue = List.options[i-1].value;
            lvOptionText = List.options[i-1].text;
            lvOptionSelected = List.options[i-1].selected;
            List.options[i-1].value = List.options[i].value;
            List.options[i-1].text = List.options[i].text;
            List.options[i-1].selected = List.options[i].selected;
            List.options[i].value = lvOptionValue;
            List.options[i].text = lvOptionText;
            List.options[i].selected = lvOptionSelected;
        }
    }
}
}


// Moves any selected option donw one in the specified list object
function moveDown(List) {
var lvOption = new Option();
for (i=List.length-2; i>=0; i--) {
    if (List.options[i].selected) {
        if (!List.options[i+1].selected) {
            lvOptionValue = List.options[i+1].value;
            lvOptionText = List.options[i+1].text;
            lvOptionSelected = List.options[i+1].selected;
            List.options[i+1].value = List.options[i].value;
            List.options[i+1].text = List.options[i].text;
            List.options[i+1].selected = List.options[i].selected;
            List.options[i].value = lvOptionValue;
            List.options[i].text = lvOptionText;
            List.options[i].selected = lvOptionSelected;
        }
    }
}
}

function SaveList(listId, hiddenFieldId)
{
    var list = GetObject(listId);
    var hiddenField = GetObject(hiddenFieldId);

    if(list && hiddenField)
    {
        for (var i = 0; i < list.length; i++)
        {
            hiddenField.value += list.options[i].value + ",";
        }
    }
}
/** extended to add the fixed list items as well so items can be hidden **/
function SaveList2(listId, hiddenFieldId, fixedListId)
{
    var Values = new Array();
    
    var list = GetObject(listId);
    var hiddenField = GetObject(hiddenFieldId);
    var fixedlist = GetObject(fixedListId);

    // get all the visible list entries into the array.
    if(list && hiddenField)
    {
        var isPresent = false;
        for (var i = 0; i < list.length; i++)
        {
            isPresent = false;
            
            for (x in Values)
            {
                if (list.options[i].value == Values[x])
                {
                    isPresent = true
                }
            }
            if (! isPresent)
            {
                Values[Values.length] = list.options[i].value;
                hiddenField.value += list.options[i].value + ",";
            }
        }
    }
    
    // get all of the hidden values into the list.
    if(fixedlist && hiddenField)
    {
        var isPresent = false;
        for (var i = 0; i < fixedlist.length; i++)
        {
            isPresent = false;
            
            for (x in Values)
            {
                if (fixedlist.options[i].value == Values[x])
                {
                    isPresent = true
                }
            }
            if (! isPresent)
            {
                Values[Values.length] = fixedlist.options[i].value;
                hiddenField.value += fixedlist.options[i].value + ",";
            }
        }

    }
}


function AddSortOrder(Source)
{
    _disableWait = true;
    
    var hidField = GetObject(_hidSortField);
    var addedSorts = "";
    var exists = false;

    if(typeof(hidField) != "undefined" && typeof(Source) != "undefined")
    {
        for (var i = 0; i < Source.length; i++)
        {
          if (Source.options[i].selected)
          {
                var selectedValue = Source.options[i].value;

                if (hidField.value.indexOf(selectedValue) > -1)
                {
                    alert(Source.options[i].text + " already added to sort list");
                    exists = true;
                    break;
                }
                else
                {
                    addedSorts = addedSorts + selectedValue + "|Asc;";
                }
            }
        }
        
        if(!exists)
        {
            //add the values to the hidden field
            hidField.value = hidField.value + addedSorts;
        }
    }
}

function RemoveSortOrder(key)
{
    _disableWait = true;
    var hidField = GetObject(_hidSortField);
    var hidButton = GetObject(_hidRemoveSortButton);

    if(typeof(hidField) != "undefined" || typeof(hidButton) != "undefined" )
    {
        //remove the value from the hidden field   
        var newValue = "";
        var splitHidden = hidField.value.split(";");
        if(splitHidden != null)
        {
            for(var i = 0; i < splitHidden.length; i++)
            {
                if (splitHidden[i] != "" && splitHidden[i].substr(0, splitHidden[i].indexOf("|")) != key)
               {
                    newValue = newValue + splitHidden[i] + ";";
               }
            }
        }

        hidField.value = newValue;

        //Click the button
        hidButton.click();
    }
  
    return false;
}

function ChangeSortOrder(key, value)
{
    _disableWait = true;
    var hidField = GetObject(_hidSortField);

    if(typeof(hidField) != "undefined")
    {
        var newValue = "";
        var splitHidden = hidField.value.split(";");
        if(splitHidden != null)
        {
            for(var i = 0; i < splitHidden.length; i++)
            {
               if(splitHidden[i] != "")
               {
                   if (splitHidden[i].substr(0, splitHidden[i].indexOf("|")) == key)
                   {
                        var detailSplit = splitHidden[i].split("|");
                        
                        newValue = newValue + detailSplit[0] + "|" + value + ";";
                   }
                   else
                   {
                        newValue = newValue + splitHidden[i] + ";";
                   }
               }
            }
        }

        hidField.value = newValue;
    }
}

function tabGridConfig_AfterSelectedTabChange(sender)
{
    var sortList = GetObject(_objSortListId);
    var colList = GetObject(_objColumnListId);

    if (sender == "sort")
	{
        colList.style.visibility = 'hidden';
        colList.style.display = 'none';
        sortList.style.visibility = 'visible';
        sortList.style.display = 'inline';
	}
	else
	{
	    sortList.style.visibility = 'hidden';
        sortList.style.display = 'none';
        colList.style.visibility = 'visible';
        colList.style.display = 'inline';
	}
}
