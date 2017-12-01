import Vue from 'vue';

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

function getColumnWidth(columns) {
  function getWidthByStrLength(length) {
    return length * 20;
  }

  return columns.map(function (column) {
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

function growToFit(columnWidth, bodyWidth) {
  var totalWidth = columnWidth.reduce(function (prev, curr) {
    return prev + curr;
  }, 0);
  if (totalWidth >= bodyWidth) return columnWidth;

  var diff = bodyWidth - totalWidth;
  return columnWidth.map(function (w) {
    return w + diff * w / totalWidth;
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
    resizeStart: function (e) {
      this.start = e.clientX;
      document.body.classList.add('vt__dragging');
      document.addEventListener('mouseup', this.resizeEnd);
    },
    resizeEnd: function (e) {
      document.body.classList.remove('vt__dragging');
      this.$emit('resize', this.column, e.clientX - this.start);
      document.removeEventListener('mouseup', this.resizeEnd);
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
            'mousedown': this.resizeStart
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

/* eslint-disable */
/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */

// Only used for the dirty checking, so the event callback count is limited to max 1 call per fps per sensor.
// In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
// would generate too many unnecessary events.
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
    return window.setTimeout(fn, 20);
};

/**
 * Iterate over each of the provided element(s).
 *
 * @param {HTMLElement|HTMLElement[]} elements
 * @param {Function}                  callback
 */
function forEachElement(elements, callback) {
    var elementsType = Object.prototype.toString.call(elements);
    var isCollectionTyped = '[object Array]' === elementsType || '[object NodeList]' === elementsType || '[object HTMLCollection]' === elementsType || '[object Object]' === elementsType || 'undefined' !== typeof jQuery && elements instanceof jQuery //jquery
    || 'undefined' !== typeof Elements && elements instanceof Elements;
    var i = 0,
        j = elements.length;
    if (isCollectionTyped) {
        for (; i < j; i++) {
            callback(elements[i]);
        }
    } else {
        callback(elements);
    }
}

/**
 * Class for dimension change detection.
 *
 * @param {Element|Element[]|Elements|jQuery} element
 * @param {Function} callback
 *
 * @constructor
 */
var ResizeSensor = function (element, callback) {
    /**
     *
     * @constructor
     */
    function EventQueue() {
        var q = [];
        this.add = function (ev) {
            q.push(ev);
        };

        var i, j;
        this.call = function () {
            for (i = 0, j = q.length; i < j; i++) {
                q[i].call();
            }
        };

        this.remove = function (ev) {
            var newQueue = [];
            for (i = 0, j = q.length; i < j; i++) {
                if (q[i] !== ev) newQueue.push(q[i]);
            }
            q = newQueue;
        };

        this.length = function () {
            return q.length;
        };
    }

    /**
     *
     * @param {HTMLElement} element
     * @param {Function}    resized
     */
    function attachResizeEvent(element, resized) {
        if (!element) return;
        if (element.resizedAttached) {
            element.resizedAttached.add(resized);
            return;
        }

        element.resizedAttached = new EventQueue();
        element.resizedAttached.add(resized);

        element.resizeSensor = document.createElement('div');
        element.resizeSensor.className = 'resize-sensor';
        var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
        var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;';

        element.resizeSensor.style.cssText = style;
        element.resizeSensor.innerHTML = '<div class="resize-sensor-expand" style="' + style + '">' + '<div style="' + styleChild + '"></div>' + '</div>' + '<div class="resize-sensor-shrink" style="' + style + '">' + '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' + '</div>';
        element.appendChild(element.resizeSensor);

        if (element.resizeSensor.offsetParent !== element) {
            element.style.position = 'relative';
        }

        var expand = element.resizeSensor.childNodes[0];
        var expandChild = expand.childNodes[0];
        var shrink = element.resizeSensor.childNodes[1];
        var dirty, rafId, newWidth, newHeight;
        var lastWidth = element.offsetWidth;
        var lastHeight = element.offsetHeight;

        var reset = function () {
            expandChild.style.width = '100000px';
            expandChild.style.height = '100000px';

            expand.scrollLeft = 100000;
            expand.scrollTop = 100000;

            shrink.scrollLeft = 100000;
            shrink.scrollTop = 100000;
        };

        reset();

        var onResized = function () {
            rafId = 0;

            if (!dirty) return;

            lastWidth = newWidth;
            lastHeight = newHeight;

            if (element.resizedAttached) {
                element.resizedAttached.call();
            }
        };

        var onScroll = function () {
            newWidth = element.offsetWidth;
            newHeight = element.offsetHeight;
            dirty = newWidth != lastWidth || newHeight != lastHeight;

            if (dirty && !rafId) {
                rafId = requestAnimationFrame(onResized);
            }

            reset();
        };

        var addEvent = function (el, name, cb) {
            if (el.attachEvent) {
                el.attachEvent('on' + name, cb);
            } else {
                el.addEventListener(name, cb);
            }
        };

        addEvent(expand, 'scroll', onScroll);
        addEvent(shrink, 'scroll', onScroll);
    }

    forEachElement(element, function (elem) {
        attachResizeEvent(elem, callback);
    });

    this.detach = function (ev) {
        ResizeSensor.detach(element, ev);
    };
};

ResizeSensor.detach = function (element, ev) {
    forEachElement(element, function (elem) {
        if (!elem) return;
        if (elem.resizedAttached && typeof ev == "function") {
            elem.resizedAttached.remove(ev);
            if (elem.resizedAttached.length()) return;
        }
        if (elem.resizeSensor) {
            if (elem.contains(elem.resizeSensor)) {
                elem.removeChild(elem.resizeSensor);
            }
            delete elem.resizeSensor;
            delete elem.resizedAttached;
        }
    });
};

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

  render: function (h, c) {
    var content = getBodyCell(c.props.column, c.props.row, c.props.index, c.props.dataBus, h);

    var click = c.data.on && c.data.on['cell-click'];

    return h(
      'td',
      {
        staticClass: 'vt__td',
        attrs: { title: typeof content === 'string' ? content : ''
        },
        on: {
          'click': function (e) {
            return click && click(c.props.row, c.props.columns, e);
          }
        }
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
    },

    selected: Object
  },

  methods: {
    getRowClass: function (row, index) {
      return {
        'vt__tr__hover': index === this.layout.hoveredRowIndex,
        'vt__tr__selected': row === this.selected
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
      this.layout.bodyWidth = this.$refs.body.clientWidth;
    },
    updateScrollX: function () {
      var body = this.$refs.body;
      this.layout.scrollX = body.offsetHeight - body.clientHeight;
    },
    updateScrollY: function () {
      var body = this.$refs.body;
      this.layout.scrollY = body.offsetWidth - body.clientWidth;
    },


    /**
     *  @exposed
     *  In rare case, row height change without DOM manipulation.
     *  So we expose this api to manually synchronize row height.
     */
    updateRowHeight: function (force) {
      if (!this.$refs.rows) return;
      var rowHeight = this.$refs.rows.map(function (row) {
        return row.offsetHeight;
      });
      if (!looseEqual(rowHeight, this.layout.bodyRowHeight) || force) {
        this.layout.bodyRowHeight = rowHeight;
      }
    }
  },

  created: function () {
    if (this.fixed) return;
    this.layout.$on('updatescrollx', this.updateScrollX);
    this.layout.$on('updatescrolly', this.updateScrollY);
    this.layout.$on('updatebodywidth', this.updateWidth);
    this.layout.$on('updaterowheight', this.updateRowHeight);
  },
  mounted: function () {
    var _this = this;

    // synchronize scroll position with table head and fixed columns
    this.$nextTick(function (_) {
      var body = _this.$refs.body;
      _this.layout.vss[_this.fixed ? 'to' : 'from'](body);
      if (_this.fixed) return;
      _this.updateWidth();
      _this.layout.hss.from(body);
      _this.resizeSensor = new ResizeSensor(body, _this.updateWidth);
    });
  },
  beforeDestroy: function () {
    var body = this.$refs.body;
    this.layout.vss.off(body);
    if (this.fixed) return;
    this.layout.hss.off(body);
    this.layout.$off('updatescrollx', this.updateScrollX);
    this.layout.$off('updatescrolly', this.updateScrollY);
    this.layout.$off('updatebodywidth', this.updateWidth);
    this.resizeSensor.detach();
  },
  render: function (h) {
    var _this2 = this;

    return h(
      'div',
      {
        ref: 'body',
        staticClass: 'vt-table-body',
        style: { 'overflow': this.fixed ? 'hidden' : 'auto' } },
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
              'class': _this2.getRowClass(row, rIndex),
              style: _this2.getRowStyle(rIndex),
              on: {
                'click': function (_) {
                  _this2.$emit('select', row);
                },
                'mouseenter': function (_) {
                  _this2.updateHoveredRowIndex(rIndex);
                }
              },

              key: rIndex, ref: 'rows', refInFor: true },
            [_this2.columns.map(function (column, cIndex) {
              return h(
                TableBodyCell,
                {
                  attrs: {
                    column: column,
                    row: row,
                    index: rIndex,
                    dataBus: _this2.dataBus
                  },
                  key: cIndex,
                  on: {
                    'cell-click': function (a, b, c) {
                      return _this2.$emit('cell-click', a, b, c);
                    }
                  }
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

function ScrollSyncer(vertical, horizontal) {
  this._from = null;
  this._to = [];

  this._sync = function (e) {
    var target = e.target;
    for (var i = 0; i < this._to.length; i++) {
      if (vertical) this._to[i].scrollTop = target.scrollTop;
      if (horizontal) this._to[i].scrollLeft = target.scrollLeft;
    }
  }.bind(this);
}

ScrollSyncer.prototype.from = function (target) {
  if (!target || !target.addEventListener) return;
  this._from = target;
  this._from.addEventListener('scroll', this._sync);
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

      scrollX: 0,
      scrollY: 0,

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
        'margin-right': this.scrollY + 'px'
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
        'right': this.scrollY + 'px'
      };
    },
    fixedBodyStyle: function () {
      return {
        'max-height': this.bodyHeight - this.scrollX + 'px'
      };
    }
  },

  watch: {
    'columnWidth': function () {
      this.$nextTick(this.updateRowHeight);
    },
    'totalWidth': function () {
      this.$nextTick(this.updateScrollX);
    },

    'bodyWidth': {
      sync: true,
      handler: function (val, oldVal) {
        if (val > oldVal || oldVal == null) {
          this.updateColumnWidth();
        }
        this.updateScrollX();
      }
    },

    'scrollX': {
      sync: true,
      handler: 'updateScrollY'
    },
    'scrollY': {
      sync: true,
      handler: function (val) {
        if (val) {
          this.updateScrollX();
        } else {
          this.updateColumnWidth();
        }
      }
    },

    'bodyHeight': function () {
      this.$nextTick(this.updateScrollY);
    }

    //
    // // resize listener will not trigger when scrollbar appear/disappear
    // 'scrollbarWidth': {
    //   sync: true,
    //   handler: 'updateBodyWidth'
    // }

  },

  methods: {
    updateScrollX: function () {
      this.$emit('updatescrollx');
    },
    updateScrollY: function () {
      this.$emit('updatescrolly');

      // when vertical scrollbar appears,
      // horizental scrollbar will not appear synchronously,
      if (this.scrollY !== 0 && this.scrollX === 0) {
        this.updateScrollX();
      }
    },
    updateColumnWidth: function () {
      this.$emit('updatecolumnwidth');
    },
    updateBodyWidth: function () {
      this.$emit('updatebodywidth');
    },
    updateRowHeight: function () {
      this.$emit('updaterowheight');
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

    selected: Object,

    dataBus: null
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
      immediate: true,
      deep: true,
      sync: true,
      handler: function () {
        this.layoutColumns(true);
      }
    },

    'rows': {
      immediate: true,
      deep: true,
      handler: function (value) {
        var _this = this;

        this.select(value && value.length ? value[0] : null);
        setTimeout(function (_) {
          _this.layout.updateScrollY();
          _this.layout.updateRowHeight();
        }, 0);
      }
    }
  },

  methods: {
    select: function (row) {
      this.$emit('update:selected', row);
    },
    resetHoveredRowIndex: function () {
      this.layout.hoveredRowIndex = null;
    },
    layoutColumns: function (reset) {
      var layout = this.layout;
      var columns = this.columns;
      var columnWidth = layout.columnWidth;
      var bodyWidth = layout.bodyWidth;
      if (!bodyWidth) return;
      if (columns.length !== columnWidth.length || reset) {
        columnWidth = getColumnWidth(columns);
      }
      layout.columnWidth = growToFit(columnWidth, bodyWidth);
    },


    // column resize
    columnResize: function (column, offset) {
      var index = this.columns.indexOf(column);
      var columnWidth = this.layout.columnWidth.slice();
      var newWidth = columnWidth[index] + offset;
      var layout = this.layout;
      if (offset < 0) {
        // keep column min width set in column options
        if (typeof column.width === 'number' && newWidth < column.width) {
          return;
        }
        // keep table fill the container
        if (layout.totalWidth + offset < layout.bodyWidth) {
          return;
        }
        // keep min column width
        if (newWidth < MIN_COLUMN_WIDTH) {
          return;
        }
      }
      columnWidth.splice(index, 1, newWidth);
      layout.columnWidth = columnWidth;
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
  created: function () {
    var _this2 = this;

    this.layout.$on('updatecolumnwidth', function (_) {
      return _this2.layoutColumns();
    });
  },
  beforeDestroy: function () {
    this.layout.$off('updatecolumnwidth');
  },
  render: function (h) {
    var _this3 = this;

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
            layout: this.layout,
            selected: this.selected
          },
          on: {
            'select': this.select,
            'cell-click': function (a, b, c) {
              return _this3.$emit('cell-click', a, b, c);
            }
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
              layout: this.layout,
              selected: this.selected
            },
            on: {
              'select': this.select,
              'cell-click': function (a, b, c) {
                return _this3.$emit('cell-click', a, b, c);
              }
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
              layout: this.layout,
              selected: this.selected
            },
            on: {
              'select': this.select,
              'cell-click': function (a, b, c) {
                return _this3.$emit('cell-click', a, b, c);
              }
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
        on: {
          'mouseleave': this.resetHoveredRowIndex
        },

        ref: 'wrapper' },
      [main, left, right]
    );
  }
};

export default Table$1;
