"use strict"

define(['jquery', 'utils', 'jqvalidate'], function($, utils) {
	// var progressbardiv = "<div style='width: 200px; opacity: .75' class='meter'><span style='width: 25%'></span></div>"

	//*** Server Polling *****************************************************************************
	var testid = null
	var deviceInfoRequest = function deviceInfoRequest(ajaxData, interval, countdown, finalCallback) {
		console.log("Polling for testid=" + testid)
		ajaxData.action = 'testpoll'
		ajaxData.testid = testid
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : ajaxData
		})
		.always(function(data) {
			var reqStatus = {'validated': false}
			//* We test the response.
			if (Object.prototype.toString.call(data.events) === '[object Array]') {// When there is at least one event, then we consider things are validated (as we received an event!)
				reqStatus.validated = true
				reqStatus.events = data.events
			}

			if (! reqStatus.validated && countdown > 0) {
				// We try again
				countdown -= interval
				setTimeout(function(){
					deviceInfoRequest(ajaxData, interval, countdown, finalCallback)
				}, interval)
			} else {
				// time is over or the request succeded. Update the view and tell the server we're done.
				finalCallback(reqStatus, ajaxData)
			}
		})
		.fail(function(jqXHR, textStatus) {
			console.log('poll failed: ' + textStatus)
		})
	}

	//***  Test main functions ***********************************************************************
	var endTest = function endTest(reqStatus, ajaxData) {
		//* We tell the server that the test is over
		ajaxData.action = 'testend'
		ajaxData.testid = testid
		$.ajax({
				'url': "/"
			, 'data': ajaxData
		})

		//* We display the test results
		if (reqStatus.validated) {
			$.mobile.loading('hide')
			$('#popupContent').html("Le test s'est terminé avec succès !")
			$('#popup').popup('open')	
		} else {
			$.mobile.loading('hide')
			$('#popupContent').html("Le nouvel équipement ne répond pas.")
			$('#popup').popup('open')
		}
	}

	var showLoading = function () {
		$.mobile.loading( 'show', {
				text: "Test de l'équipement en cours. Cela peut prendre quelques minutes..."
			, textVisible: true
		})
	}

	var testDevice = function testDevice() {
		var deviceId = $('#equip_id').val()
		var deviceType = $('#equip_type').val()
		//* frame to send at each request. only the action will be changed.
		var ajaxData = {
			  'module'     : 'device_test'
			, 'action'     : 'teststart'
			, 'deviceId'   : deviceId
			, 'deviceType' : deviceType
		}

		
		// $.mobile.loading( 'show', {html: progressbardiv})
		$.ajax({
						'url': "/"
					, 'data': ajaxData
					, 'dataType' : 'json'
		})
		.done(function(data) {
			testid = data.testid
			// console.log("testid=" + testid)
			if (data.msg) {
				$.mobile.loading('hide')
				$('#popupContent').html(data.msg)
				$('#popup').popup('open')
				if (data.hideafter) {
					setTimeout(function () {
						console.log("Hiding popup")
						$('#popup').popup('close')
						showLoading()
					}, Math.abs(data.hideafter))
				};
			}
			if (data.poll_delay) {
				pd = Math.abs(data.poll_delay)
				console.log("Starting poll in " + pd)
				setTimeout(function() {
					deviceInfoRequest(ajaxData, 1000, 180000, endTest)
				}, pd);
			}
		})
		.fail(function(jqXHR, textStatus) {
			$.mobile.loading('hide')
			$('#popupContent').html(textStatus)
			$('#popup').popup('open')
		})
	}

	//*** Submit *************************************************************************************
	//* Ignores input button and input submit
	var submitForm = function submitForm() {
		var data = utils.queryStringToHash($.param($('input:not([type=button],[type=submit]),select')))
		console.log(data)
		data.module = 'device'
		if (data.id) {
			data.action = 'submit_edit'
			delete data.equip_type //* To make sure the event type is not changed
		} else {
			data.action = 'submit_new'
		}

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : data
		})
		.done(function(data) {
			console.log(data)
			if (data.success) {
				utils.addMessage('success', 'TODO: retourner le nouvel id pour pouvoir passer en mode édition')
				// window.location.href = '/?module=device_management'
				// setTimeout('top.location.href = "/?module=scheduler"',2000)
			} else {
				utils.addMessage('error', 'Une erreur est survenue: ' + data.msg)
			}
		})
		.fail(function(a,status) { utils.addMessage('error', "Le formulaire n'a pas pu être envoyé") })
	}
	
	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('new device pageInit')
		utils.initMessages()

		$("#form").validate({
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
			, submitHandler: submitForm
		})
		
		$("#test").on('click',function(){
			$("#form").validate()
			if ( $("#form").valid() ) {
				testDevice()
			}
		})
	}

	return {
			'pageInit' : pageInit
	}
})

