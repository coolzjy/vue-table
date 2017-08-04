import Vue from 'vue';

var DEFAULT_FONT_WIDTH = 20;
var DEFAULT_COLUMN_WIDTH = 100;

var MIN_COLUMN_WIDTH = 40;

function getFixedNumber(fixed, right) {
  var count = 0;
  if (Array.isArray(fixed)) {
    fixed = fixed[right ? 1 : 0];
  } else if (right) {
    return count;
  }
  if (typeof fixed === 'number' && fixed > 0) count = fixed;
  return count;
}

function getColumnWidth(columns, layout, headEl) {
  var headFontWidth = DEFAULT_FONT_WIDTH;
  var headCellPadding = 0;
  var headCellBorderWidth = 0;

  if (headEl) {
    var th = headEl.querySelector('.vt__th');
    if (th) {
      var cellStyle = window.getComputedStyle(th);
      headFontWidth = parseInt(cellStyle.fontSize);
      headCellPadding = parseInt(cellStyle.paddingLeft) + parseInt(cellStyle.paddingRight);
      headCellBorderWidth = parseInt(cellStyle.borderLeft) + parseInt(cellStyle.borderRight);
    }
  }

  function getWidthByStrLength(length) {
    return length * headFontWidth + headCellPadding + headCellBorderWidth;
  }

  layout.columnWidth = columns.map(function (column) {
    if (typeof column === 'string') {
      return getWidthByStrLength(column.length);
    }
    if (typeof column === 'object') {
      if (typeof column.width === 'number') {
        return column.width;
      }
      if (typeof column.title === 'string') {
        return getWidthByStrLength(column.title.length);
      }
    }
    return DEFAULT_COLUMN_WIDTH;
  });
}

function fitColumnWidth(columns, layout) {
  var diff = layout.bodyWidth - layout.totalWidth;
  var width = layout.columnWidth.map(function (w) {
    return w + diff * w / layout.totalWidth;
  });

  layout.columnWidth = width.map(function (w, i) {
    var minWidth = typeof columns[i].width === 'number' ? Math.max(MIN_COLUMN_WIDTH, columns[i].width) : MIN_COLUMN_WIDTH;
    return w < minWidth ? minWidth : w;
  });
}

function looseEqual(mixed1, mixed2) {
  return JSON.stringify(mixed1) === JSON.stringify(mixed2);
}

var mixin = {
  props: {
    fixed: String,

    columns: {
      type: Array,
      required: true
    },

    dataBus: null,

    layout: {
      type: Object,
      required: true
    }
  },

  computed: {
    width: function () {
      return this.layout[this.fixed ? this.fixed + 'ColumnWidth' : 'columnWidth'];
    },
    totalWidth: function () {
      return this.layout[this.fixed ? this.fixed + 'TotalWidth' : 'totalWidth'];
    },
    tableStyle: function () {
      if (!this.totalWidth) return;
      return {
        'width': this.totalWidth + 'px'
      };
    }
  }
};

function getHeadCell(column, dataBus, h) {
  if (typeof column === 'string') {
    return column;
  }
  if (typeof column === 'object') {
    if (typeof column.headComponent === 'function') {
      return h(column.headComponent, {
        props: {
          column: column,
          dataBus: dataBus
        }
      });
    }
    if (typeof column.title === 'string') {
      return column.title;
    }
  }
}

