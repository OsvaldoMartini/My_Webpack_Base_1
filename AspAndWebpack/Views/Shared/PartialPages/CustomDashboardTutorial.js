var CustomDashboardTutorial = {
    
};
CustomDashboardTutorial.RegisterTutorialHelpSave = function (containerId)
{
        if ($('.savedashboardtext', containerId).parents('.modal-dialog').find('.modal-title').text() === 'Save Dashboard') {
            $('.savedashboardtext', containerId).show();
        } else {
            $('.savewidgettext', containerId).show();
            $('.newtextlabel', containerId).text('Save to new');
        }
        $('#newdashboard',containerId).focus();

        $('#newdashboard, #existingdashboard', containerId).focus(function () {
            $(this).parents('.form-group').find("input:radio[name='new_or_existing']").prop("checked", true).change();
        });

        $(containerId).find("input:radio[name='new_or_existing']").change(function () {
            if (this.checked) {
                if(this.value === "NEW") {
                    showDescription();
                } else {
                    hideDescription();
                }
            } 
        });

        this.RegisterTutorialHelp(containerId);
};
CustomDashboardTutorial.RegisterTutorialHelp = function (containerId) {

    $('.cd-tutorial-button', containerId).click(function () {

        $('.cd-tutorial-item', containerId).hide();
        $('.cd-tutorial, .cd-tutorial1', containerId).show();
    });
    $('.cd-tutorial-end', containerId).click(function () {
        $('.cd-tutorial', containerId).show();
        $('.cd-tutorial, .cd-tutorial-item', containerId).hide();
        $('.cd-tutorial-item', containerId).removeClass('current');
        $('.cd-tutorial1', containerId).addClass('current');
        $('.paging li a', containerId).removeClass('active');
        $('.paging li:first-child a', containerId).addClass('active');
        $('.cd-tutorial-next', containerId).show();
    });
    $('.cd-tutorial-next', containerId).click(function () {
        $('.current', containerId).removeClass('current').hide()
            .next().show().addClass('current');
        if ($('.current', containerId).hasClass('last')) {
            $('.cd-tutorial-next', containerId).hide();
        };
        $('.paging li', containerId).find('a.active').removeClass('active').parent().next().find('a').addClass('active');
    });
    $('.paging li a', containerId).click(function () {
        var cdclicked = $(this).parent();
        var cdindex = $('.paging li', containerId).index(cdclicked) + 1;
        $('.cd-tutorial-item', containerId).hide().removeClass('current');
        $('.cd-tutorial' + cdindex, containerId).show().addClass('current');
        $('.paging li a', containerId).removeClass('active');
        $(this).addClass('active');
        if (cdindex === 5) {
            $('.cd-tutorial-next', containerId).hide();
        } else {
            $('.cd-tutorial-next', containerId).show();
        }
    });

};

function hideDescription() {
    $("#saveDashDesc").prop('disabled', true);
    $("#dashSaveDescGroup").hide("fade", {}, 400);
}

function showDescription() {
    $("#saveDashDesc").prop('disabled', false);
    $("#dashSaveDescGroup").show("fade", {}, 400);
}
