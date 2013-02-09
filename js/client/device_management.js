define(['jquery','utils'], function($, utils){

  var pageInit = function() {
    console.log('device management pageInit')
    utils.initMessages()
  }

  return {
    'pageInit' : pageInit
  }
})

