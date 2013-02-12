"use strict"

define(['jquery', 'utils', 'jqvalidate'], function($,utils){

	var initCache = function(cache) {
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'task', 'action' : 'initCache'}
		})
		.done(function(data) {
			$.extend(cache, data)
		})
	}


	/**
	 * fills $select with data, a label:value dictionnary. If keepstate is not true, the $select will
	 * be enabled or disabled depending on the emptiness of data. if trigger is true, triggers change
	 * event at the end.
	 * if lockifsingle is true, the select button will be locked (disabled with style locked) when 
	 * data contains only one element. For other lengths of data, see keepstate.
	 */
	var populateSelectBox = function($select, data, trigger, keepstate, lockifsingle) {
		$select.empty()
		// $('#select option:gt(0)').remove() //* Remove all options, but not the first

		$.each(data, function(key, value) {
			$select.append($("<option></option>").attr("value", value).text(key))
		})

		if (!keepstate) {
			$select.selectmenu($.isEmptyObject(data)? 'disable' : 'enable')
		}

		if (lockifsingle) {
			var nbElems = Object.keys(data).length
			if(nbElems == 1) {
				$select.selectmenu('disable')        // makes the select look like an unclickable
				$select.parent().addClass('locked')  // button (but not greyish like disabled ones)
			} else if (nbElems > 1) {
				$select.selectmenu('enable')
				$select.parent().removeClass('locked')
			}
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
			, 'data'     : {'module' : 'task', 'action' : 'get_actions', 'deviceType' : deviceType}
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
			, 'data'     : {'module' : 'task', 'action' : 'get_event_types', 'sourceType' : sourceType}
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
			, 'data'     : $.extend({'module' : 'task', 'action' : 'get_condition_types'},arg)
		})
		.done(function(data) {
			populateSelectBox($('#condition'+ condId +' [name=condType]'), data, true, false, true)

			if (condId === 'Evt') { //* Update the conditionEvt item too
				var label = $('[name=evtSource]').find(':selected').html().replace(/&nbsp;/g, '')
				var key = $('[name=evtSource]').val()

				populateSelectBox($('#conditionEvt [name=condSource]'), JSON.parse('{"' + label +'" : "' + key + '"}'), false, true)
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
		// Grabbing the sensorType so that the server is able to determine which condition thresholds are available to us (as thresholds are set to sensor types)
		var sensorType = $(this).parents('.conditionBlock').find('select.condSourceSelect').eq(0).find(':selected').eq(0).data('sensor-type')
		console.log("sensorType=", sensorType)
		var condType = $(this).val()
		var condId = $(this).data('condition-id')

		if (condType) {
			$.ajax({
					'url'      : "/"
				, 'dataType' : 'json'
				, 'data'     : {'module' : 'task', 'action' : 'get_condition_values', 'condType' : condType, 'sensorType': sensorType}
			})
			.done(function(data) {
				if (data.type == "free") {
					// @TODO Change the input to a free text input
				} else if (data.type == "list") {
					populateSelectBox($('#condition'+ condId +' [name=condValue]'), data.values, true)
				}
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
		var params = {
				name: $('[name=taskName]').val()
			, act: utils.queryStringToHash($.param($('#actionArgs select')))
			, evt: utils.queryStringToHash($.param($('#evtArgs select')))
			, cond: []
		}

		$('[id^=condition]').each(function(){
			var cond = utils.queryStringToHash($.param($(this).find('select')))
			if (!$.isEmptyObject(cond)) {
				params.cond.push(cond)
			}
		})

		return params
	}

	var submitNewTask = function() {

		console.log(getFormParams())
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'task', 'action' : 'submit', 'data': JSON.stringify(getFormParams())}
		})
		.done(function(data) {
			if (data.success) {
				utils.addMessage('success', 'Ok! Vous allez être redirigé sur la liste des tâches.')
				// window.location.href = '/?module=scheduler'
				setTimeout('top.location.href = "/?module=scheduler"',2000)
			} else {
				utils.addMessage('error', 'Une erreur est survenue')
			}
		})
		.fail(function(a,status) { utils.addMessage('error', "Le formulaire n'a pas pu être envoyé") })
	}


	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('scheduler pageInit')
	}


	var taskPI = function taskPI() {
		console.log('taskPI!')
		var cache = {}
		var conditionCount = 0

		$('.leftLink').parent().parent().parent().removeClass('ui-btn');
		$('.leftLink').contents().unwrap();

		//* WTF is this shit?
		// $("form").validate({
		// 		rules: {
		// 				'device'          : {'required': true }
		// 			, 'devAction'       : {'required': true }
		// 			, 'trigger'         : {'required': true }
		// 			, 'sensor'          : {'required': true }
		// 			, 'threshold_type'  : {'required': true }
		// 			, 'threshold_value' : {'required': true }
		// 			, 'threshold_event' : {'required': true }
		// 		} 
		// 	, messages: {}
		// 	, errorPlacement: function(error, element) {
		// 		//* Needed to place the error message out of the select menu.
		// 		if (element.is('select')) {
		// 			error.insertAfter($(element).parent())
		// 		} else {
		// 			error.insertAfter(element)
		// 		}
		// 	}
		// })

		initCache(cache)
		utils.initMessages()
		$('[name=aActor]').change(updateActionList)
		$('[name=evtSource]').change(updateEvtTypeList)
		$('[name=evtType]').change(updateCondType)
		$('#conditionEvt [name=condType]').change(updateCondValue)
		$('#addCondition').click(function() {
			var bigList = $('#bigList')
			bigList.find('li:last').before(cache.conditionTemplate.replace(/@@condId@@/g, conditionCount++))
			var newCondition = bigList.find('li:last').prev('li')
			newCondition.find("[name=condType]").change(updateCondValue)
			newCondition.find("[name=condSource]").change(updateCondType)
			newCondition.find(".removeCondition").click(removeCondition)

			//* Ask JQM to redraw the new elements
			newCondition.trigger('create')
			bigList.listview('refresh')
		})

		console.log('registering validation!')
		$('form').validate({
				rules: { 
					  taskName: "required" 
					, aActor: "required"
					, aAction: "required"
					, evtSource: "required"
					, evtType: "required"
				} 
			, messages: { 
					  taskName: "Veuillez saisir un nom pour la tâche" 
					, aActor: "Veuillez sélectionner le sujet de la tâche"
					, aAction: "Veuillez sélectionner l'action à effectuer"
					, evtSource: "Veuillez sélectionner la source de l'évènement"
					, evtType: "Veuillez sélectionner le type d'évènement"
				}
			, errorPlacement: function(error, element) {
				//* Needed to place the error message out of the select menu.
				if (element.is('select')) {
					error.insertAfter($(element).parent())
				} else {
					error.insertAfter(element)
				}
			}
			, submitHandler: submitNewTask
		})
	}


	return {
			'pageInit' : pageInit
		, 'taskPageInit' : taskPI
	}
})

