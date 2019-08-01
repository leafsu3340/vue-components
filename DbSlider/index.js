/**
 * @file 双向滑动vue组件
 * 
 * @desc 向外显露两个事件：minValChange - 输出小值；maxValChange - 输出大值
 * @desc 可控参数有：sliderBaseId、minColor、middleColor、maxColor、minVal、maxVal
 * @author dxd <dengxiaodong@ygsoft.com>
 */
define(['vue',
  'utils/format-money',
  'text!components/DbSlider/index.html',
  'css!components/DbSlider/css/dbslider.css'
], function (Vue, formatMoney, template) {
  return Vue.extend({
    name: 'DbSlider',
    template: template,
    props: {
      sliderBaseId: {
        // 双滑块控件id
        type: String,
        default: 'dbslider'
      },
      minColor: {
        // 渐变色最小颜色
        type: Object,
        default: function () {
          return {
            r: 252,
            g: 255,
            b: 88
          }
        }
      },
      middleColor: {
        // 渐变色中间颜色
        type: Object,
        default: function () {
          return {
            r: 133,
            g: 254,
            b: 124
          }
        }
      },
      maxColor: {
        // 渐变色最大颜色
        type: Object,
        default: function () {
          return {
            r: 102,
            g: 217,
            b: 252
          }
        }
      },
      minVal: {
        // 最小值
        type: Number,
        default: 0
      },
      maxVal: {
        // 最大值
        type: Number,
        default: 100
      },
      metric: {
        // 计量单位
        type: Number,
        default: 1
      },
      sliderType: {
        // 滑块类型， horizon - 水平的；vertical - 垂直的；
        type: String,
        default: 'vertical',
      },
      showTxt: {
    	  // 是否显示高低文本
    	  type: Boolean,
    	  default: true
      },
    },
    data: function data() {
      return {
        leftModalWidth: 0, // 左遮罩层宽度
        rightModalWidth: 0, // 右遮罩层宽度
        changeTimeoutId: null // 计时器
      };
    },
    watch: {
      leftModalWidth: function () {
        var self = this;
        if (self.changeTimeoutId) {
          clearTimeout(self.changeTimeoutId);
        }
        var eventName = (self.sliderType == 'horizon') ? 'minValChange' : 'maxValChange';
        // 节流
        self.changeTimeoutId = setTimeout(function () {
          self.$nextTick(function () {
            self.$emit(eventName, self.showLeftVal);
          })
        }, 100);
      },
      rightModalWidth: function () {
        var self = this;
        if (self.changeTimeoutId) {
          clearTimeout(self.changeTimeoutId);
        }
        var eventName = (self.sliderType == 'horizon') ? 'maxValChange' : 'minValChange';
        // 节流
        self.changeTimeoutId = setTimeout(function () {
          self.$nextTick(function () {
            self.$emit(eventName, self.showRightVal);
          })
        }, 100);
      }
    },
    methods: {
      // 计量单位转换
      transformMoney: function (val) {
        return formatMoney(val, this.metric);
      },
      /**
       * 根据ID获取元素
       * @param {String} o - elementId  
       */
      getEleById: function (o) {
        var self = this;
        return document.getElementById(self.sliderBaseId + o) || o;
      },
      /**
       * 滑块滑动处理函数
       * @param {Object} e - 点击事件 
       */
      changeBlock: function (e) {
        var self = this;
        var baseId = self.sliderBaseId;
        var e = e ? e : window.event;
        if (!window.event) {
          e.preventDefault();
        }
        var o = e.currentTarget;
        var init = {
          mX: o[self.offSetKey],
          lX: self.getEleById('-range-left')[self.offSetKey],
          rX: self.getEleById('-range-right')[self.offSetKey],
          dX: e[self.eClientKey]
        };
        document.onmousemove = function (e) {
          var e = e ? e : window.event;
          var dist = e[self.eClientKey] - init.dX,
            len = init.mX + dist,
            leftX = init.lX,
            rightX = init.rX;
          switch (o.id) {
            case baseId + '-range-left':
              leftX = init.lX + dist;
              leftMove();
              break;
            case baseId + '-range-right':
              rightX = init.rX + dist;
              rightMove();
              break;
              // case baseId + '-range-box':
              // leftX = init.lX + dist;
              // rightX = init.rX + dist;
              // boxMove();
              // break;
            default:
              break;
          }
          /**
           * 左滑块移动
           */
          function leftMove() {
            if ((rightX > (leftX + 10)) && (len >= 0) && (len <= 150)) {
              if (leftX < 10) {
                o.style[self.styleOffsetKey] = '-15px';
                self.getEleById('-range-box').style[self.styleOffsetKey] = 0 + 'px';
                self.getEleById('-range-box').style[self.lengthKey] = rightX + 'px';
                self.getEleById('-left-modal').style[self.lengthKey] = '0px';
                self.leftModalWidth = 0;
              } else {
                o.style[self.styleOffsetKey] = (len - 15) + "px";
                self.getEleById('-range-box').style[self.styleOffsetKey] = leftX + 'px';
                self.getEleById('-range-box').style[self.lengthKey] = rightX - leftX + 'px';
                self.getEleById('-left-modal').style[self.lengthKey] = leftX + 'px';
                self.leftModalWidth = leftX;
              }

            }
          };
          /**
           * 右滑块移动
           */
          function rightMove() {
            if ((rightX > (leftX + 25)) && (len >= 0) && (len <= 150)) {
              if (len < 140) {
                o.style[self.styleOffsetKey] = len + "px";
                self.getEleById('-range-box').style[self.styleOffsetKey] = leftX + 'px';
                self.getEleById('-range-box').style[self.lengthKey] = rightX - leftX + 'px';
                self.getEleById('-right-modal').style[self.lengthKey] = (150 - len) + 'px';
                self.rightModalWidth = 150 - len;
              } else {
                o.style[self.styleOffsetKey] = 150 + "px";
                self.getEleById('-range-box').style[self.styleOffsetKey] = leftX + 'px';
                self.getEleById('-range-box').style[self.lengthKey] = rightX - leftX + 'px';
                self.getEleById('-right-modal').style[self.lengthKey] = '0px';
                self.rightModalWidth = 0;
              }
            }
          };
          /**
           * 长滑块移动
           */
          function boxMove() {
            if ((leftX >= 0) && (rightX <= 150)) {
              o.style[self.styleOffsetKey] = len + "px";
              self.getEleById('-range-left').style[self.styleOffsetKey] = (leftX - 15) + "px";
              self.getEleById('-range-right').style[self.styleOffsetKey] = rightX + "px";
              self.getEleById('-left-modal').style[self.lengthKey] = leftX + 'px';
              self.leftModalWidth = leftX;
              self.getEleById('-right-modal').style[self.lengthKey] = (150 - rightX) + 'px';
              self.rightModalWidth = 150 - rightX;
            }
          };
        }
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        }
      },
      /**
       * 计算左侧大值颜色值
       * @param {Number} val 
       */
      computeLeftMaxColor: function (val) {
        var r = parseInt(this.middleColor.r + (this.maxColor.r - this.middleColor.r) * (val - 75) / 75);
        var g = parseInt(this.middleColor.g + (this.maxColor.g - this.middleColor.g) * (val - 75) / 75);
        var b = parseInt(this.middleColor.b + (this.maxColor.b - this.middleColor.b) * (val - 75) / 75);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      },
      /**
       * 计算左侧小值颜色值
       * @param {Number} val 
       */
      computeLeftMinColor: function (val) {
        var r = parseInt(this.minColor.r + (this.middleColor.r - this.minColor.r) * val / 75);
        var g = parseInt(this.minColor.g + (this.middleColor.g - this.minColor.g) * val / 75);
        var b = parseInt(this.minColor.b + (this.middleColor.b - this.minColor.b) * val / 75);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      },
      /**
       * 计算右侧侧大值颜色值
       * @param {Number} val 
       */
      computeRightMaxColor: function (val) {
        var r = parseInt(this.minColor.r + (this.middleColor.r - this.minColor.r) * (150 - val) / 75);
        var g = parseInt(this.minColor.g + (this.middleColor.g - this.minColor.g) * (150 - val) / 75);
        var b = parseInt(this.minColor.b + (this.middleColor.b - this.minColor.b) * (150 - val) / 75);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      },
      /**
       * 计算右侧小值颜色值
       * @param {Number} val 
       */
      computeRightMinColor: function (val) {
        var r = parseInt(this.middleColor.r + (this.maxColor.r - this.middleColor.r) * (75 - val) / 75);
        var g = parseInt(this.middleColor.g + (this.maxColor.g - this.middleColor.g) * (75 - val) / 75);
        var b = parseInt(this.middleColor.b + (this.maxColor.b - this.middleColor.b) * (75 - val) / 75);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      },
    },
    computed: {
      // 垂直模式布尔值
      isHorizon: function(){
        return this.sliderType == 'horizon';
      },
      /**
       * 左滑块颜色值计算
       * @return {String} - 颜色rgb值
       */
      leftBlockColor: function () {
        var leftWidth = this.leftModalWidth;
        if (this.isHorizon) {
          if (leftWidth <= 75) {
            return this.computeLeftMinColor(leftWidth);
          } else {
            return this.computeLeftMaxColor(leftWidth);
          }
        } else {
          if (leftWidth <= 75) {
            return this.computeRightMinColor(leftWidth);
          } else {
            return this.computeRightMaxColor(leftWidth);
          }
        }
      },
      /**
       * 右滑块颜色值计算
       * @return {String} - 颜色rgb值
       */
      rightBlockColor: function () {
        var rightWidth = this.rightModalWidth;
        if (this.isHorizon) {
          if (rightWidth > 75) {
            return this.computeRightMaxColor(rightWidth);
          } else {
            return this.computeRightMinColor(rightWidth);
          }
        } else {
          if (rightWidth > 75) {
            return this.computeLeftMaxColor(rightWidth);
          } else {
            return this.computeLeftMinColor(rightWidth);
          }
        }
      },
      /**
       * 右滑块数值显示
       * @return {Number} - 精确2位小数的数字
       */
      showRightVal: function () {
        if (this.isHorizon) {
          var val = (((150 - this.rightModalWidth) / 150) * (this.maxVal - this.minVal) + this.minVal).toFixed(2);
          return parseFloat(val, 2);
        } else {
          var val = ((this.rightModalWidth / 150) * (this.maxVal - this.minVal) + this.minVal).toFixed(2);
          return parseFloat(val, 2);
        }
      },
      /**
       * 左滑块数值显示
       * @return {Number} - 精确2位小数的数字
       */
      showLeftVal: function () {
        if (this.isHorizon) {
          var val = ((this.leftModalWidth / 150) * (this.maxVal - this.minVal) + this.minVal).toFixed(2);
          return parseFloat(val, 2);
        } else {
          var val = (((150 - this.leftModalWidth) / 150) * (this.maxVal - this.minVal) + this.minVal).toFixed(2);
          return parseFloat(val, 2);
        }
      },
      /**
       * 背景渐变色
       * @return {String} - 背景渐变样式
       */
      rangeBg: function () {
        var direction = this.isHorizon ? 'to right' : 'to top';
        var minRgb = 'rgb(' + this.minColor.r + ',' + this.minColor.g + ',' + this.minColor.b + ')';
        var middleRgb = 'rgb(' + this.middleColor.r + ',' + this.middleColor.g + ',' + this.middleColor.b + ')';
        var maxRgb = 'rgb(' + this.maxColor.r + ',' + this.maxColor.g + ',' + this.maxColor.b + ')';
        return 'linear-gradient(' + direction + ', ' + minRgb + ' 0%, ' + middleRgb + ' 50%, ' + maxRgb + ' 100%)';
      },
      // 元素长度属性key
      lengthKey: function () {
        return this.isHorizon ? 'width' : 'height';
      },
      // 鼠标左边偏移量key
      eClientKey: function () {
        return this.isHorizon ? 'clientX' : 'clientY';
      },
      // 元素偏移量key
      offSetKey: function () {
        return this.isHorizon ? 'offsetLeft' : 'offsetTop';
      },
      styleOffsetKey: function () {
        return this.isHorizon ? 'left' : 'top';
      },
      containerClass: function () {
        return this.isHorizon ? 'dbslider-horizon-range-container' : 'dbslider-vertical-range-container';
      }
    }
  });
});