import Vue from 'vue'
Vue.config.productionTips = false

var testsContext = require.context('./specs/', true, /\.spec\.js$/)
testsContext.keys().forEach(testsContext)
