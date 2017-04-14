import mixin from './mixin'
import TableHeadCell from './table-head-cell'

export default {
  name: 'table-head',

  mixins: [mixin],

  computed: {
    rowStyle () {
      if (!this.fixed) return
      return {
        'height': this.layout.headRowHeight + 'px'
      }
    }
  },

  methods: {
    columnResize (column, offset, cb) {
      this.$emit('columnResize', column, offset, cb)
    },

    /**
     *  @exposed
     *  In rare case, row height change without DOM manipulation.
     *  So we expose this api to manually synchronize row height.
     */
    updateHeight () {
      // make sure DOM is updated
      this.$nextTick(_ => {
        this.layout.headHeight = this.$refs.head.offsetHeight
        this.layout.headRowHeight = this.$refs.row.offsetHeight
      })
    }
  },

  mounted () {
    if (this.fixed) return
    this.updateHeight()
    this.$nextTick(_ => {
      this.layout.hss.to(this.$refs.head)
    })
  },

  updated () {
    /**
     *  Patch applied means row height might change,
     *  so we must update row height here
     */
    if (this.fixed) return
    this.updateHeight()
  },

  beforeDestroy () {
    if (this.fixed) return
    this.layout.hss.off(this.$refs.head)
  },

  render (h) {
    return (
      <div
        staticClass="vt-table-head"
        ref="head">
        <table
          staticClass="vt__table"
          style={this.tableStyle}>
          <colgroup>
            { this.width.map(i => <col style={{ width: i + 'px' }} />) }
          </colgroup>
          <tr
            staticClass="vt__tr"
            style={this.rowStyle}
            ref="row">
            {
              this.columns.map((column, index) =>
                <TableHeadCell
                  column={column}
                  dataBus={this.dataBus}
                  onResize={this.columnResize}
                  key={index}
                />
              )
            }
          </tr>
        </table>
      </div>
    )
  }
}
