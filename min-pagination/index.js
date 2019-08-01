/**
 * 事件：change-页数变化 
 */
define(['vue',
  'text!components/pagination/index.html',
  'css!components/pagination/css/pagination.css'
], function (Vue, template) {
  return Vue.extend({
    name: 'MinPagination',
    template: template,
    components: {},
    props: {
      index: {
        // 页码
        type: Number,
        require: true,
      },
      count: {
        // 总页数
        type: Number,
        require: true,
      },
    },
    data: function data() {
      return {
        enterPage: 1,
      };
    },
    methods: {
      gotoPage: function gotoPage() {
        const num = parseInt(this.enterPage, 10);
        this.page(num);
      },
      page: function page(index) {
        if ((index !== this.index) && (index > 0) && (index <= this.count)) {
          this.$emit('change', index);
          this.enterPage = index;
        }
      },
    },
  });
});
