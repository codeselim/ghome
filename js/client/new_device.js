define(['jquery'], function($){

	var pageInit = function() {
		console.log('new device pageInit')
		$(":submit").on('click',function () { $("#action").val(this.name) })
		$("[name=test]").on('click',testDevice)
	}

	var testDevice = function() {
		$.mobile.loading('show')
		$.ajax({
			  url: "/"
			, data: {
				  module : 'new_device'
				, action : 'test'
				, deviceid : $('#equip_id').val()
			}
			, 'dataType' : 'json'
		})
		.always(function(){
			$.mobile.loading('hide')
		})
		.done(function(data) {
			$('#popupContent').html(JSON.stringify(data))
			$('#popup').popup('open')
		}) 
		.fail(function() {
			$('#popupContent').html('error')
			$('#popup').popup('open')
		})
	}

	return {
			'pageInit' : pageInit
	}
})

