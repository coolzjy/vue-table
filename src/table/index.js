import Vue from 'vue'
import {
  MIN_COLUMN_WIDTH,
  getColumnWidth,
  fitColumnWidth
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

    dataBus: null
  },

  data () {
    return {
      layoutComplete: false
    }
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
      deep: true,
      handler () {
        this.$nextTick(_ => {
          this.layoutColumns(true)
        })
      }
    },

    'rows': {
      deep: true,
      handler: 'syncHeight'
    },

    'layout.bodyWidth' () {
      // no need to adjust column width
      if (this.layoutComplete && this.layout.scrollbarHeight !== 0) return
      this.layoutColumns()
    }
  },

  methods: {
    resetHoveredRowIndex () {
      this.layout.hoveredRowIndex = null
    },

    layoutColumns (reset) {
      if (this.columns.length !== this.layout.columnWidth.length || reset) {
        // get new column size
        getColumnWidth(this.columns, this.layout, this.$refs.head.$el)
      }
      // fit column width
      fitColumnWidth(this.columns, this.layout)
      if (!this.layoutComplete) this.layoutComplete = true
    },

    // column resize
    columnResize (column, offset, cb) {
      var index = this.columns.indexOf(column)
      var newWidth = this.layout.columnWidth[index] + offset
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
      layout.columnWidth.splice(index, 1, newWidth)
      if (cb) cb()
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
          ref="body"
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
          />
        </div>
      )
    }

    return (
      <div
        staticClass="vt__wrapper"
        style={{ visibility: this.layoutComplete ? 'visible' : 'hidden' }}
        onMouseleave={this.resetHoveredRowIndex}
        ref="wrapper">
        {main}
        {left}
        {right}
      </div>
    )
  }
}
