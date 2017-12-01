import mixin from './mixin'
import ResizeSensor from './resize-detector'
import TableBodyCell from './table-body-cell'
import { looseEqual } from './utils'

export default {
  name: 'table-body',

  mixins: [mixin],

  props: {
    rows: {
      type: Array,
      required: true
    },

    selected: Object
  },

  methods: {
    getRowClass (row, index) {
      return {
        'vt__tr__hover': index === this.layout.hoveredRowIndex,
        'vt__tr__selected': row === this.selected
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
      this.layout.bodyWidth = this.$refs.body.clientWidth
    },

    updateScrollX () {
      var body = this.$refs.body
      this.layout.scrollX = body.offsetHeight - body.clientHeight
    },

    updateScrollY () {
      var body = this.$refs.body
      this.layout.scrollY = body.offsetWidth - body.clientWidth
    },

    /**
     *  @exposed
     *  In rare case, row height change without DOM manipulation.
     *  So we expose this api to manually synchronize row height.
     */
    updateRowHeight (force) {
      if (!this.$refs.rows) return
      var rowHeight = this.$refs.rows.map(row => row.offsetHeight)
      if (!looseEqual(rowHeight, this.layout.bodyRowHeight) || force) {
        this.layout.bodyRowHeight = rowHeight
      }
    }
  },

  created () {
    if (this.fixed) return
    this.layout.$on('updatescrollx', this.updateScrollX)
    this.layout.$on('updatescrolly', this.updateScrollY)
    this.layout.$on('updatebodywidth', this.updateWidth)
    this.layout.$on('updaterowheight', this.updateRowHeight)
  },

  mounted () {
    // synchronize scroll position with table head and fixed columns
    this.$nextTick(_ => {
      var body = this.$refs.body
      this.layout.vss[this.fixed ? 'to' : 'from'](body)
      if (this.fixed) return
      this.updateWidth()
      this.layout.hss.from(body)
      this.resizeSensor = new ResizeSensor(body, this.updateWidth)
    })
  },

  beforeDestroy () {
    var body = this.$refs.body
    this.layout.vss.off(body)
    if (this.fixed) return
    this.layout.hss.off(body)
    this.layout.$off('updatescrollx', this.updateScrollX)
    this.layout.$off('updatescrolly', this.updateScrollY)
    this.layout.$off('updatebodywidth', this.updateWidth)
    this.resizeSensor.detach()
  },

  render (h) {
    return (
      <div
        ref="body"
        staticClass="vt-table-body"
        style={{ 'overflow': this.fixed ? 'hidden' : 'auto' }}>
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
                class={this.getRowClass(row, rIndex)}
                style={this.getRowStyle(rIndex)}
                onClick={_ => { this.$emit('select', row) }}
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
                      on-cell-click={(a, b, c) => this.$emit('cell-click', a, b, c)}
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
