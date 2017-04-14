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

  render (h, context) {
    var content = getBodyCell(context.props.column, context.props.row,
      context.props.index, context.props.dataBus, h)

    return (
      <td
        staticClass="vt__td"
        class={{ 'vt__td__covered': context.props.covered }}
        title={typeof content === 'string' ? content : ''}>
        { content }
      </td>
    )
  }
}
