define(['jquery', 'jqvalidate'], function($){
	var conditionTemplate = '<li> <a href="#" onclick="return false;" class="leftLink"> <span> <div class="ui-grid-b"> <div class="ui-block-a"> <select name="condSource" data-inline="true"data-mini="true" disabled></select> </div> <div class="ui-block-b"> <select name="condData" data-inline="true"data-mini="true" disabled></select> </div> </div> </span> </a> <a href="#">Retirer</a> </li> '
/* Multi line template:
<li>	
	<a href="#" onclick="return false;" class="leftLink">
		<span>
			<div class="ui-grid-b">
				<div class="ui-block-a">
					<select name="condSource" data-inline="true" disabled></select>
				</div>
				<div class="ui-block-b">
					<select name="condData" data-inline="true" disabled></select>
				</div>
				<div class="ui-block-c">
					<select name="condValue" data-inline="true"  disabled></select>
				</div>
			</div>

		</span>
	</a>
	<a href="#">Retirer</a>
</li>
*/

	var populateSelectBox = function($select, data) {
		$select.empty()
		// $('#select option:gt(0)').remove(); //* Remove all options, but not the first

		$.each(data, function(key, value) {
		  $select.append($("<option></option>").attr("value", value).text(key))
		})
		$select.selectmenu($.isEmptyObject(data)? 'disable' : 'enable')
		$select.selectmenu('refresh', true)
	}

	var updateActionList = function() {
		var deviceType = $(this).find(':selected').data('device-type')

		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_actions', 'deviceType' : deviceType}
		})
		.done(function(data) {
			console.log(data)
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
			console.log(data)
			populateSelectBox($('[name=evtType]'), data)
			if ($.isEmptyObject(data)) populateSelectBox($('[name=evtValue]'), {})
		})
	}

	var updateEvtValueList = function() {
		var evtType = $(this).val()
		$.ajax({
				'url'      : "/"
			, 'dataType' : 'json'
			, 'data'     : {'module' : 'new_task', 'action' : 'get_event_values', 'eventType' : evtType}
		})
		.done(function(data) {
			console.log(data)
			populateSelectBox($('[name=evtValue]'), data)
		})
	}

	var addCondition = function() {
		$condList = $('#conditions')
		// var condition = conditionTemplate.replace(/a/g, '')
		// $("li:last").before('<li>azddddddddd</li>')
		$condList.find('li:last').before(conditionTemplate)
		$condList.find('li:last').prev('li').trigger('create')
		$condList.listview('refresh')
	}

	var remove = function() {
		console.log('remove: ', $(this))
	}

	//*** Returned functions *************************************************************************
	var pageInit = function pageInit() {
		console.log('scheduler pageInit')
	}

	var newTaskPI = function newTaskPI() {
		console.log('new task pageInit')

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

		$('[name=aActor]').change(updateActionList)
		$('[name=evtSource]').change(updateEvtTypeList)
		$('[name=evtType]').change(updateEvtValueList)
		$('#addCondition').click(addCondition)
	}

	return {
			'pageInit' : pageInit
		, 'newTaskPageInit' : newTaskPI
	}
})

