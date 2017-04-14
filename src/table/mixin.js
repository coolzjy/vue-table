export default {
  props: {
    fixed: String,

    columns: {
      type: Array,
      required: true
    },

    dataBus: null,

    layout: {
      type: Object,
      required: true
    }
  },

  computed: {
    width () {
      return this.layout[this.fixed ? this.fixed + 'ColumnWidth' : 'columnWidth']
    },

    totalWidth () {
      return this.layout[this.fixed ? this.fixed + 'TotalWidth' : 'totalWidth']
    },

    tableStyle () {
      if (!this.totalWidth) return
      return {
        'width': this.totalWidth + 'px'
      }
    }
  }
}
