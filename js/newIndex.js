app.controller('indexController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location) {

	$scope.isLoading = true;

	$scope.currentObject = {};
	$scope.currentEngine = {};
	$scope.currentMethod = {};
	$scope.currentNamespace = "";

	$scope.selectedNamespaceObjects = [];
	$scope.selectedNamespace = "";

	$scope.objects = [];
	$scope.methods = [];
	$scope.adapters = [];

	$scope.namespacesMaster = [];
	$scope.namespaces = [];
	$scope.displayNamespace = false;
	$scope.namespaceFilter = "";

	$scope.expandObjects = false;
	$scope.expandEngine = false;
	$scope.expandAdapter = false;

	$scope.displaySearch = true;
	$scope.displayResults = false;
	$scope.displayObject = false;
	$scope.displayEngineMethod = false;

	$scope.mainSearch = {
		searchTerm : "",
	};

	$scope.handleFailure = function(response)
	{
		$scope.isLoading = false;
		failureHandling.handleFailure(response, $window);
	};

	$scope.showObjects = function()
	{
		$scope.expandObjects = !$scope.expandObjects;
	};

	$scope.showEngine = function()
	{
		$scope.expandEngine = !$scope.expandEngine;
	};

	$scope.showAdapter = function()
	{
		$scope.expandAdapter = !$scope.expandAdapter;
	};

	$scope.goToNamespace = function(namespace)
	{
		alert("Fraser didn't do this yet - remind him?");
	};

	$scope.goToEngine = function(engine)
	{
		alert("Fraser didn't do this yet - remind him?");
	};

	$scope.goToAdapter = function(engine)
	{
		alert("Fraser didn't do this yet - remind him?");
	};

	$scope.runSearch = function()
	{
		alert("Fraser didn't do this yet - remind him?");
	};

	$scope.surpriseMe = function()
	{
		var item = $scope.objects[Math.floor(Math.random() * $scope.objects.length)]
		$location.search('type', 'oM');
		$location.search('namespace', item.namespace);
		$location.search('object', item.memberName);
	};

	$scope.setDisplaySearch = function()
	{
		$scope.setAllViewsFalse();
		$scope.displaySearch = true;
	};

	$scope.setDisplayObject = function()
	{
		$scope.setAllViewsFalse();
		$scope.displayObject = true;
	};

	$scope.setDisplayEngineMethods = function()
	{
		$scope.setAllViewsFalse();
		$scope.displayEngineMethod = true;
	};

	$scope.setAllViewsFalse = function()
	{
		$scope.displaySearch = false;
		$scope.displayResults = false;
		$scope.displayObject = false;
		$scope.displayEngineMethod = false;
	};

	$scope.displayObjectProperties = function(object)
	{
		object.displayProperties = !object.displayProperties;
	};

	$scope.displayEngineMethods = function(object)
	{
		object.displayMethods = !object.displayMethods;
	};

	$scope.displayAdapterMethods = function(object)
	{
		object.displayAdapters = !object.displayAdapters;
	};

	$scope.displayMethodInputs = function(method)
	{
		method.displayInputs = !method.displayInputs;
	};

	$scope.displayMethodOutputs = function(method)
	{
		method.displayOutputs = !method.displayOutputs;
	};

	$scope.displayNamespaceSplit = function(namespace)
	{
		var split = namespace.split('.');

		if(split.length > 2)
		{
			if(split.length > 3 && split[2] == "External")
				return split[3];
			else
				return split[2];
		}
		else return namespace; //Not sure what happened
	};

	$scope.$on('$locationChangeSuccess', function (a, newUrl, oldUrl) {
		$scope.isLoading = true;

		var type = $location.search().type;
		if(type == null)
		{
			$scope.readSearch();
			$scope.setDisplaySearch();
		}
		else if(type == "oM")
		{
			$scope.read_oM();
			$scope.setDisplayObject();
		}
		else if (type == "engine")
		{
			$scope.readEngine();
			$scope.setDisplayEngineMethods();
		}
	});

	$scope.goToObject = function(object)
	{
		$location.search('type', 'oM');
		$location.search('namespace', object.namespace);
		$location.search('object', object.memberName);
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

		tuples.forEach(function(obj) {
			obj[1].sort(function(a, b) {
				if(a.memberName < b.memberName) return -1;
				if(a.memberName > b.memberName) return 1;
				return 0;
			});
		});

		return tuples;
	};

	$scope.groupMethodsByClass = function(array) {
		var arr = [];

		array.forEach(function(obj) {
			var ns = obj.className;
			if($scope.nthIndexOf(ns, '.', 3) != -1)
				ns = ns.substring(0, $scope.nthIndexOf(ns, '.', 3));

			if(arr[ns] == undefined)
				arr[ns] = [];

			arr[ns].push(obj);
		});

		var tuples = [];

		for (var key in arr) tuples.push([key, arr[key]]);

		tuples.sort(function(a, b) {
			a = a[0];
			b = b[0];
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		});

		tuples.forEach(function(obj) {
			obj[1].sort(function(a, b) {
				if(a.memberName < b.memberName) return -1;
				if(a.memberName > b.memberName) return 1;
				return 0;
			});
		});

		return tuples;
	};

	$scope.readSearch = function()
	{
		$http.get('js/adapter.json').then(function(response) {
			$scope.adapters = response.data;

			$http.get('js/methods.json').then(function(response) {
				$scope.methods = response.data;

				$http.get('js/objects.json').then(function(response) {
					$scope.objects = response.data;

					$scope.isLoading = false;
				}, function(response) {
					$scope.handleFailure(response);
				});
			}, function(response) {
				$scope.handleFailure(response);
			});
		}, function(response) {
			$scope.handleFailure(response);
		});
	};

	$scope.read_oM = function()
	{
		var namespace = $location.search().namespace;
		var object = $location.search().object;

		$scope.displayNamespace = false;

		$scope.selectedNamespace = namespace;

		$http.get('js/adapter.json').then(function(response) {
			$scope.adapters = response.data;

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

					$scope.namespaces.sort();

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
							$scope.currentObject.methods = groupedMethods;

							var adapters = [];
							$scope.adapters.filter(function(obj) {
								if(obj.namespace == $scope.currentObject.namespace && obj.memberName == $scope.currentObject.memberName)
									adapters.push(obj);
							});

							var adapterNamespace = namespace.replace('oM', 'Adapter');
							if($scope.nthIndexOf(adapterNamespace, '.', 3) != -1)
								adapterNamespace = adapterNamespace.substring(0, $scope.nthIndexOf(adapterNamespace, '.', 3));

							if(adapters.length > 0)
							{
								var groupedAdapters = $scope.groupMethodsByNamespace(adapters[0].adapterMethods, adapterNamespace);
								$scope.currentObject.adapters = groupedAdapters;
							}
							else
								$scope.currentObject.adapters = [];
						}
					}
					else
					{
						$scope.objects.filter(function(obj) {
							if(obj.namespace.startsWith(namespace))
								$scope.selectedNamespaceObjects.push(obj);
						});

						$scope.currentNamespace = namespace;

						$scope.displayNamespace = true;
					}

					$scope.isLoading = false;		
				}, function(response) {
					$scope.handleFailure(response);
				});

			}, function(response) {
				$scope.handleFailure(response);
			});
		}, function(response) {
			$scope.handleFailure(response);
		});
	};

	$scope.readEngine = function()
	{
		var engine = $location.search().engine;
		var method = $location.search().method;

		$http.get('js/methods.json').then(function(response) {
			$scope.methods = response.data;

			$scope.methods.forEach(function(obj) {
				var ns = obj.namespace;
				if($scope.nthIndexOf(ns, '.', 3) != -1)
					ns = ns.substring(0, $scope.nthIndexOf(ns, '.', 3));

				if($scope.namespaces.indexOf(ns) == -1)
					$scope.namespaces.push(ns);
			});

			if(method == null)
			{
				$scope.namespacesMaster = JSON.parse(JSON.stringify($scope.namespaces));

				$http.get('js/objects.json').then(function(response) {
					$scope.objects = response.data;
					$scope.currentEngine = null;

					if(engine != null && engine != undefined)
					{
						$scope.currentEngine = { methods: [] };

						var methods = [];
						$scope.methods.filter(function(obj) {
							if(obj.namespace.includes(engine))
								methods.push(obj);
						});

						if($scope.nthIndexOf(engine, '.', 3) != -1)
							engine = engine.substring(0, $scope.nthIndexOf(engine, '.', 3));

						var groupedMethods = $scope.groupMethodsByClass(methods, engine);
						$scope.currentEngine.methods = groupedMethods;
					}

					$scope.isLoading = false;		
				}, function(response) {
					$scope.handleFailure(response);
				});
			}
			else
			{
				$scope.methods.forEach(function(obj) {
					var ns = obj.namespace;
					if($scope.nthIndexOf(ns, '.', 3) != -1)
						ns = ns.substring(0, $scope.nthIndexOf(ns, '.', 3));

					if(ns == engine && obj.memberName == method)
						$scope.currentMethod = obj;
				});
			}

		}, function(response) {
			$scope.handleFailure(response);
		});
	};

	$scope.showHideNamespace = function(object)
	{
		if(object.canView == undefined)
			object.canView = false;
		
		object.canView = !object.canView;
	};

	$scope.showHideMethodInputs = function(object)
	{
		if(object.canViewInputs == undefined)
			object.canViewInputs = false;
		
		object.canViewInputs = !object.canViewInputs;
	};
});