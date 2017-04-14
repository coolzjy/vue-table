import Vue from 'vue'

export function getVm (options, propsData) {
  var Ctor = Vue.extend(options)
  return new Ctor({ propsData })
}

export function triggerMouseEvent (el, name, options) {
  options = options || {}
  var ev = document.createEvent('MouseEvent')
  ev.initMouseEvent(
    name,
    true /* bubble */, true /* cancelable */,
    window /* view */, null /* detail */,
    options.screenX, options.screenY,
    options.clientX, options.clientY,
    false, false, false, false, /* modifier keys */
    0 /* left */, null /* related target */
  )
  el.dispatchEvent(ev)
}
