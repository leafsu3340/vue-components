/**
 * 事件：change - 页数变化 
 */
define(['vue',
  'text!components/pagination/index.html',
  'css!components/pagination/css/pagination.css'
], function (Vue, template) {
  return Vue.extend({
    name: 'Pagination',
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
      rows: {
        // 总条数
        type: Number,
        require: true,
        default: 0
      },
      // pagesize值
      initPageValue: {
        type: Number,
        default: 20
      }
    },
    mounted: function mounted() {
      this.pageValue = this.initPageValue;
    },
    data: function data() {
      return {
        enterPage: 1,
        pageValue: 20, // pageSize - -1:全部
        pageSizeOption: [{
          value: 20,
          name: '20条/页',
        }, {
          value: 50,
          name: '50条/页',
        }, {
          value: 100,
          name: '100条/页',
        }, {
          value: 200,
          name: '200条/页',
        }, {
          value: -1,
          name: '全部',
        }, ]
      };
    },
    watch: {
      initPageValue: function initPageValue(nVal) {
        this.pageValue = nVal;
      },
      pageValue: function pageValue(nVal) {
        this.triggerPageSize(nVal);
      }
    },
    methods: {
      page: function page(index) {
        if ((index !== this.index) && (index > 0) && (index <= this.count)) {
          this.$emit('change', index);
          this.enterPage = index;
        }
      },
      triggerPageSize: function(nVal){
    	  this.$emit('triggerPageSize', nVal);
      }
    },
  });
});