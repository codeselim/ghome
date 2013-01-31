define(['jquery', 'jqvalidate'], function($){

	var updateActionList = function() {
		console.log('ual')
		var deviceType = $('#device :selected').data('device-type')

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_actions', 'deviceType' : deviceType}
		})
		.always(function(data) {
			console.log(data)
			$devAction = $('#devAction')

			$devAction.empty()
			// $('#devAction option:gt(0)').remove(); //* Remove all options, but not the first

			$.each(data, function(key, value) {
			  $devAction.append($("<option></option>").attr("value", value).text(key))
			})
			$devAction.selectmenu('refresh', true)
		})
	}

	var updateTriggerConditions = function() {
		var sensorType = $('#sensor :selected').data('sensor-type')
		console.log(sensorType)
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'html'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_threshold_div', 'sensorType' : sensorType}
		})
		.always(function(data) {
			$('#thresholdDiv').html(data).trigger('create')
			// $('#sensor').change(updateTriggerConditions)
		})
	}

	var updateTriggerDiv = function() {
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'html'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_trigger_div', 'triggerType' : $('#trigger :selected').val()}
		})
		.always(function(data) {
			$('#triggerDiv').html(data).trigger('create')
			$('#sensor').change(updateTriggerConditions)
		})
	}

	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('scheduler pageInit')
	}

	var newTaskPI = function newTaskPI() {
		console.log('new task pageInit')

	  $('.leftLink').parent().parent().parent().removeClass('ui-btn');
    $('.leftLink').contents().unwrap();

		$("#form").validate({
			  rules: {
			  	  'device'          : {'required': true }
			  	, 'devAction'       : {'required': true }
			  	, 'trigger'         : {'required': true }
			  	, 'sensor'          : {'required': true }
			  	, 'threshold_type'  : {'required': true }
			  	, 'threshold_value' : {'required': true }
			  	, 'threshold_event' : {'required': true }
			  } 
			, messages: {}
			, errorPlacement: function(error, element) {
				//* Needed to place the error message out of the select menu.
				if (element.is('select')) {
					error.insertAfter($(element).parent())
				} else {
					error.insertAfter(element)
				}
			}
		})

		$('#device').change(updateActionList)
		$('#trigger').change(updateTriggerDiv)
	}

	return {
			'pageInit' : pageInit
		, 'newTaskPageInit' : newTaskPI
	}
})

