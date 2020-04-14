app.controller('methodController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location, apiHelpers) {

	$scope.isLoading = true;

	//Navigation objects
	$scope.navigationObjectModel = [];
	$scope.navigationEngines = [];
	$scope.navigationAdapters = [];

	$scope.expandObjects = false;
	$scope.expandEngine = false;
	$scope.expandAdapter = false;

	//oM specific methods
	$scope.currentMethod = {};

	$scope.selectedNamespaceObjects = [];

	$scope.displayEngine = false;
	$scope.displayEngineMethod = false;

	$scope.adapters = [];
	$scope.methods = [];
	$scope.objects = [];

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

	$scope.goToObjectNamespace = function(namespace)
	{
		$window.location.href = "object.html#!?namespace=" + namespace;
	};

	$scope.goToEngineNamespace = function(engine)
	{
		alert("Not done, sorry");
	};

	$scope.goToAdapterNamespace = function(adapter)
	{
		alert("Not done, sorry");
	};

	$scope.setLocationNull = function()
	{
		$location.search('engine', null);
	};

	$scope.setDisplayObject = function()
	{
		$scope.setAllViewsFalse();
		$scope.displayObject = true;
	};

	$scope.setDisplayNamespace = function()
	{
		$scope.setAllViewsFalse();
		$scope.displayNamespace = true;
	};

	$scope.setAllViewsFalse = function()
	{
		$scope.displayNamespace = false;
		$scope.displayObject = false;
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
		return apiHelpers.displayNamespaceSplit(namespace);
	};

	$scope.$on('$locationChangeSuccess', function (a, newUrl, oldUrl) {
		$scope.isLoading = true;

		if($scope.objects.length == 0)
			$scope.setUpNavigation(); //First time load

		$scope.read_Engine();
	});

	$scope.goToObject = function(object)
	{
		$location.search('type', 'oM');
		$location.search('namespace', object.namespace);
		$location.search('object', object.memberName);
	};

	$scope.groupMethodsByNamespace = function(array, coreNS) {
		var arr = [];

		array.forEach(function(obj) {
			var ns = obj.namespace;
			if(apiHelpers.nthIndexOf(ns, '.', 3) != -1)
				ns = ns.substring(0, apiHelpers.nthIndexOf(ns, '.', 3));

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

	$scope.read_Engine = function()
	{
		var engine = $location.search().engine;
		var method = $location.search().method;

		if($scope.methods.length == 0) return;
		
		if(method == null)
		{
			$scope.currentEngine = null;

			if(engine != null && engine != undefined)
			{
				$scope.currentEngine = { methods: [] };

				var methods = [];
				$scope.methods.filter(function(obj) {
					if(obj.namespace.includes(engine))
						methods.push(obj);
				});

				if(apiHelpers.nthIndexOf(engine, '.', 3) != -1)
					engine = engine.substring(0, apiHelpers.nthIndexOf(engine, '.', 3));

				var groupedMethods = $scope.groupMethodsByClass(methods, engine);
				$scope.currentEngine.methods = groupedMethods;
			}

			$scope.isLoading = false;
		}
		else
		{
			$scope.methods.forEach(function(obj) {
				var ns = obj.namespace;
				if(apiHelpers.nthIndexOf(ns, '.', 3) != -1)
					ns = ns.substring(0, apiHelpers.nthIndexOf(ns, '.', 3));

				if(ns == engine && obj.memberName == method)
					$scope.currentMethod = obj;
			});

			$scope.isLoading = false;
		}
	};

	$scope.setUpNavigation = function()
	{
		$http.get('js/adapter.json').then(function(response) {
			$scope.adapters = response.data;

			$scope.adapters.forEach(function(obj) {
				var ns = obj.namespace;
				if(apiHelpers.nthIndexOf(ns, '.', 3) != -1)
					ns = ns.substring(0, apiHelpers.nthIndexOf(ns, '.', 3));

				if($scope.navigationAdapters.indexOf(ns) == -1)
					$scope.navigationAdapters.push(ns);
			});

			$scope.navigationAdapters.sort();

			$http.get('js/methods.json').then(function(response) {
				$scope.methods = response.data;

				$scope.methods.forEach(function(obj) {
					var ns = obj.namespace;
					if(apiHelpers.nthIndexOf(ns, '.', 3) != -1)
						ns = ns.substring(0, apiHelpers.nthIndexOf(ns, '.', 3));

					if($scope.navigationEngines.indexOf(ns) == -1)
						$scope.navigationEngines.push(ns);
				});

				$scope.navigationEngines.sort();

				$http.get('js/objects.json').then(function(response) {
					$scope.objects = response.data;

					$scope.objects.forEach(function(obj) {
						var ns = obj.namespace;
						if(apiHelpers.nthIndexOf(ns, '.', 3) != -1)
							ns = ns.substring(0, apiHelpers.nthIndexOf(ns, '.', 3));

						if($scope.navigationObjectModel.indexOf(ns) == -1)
							$scope.navigationObjectModel.push(ns);
					});

					$scope.navigationObjectModel.sort();

					$scope.read_Engine();
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
});