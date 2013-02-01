define(['jquery', 'jqvalidate'], function($){

	var initCache = function(cache) {
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'initCache'}
		})
		.done(function(data) {
			$.extend(cache, data)
		})
	}


	var populateSelectBox = function($select, data, keepstate) {
		$select.empty()
		// $('#select option:gt(0)').remove(); //* Remove all options, but not the first

		$.each(data, function(key, value) {
		  $select.append($("<option></option>").attr("value", value).text(key))
		})

		if (!keepstate) {
			$select.selectmenu($.isEmptyObject(data)? 'disable' : 'enable')
		}
		$select.selectmenu('refresh', true)
	}

	var updateActionList = function() {
		var deviceType = $(this).find(':selected').data('device-type')

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_actions', 'deviceType' : deviceType}
		})
		.done(function(data) {
			populateSelectBox($('[name=aAction]'), data)
		})
	}

	var updateEvtTypeList = function() {
		var sourceType = $(this).find(':selected').data('sensor-type')
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_event_types', 'sourceType' : sourceType}
		})
		.done(function(data) {
			populateSelectBox($('[name=evtType]'), data)
			$('[name=evtType]').trigger('change')
		})
	}

	var updateEvtCondition = function() {
		var updateCondition = function(data) {
			var label = $('[name=evtSource]').find(':selected').html().replace(/&nbsp;/g, '')
			var key = $('[name=evtSource]').val()

			console.log(data)

			populateSelectBox($('#evtCondition [name=condSource]'), JSON.parse('{"' + label +'" : ' + key + '}'), true)
			populateSelectBox($('#evtCondition [name=condData]'), data)

			if ($.isEmptyObject(data)) {
				$('#evtCondition').hide()
			} else {
				$('#evtCondition').show()
			}
		}

		var evtType = $(this).val()
		if (evtType) {
			$.ajax({
					'url'      : "/"
				, 'dataType' : 'json'
				, 'data'     : {'module' : 'new_task', 'action' : 'get_condition_types', 'evtType' : evtType}
			})
			.done(function(data) {
				updateCondition(data)
			})
		} else {
			updateCondition({})
		}
	}

	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('scheduler pageInit')
	}

	var newTaskPI = function newTaskPI() {
		var cache = {}		

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

		initCache(cache)

		$('[name=aActor]').change(updateActionList)
		$('[name=evtSource]').change(updateEvtTypeList)
		$('[name=evtType]').change(updateEvtCondition)
		$('#addCondition').click(function() {
			$condList = $('#conditions')
			$condList.find('li:last').before(cache.conditionTemplate)
			$condList.find('li:last').prev('li').trigger('create')
			$condList.listview('refresh')
		})
	}

	return {
			'pageInit' : pageInit
		, 'newTaskPageInit' : newTaskPI
	}
})

