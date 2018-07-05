var DefenceProgrammesVM = function (containerId, modalId) {
    var self = this;

    self.$container = $("#" + containerId);
    self.$modal = $("#" + modalId);

    self.$container.on('click', '.dropdown-menu a', function () {
        self.$container.find(".selectedView").html($(this).html() + " <i class='icon-menu u-font-85 grey2'></i>");
        self.view = $(this).html();
    });
    self.view = '';
};

if (typeof WidgetBase === 'function') {
    DefenceProgrammesVM.prototype = new WidgetBase();
}

DefenceProgrammesVM.prototype.exportItem = function () {
    var self = this;
    self.$modal.find('input[name="view"]').val(self.view);
    self.$modal.modal({
        backdrop: true
    });

    $('[type="submit"]', self.$modal).click(function () {
        self.$modal.modal('hide');
    });

    return;
};