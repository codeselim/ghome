define(['jquery'], function($){
	// var progressbardiv = "<div style='width: 200px; opacity: .75' class='meter'><span style='width: 25%'></span></div>"


	//*** Utils **************************************************************************************
	var isArray = function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
	}

	/**
	 * @param{Object} args arguments of the chain. must contain:
	 *    params (Object): contains all the parameters useful to the other functions
	 * 		func (Function): main function, to be called at each turn. Takes params as parameter
	 *		test (Function): test function, must return a boolean. If it returns true, the chain ends.
	 *			Takes params as parameter
	 *		finalCallback(Function): will be called at the end of the chain. Takes params as parameter
	 */
	var chainTimeouts = function chainTimeouts(args){
		args.func(args.params)
		if (!args.test(args.params)) {
			setTimeout(function(){chainTimeouts(args)}, args.interval)  
		} else {
			args.finalCallback(args.params)
		}
	}

	//*** Server Polling *****************************************************************************

	var pollServer = function pollServer(deviceId, deviceType, callback) {
		var totalTimeout = 10000
		var pollInterval = 1000

		//* Checks if we reached the end of the chain (timeout or device validated)
		var isDeviceValidated = function(params) {
			if (! params.validated && params.countdown > 0) {
				params.countdown -= params.interval
				return false
			}
			return true
		}

		//* Retrieves the device info from the server and updates the object params
		var deviceInfoRequest = function(params) {
			$.ajax({
				  'url'      : "/"
				, 'dataType' : 'json'
				, 'data'     : {
					  'module'     : 'new_device'
					, 'action'     : 'testpoll'
					, 'deviceId'   : params.deviceId
					, 'deviceType' : params.deviceType
				}
			})
			.done(function(data) {
				if (isArray(data.events)) {
					params.validated = true
				}
			})
			.fail(function(jqXHR, textStatus) {
				console.log('poll failed: ' + textStatus)
			})
		}

		//* We start the chain
		chainTimeouts({
			  'test'          : isDeviceValidated
			, 'func'          : deviceInfoRequest
			, 'interval'      : pollInterval
			, 'finalCallback' : callback
			, 'params'        : {
			    'countdown'  : totalTimeout
				, 'interval'   : pollInterval
				, 'validated'  : false
				, 'deviceId'   : deviceId
				, 'deviceType' : deviceType
			}
		})
	}

	//***  Test main functions ***********************************************************************
	var endTest = function endTest(params) {
		//* We tell the server that the test is over
		$.ajax({
			  'url': "/"
			, 'data': {
				  'module'     : 'new_device'
				, 'action'     : 'testend'
				, 'deviceId'   : params.deviceId
				, 'deviceType' : params.deviceType
			}
		})

		//* We display the test results
		if (params.validated) {
			$.mobile.loading('hide')
			$('#popupContent').html('ok!')
			$('#popup').popup('open')	
		} else {
			$.mobile.loading('hide')
			$('#popupContent').html('error')
			$('#popup').popup('open')
		}
	}

	var testDevice = function testDevice() {
		var deviceId = $('#equip_id').val()
		var deviceType = $('#equip_type').val()
		$.mobile.loading( 'show', {
			  text: "Test de l'équipement en cours. Cela peut prendre quelques minutes..."
			, textVisible: true
		})
		// $.mobile.loading( 'show', {html: progressbardiv})
		$.ajax({
					  'url': "/"
					, 'data': {
						  'module'     : 'new_device'
						, 'action'     : 'teststart'
						, 'deviceId'   : deviceId
						, 'deviceType' : deviceType
					}
					, 'dataType' : 'json'
		})
		.done(function(data) {
			pollServer(deviceId, deviceType, endTest)
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
		$(":submit").on('click',function () { $("#action").val(this.name) })
		$("[name=test]").on('click',testDevice)
	}


	return {
			'pageInit' : pageInit
	}
})

