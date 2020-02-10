app.controller('engineController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location) {

	$scope.isLoading = true;

	$scope.currentEngine = {};
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

		var engine = $location.search().engine;

		$scope.displayNamespace = false;

		$scope.selectedNamespace = namespace;

		$http.get('js/methods.json').then(function(response) {
			$scope.methods = response.data;

			$scope.methods.forEach(function(obj) {
				var ns = obj.namespace;
				if($scope.nthIndexOf(ns, '.', 3) != -1)
					ns = ns.substring(0, $scope.nthIndexOf(ns, '.', 3));

				if($scope.namespaces.indexOf(ns) == -1)
					$scope.namespaces.push(ns);
			});

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

		}, function(response) {
			$scope.handleFailure(response);
		});

		$scope.isLoading = false;
	});

	$scope.goToObject = function(object) {
		$window.location.href = "/index.html?namespace=" + object.namespace + "&object=" + object.memberName;
	};

	$scope.goToEngine = function(namespace) {
		$location.search('engine', namespace);
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

	$scope.showHideClass = function(ns) {
		if(ns.canView == undefined)
			ns.canView = false;
		
		ns.canView = !ns.canView;
	};
});