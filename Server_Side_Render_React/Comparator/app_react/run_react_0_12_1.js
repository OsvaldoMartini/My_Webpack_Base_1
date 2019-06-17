function _react() {
  var Class = React.createClass({
    select: function(data) {
      this.props.selected = data.id;
      this.forceUpdate();
    },

    render: function() {
      var items = [];
      for (var i = 0; i < this.props.data.length; i++) {
        items.push(
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col-md-12 test-data' },
              React.createElement(
                'span',
                {
                  className:
                    this.props.selected === this.props.data[i].id
                      ? 'selected'
                      : '',
                  onClick: this.select.bind(null, this.props.data[i])
                },
                this.props.data[i].label
              )
            )
          )
        );
      }

      return React.createElement('div', null, items);
    }
  });

  var runReact = document.getElementById('run-react');
  runReact.addEventListener('click', function() {
    var data = _buildData(),
      date = new Date();

    //Version 0.12.1
    React.render(
      new Class({ data: data, selected: null }),
      document.getElementById('react')
    );

    runReact.innerHTML = new Date() - date + ' ms';
  });
}
