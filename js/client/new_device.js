define(['jquery', 'jqvalidate'], function($) {
	// var progressbardiv = "<div style='width: 200px; opacity: .75' class='meter'><span style='width: 25%'></span></div>"

	//*** Server Polling *****************************************************************************
	var testid = null
	var deviceInfoRequest = function deviceInfoRequest(ajaxData, interval, countdown, finalCallback) {
		ajaxData.action = 'testpoll'
		ajaxData.testid = testid
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : ajaxData
		})
		.always(function(data) {
			var reqStatus = {'validated' :false}
			//* We test the response.
			if (Object.prototype.toString.call(data.events) === '[object Array]') {
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
			$('#popupContent').html("Le test s'est terminé avec succès! (si type = prise : la commande d'activation de la prise a été envoyée. Vérifiez si elle s'est bien allumée.)")
			$('#popup').popup('open')	
		} else {
			$.mobile.loading('hide')
			$('#popupContent').html("Le nouvel équipement ne répond pas.")
			$('#popup').popup('open')
		}
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

		$.mobile.loading( 'show', {
				text: "Test de l'équipement en cours. Cela peut prendre quelques minutes..."
			, textVisible: true
		})
		// $.mobile.loading( 'show', {html: progressbardiv})
		$.ajax({
						'url': "/"
					, 'data': ajaxData
					, 'dataType' : 'json'
		})
		.done(function(data) {
			testid = data.testid
			deviceInfoRequest(ajaxData, 3000, 15000, endTest)
		})
		.fail(function(jqXHR, textStatus) {
			$.mobile.loading('hide')
			$('#popupContent').html(textStatus)
			$('#popup').popup('open')
		})
	}
	
	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('new device pageInit')
		
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
		})
		
		$(":submit").on('click',function () { $("#action").val(this.name) })
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

