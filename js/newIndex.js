app.controller('indexController', function($scope, $window, $http, $filter, notificationFactory, failureHandling, $location) {

	$scope.isLoading = true;

	$scope.currentObject = {};
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

	$scope.$on('$locationChangeSuccess', function (a, newUrl, oldUrl) {
		$scope.isLoading = true;

		var namespace = $location.search().namespace;
		var object = $location.search().object;

		$scope.displayNamespace = false;

		$scope.selectedNamespace = namespace;

		$http.get('js/adapter.json').then(function(response) {
			$scope.adapters = response.data;
		}, function(response) {
			$scope.handleFailure(response);
		});

		$http.get('js/methods.json').then(function(response) {
			$scope.methods = response.data;
		}, function(response) {
			$scope.handleFailure(response);
		});

		$http.get('js/objects.json').then(function(response) {
			$scope.objects = response.data;
		}, function(response) {
			$scope.handleFailure(response);
		});

		$scope.isLoading = false;
	});
});