function getBodyCell (column, row, index, dataBus, h) {
  if (typeof column === 'string') {
    return row[column]
  }
  if (typeof column === 'object') {
    if (typeof column.bodyComponent === 'function') {
      return h(column.bodyComponent, {
        props: {
          column,
          row,
          index,
          dataBus
        }
      })
    }
    if (typeof column.prop === 'string') {
      return row[column.prop]
    }
  }
}

export default {
  name: 'table-body-cell',

  functional: true,

  props: {
    column: {
      type: [String, Object],
      required: true
    },

    row: {
      type: Object,
      required: true
    },

    index: {
      type: Number,
      required: true
    },

    dataBus: null
  },

  render (h, c) {
    var content = getBodyCell(c.props.column, c.props.row,
      c.props.index, c.props.dataBus, h)

    var click = c.data.on && c.data.on['cell-click']

    return (
      <td
        staticClass="vt__td"
        title={typeof content === 'string' ? content : ''}
        onClick={e => click && click(c.props.row, c.props.columns, e)}>
        { content }
      </td>
    )
  }
}
