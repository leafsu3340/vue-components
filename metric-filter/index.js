/**
 * 计量单位组件
 * 事件：metricChange
 */
define(['vue',
  'text!./index.html',
  'utils/page-params',
  'js/gwzjjk-const',
  'css!./css/metric-filter.css'
], function (Vue, template, pageParams, ZJJK_CONST) {
  return Vue.extend({
    template: template,
    components: {},
    props: {
      initMetric: {
        // 初始计量单位
        type: Number,
        default: 1
      },
      metricOnly: {
        // 计量单位仅作显示
        type: String,
        default: ''
      },
      metricData: {
        // 计量单位 集合
        type: Array,
        default: function () {
          return ZJJK_CONST.metricData;
        }
      }
    },
    data: function () {
      return {
        metric: 1,
      };
    },
    watch: {
      metric: function (nVal) {
        this.$emit('metricChange', nVal);
        pageParams.setPageParams({
          metric: nVal
        });
      }
    },
    mounted: function () {
      this.metric = this.initMetric;
      pageParams.setPageParams({
        metric: this.metric
      });
    },
    computed: {
      metricNames: function () {
        var result = {};
        $.each(this.metricData, function (index, item) {
          result[item.value] = item.title;
        })
        return result;
      }
    }
  });
});