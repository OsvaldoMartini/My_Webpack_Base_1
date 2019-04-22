//Fiscal Interactive JS functions

function FI_btnDelete_Click(){
    
    var retval = false;
    var answer = confirm("Please confirm deletion of this Fiscal Term.")

    if (answer) {
        _disableWait = true;
        retval = true;
    }

    return retval;
}

//reset form data
function FI_btnResetForm_Click() {

    var savedValueTag = "_SAVED_VALUE";
    
    for (i = 0; i < document.forms[0].elements.length; i++) {

        var element = document.forms[0].elements[i];
        var position = element.name.indexOf(savedValueTag);

        if (element.type == "hidden" && position > 0)
        {
            var dataText = GetObject(element.id.substring(0, position));

            if (dataText != null && typeof (dataText) != 'undefined') {
                dataText.value = element.value;
            }
        }
    }
    return false;
}


