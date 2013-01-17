define(['jquery'], function($){
	var optionTemplate = '<option value="">-- Choisir --</option>'


  var pageInit = function() {
    console.log('new device pageInit')
    $(":submit").click(function () { $("#action").val(this.name); });
  }

  var test = function() {
		$('#deviceList').append(listItemTemplate)
    $('#deviceList').listview('refresh')
  }

  return {
    'pageInit' : pageInit
    , 'test' : test
  }
})

