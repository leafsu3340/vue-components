/**
 * 定制金额筛选器
 * 
 * 可选传值：initUppLim 默认上限 initLowLim默认下限
 * 事件：moneyChange
 * @author wuwei3@ygsoft.com
 */
define(['vue',
  'text!./index.html',
  'utils/com-utils.js',
  'css!./css/moneyfilter.css',
], function (Vue, template, comUtils) {
  return Vue.extend({
    name: 'FiterMoney',
    template: template,
    props: {
      initUppLim: {
        // 初始化值
        type: Number,
        default: 0
      },
      initLowLim: {
        // 初始化值
        type: Number,
        default: 0
      },
      filterId: {
        // 组件id
        type: String,
        default: 'filtermoney'
      },
      metric: {
        // 计量单位
        type: Number,
        default: 1
      }
    },
    data: function () {
      return {
        uppLim: '', //金额上限展示值
        lowLim: '', //金额下限展示值
      }
    },
    mounted: function () {
      //初始化上限
      if (this.initUppLim) {
        var uppId = '#' + this.filterId + '-uppLim';
        $(uppId).val(this.initUppLim);
        this.changeMoneyFilter($(uppId), 'uppLim');
      }
      //初始化下限
      if (this.initLowLim) {
        var lowId = '#' + this.filterId + '-lowLim';
        $(lowId).val(this.initLowLim);
        this.changeMoneyFilter($(lowId), 'lowLim');
      }
    },
    watch: {
      metric: function (nVal, oVal) {
        if (this.uppLim !== '') {
          var uppId = '#' + this.filterId + '-uppLim';
          var newUppVal = this.uppLim / nVal;
          this.changeShowValue($(uppId), newUppVal);
        }
        if (this.lowLim !== '') {
          var lowId = '#' + this.filterId + '-lowLim';
          var newLowVal = this.lowLim / nVal;
          this.changeShowValue($(lowId), newLowVal);
        }
      }
    },
    methods: {
      /**
       * 切换输入框显示值
       * @param {Dom} target - 输入框dom 
       * @param {*} val 显示值
       */
      changeShowValue: function (target, val) {
        $target = $(target);
        //千分位化展示值并展示
        if (val) {
          var nVal = this.formatNum(val);
          $target.val(nVal);
          $target.attr('title', nVal);
        } else {
          $target.val(val);
          $target.attr('title', val);
        }
      },
      /**
       * @func
       * @desc 金额筛选器-金额千分位
       * @param {Object} target - 元素
       * @param {String} type - 判断上限还是下限
       */
      changeMoneyFilter: function (target, type) {
        //接收value值
        $target = $(target);
        var val = $target.val();

        //判断是否符合
        if (!this.judgeValue(val, type)) {
          $target.val('');
          $target.attr('title', '');
          return null;
        }

        //千分位化展示值并展示
        if (val) {
          var nVal = this.formatNum(val);
          $target.val(nVal);
          $target.attr('title', nVal);
        } else {
          $target.val(val);
          $target.attr('title', val);
        }
        //将未千分位化的值保存
        if (type == 'uppLim') {
          this.uppLim = val ? (parseFloat(val) * this.metric) : '';
        } else {
          this.lowLim = val ? (parseFloat(val) * this.metric) : '';
        }
        //传出值
        var filMonRes = '';
        filMonRes = {
          uppLim: this.uppLim,
          lowLim: this.lowLim,
        };
        this.$emit('moneyChange', filMonRes);
      },
      /**
       * @func
       * @desc 聚焦到筛选器展示值变为未千分位数值
       * @param {Object} target - 元素
       */
      focusfilter: function (target) {
        target.value = target.value.replace(/,/g, '');
      },
      /**
       * 金额千分位函数
       * @param {Number} num - 需要转化的数据
       * @returns {String}
       */
      formatNum: function (num) {
        return comUtils.formatNum(num, 2, 1);
      },
      /**
       * 判断输入金额是否符合条件（符合为true）
       * @param {Number} val - 需要判断的值
       * @returns {Boolean} type - 输入类型 ： 上限/下限
       */
      judgeValue: function (val, type) {
        //先判断是否为空
        if (!val) {
          return true;
        }
        //判断输入值是否符合
        var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
        if (!reg.test(val)) {
          MAT.utils.notific('数值范围输入有误', 'warn');
          return false;
        } else {
          //判断大小是否符合
          if (type == 'uppLim') {
            //val为上限
            if (this.lowLim && ((parseFloat(val) * this.metric < this.lowLim))) {
              MAT.utils.notific('不应该小于下限', 'warn');
              return false;
            } else {
              return true;
            }
          } else {
            //val为下限
            if (this.uppLim && ((parseFloat(val) * this.metric > this.uppLim))) {
              MAT.utils.notific('不应该大于上限', 'warn');
              return false;
            } else {
              return true;
            }
          }
        }
      },
      /**
       * @func
       * @desc 重置筛选器
       */
      resetFilter: function () {
        var uppId = '#' + this.filterId + '-uppLim';
        $(uppId).val('');
        var lowId = '#' + this.filterId + '-lowLim';
        $(lowId).val('');
        this.changeMoneyFilter($(uppId), 'uppLim');
        this.changeMoneyFilter($(lowId), 'lowLim');
      }
    }
  });
})