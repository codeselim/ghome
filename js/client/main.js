require.config({ 
	baseUrl: "js/client"
	, paths: {  
		"jquerymobile": "../vendor/jquery.mobile-1.2.0.min"
	}
	, shim : {
		"jquerymobile" : ['jquery']
	}
})


require(["jquery", "sseListener", "jquerymobile"], function($,sseListener) {
	$(function() {
		$('body').css('visibility', 'visible')

		$( '#home' ).live( 'pageinit',function(event){
			console.log('home live')
		});
		$( '#notif' ).live( 'pageinit',function(event){
			console.log('notif live')
		});

		var homePI = function() {
			console.log('pageinit home!')
			$('#btn1').click(function(){
				console.log('btn1')
				$('#mmc').removeAttr('hidden')
			})} 

			var notifPI = function() {
				console.log('pageinit notif!')
				var onSSERecieved = function(e) {
					$('#sseOutput').append("<br />" + e.data)
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
				"home" : homePI,
				"notif" : notifPI
			}

			for( id in pageinits) {
				$(document).delegate("#" + id, "pageinit", pageinits[id])	
			}

			//* When the page is loaded from non AJAX request, pageinit event
			//* is fired before the functions are bound. It has to be called
			//* here.
			pageinits[$('[data-role="page"]:first').attr('id')]()

		})
})