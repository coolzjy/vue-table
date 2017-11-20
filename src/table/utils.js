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

export function getColumnWidth (columns) {
  function getWidthByStrLength (length) {
    return length * 20
  }

  return columns.map(column => {
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

export function growToFit (columnWidth, bodyWidth) {
  var totalWidth = columnWidth.reduce((prev, curr) => prev + curr, 0)
  if (totalWidth >= bodyWidth) return columnWidth

  var diff = bodyWidth - totalWidth
  return columnWidth.map(w => {
    return w + diff * w / totalWidth
  })
}

export function looseEqual (mixed1, mixed2) {
  return JSON.stringify(mixed1) === JSON.stringify(mixed2)
}