var TableHeadCell = {
  name: 'table-head-cell',

  props: {
    column: {
      type: [String, Object],
      required: true
    },

    dataBus: null
  },

  methods: {
    dragStart: function (e) {
      this.dragging = true;
      this.start = e.clientX;
      document.body.classList.add('vt__dragging');
      document.addEventListener('mousemove', this.dragMove);
      document.addEventListener('mouseup', this.dragEnd);
    },
    dragMove: function (e) {
      var _this = this;

      this.$emit('resize', this.column, e.clientX - this.start, function (_) {
        _this.start = e.clientX;
      });
    },
    dragEnd: function (e) {
      this.dragging = false;
      document.body.classList.remove('vt__dragging');
      document.removeEventListener('mousemove', this.dragMove);
      document.removeEventListener('mouseup', this.dragEnd);
    }
  },

  render: function (h) {
    return h(
      'th',
      {
        staticClass: 'vt__th' },
      [getHeadCell(this.column, this.dataBus, h), !this.column.disableResize && h(
        'div',
        {
          'class': 'vt-resize-handle',
          on: {
            'mousedown': this.dragStart
          }
        },
        []
      )]
    );
  }
};

var TableHead = {
  name: 'table-head',

  mixins: [mixin],

  computed: {
    rowStyle: function () {
      if (!this.fixed) return;
      return {
        'height': this.layout.headRowHeight + 'px'
      };
    }
  },

  methods: {
    columnResize: function (column, offset, cb) {
      this.$emit('columnResize', column, offset, cb);
    },


    /**
     *  @exposed
     *  In rare case, row height change without DOM manipulation.
     *  So we expose this api to manually synchronize row height.
     */
    updateHeight: function () {
      var _this = this;

      // make sure DOM is updated
      this.$nextTick(function (_) {
        _this.layout.headHeight = _this.$refs.head.offsetHeight;
        _this.layout.headRowHeight = _this.$refs.row.offsetHeight;
      });
    }
  },

  mounted: function () {
    var _this2 = this;

    if (this.fixed) return;
    this.updateHeight();
    this.$nextTick(function (_) {
      _this2.layout.hss.to(_this2.$refs.head);
    });
  },
  updated: function () {
    /**
     *  Patch applied means row height might change,
     *  so we must update row height here
     */
    if (this.fixed) return;
    this.updateHeight();
  },
  beforeDestroy: function () {
    if (this.fixed) return;
    this.layout.hss.off(this.$refs.head);
  },
  render: function (h) {
    var _this3 = this;

    return h(
      'div',
      {
        staticClass: 'vt-table-head',
        ref: 'head' },
      [h(
        'table',
        {
          staticClass: 'vt__table',
          style: this.tableStyle },
        [h(
          'colgroup',
          null,
          [this.width.map(function (i) {
            return h(
              'col',
              { style: { width: i + 'px' } },
              []
            );
          })]
        ), h(
          'tr',
          {
            staticClass: 'vt__tr',
            style: this.rowStyle,
            ref: 'row' },
          [this.columns.map(function (column, index) {
            return h(
              TableHeadCell,
              {
                attrs: {
                  column: column,
                  dataBus: _this3.dataBus
                },
                on: {
                  'resize': _this3.columnResize
                },

                key: index
              },
              []
            );
          })]
        )]
      )]
    );
  }
};

/**
 *  Detect Element Resize
 *
 *  https://github.com/sdecima/javascript-detect-element-resize
 *  Sebastian Decima
 *
 *  version: 0.5.3
 */

var stylesCreated = false;

var requestFrame = function () {
  var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
    return window.setTimeout(fn, 20);
  };
  return function (fn) {
    return raf(fn);
  };
}();

var cancelFrame = function () {
  var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
  return function (id) {
    return cancel(id);
  };
}();

function resetTriggers(element) {
  var triggers = element.__resizeTriggers__;
  var expand = triggers.firstElementChild;
  var contract = triggers.lastElementChild;
  var expandChild = expand.firstElementChild;
  contract.scrollLeft = contract.scrollWidth;
  contract.scrollTop = contract.scrollHeight;
  expandChild.style.width = expand.offsetWidth + 1 + 'px';
  expandChild.style.height = expand.offsetHeight + 1 + 'px';
  expand.scrollLeft = expand.scrollWidth;
  expand.scrollTop = expand.scrollHeight;
}

function checkTriggers(element) {
  return element.offsetWidth !== element.__resizeLast__.width || element.offsetHeight !== element.__resizeLast__.height;
}

