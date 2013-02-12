"use strict"

define(['jquery', 'utils', 'jqvalidate'], function($,utils){			

	var submitForm = function submitForm() {
		var data = utils.queryStringToHash($.param($('input:not([type=button],[type=submit]),select')))
		console.log(data)
		data.module = 'spy'

		data.action = 'submit_parameters'

		$.ajax({
			'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : data
		})
		.done(function(data) {
			console.log(data)
			if (data.success) {
				// utils.addMessage('success', 'TODO: retourner le nouvel id pour pouvoir passer en mode édition')
				 window.location.href = '/?module=spy' //* Why reload entirely?
					// setTimeout('top.location.href = "/?module=scheduler"',2000)
				} else {
					utils.addMessage('error', 'Une erreur est survenue: ' + data.msg)
				}
			})
		.fail(function(a,status) { utils.addMessage('error', "Le formulaire n'a pas pu être envoyé") })

	}

	var pageInit = function() {
		// TODO : get recent logs from spy table and create a table with them
		utils.initMessages();

		console.log('spy!!!')

		$("form").validate({
			rules: { 
				email: {required:true, email:true}
			} 
			, messages: { 
				email: {
					required : "Email requis",
					email : "Email non valide"
				}
			}
			// , errorPlacement: function(error, element) {
			// 	//* Needed to place the error message out of the select menu.
			// 	if (element.is('select')) {
			// 		error.insertAfter($(element).parent())
			// 	} else {
			// 		error.insertAfter(element)
			// 	}
			// }
			, submitHandler: submitForm
		})
	}	

	return {
		pageInit: pageInit
	}
})


