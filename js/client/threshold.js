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
        dataToSubmit.deviceTypes = utils.queryStringToHash($.param($('input[type=checkbox]:checked')))
        dataToSubmit.module = 'threshold'
        if (dataToSubmit.id) {
          dataToSubmit.action = 'submit_edit'
        } else {
          dataToSubmit.action = 'submit_new'
        }
        console.log(dataToSubmit)

        $.ajax({
            'url'      : "/"
          , 'dataType' : 'json'
          , 'data'     : dataToSubmit
        })
        .done(function(data) {
          console.log(data)
          if (data.success) {
            window.location.href = '/?module=threshold_list&msg='+encodeURIComponent(data.msg)
          } else {
            utils.addMessage('error', 'Une erreur est survenue: ' + data.msg)
          }
        })
        .fail(function(_,status) { console.log(status); utils.addMessage('error', "Le formulaire n'a pas pu être envoyé") })
      }
    })
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

