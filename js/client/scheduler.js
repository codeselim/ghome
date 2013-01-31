define(['jquery', 'jqvalidate'], function($){

	var updateActionList = function() {
		console.log('ual')
		var deviceType = $('#device :selected').data('device-type')

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_options', 'device-type' : deviceType}
		})
		.always(function(data) {
			console.log(data)

			$('#devAction option:gt(0)').remove(); //* Remove all options, but not the first

			$.each(data, function(key, value) {
			  $('#devAction').append($("<option></option>").attr("value", value).text(key))
			})
		})
	}

var updateTriggerDiv = function() {
	console.log('utd')
	$.ajax({
			'url'      : "/"
		, 'dataType' : 'html'
		, 'data'     : {'module' : 'new_task', 'action' : 'get_trigger_div', 'trigger_type' : $('#trigger :selected').val()}
	})
	.always(function(data) {
		console.log(data)

		$('#triggerDiv').html(data)
	})
}


	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('scheduler pageInit')
	}

	var newTaskPI = function newTaskPI() {
		console.log('new task pageInit')
		$('#device').on('change', updateActionList)
		$('#trigger').on('change', updateTriggerDiv)
	}

	return {
			'pageInit' : pageInit
		, 'newTaskPageInit' : newTaskPI
	}
})