function scrollListener(e) {
  var element = this;
  resetTriggers(this);
  if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
  this.__resizeRAF__ = requestFrame(function () {
    if (checkTriggers(element)) {
      element.__resizeLast__.width = element.offsetWidth;
      element.__resizeLast__.height = element.offsetHeight;
      element.__resizeListeners__.forEach(function (fn) {
        fn.call(element, e);
      });
    }
  });
}

/* Detect CSS Animations support to detect element display/re-attach */
var animation = false;
var keyframeprefix = '';
var animationstartevent = 'animationstart';
var domPrefixes = 'Webkit Moz O ms'.split(' ');
var startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' ');
var pfx = '';

var elm = document.createElement('fakeelement');
if (elm.style.animationName !== undefined) animation = true;

/* istanbul ignore if */
if (animation === false) {
  for (var i = 0; i < domPrefixes.length; i++) {
    if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
      pfx = domPrefixes[i];
      keyframeprefix = '-' + pfx.toLowerCase() + '-';
      animationstartevent = startEvents[i];
      animation = true;
      break;
    }
  }
}

var animationName = 'resizeanim';
var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + ';';

function createStyles() {
  if (!stylesCreated) {
    // opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
    var css = (animationKeyframes || '') + '.resize-triggers { ' + (animationStyle || '') + 'visibility: hidden; opacity: 0; } ' + '.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }';
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
    stylesCreated = true;
  }
}

function addResizeListener(element, fn) {
  if (!element.__resizeTriggers__) {
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    createStyles();
    element.__resizeLast__ = {};
    element.__resizeListeners__ = [];(element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
    element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div><div class="contract-trigger"></div>';
    element.appendChild(element.__resizeTriggers__);
    resetTriggers(element);
    element.addEventListener('scroll', scrollListener, true);

    /* Listen for a css animation to detect element display/re-attach */
    animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function (e) {
      if (e.animationName === animationName) resetTriggers(element);
    });
    element.__resizeListeners__.push(fn);
  }
}

function removeResizeListener(element, fn) {
  element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
  if (!element.__resizeListeners__.length) {
    element.removeEventListener('scroll', scrollListener);
    element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
  }
}

function getBodyCell(column, row, index, dataBus, h) {
  if (typeof column === 'string') {
    return row[column];
  }
  if (typeof column === 'object') {
    if (typeof column.bodyComponent === 'function') {
      return h(column.bodyComponent, {
        props: {
          column: column,
          row: row,
          index: index,
          dataBus: dataBus
        }
      });
    }
    if (typeof column.prop === 'string') {
      return row[column.prop];
    }
  }
}

var TableBodyCell = {
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

  render: function (h, context) {
    var content = getBodyCell(context.props.column, context.props.row, context.props.index, context.props.dataBus, h);

    return h(
      'td',
      {
        staticClass: 'vt__td',
        'class': { 'vt__td__covered': context.props.covered },
        attrs: { title: typeof content === 'string' ? content : '' }
      },
      [content]
    );
  }
};

