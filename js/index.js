app.controller('indexController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location) {

	$scope.isLoading = true;

	$scope.currentObject = {};
	$scope.selectedNamespaceObjects = [];
	$scope.selectedNamespace = "";

	$scope.objects = [];
	$scope.methods = [];

	$scope.namespaces = [];
	$scope.displayNamespace = false;

	$scope.handleFailure = function(response)
	{
		$scope.isLoading = false;
		failureHandling.handleFailure(response, $window);
	};

	$scope.$on('$locationChangeSuccess', function (a, newUrl, oldUrl) {
		$scope.isLoading = true;

		var namespace = $location.search().namespace;
		var object = $location.search().object;

		$scope.displayNamespace = false;

		$scope.selectedNamespace = namespace;

		$http.get('js/methods.json').then(function(response) {
			$scope.methods = response.data;

			$http.get('js/objects.json').then(function(response) {
				$scope.objects = response.data;
				$scope.currentObject = null;

				$scope.objects.forEach(function(obj) {
					if($scope.namespaces.indexOf(obj.namespace) == -1)
						$scope.namespaces.push(obj.namespace);
				});

				if(object != null && object != undefined)
				{
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
				}
				else
				{
					$scope.objects.filter(function(obj) {
						if(obj.namespace == namespace)
							$scope.selectedNamespaceObjects.push(obj);
					});

					$scope.displayNamespace = true;
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

	$scope.goToNamespace = function(namespace) {
		$location.search('namespace', namespace.namespace);
	};
});