app.factory('notificationFactory', function(toastr) {
	return {
		showNotification : function(message, type, title)
		{
			var hasTitle = (title && title != ""); //Check whether a title exists
			switch(type)
			{
				case 'success':
					if(hasTitle)
						toastr.success(message, title);
					else
						toastr.success(message);
					break;
				case 'error' :
					if(hasTitle)
						toastr.error(message, title);
					else
						toastr.error(message);
					break;
				case 'info' :
					if(hasTitle)
						toastr.info(message, title);
					else
						toastr.info(message);
					break;
				case 'warning' :
					if(hasTitle)
						toastr.warning(message, title);
					else
						toastr.warning(message);
					break;
				default:
					if(hasTitle)
						toastr.info(message, title);
					else
						toastr.info(message);
			}
		},
	};
});

app.factory('failureHandling', function(notificationFactory) {
	return {
		handleFailure : function(response, window)
		{
			notificationFactory.showNotification("An error has occurred with that action", 'error');
		},
	};
});