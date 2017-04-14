# Vue Table
A minimal and highly extendable table component for Vue.js

## Quick Start
### Install & Import
Install via NPM
```bash
npm i vue-table -S
```
Besides import the js module, you have to import the core style file at same time
```js
import VTable from 'vue-table'
import 'vue-table/index.css'
```
And a optional simple theme file
```js
import 'vue-table/default-theme.css'
```
Do not forget to register to *Vue*
```js
/* global */
Vue.component('v-table', VTable)

/* or scoped */
components: {
  VTable
}
```

### First Table
Columns and rows are essential for a table. Assume your assets looks like this:
```js
/* in Vue component options */
data: {
  columns: ['Name', 'Gender', 'Age'],

  rows: [{
    Name: 'Gilli Haydn',
    Gender: 'Male',
    Age: 46
  }, ...]
}
```
In template
```html
<div>
  <v-table :columns="columns" rows="rows">
  </v-table>
</div>
```
Now you get your first table.

<div id="demo1">
  <v-table :columns="columns" :rows="rows">
  </v-table>
</div>
<script>
new Vue({
  el: '#demo1',

  data: {
    columns: ['Name', 'Gender', 'Age'],
    rows: rows
  }
})
</script>


## Table Height
Use `height` prop to set table height, `:height="200"` will result to a 200px height table. Additionally, add `use-max` prop to use max-height instead of height.

## Column Options
You can set custom title which different from data key by using object in columns
```js
{
  title: 'Full Name',
  prop: 'Name'
}
```
Additionally, you can specify column width using `width` property
```js
{
  title: 'Full Name',
  prop: 'Name',
  width: 200 /* in px */
}
```

<div id="demo2">
  <v-table :columns="columns" :rows="rows">
  </v-table>
</div>
<script>
new Vue({
  el: '#demo2',

  data: {
    columns: [{
      title: 'Full Name',
      prop: 'Name',
      width: 200
    }, 'Gender', 'Age'],
    rows: rows
  }
})
</script>

<p class="tip">
  Column width property works much more like `min-width` in CSS, that is, if there is extra space, column width will grow to fill the space.
</p>

Full column options are listed below:

| Property | Type | Description |
| ------ | ------ | ------ |
| title | string | Title display in head cell |
| prop | string | Data propery in row object |
| width | number | Width of column |
| disableResize | boolean | Disable column resize |
| headComponent | function | Custom component for head cell render (will explain later) |
| bodyComponent | function | Custom component for body cell render (will explain later) |

## Fixed Columns
To make table with a huge number of columns more readable, *Vue Table* supports fixed columns on both left and right side. To enable fixed columns, use `fixed` prop.
```html
<!-- 1 fixed column on the left -->
<v-table :fixed="1"></v-table>

<!-- 1 fixed column on the left and 1 on the right -->
<v-table :fixed="[1, 1]"></v-table>

<!-- 1 fixed column on the right -->
<v-table :fixed="[0, 1]"></v-table>
```

<div id="demo3">
  <div>
    <button @click="fixed = 1">fixed = 1</button>
    <button @click="fixed = [1, 1]">fixed = [1, 1]</button>
    <button @click="fixed = [0, 1]">fixed = [0, 1]</button>
  </div>
  <v-table :columns="columns" :rows="rows" :fixed="fixed">
  </v-table>
</div>
<script>
new Vue({
  el: '#demo3',

  data: {
    fixed: 1,
    columns: columns.map(function (column) {
      return {
        title: column,
        prop: column,
        width: 200
      }
    }),
    rows: rows
  }
})
</script>

## Extend *Vue Table*
Want more features? Just do it yourself by extend *Vue Table*. Almost every cell in the table is extendable.

### Custom Component
*Vue Table* extension is based on custom component. Use `Vue.extend` to obtain a custom component constructor.
```js
const Ctor = Vue.extend({
  /* options here */
})
```

### Extend Table Head
*Vue* component constructor passed to `headComponent` property in column options will be used to render head cell, the following props will be passed to the component:

| Prop | Type | Description |
| ------ | ------ | ------ |
| column | object | Column options object |
| dataBus | any | Data bus used to transfer data among components |

### Extend Table Body
*Vue* component constructor passed to `bodyComponent` property in column options will be used to render body cell, the following props will be passed to the component:

| Prop | Type | Description |
| ------ | ------ | ------ |
| column | object | Column options object |
| row | object | Row data object |
| index | number | Row index |
| dataBus | any | Data bus used to transfer data among components |

### Extend Demo - Editable Table
<div id="demo4">
  <v-table :columns="columns" :rows="rows" :fixed="fixed">
  </v-table>
</div>
<script>
var BodyCell = Vue.extend({
  template: '<div><input v-show="row.editing" type="text" v-model="row[column.prop]"><span v-show="!row.editing">{{ row[column.prop] }}</span><div>',

  props: ['column', 'row', 'index', 'dataBus']
})

var BodyCellOperation = Vue.extend({
  template: '<button @click="click">{{ row.editing ? \'Done\' : \'Edit\' }}</button>',

  props: ['column', 'row', 'index', 'dataBus'],

  methods: {
    click: function () {
      this.$set(this.row, 'editing', !this.row.editing)
    }
  }
})

new Vue({
  el: '#demo4',

  data: {
    fixed: [1, 1],
    columns: columns.map(function (column) {
      return {
        title: column,
        prop: column,
        width: 160,
        bodyComponent: BodyCell
      }
    }).concat([{
      title: 'Edit',
      width: 80,
      bodyComponent: BodyCellOperation
    }]),
    rows: JSON.parse(JSON.stringify(rows))
  }
})
</script>


## More
Find a bug? please report via [Github issue](https://github.com/coolzjy/vue-table/issues)
