define(['jquery','utils'], function($, utils){

	var submitForm = function() {
		var dataToSubmit = {
			  'name'        : $('[name=name]').val()
			, 'value'       : $('[name=value]').val()
			, 'id'          : $('[name=id]').val()
			, 'module'      : 'threshold'
			, 'deviceTypes' : utils.queryStringToHash($.param($('input[type=checkbox]:checked')))['stid']
		}

		if (dataToSubmit.id) {
			dataToSubmit.action = 'submit_edit'
		} else {
			dataToSubmit.action = 'submit_new'
		}

		console.log('Data to submit: ', JSON.stringify(dataToSubmit))

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : dataToSubmit
			, contentType: 'application/json'
		})
		.done(function(data) {
			console.log(data)
			if (data.success) {
				window.location.href = '/?module=threshold_list&msg='+encodeURIComponent(data.msg)
			} else {
				console.log(data.msg)
				utils.addMessage('error', 'Une erreur est survenue: ' + data.msg)
			}
		})
		.fail(function(_,status) { console.log(status); utils.addMessage('error', "Le formulaire n'a pas pu être envoyé") })
	}

	var checkUnlinkAllowed = function() {
		console.log('cb changed')
		var $cb = $(this)
		if (this.checked == false) {
			console.log('cb unchecked')
			var data = {
				  'sensorType' : $cb.val()
				, 'action' : 'check_task'
				, 'id' : $("input[name='id']").val()
				, 'module' : 'threshold'
			}
			console.log(data)
			$.ajax({
				'url'      : "/"
				, 'dataType' : 'json'
				, 'data'     : data
			})
			.done(function(data) {
				console.log('recieved:',data)
				if(!data.success) {
					$cb.attr("checked",true).checkboxradio("refresh")
					utils.addMessage('error', 'Le seuil est utilisé par un évènement sur ce type de capteur. Impossible de le délier maintenant.')
					// console.log(utils)
				}
			})
		}
	}


	var pageInit = function() {
		console.log('threshold pageInit')
		utils.initMessages()
		$("form").validate({
				rules: { 
						name: "required"
					, value: "required" /* @TODO numeric?*/
				} 
			, messages: { 
						name: "Veuillez entrez un nom pour le seuil"
					, value: "Veuillez entrez une valeur pour le seuil"
				}
			, submitHandler: submitForm
				
		})
	
		if ($('input[name=id]').val()) {
			// Edit mode
			console.log('edit mode!, id =', $('input[name=id]').val())
			$("input[type='checkbox']").change(checkUnlinkAllowed)
		}
	}

	var listPageInit = function() {
		console.log('threshold list pageInit')
		utils.initMessages()
	}

	return {
			'pageInit' : pageInit
		, 'listPageInit' : listPageInit
	}
})

