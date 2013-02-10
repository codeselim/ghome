define(['jquery','utils'], function($, utils){

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
      , submitHandler: function()  {
        var dataToSubmit = {}
        dataToSubmit.name = $('[name=name]').val()
        dataToSubmit.value = $('[name=value]').val()

        dataToSubmit.deviceTypes = utils.queryStringToHash($.param($('input[type=checkbox]:checked')))['stid']
        dataToSubmit.module = 'threshold'
        if (dataToSubmit.id) {
          dataToSubmit.action = 'submit_edit'
        } else {
          dataToSubmit.action = 'submit_new'
        }
        console.log(dataToSubmit.deviceTypes)
        console.log(JSON.stringify(dataToSubmit))

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
    })

//"input[type='checkbox']"

  $("input[type='checkbox']").change( function(event) {
    var cb = this
    if (this.checked == false) {
     
      //<input type="hidden" name="id" value="{{threshold.id}}" />
      if ($("div[data-url='/?module=threshold&action=new']").find("form").find("input[name='id']").val() == null) {
        // Edit mode
        
      alert('Unchecked')
      var data = {}
      data.sensorType = $(this).val()
      data.action = "check_task"
      // Résout un problème de form cachée avec l'id d'un seuil édité précédemment mais non validé
      if($('form').length > 1) {
      data.id = $('form:not([novalidate])').find("input[name='id']").val()
    }
    else {
      data.id = $("input[name='id']").val()
    }
    data.module='threshold'
      $.ajax({
            'url'      : "/"
          , 'dataType' : 'json'
          , 'data'     : data
          , contentType: 'application/json'
        })
        .done(function(data) {
          if(!data.success) {
            $(cb).attr("checked",true).checkboxradio("refresh");
          }
      })
      }
    }
});



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

