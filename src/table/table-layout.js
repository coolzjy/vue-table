import ScrollSyncer from 'scroll-syncer'
import { getFixedNumber } from './utils'

export default {
  data () {
    return {
      fixed: 0,
      height: undefined,
      useMax: false,

      headHeight: undefined,
      bodyWidth: undefined,

      columnWidth: [],

      headRowHeight: undefined,
      bodyRowHeight: [],

      scrollX: 0,
      scrollY: 0,

      hoveredRowIndex: null
    }
  },

  computed: {
    leftColumnNumber () {
      return getFixedNumber(this.fixed)
    },

    rightColumnNumber () {
      return getFixedNumber(this.fixed, true)
    },

    leftColumnWidth () {
      return this.columnWidth.slice(0, this.leftColumnNumber)
    },

    rightColumnWidth () {
      return this.columnWidth.slice(-this.rightColumnNumber)
    },

    totalWidth () {
      return this.columnWidth.reduce((prev, curr) => prev + curr, 0)
    },

    leftTotalWidth () {
      return Math.ceil(this.leftColumnWidth
        .reduce((prev, curr) => prev + curr, 0))
    },

    rightTotalWidth () {
      return Math.ceil(this.rightColumnWidth
        .reduce((prev, curr) => prev + curr, 0))
    },

    mainHeadStyle () {
      return {
        'margin-right': this.scrollY + 'px'
      }
    },

    bodyHeight () {
      if (
        this.height === undefined ||
        this.headHeight === undefined
      ) return
      return this.height - this.headHeight
    },

    bodyStyle () {
      if (this.bodyHeight === undefined) return
      var result = {}
      result[this.useMax ? 'max-height' : 'height'] = this.bodyHeight + 'px'
      return result
    },

    rightWrapperStyle () {
      return {
        'right': this.scrollY + 'px'
      }
    },

    fixedBodyStyle () {
      return {
        'max-height': this.bodyHeight - this.scrollX + 'px'
      }
    }
  },

  watch: {
    'columnWidth' () {
      this.$nextTick(this.updateRowHeight)
    },
    'totalWidth' () {
      this.$nextTick(this.updateScrollX)
    },
    'bodyWidth': {
      sync: true,
      handler (val, oldVal) {
        if (val > oldVal || oldVal == null) {
          this.updateColumnWidth()
        }
        this.updateScrollX()
      }
    },

    'scrollX': {
      sync: true,
      handler: 'updateScrollY'
    },
    'scrollY': {
      sync: true,
      handler (val) {
        if (val) {
          this.updateScrollX()
        } else {
          this.updateColumnWidth()
        }
      }
    },

    'bodyHeight' () {
      this.$nextTick(this.updateScrollY)
    }

    //
    // // resize listener will not trigger when scrollbar appear/disappear
    // 'scrollbarWidth': {
    //   sync: true,
    //   handler: 'updateBodyWidth'
    // }
  },

  methods: {
    updateScrollX () {
      this.$emit('updatescrollx')
    },

    updateScrollY () {
      this.$emit('updatescrolly')

      // when vertical scrollbar appears,
      // horizental scrollbar will not appear synchronously,
      if (this.scrollY !== 0 && this.scrollX === 0) {
        this.updateScrollX()
      }
    },

    updateColumnWidth () {
      this.$emit('updatecolumnwidth')
    },

    updateBodyWidth () {
      this.$emit('updatebodywidth')
    },

    updateRowHeight () {
      this.$emit('updaterowheight')
    }
  },

  beforeCreate () {
    this.vss = new ScrollSyncer(true, false)
    this.hss = new ScrollSyncer(false, true)
  }
}
