define(['jquery', 'utils', 'jqvalidate'], function($,utils){

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


	/**
	 * fills $select with data, a label:value dictionnary. If keepstate is not true, the $select will
	 * be enabled or disabled depending on the emptiness of data. if trigger is true, triggers change
	 * event at the end.
	 */
	var populateSelectBox = function($select, data, trigger, keepstate) {
		$select.empty()
		// $('#select option:gt(0)').remove() //* Remove all options, but not the first

		$.each(data, function(key, value) {
			$select.append($("<option></option>").attr("value", value).text(key))
		})

		if (!keepstate) {
			$select.selectmenu($.isEmptyObject(data)? 'disable' : 'enable')
		}
		$select.selectmenu('refresh', true)

		if (trigger) {
			$select.trigger('change')
		}
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
			populateSelectBox($('[name=evtType]'), data, true)
		})
	}


	var updateCondType = function() {
		var condId = $(this).data('condition-id')
		var arg = {}
		if (condId === 'Evt') {
			arg = {'evtType' : $(this).val()}
		} else {
			arg = {'sensorType' : $(this).find(':selected').data('sensor-type')}
		}

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : $.extend({'module' : 'new_task', 'action' : 'get_condition_types'},arg)
		})
		.done(function(data) {
			populateSelectBox($('#condition'+ condId +' [name=condType]'), data, true)

			if (condId === 'Evt') { //* Update the conditionEvt item too
				var label = $('[name=evtSource]').find(':selected').html().replace(/&nbsp;/g, '')
				var key = $('[name=evtSource]').val()

				populateSelectBox($('#conditionEvt [name=condSource]'), JSON.parse('{"' + label +'" : ' + key + '}'), false, true)
				if ($.isEmptyObject(data)) {
					$('#conditionEvt').addClass('ui-screen-hidden')
				} else {
					$('#conditionEvt').removeClass('ui-screen-hidden')
				}
			}
		})
	}


	/**
	 * Uses the condition-id attribute of the element to edit the right condValue select list
	 */
	var updateCondValue = function() {
		var condType = $(this).val()
		var condId = $(this).data('condition-id')

		if (condType) {
			$.ajax({
					'url'      : "/"
				, 'dataType' : 'json'
				, 'data'     : {'module' : 'new_task', 'action' : 'get_condition_values', 'condType' : condType}
			})
			.done(function(data) {
				populateSelectBox($('#condition'+ condId +' [name=condValue]'), data, true)
			})
		} else {
			populateSelectBox($('#condition'+ condId +' [name=condValue]'), {})
		}
	}

	var removeCondition = function() {
		$('#condition'+ $(this).data('condition-id')).remove()
		$('#bigList').listview('refresh')
	}


	

	var getFormParams = function() {
		//* Fixed params
		params = {

			  action: utils.queryStringToHash($.param($('#actionArgs select')))
			, evt: utils.queryStringToHash($.param($('#evtArgs select')))
		}

		return params
	}


	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('scheduler pageInit')
	}


	var newTaskPI = function newTaskPI() {
		var cache = {}
		var conditionCount = 0

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
		$('[name=evtType]').change(updateCondType)
		$('#conditionEvt [name=condType]').change(updateCondValue)
		$('#addCondition').click(function() {
			$bigList = $('#bigList')
			$bigList.find('li:last').before(cache.conditionTemplate.replace(/@@condId@@/g, conditionCount++))
			$newCondition = $bigList.find('li:last').prev('li')
			$newCondition.find("[name=condType]").change(updateCondValue)
			$newCondition.find("[name=condSource]").change(updateCondType)
			$newCondition.find(".removeCondition").click(removeCondition)

			//* Ask JQM to redraw the new elements
			$newCondition.trigger('create')
			$bigList.listview('refresh')
		})

		$('form').validate({
				rules: { 
						equip_id: "required"
					, equip_type: "required"
				} 
			, messages: { 
						equip_id: "Veuillez entrez l'identifiant de l'équipemement à ajouter"
					, equip_type: "Veuillez sélectionner le type d'équipement"
				}
			, errorPlacement: function(error, element) {
				//* Needed to place the error message out of the select menu.
				if (element.is('select')) {
					error.insertAfter($(element).parent())
				} else {
					error.insertAfter(element)
				}
			}
			, submitHandler: function() {
				console.log(getFormParams())
			}
		})
	}


	return {
			'pageInit' : pageInit
		, 'newTaskPageInit' : newTaskPI
	}
})