var TableBody = {
  name: 'table-body',

  mixins: [mixin],

  props: {
    rows: {
      type: Array,
      required: true
    }
  },

  methods: {
    getRowClass: function (index) {
      return {
        'vt__tr__hover': index === this.layout.hoveredRowIndex
      };
    },
    getRowStyle: function (index) {
      if (!this.fixed) return;
      if (typeof this.layout.bodyRowHeight[index] === 'number') {
        return { height: this.layout.bodyRowHeight[index] + 'px' };
      }
    },
    updateHoveredRowIndex: function (index) {
      this.layout.hoveredRowIndex = index;
    },
    updateWidth: function () {
      var _this = this;

      if (this.fixed) return;
      setTimeout(function (_) {
        _this.layout.bodyWidth = _this.$refs.body.clientWidth;
      }, 0);
    },
    updateScrollbar: function () {
      var _this2 = this;

      if (this.fixed) return;
      setTimeout(function (_) {
        var body = _this2.$refs.body;
        _this2.layout.scrollbarWidth = body.offsetWidth - body.clientWidth;
        _this2.layout.scrollbarHeight = body.offsetHeight - body.clientHeight;
      }, 0);
    },


    /**
     *  @exposed
     *  In rare case, row height change without DOM manipulation.
     *  So we expose this api to manually synchronize row height.
     */
    updateRowHeight: function (force) {
      var _this3 = this;

      if (this.fixed) return;
      // make sure DOM is updated
      this.$nextTick(function (_) {
        var rowHeight = _this3.$refs.rows.map(function (row) {
          return row.offsetHeight;
        });
        if (!looseEqual(rowHeight, _this3.layout.bodyRowHeight) || force) {
          _this3.layout.bodyRowHeight = rowHeight;
        }
      });
    }
  },

  created: function () {
    if (this.fixed) return;
    this.layout.$on('updatescrollbar', this.updateScrollbar);
    this.layout.$on('updatebodywidth', this.updateWidth);
  },
  mounted: function () {
    var _this4 = this;

    // synchronize scroll position with table head and fixed columns
    this.$nextTick(function (_) {
      var body = _this4.$refs.body;
      _this4.layout.vss[_this4.fixed ? 'to' : 'from'](body);
      if (_this4.fixed) return;
      _this4.layout.hss.from(body);
      addResizeListener(body, _this4.updateWidth);
    });
  },
  updated: function () {
    /**
     *  Patch applied means row height might change,
     *  so we must check row height here
     */
    this.updateScrollbar();
    this.updateRowHeight();
  },
  beforeDestroy: function () {
    var body = this.$refs.body;
    this.layout.vss.off(body);
    if (this.fixed) return;
    this.layout.hss.off(body);
    this.layout.$off('updatescrollbar', this.updateScrollbar);
    this.layout.$off('updatebodywidth', this.updateWidth);
    removeResizeListener(body, this.updateWidth);
  },
  render: function (h) {
    var _this5 = this;

    return h(
      'div',
      {
        staticClass: 'vt-table-body',
        style: { 'overflow-y': this.fixed ? 'hidden' : 'auto' },
        ref: 'body' },
      [h(
        'table',
        {
          staticClass: 'vt__table',
          style: this.tableStyle },
        [h(
          'colgroup',
          null,
          [this.width.map(function (i) {
            return h(
              'col',
              { style: { width: i + 'px' } },
              []
            );
          })]
        ), this.rows.map(function (row, rIndex) {
          return h(
            'tr',
            {
              staticClass: 'vt__tr',
              'class': _this5.getRowClass(rIndex),
              style: _this5.getRowStyle(rIndex),
              on: {
                'mouseenter': function (_) {
                  _this5.updateHoveredRowIndex(rIndex);
                }
              },

              key: rIndex, ref: 'rows', refInFor: true },
            [_this5.columns.map(function (column, cIndex) {
              return h(
                TableBodyCell,
                {
                  attrs: {
                    column: column,
                    row: row,
                    index: rIndex,
                    dataBus: _this5.dataBus
                  },
                  key: cIndex
                },
                []
              );
            })]
          );
        })]
      )]
    );
  }
};

function ScrollSyncer(vertical, horizontal, usePassive) {
  this._from = null;
  this._to = [];
  this._bindOptions = usePassive ? { passive: true } : undefined;

  this._sync = function (e) {
    var target = e.target;
    this._to.forEach(function (el) {
      if (vertical) el.scrollTop = target.scrollTop;
      if (horizontal) el.scrollLeft = target.scrollLeft;
    }, this);
  }.bind(this);
}

ScrollSyncer.prototype.from = function (target) {
  if (!target || !target.addEventListener) return;
  this._from = target;
  this._from.addEventListener('scroll', this._sync, this._bindOptions);
};

ScrollSyncer.prototype.to = function (target) {
  if (!target) return;
  this._to.push(target);
};

