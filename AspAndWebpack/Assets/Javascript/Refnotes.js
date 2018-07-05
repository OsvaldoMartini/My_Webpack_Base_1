
$('[data-refnote]')
    .tipsy({
        aria: true,
        delayIn: 350,
        title: function () {
            return $(this.getAttribute('data-refnote')).text();
        }
})
