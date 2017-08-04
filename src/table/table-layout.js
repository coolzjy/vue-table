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

      scrollbarWidth: 0,
      scrollbarHeight: 0,

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
        'margin-right': this.scrollbarWidth + 'px'
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
        'right': this.scrollbarWidth + 'px'
      }
    },

    fixedBodyStyle () {
      return {
        'max-height': this.bodyHeight - this.scrollbarHeight + 'px'
      }
    }
  },

  watch: {
    // update scrollbar size when body size changed
    'bodyWidth': 'updateScrollbar',
    'bodyHeight': 'updateScrollbar',

    // resize listener will not trigger when scrollbar appear/disappear
    'scrollbarWidth': 'updateBodyWidth'
  },

  methods: {
    updateScrollbar () {
      this.$emit('updatescrollbar')
    },

    updateBodyWidth () {
      this.$emit('updatebodywidth')
    }
  },

  beforeCreate () {
    this.vss = new ScrollSyncer(true, false)
    this.hss = new ScrollSyncer(false, true)
  }
}
