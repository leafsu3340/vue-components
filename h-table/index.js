/**
 * 表格组件（待完善）
 */
define(['vue',
'text!./index.html',
'css!./css/index.css'
], function(Vue, template) {
  return Vue.extend({
    name: 'h-talbe',
    template: template,
    props: {
      rows: Array,
      columns: Array,
      title: String,
      unit: String,
      width: [Number, String],
      height: [Number, String]
    },
    data() {
      return {};
    },
    methods: {
      getCls(align, className) {
        if (align === "left") {
          return "is-left " + (className || "");
        }
        if (align === "right") {
          return "is-right " + (className || "");
        }
        if (align === "center") {
          return "is-center " + (className || "");
        }
      },
      getStyle(width) {
        if (width) {
          return { width: width };
        }
        return {};
      }
    }
  })
});