ScrollSyncer.prototype.sync = function () {
  if (this._from) {
    this._sync({ target: this._from });
  }
};

ScrollSyncer.prototype.off = function (target) {
  if (target === undefined || target === this._from) {
    // remove event listener and release element reference
    if (this._from.removeEventListener) {
      this._from.removeEventListener('scroll', this._scrollHandler);
    }
    this._from = null;
  }

  if (target === undefined) {
    this._to = [];
  } else {
    var index = this._to.indexOf(target);
    if (index >= 0) {
      this._to.splice(index, 1);
    }
  }
};

var index_common = ScrollSyncer;

var TableLayout = {
  data: function () {
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
    };
  },


  computed: {
    leftColumnNumber: function () {
      return getFixedNumber(this.fixed);
    },
    rightColumnNumber: function () {
      return getFixedNumber(this.fixed, true);
    },
    leftColumnWidth: function () {
      return this.columnWidth.slice(0, this.leftColumnNumber);
    },
    rightColumnWidth: function () {
      return this.columnWidth.slice(-this.rightColumnNumber);
    },
    totalWidth: function () {
      return this.columnWidth.reduce(function (prev, curr) {
        return prev + curr;
      }, 0);
    },
    leftTotalWidth: function () {
      return Math.ceil(this.leftColumnWidth.reduce(function (prev, curr) {
        return prev + curr;
      }, 0));
    },
    rightTotalWidth: function () {
      return Math.ceil(this.rightColumnWidth.reduce(function (prev, curr) {
        return prev + curr;
      }, 0));
    },
    mainHeadStyle: function () {
      return {
        'margin-right': this.scrollbarWidth + 'px'
      };
    },
    bodyHeight: function () {
      if (this.height === undefined || this.headHeight === undefined) return;
      return this.height - this.headHeight;
    },
    bodyStyle: function () {
      if (this.bodyHeight === undefined) return;
      var result = {};
      result[this.useMax ? 'max-height' : 'height'] = this.bodyHeight + 'px';
      return result;
    },
    rightWrapperStyle: function () {
      return {
        'right': this.scrollbarWidth + 'px'
      };
    },
    fixedBodyStyle: function () {
      return {
        'max-height': this.bodyHeight - this.scrollbarHeight + 'px'
      };
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
    updateScrollbar: function () {
      this.$emit('updatescrollbar');
    },
    updateBodyWidth: function () {
      this.$emit('updatebodywidth');
    }
  },

  beforeCreate: function () {
    this.vss = new index_common(true, false);
    this.hss = new index_common(false, true);
  }
};

