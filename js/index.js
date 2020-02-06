app.controller('indexController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location) {

	$scope.isLoading = true;

	$scope.currentObject = {};

	$scope.objects = [];

	$scope.handleFailure = function(response)
	{
		$scope.isLoading = false;
		failureHandling.handleFailure(response, $window);
	};

	$scope.$on('$locationChangeSuccess', function (a, newUrl, oldUrl) {
		$scope.isLoading = true;

		var namespace = $location.search().namespace;
		var object = $location.search().object;

		$http.get('js/methods.json').then(function(response) {
			$scope.methods = response.data;

			$http.get('js/objects.json').then(function(response) {
				$scope.objects = response.data;
				$scope.currentObject = null;

				$scope.objects.filter(function(obj) {
					if(obj.namespace == namespace && obj.memberName == object)
						$scope.currentObject = obj;
				});

				if($scope.currentObject != null)
				{
					var types = [];
					types.push(namespace + "." + object);
					$scope.currentObject.inheritance.forEach(function(obj) {
						types.push(obj.namespace + "." + obj.memberName);
					});

					var methods = [];
					$scope.methods.filter(function(obj) {
						obj.inputs.filter(function(input) {
							if(types.indexOf(input.namespace + "." + input.memberName) != -1)
							{
								if(methods.indexOf(obj) == -1)
									methods.push(obj);
							}
						});
					});

					methods.sort(function(a, b) {
						if(a.namespace < b.namespace) return -1;
						if(a.namespace > b.namespace) return 1;
						return 0;
					});

					$scope.currentObject.methods = methods;
				}

				$scope.isLoading = false;		
			}, function(response) {
				$scope.handleFailure(response);
			});

		}, function(response) {
			$scope.handleFailure(response);
		});

		$scope.isLoading = false;
	});

	$scope.isObject = function() {
		return $scope.currentObject.isObject;
	};

	$scope.goToObject = function(object) {
		$location.search('namespace', object.namespace);
		$location.search('object', object.memberName);
	};
});