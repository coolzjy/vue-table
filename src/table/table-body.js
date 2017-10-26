import mixin from './mixin'
import {
  addResizeListener,
  removeResizeListener
} from './resize-detector'
import TableBodyCell from './table-body-cell'
import { looseEqual } from './utils'

export default {
  name: 'table-body',

  mixins: [mixin],

  props: {
    rows: {
      type: Array,
      required: true
    }
  },

  methods: {
    getRowClass (index) {
      return {
        'vt__tr__hover': index === this.layout.hoveredRowIndex
      }
    },

    getRowStyle (index) {
      if (!this.fixed) return
      if (typeof this.layout.bodyRowHeight[index] === 'number') {
        return { height: this.layout.bodyRowHeight[index] + 'px' }
      }
    },

    updateHoveredRowIndex (index) {
      this.layout.hoveredRowIndex = index
    },

    updateWidth () {
      if (this.fixed) return
      setTimeout(_ => {
        this.layout.bodyWidth = this.$refs.body.clientWidth
      }, 0)
    },

    updateScrollbar () {
      if (this.fixed) return
      var body = this.$refs.body
      this.layout.scrollbarWidth = body.offsetWidth - body.clientWidth
      this.layout.scrollbarHeight = body.offsetHeight - body.clientHeight
    },

    /**
     *  @exposed
     *  In rare case, row height change without DOM manipulation.
     *  So we expose this api to manually synchronize row height.
     */
    updateRowHeight (force) {
      if (this.fixed) return
      // make sure DOM is updated
      this.$nextTick(_ => {
        var rowHeight = this.$refs.rows.map(row => row.offsetHeight)
        if (!looseEqual(rowHeight, this.layout.bodyRowHeight) || force) {
          this.layout.bodyRowHeight = rowHeight
        }
      })
    }
  },

  created () {
    if (this.fixed) return
    this.layout.$on('updatescrollbar', this.updateScrollbar)
    this.layout.$on('updatebodywidth', this.updateWidth)
  },

  mounted () {
    // synchronize scroll position with table head and fixed columns
    this.$nextTick(_ => {
      var body = this.$refs.body
      this.layout.vss[this.fixed ? 'to' : 'from'](body)
      if (this.fixed) return
      this.layout.hss.from(body)
      addResizeListener(body, this.updateWidth)
    })
  },

  updated () {
    /**
     *  Patch applied means row height might change,
     *  so we must check row height here
     */
    this.updateScrollbar()
    this.updateRowHeight()
  },

  beforeDestroy () {
    var body = this.$refs.body
    this.layout.vss.off(body)
    if (this.fixed) return
    this.layout.hss.off(body)
    this.layout.$off('updatescrollbar', this.updateScrollbar)
    this.layout.$off('updatebodywidth', this.updateWidth)
    removeResizeListener(body, this.updateWidth)
  },

  render (h) {
    return (
      <div
        staticClass="vt-table-body"
        style={{ 'overflow-y': this.fixed ? 'hidden' : 'auto' }}
        ref="body">
        <table
          staticClass="vt__table"
          style={this.tableStyle}>
          <colgroup>
            { this.width.map(i => <col style={{ width: i + 'px' }} />) }
          </colgroup>
          {
            this.rows.map((row, rIndex) =>
              <tr
                staticClass="vt__tr"
                class={this.getRowClass(rIndex)}
                style={this.getRowStyle(rIndex)}
                onMouseenter={_ => { this.updateHoveredRowIndex(rIndex) }}
                key={rIndex} ref="rows" refInFor>
                {
                  this.columns.map((column, cIndex) =>
                    <TableBodyCell
                      column={column}
                      row={row}
                      index={rIndex}
                      dataBus={this.dataBus}
                      key={cIndex}
                    />
                  )
                }
              </tr>
            )
          }
        </table>
      </div>
    )
  }
}
