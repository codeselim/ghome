require.config({ 
	baseUrl: 'js/client'
	, paths: {  
		'jquerymobile': '../vendor/jquery.mobile-1.2.0.min'
	}
	, shim : {
		'jquerymobile' : ['jquery']
	}
})


require(['jquery', 'sseListener', 'device_management', 'new_device', 'jquerymobile'], function($,sseListener, devMgmt, new_device) {
	$(function() {
		//* Hides the body until JQM finishes applying styles
		$('body').css('visibility', 'visible')

		// $( '#home' ).live( 'pageinit',function(event){
		// 	console.log('home live')
		// });
		// $( '#notif' ).live( 'pageinit',function(event){
		// 	console.log('notif live')
		// });

		var homePI = function() {
			console.log('pageinit home!')
		}

		var notifPI = function() {
			console.log('pageinit notif!')
			var onSSERecieved = function(e) {
				$('#sseOutput').append('<br />' + e.data)
			}

			$('#sseToggle').change(function() { 
				console.log('toggled!')
				if ($(this).val() == 'on') {
					sseListener.enableSSE(onSSERecieved)
				} else {
					sseListener.disableSSE()
					$('#sseOutput').html('')
				}
			})
		}

		//* Registering the page inits
		pageinits = {
			  'home' : homePI
			, 'notif' : notifPI
			, 'devMgmt' : devMgmt.pageInit
			, 'newDevice' : new_device.pageInit 
		}

		for( id in pageinits) {
			console.log('applying pageinit for ' + id)
			$(document).delegate('#' + id, 'pageinit', pageinits[id])	
		}

		//* When the page is loaded from non AJAX request, pageinit event
		//* is fired before the functions are bound. It has to be called
		//* here.
		console.log($('[data-role="page"]:first').attr('id'))
		pageinits[$('[data-role="page"]:first').attr('id')]()

	})
})