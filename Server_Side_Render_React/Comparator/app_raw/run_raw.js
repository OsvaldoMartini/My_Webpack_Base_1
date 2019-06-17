function _raw() {
  var container = document.getElementById('raw'),
    template = document.getElementById('raw-template').innerHTML;
  document.getElementById('run-raw').addEventListener('click', function() {
    var data = _buildData(),
      date = new Date(),
      html = '';

    for (var i = 0; i < data.length; i++) {
      var render = template;
      render = render.replace('{{className}}', '');
      render = render.replace('{{label}}', data[i].label);
      html += render;
    }

    container.innerHTML = html;

    var spans = container.querySelectorAll('.test-data span');
    for (var i = 0; i < spans.length; i++)
      spans[i].addEventListener('click', function() {
        var selected = container.querySelector('.selected');
        if (selected) selected.className = '';
        this.className = 'selected';
      });

    document.getElementById('run-raw').innerHTML = new Date() - date + ' ms';
  });
}
