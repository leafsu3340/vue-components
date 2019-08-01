/**
 * 事件：dateTimeChange
 */
define(['vue',
  'text!components/datepicker/index.html',
  'utils/format-date',
  'datetimepicker',
  'css!components/datepicker/css/datepicker.css'
], function (Vue, template, formateDate) {
  return Vue.extend({
    name: 'DatePicker',
    template: template,
    props: {
      labelTitle: {
        // title标签
        type: String,
        default: '选择日期:'
      },
      dateFormat: {
        // 日期格式
        type: String,
        default: 'yyyy-mm-dd'
      },
      pickerId: {
        // 实例化ID
        type: String,
        default: 'datetimepicker'
      },
      initDate: {
        // 初始化日期
        type: String,
        default: ''
      },
      startDate: {
        // 开始日期
        type: String,
        default: '1970-01-01'
      },
      endDate: {
        // 结束日期
        type: String,
        default: '3000-01-01'
      },
      timePickerMinView: {
        // 2 or 'month' for month view (the default);3 or 'year' for the 12-month overview
        type: Number,
        default: 2
      }
    },
    data: function data() {
      return {
        dateTime: '',
        showClear: false
      };
    },
    mounted: function mounted() {
      this.initDateTime();
    },
    watch: {
      initDate: function initDate(nVal) {
        this.dateTime = nVal;
        this.$emit('dateTimeChange', this.dateTime);
      },
      startDate: function startAndEnd(nVal) {
        var self = this;
        if (!nVal) {
          $('#' + self.pickerId).datetimepicker('setStartDate', '1970-01-01');
        } else {
          $('#' + self.pickerId).datetimepicker('setStartDate', nVal);
        }
      },
      endDate: function endDate(nVal) {
        var self = this;
        if (!nVal) {
          $('#' + self.pickerId).datetimepicker('setEndDate', '3000-01-01');
        } else {
          $('#' + self.pickerId).datetimepicker('setEndDate', nVal);
        }
      }
    },
    methods: {
      /**
       * 时间控件初始化
       */
      initDateTime: function initDateTime() {
        var self = this;
        self.dateTime = self.initDate;
        self.$emit('dateTimeChange', self.dateTime);
        var pickerId = '#' + self.pickerId;
        $(pickerId).datetimepicker({
          format: this.dateFormat,
          autoclose: true,
          minView: self.timePickerMinView,
          startView: self.timePickerMinView,
          todayBtn: true,
          todayHighlight: true,
          initialDate: self.dateTime,
          language: 'zh-CN',
          viewSelect: self.timePickerMinView,
        }).on('changeDate', function (ev) {
          var timeStr = formateDate(new Date(ev.date), self.dateFormat);
          self.dateTime = timeStr;
          self.$emit('dateTimeChange', self.dateTime);
        });

        $(pickerId).datetimepicker('update');
      },
      /**
       * 设置日期
       */
      setDate: function setDate(val) {
        this.dateTime = val;
        this.$emit('dateTimeChange', this.dateTime);
        var pickerId = '#' + this.pickerId;
        $(pickerId).datetimepicker('update');
      },
      /**
       * 清除日期
       */
      clearDate: function clearDate() {
        this.dateTime = '';
        this.$emit('dateTimeChange', this.dateTime);
        var pickerId = '#' + this.pickerId;
        $(pickerId).datetimepicker('update');
      }
    },
  });
});