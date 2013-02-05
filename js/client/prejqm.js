require(['jquery'], function($) {
	$(document).bind('mobileinit', function() {
		console.log('prejqm')
	 $.mobile.ajaxEnabled = false; 
	});
})