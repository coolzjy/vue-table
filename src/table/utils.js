var DEFAULT_FONT_WIDTH = 20
var DEFAULT_COLUMN_WIDTH = 100

export var MIN_COLUMN_WIDTH = 40

export function getFixedNumber (fixed, right) {
  var count = 0
  if (Array.isArray(fixed)) {
    fixed = fixed[right ? 1 : 0]
  } else if (right) {
    return count
  }
  if (typeof fixed === 'number' && fixed > 0) count = fixed
  return count
}

export function getColumnWidth (columns, layout, headEl) {
  var headFontWidth = DEFAULT_FONT_WIDTH
  var headCellPadding = 0
  var headCellBorderWidth = 0

  if (headEl) {
    var th = headEl.querySelector('.vt__th')
    if (th) {
      var cellStyle = window.getComputedStyle(th)
      headFontWidth = parseInt(cellStyle.fontSize)
      headCellPadding =
        parseInt(cellStyle.paddingLeft) + parseInt(cellStyle.paddingRight)
      headCellBorderWidth =
        parseInt(cellStyle.borderLeft) + parseInt(cellStyle.borderRight)
    }
  }

  function getWidthByStrLength (length) {
    return length * headFontWidth + headCellPadding + headCellBorderWidth
  }

  layout.columnWidth = columns.map(column => {
    if (typeof column === 'string') {
      return getWidthByStrLength(column.length)
    }
    if (typeof column === 'object') {
      if (typeof column.width === 'number') {
        return column.width
      }
      if (typeof column.title === 'string') {
        return getWidthByStrLength(column.title.length)
      }
    }
    return DEFAULT_COLUMN_WIDTH
  })
}

export function fitColumnWidth (columns, layout) {
  var diff = layout.bodyWidth - layout.totalWidth
  var width = layout.columnWidth.map(w => {
    return w + diff * w / layout.totalWidth
  })

  layout.columnWidth = width.map((w, i) => {
    var minWidth = typeof columns[i].width === 'number'
      ? Math.max(MIN_COLUMN_WIDTH, columns[i].width) : MIN_COLUMN_WIDTH
    return w < minWidth ? minWidth : w
  })
}

export function looseEqual (mixed1, mixed2) {
  return JSON.stringify(mixed1) === JSON.stringify(mixed2)
}
