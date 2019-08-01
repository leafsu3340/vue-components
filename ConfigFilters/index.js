/**
 * 可配置筛选框
 * 
 * 事件： triggerQuery; resetQuery;
 */
define(['vue',
  'text!./index.html',
  'components/dropfilter/index',
  'components/datepicker/index',
  'utils/com-utils',
  'css!./css/config-filters.css'
], function (Vue, template, DropFilter, DatePicker, comUtils) {
  return Vue.extend({
    name: 'ConfigFilters',
    template: template,
    components: {
      'drop-filter': DropFilter,
      'date-picker': DatePicker
    },
    props: {
      filterItems: {
        // 需配置的筛选器组数据
        type: Array,
        default: function () {
          return []
        }
      },
      metric: {
        // 计量单位
        type: Number,
        default: 1
      }
    },
    data: function data() {
      return {
        filtersData: [], // 筛选框数据
        filtersParam: {}, // 返回的筛选框参数
        inputModel: {} // 输入框绑定值
      };
    },
    watch: {
      filterItems: function (nVal) {
        var self = this;
        this.filtersData = nVal.concat();
        this.filtersParam = {};
        this.inputModel = {};
        // 设置input默认值
        $.each(self.filtersData, function (index, fItem) {
          var fItemField = fItem.field;
          var fItemInitVal = fItem.initvalue;
          var startField = 'start_' + fItemField;
          var endField = 'end_' + fItemField;
          switch (fItem.type) {
            case 3:
              // 模糊查询
              self.inputModel[fItemField] = fItemInitVal;
              self.filtersParam[fItemField] = fItemInitVal || '';
              break;
            case 6:
              // 金额区间
              var intObj = {};
              try {
                intObj = JSON.parse(fItemInitVal) || {};
              } catch (error) {}
              self.inputModel[startField] = intObj[startField]?comUtils.formatNum(intObj[startField], 2, self.metric):intObj[startField];
              self.inputModel[endField] = intObj[endField]?comUtils.formatNum(intObj[endField], 2, self.metric):intObj[endField];
              self.filtersParam[startField] = intObj[startField] || '';
              self.filtersParam[endField] = intObj[endField] || '';
              break;
            case 8:
              // 数量区间
              var intObj = {};
              try {
                intObj = JSON.parse(fItemInitVal) || {};
              } catch (error) {}
              self.inputModel[startField] = intObj[startField];
              self.inputModel[endField] = intObj[endField];
              self.filtersParam[startField] = intObj[startField] || '';
              self.filtersParam[endField] = intObj[endField] || '';
              break;
            default:
              break;
          }
        });
      },
      metric: function (nVal) {
        var self = this;
        var newInputModal = $.extend(true, {}, self.inputModel);
        $.each(self.filtersData, function (idx, fItem) {
          var fItemField = fItem.field;
          if (fItem.type == 6) {
            // 金额区间
            var startField = 'start_' + fItemField;
            var endField = 'end_' + fItemField;

            var startFieldTrans = self.transformNum(self.filtersParam[startField], nVal);
            var endFieldTrans = self.transformNum(self.filtersParam[endField], nVal);
            newInputModal[startField] = startFieldTrans?comUtils.formatNum(startFieldTrans, 2, 1):startFieldTrans;
            newInputModal[endField] = endFieldTrans?comUtils.formatNum(endFieldTrans, 2, 1):endFieldTrans;
          }
        });
        self.inputModel = newInputModal;
      }
    },
    mounted: function () {
      this.filtersData = this.filterItems.concat();
    },
    methods: {
      // 金额区间单位换算
      transformNum: function (num, nVal) {
        if (!num) {
          return num;
        } else {
          return (num / nVal).toFixed(2);
        }
      },
      // 枚举设值
      setEumFilter: function (val, field) {
        this.filtersParam[field] = val.selectedIds;
      },
      // 单选时间设值
      onSingleDateChange: function (val, field) {
        this.filtersParam[field] = val;
      },
      // 时间区间始设值
      onStartSDateChange: function (val, field, filterIndex) {
        this.filtersParam[field] = val;
        var newObj = this.filtersData[filterIndex];
        newObj.startOfStartDate = val;
        this.$set(this.filtersData, filterIndex, newObj);
      },
      // 时间区间末设值
      onStartEDateChange: function (val, field, filterIndex) {
        this.filtersParam[field] = val;
        var newObj = this.filtersData[filterIndex];
        newObj.endOfStartDate = val;
        this.$set(this.filtersData, filterIndex, newObj);
      },
      // 金额区间设值
      changeMoneyInput: function (prefix, item, e) {
        var inputField = prefix + item.field;
        var inputVal = this.inputModel[inputField];
        if (inputVal) {
          var reg = new RegExp(item.verify);
          // 格式校验
          if (reg.test(inputVal)) {
            // 校验大小
            if (prefix == 'start_') {
              var maxVal = this.inputModel['end_' + item.field];
              if (maxVal && (parseInt(maxVal, 10) < parseInt(inputVal, 10))) {
                this.inputModel[inputField] = '';
                inputVal = '';
                e.target.value = '';
                MAT.utils.notific('不可超过最大值，请知悉', 'warn');
              }
            } else {
              var minVal = this.inputModel['start_' + item.field];
              if (minVal && (parseInt(minVal, 10) > parseInt(inputVal, 10))) {
                this.inputModel[inputField] = '';
                inputVal = '';
                e.target.value = '';
                MAT.utils.notific('不可小于最小值，请知悉', 'warn');
              }
            }
          } else {
            this.inputModel[inputField] = '';
            inputVal = '';
            e.target.value = '';
            MAT.utils.notific(item.verifytip, 'warn');
          }
          if (e.target.value) {
            e.target.value = comUtils.formatNum(e.target.value, 2, 1);
          }
          var res = inputVal ? ((inputVal * this.metric * 10) / 10) : inputVal;
          this.filtersParam[inputField] = res + '';
        } else {
          this.filtersParam[inputField] = inputVal;
        }
      },
      /**
       * 聚焦到金额筛选器展示值变为未千分位数值
       * @param {Object} target - 元素
       */
      focusfilter: function (target) {
        target.value = target.value.replace(/,/g, '');
      },
      // 账户数量区间设值
      changeAccountInput: function (prefix, item, e) {
        var inputField = prefix + item.field;
        var inputVal = this.inputModel[inputField];
        if (inputVal) {
          var reg = new RegExp(item.verify);
          if (reg.test(inputVal)) {
            if (prefix == 'start_') {
              var maxVal = this.inputModel['end_' + item.field];
              if (maxVal && (parseInt(maxVal, 10) < parseInt(inputVal, 10))) {
                this.inputModel[inputField] = '';
                inputVal = '';
                MAT.utils.notific('不可超过最大值，请知悉', 'warn');
              }
            } else {
              var minVal = this.inputModel['start_' + item.field];
              if (minVal && (parseInt(minVal, 10) > parseInt(inputVal, 10))) {
                this.inputModel[inputField] = '';
                inputVal = '';
                MAT.utils.notific('不可小于最小值，请知悉', 'warn');
              }
            }
          } else {
            this.inputModel[inputField] = '';
            inputVal = '';
            MAT.utils.notific(item.verifytip, 'warn');
          }
          this.filtersParam[inputField] = inputVal;
        } else {
          this.filtersParam[inputField] = inputVal;
        }
      },
      // 模糊查询
      fuzzyQuery: function (field, item, e) {
        var inputVal = this.inputModel[field];
        var reg = new RegExp(item.verify);
        if (reg.test(inputVal)) {
          this.filtersParam[field] = inputVal;
        } else {
          this.inputModel[field] = '';
          MAT.utils.notific(item.verifytip, 'warn')
        }
      },
      // 查询
      triggerQuery: function () {
        this.$emit('triggerQuery', this.filtersParam);
      },
      // 重置查询条件
      resetQuery: function () {
        var self = this;
        $.each(self.filtersData, function (index, fItem) {
          var fItemField = fItem.field;
          var fItemInitVal = fItem.initvalue;
          var startField = 'start_' + fItemField;
          var endField = 'end_' + fItemField;
          switch (fItem.type) {
            case 2:
              // 多选
              self.$refs[fItemField][0].setInitValue(fItemInitVal);
              break;
            case 3:
              // 模糊查询
              self.inputModel[fItemField] = fItemInitVal;
              self.filtersParam[fItemField] = fItemInitVal || '';
              break;
            case 4:
              // 时间单选
              self.$refs[fItemField][0].clearDate();
              break;
            case 5:
              // 时间区间
              self.$refs[startField][0].clearDate();
              self.$refs[endField][0].clearDate();
              break;
            case 6:
              // 金额区间
              var intObj = {};
              try {
                intObj = JSON.parse(fItemInitVal) || {};
              } catch (error) {}
              var startVal = intObj[startField] ? intObj[startField] / self.metric : intObj[startField];
              var endVal = intObj[endField] ? intObj[endField] / self.metric : intObj[endField];
              self.inputModel[startField] = startVal;
              self.inputModel[endField] = endVal;
              self.filtersParam[startField] = intObj[startField] || '';
              self.filtersParam[endField] = intObj[endField] || '';
              break;
              // case 7:
              //   // 布尔
              //   self.$refs[fItemField][0].setInitValue(fItemInitVal);
              //   break;
            case 8:
              // 数量区间
              var intObj = {};
              try {
                intObj = JSON.parse(fItemInitVal) || {};
              } catch (error) {}
              self.inputModel[startField] = intObj[startField];
              self.inputModel[endField] = intObj[endField];
              self.filtersParam[startField] = intObj[startField] || '';
              self.filtersParam[endField] = intObj[endField] || '';
              break;
            default:
              break;
          }
        });
        this.$emit('resetQuery', this.filtersParam);
      },
      // 设置input默认值
      setInputDefault: function (field, val) {
        var self = this;
        this.filtersParam[field] = val;
        $(self.$refs[field][0]).val();
      }
    }
  });
});