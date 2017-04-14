import Vue from 'vue'

export var columns = [
  'col1',
  {
    title: 'Col 2',
    prop: 'col2',
    width: 10
  },
  {
    headComponent: Vue.extend({
      render (h) {
        return h('span', 'Col 3')
      }
    })
  },
  {
    title: 'Col 4',
    bodyComponent: Vue.extend({
      render (h) {
        return h('span', 'row')
      }
    })
  }
]

export var rows = [
  { col1: '1', col2: '2', col3: '3', col4: '4' }
]
