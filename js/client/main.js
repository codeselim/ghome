"use strict"

require.config({ 
	baseUrl: 'js/client'
	, paths: { 
		  'jquerymobile': '../vendor/jquery.mobile-1.2.0.min'
		, 'jqvalidate': '../vendor/jquery.validate.min'
	}
	, shim : {
		'jquerymobile' : ['jquery']
		, 'highcharts' : {
			'exports' : 'Highcharts'
			, 'deps' : ['jquery']
		}
	}
})


require(['jquery', /*'prejqm',*/ 'sseListener', 'device_management', 'device', 'scheduler', 'threshold', 'spy', 'jquerymobile'], 
	function($, /*_,*/ sseListener, devMgmt, device, scheduler, threshold, spy) {
	$(function() {
		//* Hides the body until JQM finishes applying styles
		$('body').css('visibility', 'visible')

		var homePI = function() {
			console.log('pageinit home!')
		}

		//* Registering the page inits
		var pageinits = {
			  'home'          : homePI
			, 'devMgmt'       : devMgmt.pageInit
			, 'device'        : device.pageInit
			, 'scheduler'     : scheduler.pageInit
			, 'task'          : scheduler.taskPageInit
			, 'thresholdList' : threshold.listPageInit
			, 'threshold'     : threshold.pageInit
			, 'spy'           : spy.pageInit
		}

		for(var id in pageinits) {
			console.log('applying pageinit for ' + id)
			$(document).delegate('#' + id, 'pageinit', pageinits[id])	
		}

		//* When the page is loaded from non AJAX request, pageinit event
		//* is fired before the functions are bound. It has to be called
		//* here.
		console.log($('[data-role="page"]:first').attr('id'))
		pageinits[$('[data-role="page"]:first').attr('id')]()

		$(document).on('pagehide', 'div', function(event, ui) {
			var page = $(event.target)

			if(page.attr('data-cache') == 'never'){
				page.remove()
			}
		})

		//* Open SSE Connection
		sseListener.initDeviceStateListener()
	})
})