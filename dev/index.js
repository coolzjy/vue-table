import Vue from 'vue'
import Table from '@'
import '@/index.css'
import '@/theme.css'
import rows from './rows.json'

var columns = [{
  title: 'Name',
  prop: 'Name',
  width: 200
}, {
  title: 'Gender',
  prop: 'Gender',
  width: 80
}, {
  title: 'Age',
  prop: 'Age',
  width: 50
}, {
  title: 'Email',
  prop: 'Email',
  width: 200
}, {
  title: 'Country',
  prop: 'Country',
  width: 150
}, {
  title: 'State',
  prop: 'State',
  width: 150
}, {
  title: 'City',
  prop: 'City',
  width: 150
}, {
  title: 'Address',
  prop: 'Address',
  width: 150
}]

var vm = new Vue({
  data: {
    columnNum: 3,
    rowNum: 3
  },

  computed: {
    columns () {
      return columns.slice(0, this.columnNum)
    },

    rows () {
      return rows.slice(0, this.rowNum)
    }
  },

  methods: {
    mColumns (num) {
      var newNum = this.columnNum + num
      if (newNum >= 0 && newNum <= columns.length) {
        this.columnNum = newNum
      }
    },

    mRows (num) {
      var newNum = this.rowNum + num
      if (newNum >= 0 && newNum <= rows.length) {
        this.rowNum = newNum
      }
    }
  },

  mounted () {
    var table = this.$children[0]
    table.layout.$watch('$data', v => {
      console.log('Layout: ', JSON.stringify(v, null, '  '))
    }, { deep: true, immediate: true })
  },

  render (h) {
    return (
      <div>
        <div>
          <button onClick={_ => { this.mColumns(1) }}>+ column</button>
          <button onClick={_ => { this.mColumns(-1) }}>- column</button>
          <button onClick={_ => { this.mRows(1) }}>+ row</button>
          <button onClick={_ => { this.mRows(-1) }}>- row</button>
        </div>
        <Table
          columns={this.columns}
          rows={this.rows}
          fixed={[1, 1]}
          height={200}
          on-cell-click={(a, b, c) => console.log(a, b, c)}
        />
      </div>
    )
  }
})

document.body.appendChild(vm.$mount().$el)
