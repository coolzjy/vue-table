import Vue from 'vue'
import {
  MIN_COLUMN_WIDTH,
  getColumnWidth,
  growToFit
} from './utils'
import TableHead from './table-head'
import TableBody from './table-body'
import TableLayout from './table-layout'

export default {
  name: 'table',

  props: {
    columns: {
      type: Array,
      default () { return [] }
    },

    rows: {
      type: Array,
      default () { return [] }
    },

    fixed: {
      type: [Number, Array],
      default: 0
    },

    height: Number,

    useMax: Boolean,

    selected: Object,

    dataBus: null
  },

  computed: {
    leftColumns () {
      return this.columns.slice(0, this.layout.leftColumnNumber)
    },

    rightColumns () {
      return this.columns.slice(-this.layout.rightColumnNumber)
    }
  },

  watch: {
    'fixed': {
      immediate: true,
      deep: true,
      handler (value) {
        this.layout.fixed = value
      }
    },

    'height': {
      immediate: true,
      handler (value) {
        this.layout.height = value
      }
    },

    'useMax': {
      immediate: true,
      handler (value) {
        this.layout.useMax = value
      }
    },

    'columns': {
      immediate: true,
      deep: true,
      sync: true,
      handler () {
        this.layoutColumns(true)
      }
    },

    'rows': {
      immediate: true,
      deep: true,
      handler (value) {
        this.select(value && value.length ? value[0] : null)
        setTimeout(_ => {
          this.layout.updateScrollY()
          this.layout.updateRowHeight()
        }, 0)
      }
    }
  },

  methods: {
    select (row) {
      this.$emit('update:selected', row)
    },

    resetHoveredRowIndex () {
      this.layout.hoveredRowIndex = null
    },

    layoutColumns (reset) {
      var layout = this.layout
      var columns = this.columns
      var columnWidth = layout.columnWidth
      var bodyWidth = layout.bodyWidth
      if (!bodyWidth) return
      if (columns.length !== columnWidth.length || reset) {
        columnWidth = getColumnWidth(columns)
      }
      layout.columnWidth = growToFit(columnWidth, bodyWidth)
    },

    // column resize
    columnResize (column, offset) {
      var index = this.columns.indexOf(column)
      var columnWidth = this.layout.columnWidth.slice()
      var newWidth = columnWidth[index] + offset
      var layout = this.layout
      if (offset < 0) {
        // keep column min width set in column options
        if (typeof column.width === 'number' && newWidth < column.width) {
          return
        }
        // keep table fill the container
        if (layout.totalWidth + offset < layout.bodyWidth) {
          return
        }
        // keep min column width
        if (newWidth < MIN_COLUMN_WIDTH) {
          return
        }
      }
      columnWidth.splice(index, 1, newWidth)
      layout.columnWidth = columnWidth
    },

    // @exposed
    syncHeight () {
      if (this.$refs.head) {
        this.$refs.head.updateHeight()
      }
      if (this.$refs.body) {
        this.$refs.body.updateRowHeight(true)
      }
    }
  },

  beforeCreate () {
    this.layout = new Vue(TableLayout)
  },

  created () {
    this.layout.$on('updatecolumnwidth', _ => this.layoutColumns())
  },

  beforeDestroy () {
    this.layout.$off('updatecolumnwidth')
  },

  render (h) {
    var left, right

    var main = (
      <div
        staticClass="vt__main-wrapper">
        <TableHead
          style={this.layout.mainHeadStyle}
          columns={this.columns}
          dataBus={this.dataBus}
          layout={this.layout}
          ref="head"
          onColumnResize={this.columnResize}
        />
        <TableBody
          style={this.layout.bodyStyle}
          columns={this.columns}
          rows={this.rows}
          dataBus={this.dataBus}
          layout={this.layout}
          selected={this.selected}
          onSelect={this.select}
          ref="body"
          on-cell-click={(a, b, c) => this.$emit('cell-click', a, b, c)}
        />
      </div>
    )

    if (this.layout.leftColumnNumber) {
      left = (
        <div
          staticClass="vt__left-wrapper">
          <TableHead
            fixed="left"
            columns={this.leftColumns}
            dataBus={this.dataBus}
            layout={this.layout}
            onColumnResize={this.columnResize}
          />
          <TableBody
            style={this.layout.fixedBodyStyle}
            fixed="left"
            columns={this.leftColumns}
            rows={this.rows}
            dataBus={this.dataBus}
            layout={this.layout}
            selected={this.selected}
            onSelect={this.select}
            on-cell-click={(a, b, c) => this.$emit('cell-click', a, b, c)}
          />
        </div>
      )
    }

    if (this.layout.rightColumnNumber) {
      right = (
        <div
          staticClass="vt__right-wrapper"
          style={this.layout.rightWrapperStyle}>
          <TableHead
            fixed="right"
            columns={this.rightColumns}
            dataBus={this.dataBus}
            layout={this.layout}
            onColumnResize={this.columnResize}
          />
          <TableBody
            style={this.layout.fixedBodyStyle}
            fixed="right"
            columns={this.rightColumns}
            rows={this.rows}
            dataBus={this.dataBus}
            layout={this.layout}
            selected={this.selected}
            onSelect={this.select}
            on-cell-click={(a, b, c) => this.$emit('cell-click', a, b, c)}
          />
        </div>
      )
    }

    return (
      <div
        staticClass="vt__wrapper"
        onMouseleave={this.resetHoveredRowIndex}
        ref="wrapper">
        {main}
        {left}
        {right}
      </div>
    )
  }
}
