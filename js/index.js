app.controller('indexController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location) {

	$scope.isLoading = true;

	$scope.currentObject = {};
	$scope.selectedNamespaceObjects = [];
	$scope.selectedNamespace = "";

	$scope.objects = [];
	$scope.methods = [];

	$scope.namespacesMaster = [];
	$scope.namespaces = [];
	$scope.displayNamespace = false;
	$scope.namespaceFilter = "";

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
				$scope.selectedNamespaceObjects = [];

				$scope.objects.forEach(function(obj) {
					var ns = obj.namespace;
					if($scope.nthIndexOf(ns, '.', 3) != -1)
						ns = ns.substring(0, $scope.nthIndexOf(ns, '.', 3));

					if($scope.namespaces.indexOf(ns) == -1)
						$scope.namespaces.push(ns);
				});

				$scope.namespacesMaster = JSON.parse(JSON.stringify($scope.namespaces));

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

						var engineNamespace = namespace.replace('oM', 'Engine');
						if($scope.nthIndexOf(engineNamespace, '.', 3) != -1)
							engineNamespace = engineNamespace.substring(0, $scope.nthIndexOf(engineNamespace, '.', 3));

						var groupedMethods = $scope.groupMethodsByNamespace(methods, engineNamespace);
						/*methods.sort(function(a, b) {
							if(a.namespace.includes(engineNamespace)) return -1;
							if(b.namespace.includes(engineNamespace)) return 1;
							return 0;
						});

						methods.sort(function(a, b) {
							if((a.namespace.includes(engineNamespace) && b.namespace.includes(engineNamespace)) || (!a.namespace.includes(engineNamespace) && !b.namespace.includes(engineNamespace)))
							{
								if(a.namespace < b.namespace) return -1;
								if(a.namespace > b.namespace) return 1;
							}
							return 0;
						});*/

						$scope.currentObject.methods = groupedMethods;
					}
				}
				else
				{
					$scope.objects.filter(function(obj) {
						if(obj.namespace.startsWith(namespace))
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
		$location.search('namespace', namespace);
	};

	$scope.filterNamespaces = function() {
		if($scope.namespaceFilter == "" || $scope.namespaceFilter == undefined)
			$scope.namespaces = JSON.parse(JSON.stringify($scope.namespacesMaster));
		else
		{
			var arr = [];
			$scope.namespacesMaster.forEach(function(obj) {
				if(obj.toLowerCase().includes($scope.namespaceFilter.toLowerCase()))
					arr.push(obj);
			});

			$scope.namespaces = arr;
		}
	};

	$scope.nthIndexOf = function(str, pattern, n) {
	    var i = -1;

	    while (n-- && i++ < str.length) {
	        i = str.indexOf(pattern, i);
	        if (i < 0) break;
	    }

	    return i;
	};

	$scope.groupMethodsByNamespace = function(array, coreNS) {
		var arr = [];

		array.forEach(function(obj) {
			var ns = obj.namespace;
			if($scope.nthIndexOf(ns, '.', 3) != -1)
				ns = ns.substring(0, $scope.nthIndexOf(ns, '.', 3));

			if(arr[ns] == undefined)
				arr[ns] = [];

			arr[ns].push(obj);
		});

		var tuples = [];

		for (var key in arr) tuples.push([key, arr[key]]);

		tuples.sort(function(a, b) {
			if(a[0].includes(coreNS)) return -1;
			if(b[0].includes(coreNS)) return 1;
			return 0;
		});

		var t = tuples.shift();

		tuples.sort(function(a, b) {
			a = a[0];
			b = b[0];
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		});

		tuples.splice(0, 0, t);

		return tuples;
	};
});