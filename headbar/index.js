/**
 * @file 基于datetimepicker\jstree封装的页面头部组件
 * @desc 对外声明的事件包括(metricChange，organChange，dateTimeChange)
 */
define(['vue',
  'text!components/headbar/index.html',
  './js/organJstree',
  'utils/format-date',
  'utils/page-params',
  'js/gwzjjk-const',
  'datetimepicker',
  'css!components/headbar/css/headbar.css'
], function (Vue, template, organJstree, formateDate, pageParams, ZJJK_CONST) {
  return Vue.extend({
    template: template,
    components: {},
    props: {
      dateFormat: {
        // 日期格式
        type: String,
        default: 'yyyy-mm-dd'
      },
      initDate: {
        // 初始日期
        type: String,
        default: ''
      },
      defaultOrgan: {
        // 初始机构Id
        type: String,
        default: '',
        require: true
      },
      rootOrgan: {
        // 初始根节点组织机构Id
        type: String,
        default: '',
        require: true
      },
      initMetric: {
        // 初始计量单位
        type: Number,
        default: 1
      },
      timePickerMinView: {
        // 2 or 'month' for month view (the default);3 or 'year' for the 12-month overview
        type: Number,
        default: 2
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
      },
      isUpdateStorage: {
        // 是否更新localstorage里的参数
        type: Boolean,
        default: true
      },
      levelDefine: {
        // 定义层级函数 组织机构类型 0 - 所有层级； 1 - 一层级；2 - 两层级；
        type: Function,
        default: function (rootOrgan) {
          return 0;
        }
      },
      organType: {
        // 定义层级函数 组织机构类型 0 - 国网； 1 - 山东；
        type: Number,
        default: 0
      },
      choseDateType: {
        // 日期类型是否可选
        type: Boolean,
        default: false
      },
      organReadOnly: {
        // 组织机构单位只读时，需传值进来(对象内的属性都必填)
        type: Object,
        default: function () {
          return {
            flag: false,
            organId: '',
            treelevel: '',
            organName: ''
          }
        }
      },
      storeDayTime: {
        // 保存的“天”维度时间数据，切换日月年时起记忆作用
        type: String,
        default: ''
      },
      frozenDateType: {
        // 冻结日期类型，保持日期类型选择显示，但日期还是该参数指定的日期类型
        // 2 - 日；3 - 月；4 - 年；
        type: Number,
        default: 0
      },
      hideOrganArr: {
        // 需要定制隐藏不显示的组织机构ID集合
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    data: function () {
      return {
        dateTime: '',
        metric: 1,
        organ: '',
        organId: '',
        treelevel: 3,
        dateTypes: ZJJK_CONST.dateTypes,
        dateTitles: ZJJK_CONST.dateTitles,
        dateType: 2 // 默认为日维度类型
      };
    },
    watch: {
      metric: function metric() {
        this.exportValue('metric');
      },
      dateType: function (nVal) {
        this.refreshDateTime(nVal);
      }
    },
    mounted: function () {
      var self = this;
      this.metric = this.initMetric;
      // 若组织机构只读
      if (this.organReadOnly.flag) {
        this.organId = this.organReadOnly.organId;
        this.treelevel = this.organReadOnly.treelevel;
        this.organ = this.organReadOnly.organName;
      } else {
        this.initOrganSelect();
        // 监控页面切换rootOrganId
        MAT.event.clear("changeOrgan");
        MAT.event.on("changeOrgan", function (organId) {
          // 销毁jstree、清空jstree数据
          $('#headbar-organ .org-tree-container').jstree("destroy");
          $('#headbar-organ .org-tree-container').data('jstree', false).empty();
          self.initOrganSelect(organId, organId);
        });
        MAT.event.clear("selectTreeNode");
        MAT.event.on("selectTreeNode", function (node) {
          self.organ = node.text;
          self.organId = node.id;
          var org = node.original.org || {};
          if ((org.treelevel == 3) && (org['p_v_organ_id'] == ZJJK_CONST.gwOrganId)) {
            self.treelevel = 2;
          } else {
            self.treelevel = org.treelevel;
          }
          self.exportValue('organ');
        })
      }
      this.initDateTime();
    },
    methods: {
      /**
       * 输出组件变量值
       */
      exportValue: function exportValue(type) {
        if ((!!this.metric) && (!!this.dateTime) && (!!this.organId)) {
          var emitName = type + 'Change';
          this.$emit(emitName, this.headerResult);
          if (this.isUpdateStorage) {
            var selectedDay = formateDate(new Date(this.dateTime), 'yyyy-mm-dd')
            var pParam = {
              metric: this.metric,
              organId: this.organId,
              tday: selectedDay,
            }
            pageParams.setPageParams(pParam);
          }
        }
      },
      /**
       * 单位选择器初始化
       */
      initOrganSelect: function initOrganSelect(defaultOrganId, rootOrganId) {
        var self = this;
        var defaultOrgan = '';
        var rootOrgan = '';
        if ((!defaultOrganId) && (!rootOrganId)) {
          defaultOrgan = self.defaultOrgan;
          rootOrgan = self.rootOrgan;
        } else {
          defaultOrgan = defaultOrganId;
          rootOrgan = rootOrganId;
        }
        // 初始化jsTree
        var level = self.levelDefine(rootOrgan);
        organJstree.init(defaultOrgan, rootOrgan, self.organType, level, self.hideOrganArr);
        $('#headbar-organ').unbind();
        organJstree.bindEvent();
      },
      /**
       * 日期控件初始化
       */
      initDateTime: function initDateTime() {
        var self = this;
        if (!self.initDate) {
          self.dateTime = formateDate(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), this.dateFormat);
        } else {
          self.dateTime = formateDate(new Date(this.initDate), this.dateFormat);
        }

        self.exportValue('dateTime');
        $('#datetimepicker').datetimepicker({
          format: self.dateFormat,
          autoclose: true,
          minView: self.timePickerMinView,
          startView: self.timePickerMinView,
          todayBtn: true,
          todayHighlight: true,
          initialDate: self.dateTime,
          language: 'zh-CN',
          viewSelect: self.timePickerMinView,
        }).on('changeDate', function (ev) {
          self.dateTime = formateDate(new Date(ev.date), self.dateFormat);
          self.exportValue('dateTime');
        });

        $('#datetimepicker').datetimepicker('update');
      },
      /**
       * 刷新日期控件
       */
      refreshDateTime: function (dateType) {
        $('#datetimepicker').unbind();
        $('#datetimepicker').datetimepicker('remove');
        var self = this;
        var timePickerMinView = self.timePickerMinView;
        var dateFormat = self.dateFormat;
        // 日期类型可选
        if (!self.frozenDateType) {
          if (self.choseDateType && dateType) {
            timePickerMinView = dateType;
            switch (dateType) {
              case 2:
                dateFormat = 'yyyy-mm-dd'
                break;
              case 3:
                dateFormat = 'yyyy-mm'
                break;
              case 4:
                dateFormat = 'yyyy'
                break;
              default:
                break;
            }
          }
        } else {
          timePickerMinView = self.frozenDateType;
          switch (self.frozenDateType) {
            case 2:
              dateFormat = 'yyyy-mm-dd'
              break;
            case 3:
              dateFormat = 'yyyy-mm'
              break;
            case 4:
              dateFormat = 'yyyy'
              break;
            default:
              break;
          }
        }

        if (!self.initDate) {
          self.dateTime = formateDate(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), dateFormat);
        } else {
          if (self.storeDayTime) {
            self.dateTime = formateDate(new Date(self.storeDayTime), dateFormat);
          } else {
            self.dateTime = formateDate(new Date(self.initDate), dateFormat);
          }
        }
        self.exportValue('dateTime');
        $('#datetimepicker').datetimepicker({
          format: dateFormat,
          autoclose: true,
          minView: timePickerMinView,
          startView: timePickerMinView,
          todayBtn: true,
          todayHighlight: true,
          initialDate: self.dateTime,
          language: 'zh-CN',
          viewSelect: timePickerMinView,
        }).on('changeDate', function (ev) {
          self.dateTime = formateDate(new Date(ev.date), dateFormat);
          self.exportValue('dateTime');
        });
        $('#datetimepicker').datetimepicker('update');
      },
      // 选中jsTree中的某一个节点
      selectTreeNode: function selectTreeNode(nodeId) {
        var treeId = '#' + this.filterId + '-tree-container';
        $(treeId).jstree('select_node', nodeId);
      },
      /**
       * 设置日期
       */
      setDate: function setDate(val) {
        this.dateTime = val;
        this.exportValue('dateTime');
        $('#datetimepicker').datetimepicker('update');
      },
    },
    computed: {
      // 返回的结果集
      headerResult: function headerResult() {
        return {
          metric: this.metric,
          organ: this.organ,
          metricName: this.metricNames[this.metric],
          dateTime: this.dateTime,
          organId: this.organId,
          treelevel: this.treelevel,
          dateType: this.dateType,
          dateTypeTitle: this.dateTitles[this.dateType]
        };
      },
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