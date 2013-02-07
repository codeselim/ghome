define(['jquery','utils'], function($, utils){

  var pageInit = function() {
    console.log('threshold pageInit')
    // utils.initMessages()
  }

  var listPageInit = function() {
    console.log('threshold list pageInit')
    // utils.initMessages()
  }

  return {
      'pageInit' : pageInit
    , 'listPageInit' : listPageInit
  }
})

