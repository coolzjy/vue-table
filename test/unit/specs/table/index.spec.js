/* global describe, before, after, it, assert */

import { getVm, triggerMouseEvent } from '../../utils'
import { columns, rows } from '../../data'
import Table from '@/table'
import '@/index.css'

describe('Component Table', function () {
  var div = document.createElement('div')
  div.style.width = '400px'
  document.body.appendChild(div)
  var vm

  before(function (done) {
    vm = getVm(Table, {
      columns,
      rows,
      fixed: [1, 1],
      height: 200,
      useMax: true
    })
    vm.$mount()
    div.appendChild(vm.$el)

    // make sure dom is ready and RAF callback has been called
    setTimeout(done, 100)
  })

  after(function (done) {
    // delay destroy because vm is accessed in next tick handler
    setTimeout(function () {
      vm.$destroy()
      done()
    }, 100)
  })

  describe('Options', function () {
    it('name', function () {
      assert.strictEqual(Table.name, 'table')
    })

    it('props', function () {
      assert.property(Table.props, 'columns')
      assert.deepEqual(Table.props.columns.default(), [])
      assert.property(Table.props, 'rows')
      assert.deepEqual(Table.props.rows.default(), [])
      assert.property(Table.props, 'fixed')
      assert.strictEqual(Table.props.fixed.default, 0)
      assert.property(Table.props, 'dataBus')
    })

    it('hooks', function () {
      assert.typeOf(Table.beforeCreate, 'function')
    })
  })

  describe('Instance', function () {
    describe('Property', function () {
      it('leftColumns', function () {
        assert.deepEqual(vm.leftColumns, [columns[0]])
      })

      it('rightColumns', function () {
        assert.deepEqual(vm.rightColumns, [columns[3]])
      })
    })

    describe('Function', function () {
      describe('Hovered row', function () {
        it('select when mouse enter row', function () {
          var row = vm.$el.querySelector('.vt-table-body .vt__tr')
          triggerMouseEvent(row, 'mouseenter')
          assert.strictEqual(vm.layout.hoveredRowIndex, 0)
        })

        it('reset index when mouse leave table', function () {
          var wrapper = vm.$el
          triggerMouseEvent(wrapper, 'mouseleave')
          assert.strictEqual(vm.layout.hoveredRowIndex, null)
        })
      })

      describe('Width change', function () {
        var handles

        function adjustWidth (handle, offset) {
          triggerMouseEvent(handle, 'mousedown', { clientX: 0 })
          triggerMouseEvent(document, 'mousemove', { clientX: offset })
          triggerMouseEvent(document, 'mouseup', { clientX: offset })
        }

        before(function () {
          handles = vm.$el.querySelectorAll('.vt-resize-handle')
        })

        it('width grow', function () {
          var width = vm.layout.columnWidth[0]
          adjustWidth(handles[0], 500)
          assert.strictEqual(vm.layout.columnWidth[0], width + 500)
        })

        it('width shrink: less than min width not allowed', function () {
          var width = vm.layout.columnWidth[1]
          adjustWidth(handles[1], -400)
          assert.strictEqual(vm.layout.columnWidth[1], width)
        })

        it('width shrink: less than container width not allowed', function () {
          var width = vm.layout.columnWidth[0]
          adjustWidth(handles[0], -600)
          assert.strictEqual(vm.layout.columnWidth[0], width)
        })

        it('width shrink: less than default min width not allowed', function () {
          var width = vm.layout.columnWidth[3]
          adjustWidth(handles[3], -400)
          assert.strictEqual(vm.layout.columnWidth[3], width)
        })
      })

      describe('Sync height', function () {
        it('syncHeight callable', function () {
          vm.syncHeight()
        })
      })
    })
  })
})
