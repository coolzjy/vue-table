function getHeadCell (column, dataBus, h) {
  if (typeof column === 'string') {
    return column
  }
  if (typeof column === 'object') {
    if (typeof column.headComponent === 'function') {
      return h(column.headComponent, {
        props: {
          column,
          dataBus
        }
      })
    }
    if (typeof column.title === 'string') {
      return column.title
    }
  }
}

export default {
  name: 'table-head-cell',

  props: {
    column: {
      type: [String, Object],
      required: true
    },

    dataBus: null
  },

  methods: {
    resizeStart (e) {
      this.start = e.clientX
      document.body.classList.add('vt__dragging')
      document.addEventListener('mouseup', this.resizeEnd)
    },

    resizeEnd (e) {
      document.body.classList.remove('vt__dragging')
      this.$emit('resize', this.column, e.clientX - this.start)
      document.removeEventListener('mouseup', this.resizeEnd)
    }
  },

  render (h) {
    return (
      <th
        staticClass="vt__th">
        { getHeadCell(this.column, this.dataBus, h) }
        {
          !this.column.disableResize && (
            <div
              class="vt-resize-handle"
              onMousedown={this.resizeStart}
            />
          )
        }
      </th>
    )
  }
}
