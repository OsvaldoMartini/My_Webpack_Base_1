function _angular(data) {
  angular.module('test', []).controller('controller', function($scope) {
    $scope.run = function() {
      var data = _buildData(),
        date = new Date();

      $scope.selected = null;
      $scope.$$postDigest(function() {
        document.getElementById('run-angular').innerHTML =
          new Date() - date + ' ms';
      });

      $scope.data = data;
    };

    $scope.select = function(item) {
      $scope.selected = item.id;
    };
  });
}
