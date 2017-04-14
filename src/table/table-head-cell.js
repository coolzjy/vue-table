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
    dragStart (e) {
      this.dragging = true
      this.start = e.clientX
      document.body.classList.add('vt__dragging')
      document.addEventListener('mousemove', this.dragMove)
      document.addEventListener('mouseup', this.dragEnd)
    },

    dragMove (e) {
      this.$emit('resize', this.column, e.clientX - this.start, _ => {
        this.start = e.clientX
      })
    },

    dragEnd (e) {
      this.dragging = false
      document.body.classList.remove('vt__dragging')
      document.removeEventListener('mousemove', this.dragMove)
      document.removeEventListener('mouseup', this.dragEnd)
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
              onMousedown={this.dragStart}
            />
          )
        }
      </th>
    )
  }
}