var Table$1 = {
  name: 'table',

  props: {
    columns: {
      type: Array,
      default: function () {
        return [];
      }
    },

    rows: {
      type: Array,
      default: function () {
        return [];
      }
    },

    fixed: {
      type: [Number, Array],
      default: 0
    },

    height: Number,

    useMax: Boolean,

    dataBus: null
  },

  data: function () {
    return {
      layoutComplete: false
    };
  },


  computed: {
    leftColumns: function () {
      return this.columns.slice(0, this.layout.leftColumnNumber);
    },
    rightColumns: function () {
      return this.columns.slice(-this.layout.rightColumnNumber);
    }
  },

  watch: {
    'fixed': {
      immediate: true,
      deep: true,
      handler: function (value) {
        this.layout.fixed = value;
      }
    },

    'height': {
      immediate: true,
      handler: function (value) {
        this.layout.height = value;
      }
    },

    'useMax': {
      immediate: true,
      handler: function (value) {
        this.layout.useMax = value;
      }
    },

    'columns': {
      deep: true,
      handler: function () {
        var _this = this;

        this.$nextTick(function (_) {
          _this.layoutColumns(true);
        });
      }
    },

    'rows': {
      deep: true,
      handler: 'syncHeight'
    },

    'layout.bodyWidth': function () {
      // no need to adjust column width
      if (this.layoutComplete && this.layout.scrollbarHeight !== 0) return;
      this.layoutColumns();
    }
  },

  methods: {
    resetHoveredRowIndex: function () {
      this.layout.hoveredRowIndex = null;
    },
    layoutColumns: function (reset) {
      if (this.columns.length !== this.layout.columnWidth.length || reset) {
        // get new column size
        getColumnWidth(this.columns, this.layout, this.$refs.head.$el);
      }
      // fit column width
      fitColumnWidth(this.columns, this.layout);
      if (!this.layoutComplete) this.layoutComplete = true;
    },


    // column resize
    columnResize: function (column, offset, cb) {
      var index = this.columns.indexOf(column);
      var newWidth = this.layout.columnWidth[index] + offset;
      if (offset < 0) {
        // keep column min width set in column options
        if (typeof column.width === 'number' && newWidth < column.width) {
          return;
        }
        // keep table fill the container
        if (this.layout.totalWidth + offset < this.layout.bodyWidth) {
          return;
        }
        // keep min column width
        if (newWidth < MIN_COLUMN_WIDTH) {
          return;
        }
      }
      this.layout.columnWidth.splice(index, 1, newWidth);
      if (cb) cb();
    },


    // @exposed
    syncHeight: function () {
      if (this.$refs.head) {
        this.$refs.head.updateHeight();
      }
      if (this.$refs.body) {
        this.$refs.body.updateRowHeight(true);
      }
    }
  },

  beforeCreate: function () {
    this.layout = new Vue(TableLayout);
  },
  render: function (h) {
    var left, right;

    var main = h(
      'div',
      {
        staticClass: 'vt__main-wrapper' },
      [h(
        TableHead,
        {
          style: this.layout.mainHeadStyle,
          attrs: { columns: this.columns,
            dataBus: this.dataBus,
            layout: this.layout
          },
          ref: 'head',
          on: {
            'columnResize': this.columnResize
          }
        },
        []
      ), h(
        TableBody,
        {
          style: this.layout.bodyStyle,
          attrs: { columns: this.columns,
            rows: this.rows,
            dataBus: this.dataBus,
            layout: this.layout
          },
          ref: 'body'
        },
        []
      )]
    );

    if (this.layout.leftColumnNumber) {
      left = h(
        'div',
        {
          staticClass: 'vt__left-wrapper' },
        [h(
          TableHead,
          {
            attrs: {
              fixed: 'left',
              columns: this.leftColumns,
              dataBus: this.dataBus,
              layout: this.layout
            },
            on: {
              'columnResize': this.columnResize
            }
          },
          []
        ), h(
          TableBody,
          {
            style: this.layout.fixedBodyStyle,
            attrs: { fixed: 'left',
              columns: this.leftColumns,
              rows: this.rows,
              dataBus: this.dataBus,
              layout: this.layout
            }
          },
          []
        )]
      );
    }

    if (this.layout.rightColumnNumber) {
      right = h(
        'div',
        {
          staticClass: 'vt__right-wrapper',
          style: this.layout.rightWrapperStyle },
        [h(
          TableHead,
          {
            attrs: {
              fixed: 'right',
              columns: this.rightColumns,
              dataBus: this.dataBus,
              layout: this.layout
            },
            on: {
              'columnResize': this.columnResize
            }
          },
          []
        ), h(
          TableBody,
          {
            style: this.layout.fixedBodyStyle,
            attrs: { fixed: 'right',
              columns: this.rightColumns,
              rows: this.rows,
              dataBus: this.dataBus,
              layout: this.layout
            }
          },
          []
        )]
      );
    }

    return h(
      'div',
      {
        staticClass: 'vt__wrapper',
        style: { visibility: this.layoutComplete ? 'visible' : 'hidden' },
        on: {
          'mouseleave': this.resetHoveredRowIndex
        },

        ref: 'wrapper' },
      [main, left, right]
    );
  }
};

export default Table$1;
