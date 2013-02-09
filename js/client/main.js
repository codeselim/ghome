"use strict"

require.config({ 
	baseUrl: 'js/client'
	, paths: {  
		  'jquerymobile': '../vendor/jquery.mobile-1.2.0.min'
		, 'jqvalidate': '../vendor/jquery.validate.min'
	}
	, shim : {
		'jquerymobile' : ['jquery']
	}
})


require(['jquery', /*'prejqm',*/ 'sseListener', 'device_management', 'device', 'scheduler', 'jquerymobile'], 
	function($, /*_,*/ sseListener, devMgmt, device, scheduler) {
	$(function() {

		//* Hides the body until JQM finishes applying styles
		$('body').css('visibility', 'visible')

		var homePI = function() {
			console.log('pageinit home!')
		}

		var notifPI = function() {
			console.log('pageinit notif!')
			var onSSERecieved = function(e) {
				$('#sseOutput').append('<br />' + e.data)
			}

			$('#sseToggle').change(function() { 
				console.log('toggled!')
				if ($(this).val() == 'on') {
					sseListener.enableSSE(onSSERecieved)
				} else {
					sseListener.disableSSE()
					$('#sseOutput').html('')
				}
			})
		}

		//* Registering the page inits
		var pageinits = {
			  'home'      : homePI
			, 'notif'     : notifPI
			, 'devMgmt'   : devMgmt.pageInit
			, 'device'    : device.pageInit
			, 'scheduler' : scheduler.pageInit
			, 'task'   : scheduler.taskPageInit
			, 'spy'       : function() {
				// TODO : get recent logs from spy table and create a table with them
				utils.initMessages();
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
							utils.addMessage('success', 'TODO: retourner le nouvel id pour pouvoir passer en mode édition')
							window.location.href = '/?module=spy'
							// setTimeout('top.location.href = "/?module=scheduler"',2000)
						} else {
							utils.addMessage('error', 'Une erreur est survenue: ' + data.msg)
						}
					})
					.fail(function(a,status) { utils.addMessage('error', "Le formulaire n'a pas pu être envoyé") })
				}

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
			}
		}

		for(var id in pageinits) {
			console.log('applying pageinit for ' + id)
			$(document).delegate('#' + id, 'pageinit', pageinits[id])	
		}

		//* When the page is loaded from non AJAX request, pageinit event
		//* is fired before the functions are bound. It has to be called
		//* here.
		console.log($('[data-role="page"]:first').attr('id'))
		pageinits[$('[data-role="page"]:first').attr('id')]()

		$(document).on('pagehide', 'div', function(event, ui) {
			var page = $(event.target)

			if(page.attr('data-cache') == 'never'){
				page.remove()
			}
		})
	})
})