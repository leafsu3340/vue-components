/**
 * 资金账户树模态框
 */
define(['vue',
  'text!./index.html',
  'utils/format-date',
  'utils/export-file',
  'utils/loader',
  'utils/datagrid-formatter',
  'components/datagrid/index',
  'components/zhmx-modal/index',
  'components/pagination/index',
  'js/gwzjjk-const',
  'css!./css/zjzhs-modal.css'
], function (Vue, template, formatDate, exportFile, Loader, Formatters,
  Datagrid, ZhmxModal, Pagination, ZJJK_CONST) {
  return Vue.extend({
    name: 'ZjzhsModal',
    template: template,
    components: {
      'datagrid': Datagrid,
      'zhmxmodal': ZhmxModal,
      'pagination': Pagination
    },
    props: {
      tday: { // tday
        type: String,
        default: ''
      },
      zjzhsModalId: { // 模态框ID
        type: String,
        default: 'zjzhs-modal'
      },
      modalTitle: { // modal-title
        type: String,
        default: '账户树'
      },
      metric: { // 计量单位
        type: Number,
        default: 1
      },
    },
    data: function data() {
      return {
        zjzhsParams: {},
        organId: '',
        organName: '',
        isAlone: false, // true-独立账户；false-集团账户；
        showPagination: false,
        total: 0
      };
    },
    mounted: function mounted() {
      var self = this;
      var modalId = '#' + this.zjzhsModalId;
      $(modalId).on('shown.bs.modal', function () {
        // 模态框渲染完成后请求数据渲染表格
        self.queryGridData();
      })
    },
    methods: {
      // 切换是否独立账户
      switchZhClass: function switchZhClass(val) {
        this.isAlone = val;
        this.$nextTick(function () {
          this.queryGridData();
        })
      },
      // data-grid渲染完成
      onZjModalFinishDraw: function onZjModalFinishDraw() {
        Loader.unblock({
          "$container": $(".zjzhs-tree-modal")
        });
        this.showPagination = this.isAlone;
      },
      // 树形表格懒加载
      onZjModalLazyLoad: function onZjModalLazyLoad(params) {
        var row = params.row;
        var self = this;
        var queryParams = self.zjzhsParams;
        queryParams.organ_id = '';
        queryParams.paccount_id = row['account_id'];
        var reqParams = {
          params: JSON.stringify(queryParams),
        };
        Loader.block({
          "$container": $(".zjzhs-tree-modal")
        });
        MAT.utils.getUrl('/gwzjjk/common/report/getReportObject', reqParams, function (res) {
          var tableData = res.obj.esData || [];
          var childrenNodes = [];
          $.each(tableData, function (index, eItem) {
            if (eItem['account_id'] !== row['account_id']) {
              if (!eItem['is_leaf']) {
                eItem.children = [];
                eItem.state = 'closed';
              }
              childrenNodes.push(eItem);
            }
          })
          $(params.gridId).treegrid('append', {
            parent: row['account_id'],
            data: childrenNodes
          });
          // FIXME:直接使用jquery展示隔壁子集所属的表格div，缺少展示动画，应该考虑调用easyui-api实现。
          self.$nextTick(function () {
            var nodeId = 'tr[node-id=' + row['organ_id'] + ']';
            $(nodeId).next().find('td>div').show();
            Loader.unblock({
              "$container": $(".zjzhs-tree-modal")
            });
          })
        }, function (e) {
          Loader.unblock({
            "$container": $(".zjzhs-tree-modal")
          });
        });
      },
      // 单击单元格
      onClickCell: function (params) {
        if (params.field == 'account') {
          var accountId = this.isAlone ? params.row['account_id'] : params['account_id'];
          this.$refs.zhmxModal.getZhmxData(accountId);
        }
      },
      // 融资明细单元格格式化函数
      zjzhsModalGridFormat: Formatters.fieldFormat,
      // 导出
      exportZjzhFile: function exportZjzhFile() {
        var expParam = this.zjzhsParams;
        expParam.isExp = 1;
        expParam.tableType = this.isAlone ? 1 : 0;
        expParam.pageSize = 1000;
        expParam.startRow = 0;
        expParam.organName = this.organName;
        expParam.unitName = ZJJK_CONST.metricNames[this.metric],
        expParam.unit = this.metric;
        exportFile.exportExcel(expParam);
      },
      // 查询资金账户树请求
      getZjzhsData: function getZjzhsData(organId, organName) {
        var self = this;
        self.organName = organName;
        self.organId = organId;
        var modalId = '#' + self.zjzhsModalId;
        $(modalId).modal('show').prependTo('body');
      },
      // 查询esdata后台数据
      queryGridData: function queryGridData() {
        var self = this;
        self.zjzhsParams = {
          reportId: '1028',
          tday: formatDate(new Date(self.tday), 'YYYYMMdd'),
          organ_id: self.organId,
          isalone: self.isAlone ? 0 : '',
          isjtzh: self.isAlone ? '' : 0,
          pageSize: 1000,
          startRow: 0
        };
        var reqParams = {
          params: JSON.stringify(self.zjzhsParams),
        };
        Loader.block({
          "$container": $(".zjzhs-tree-modal")
        });
        MAT.utils.getUrl('/gwzjjk/common/report/getReportObject', reqParams, function (res) {
          var tableData = res.obj || {};
          self.total = res.obj.total || 0;
          var gridProperty = {};
          for (key in tableData.propertyMap) {
            var attrVal = tableData.propertyMap[key]["attr_value"];
            if (attrVal === '0') {
              gridProperty[key] = false;
            } else if (attrVal === '1') {
              gridProperty[key] = true;
            } else {
              gridProperty[key] = attrVal;
            }
          };
          // 固定为树形表格
          gridProperty.tableType = self.isAlone;
          var optionData = {
            columns: tableData.headerMap.generalList,
            frozenColumns: tableData.headerMap.frozenList,
            gridProperty: gridProperty,
          };
          var bodyData = {
            rows: tableData.esData
          };
          self.$nextTick(function () {
            self.$refs.zjModalGridTable.initGridHeader(optionData);
            self.$refs.zjModalGridTable.initGridBody(bodyData);
          });
        }, function (e) {
          Loader.unblock({
            "$container": $(".zjzhs-tree-modal")
          });
        });
      }
    },
    computed: {
      // 请求参数
      zhmxModalParam: function zhmxModalParam() {
        return {
          reportId: '1025', //账户台帐明细表ID
          tday: formatDate(new Date(this.tday), 'YYYYMMdd'), //查询日期
          organ_id: this.organId,
        }
      },
    }
  });
});