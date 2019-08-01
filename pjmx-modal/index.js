define(['vue',
  'text!./index.html',
  'utils/format-date',
  'utils/format-money',
  'echarts',
  'css!./css/pjmx-info-modal.css'
], function (Vue, template, formatDate, formateMoney, echarts) {
  return Vue.extend({
    name: 'PjmxModal',
    template: template,
    props: {
      reqParams: { // 票据详情请求参数
        type: Object,
        default: function () {
          return {
            tday: '',
            organ_id: '',
            ys_or_yf_id: '',
          }
        }
      },
      pjmxModalId: { // modalID
        type: String,
        default: 'pjmx-modal'
      },
      metric: { // 计量单位
        type: Number,
        default: 1
      }
    },
    data: function () {
      return {
        flag: true,
        discount_rate: '',
        showData: [],//   票据台帐明细弹出框信息
        // pjtzmxDetailInfo: {}, //   票据台帐明细弹出框信息
        // 应收日期字段
        issue_date: '', // 卡片格式化出票日期
        due_date: '', // 卡片格式化到期日
        endorse_date: '', // 卡片格式化背书日期
        receive_date: '', // 卡片格式化收票日期
        discount_date: '', // 卡片格式化贴现日期
        begin_time: '', // 卡片格式化开始时间
        cdrq: '', // 卡片格式化收款日期
        end_time: '', // 卡片格式化结束时间
        accept_date: '', // 卡片格式化承兑日期
        // 应付日期字段
        ysissue_date: '', // 卡片格式化应收日期
        ysdue_date: '', // 卡片格式化到期日
        ysbegin_time: '', // 卡片格式化开始时间
        yspay_date: '', // 卡片格式化付款日期
        ysend_time: '', // 卡片格式化结束时间
        ysaccept_date: '', //卡片格式化承兑日期       
        return_date: '', //卡片格式化退票日期 
      };
    },
    methods: {
      // 获取票据详情明细数据
      getPjtzmxData: function (ys_or_yf_id, reportId, reportType) {
        var self = this;
        // 根据票据应收唯一id获取票据台帐明细详情
        if (reportType !== undefined) {
           self.flag = reportType;
        } else {
           self.flag = reportId == '1023';
        }
        
        var reqParams = self.reqParams;
        reqParams.ys_or_yf_id = ys_or_yf_id;
        reqParams.reportId = reportId;
        MAT.utils.getUrl('/gwzjjk/common/report/getReportObject', {
          params: JSON.stringify(reqParams)
        }, function (res) {

          //取出数据
          var esData = res.obj.esData || [];
          var generalList = res.obj.headerMap.generalList[0] || [];
          //定义展示数组
          var showData = [];

          //将值装入展示数组
          $.each(esData, function (esindex, esItem) {
            $.each(generalList, function (genindex, genItem) {
              showData.push({
                title: genItem.title,
                field_type: genItem.field_type,
                value: esItem[genItem.field]
              });
            })
          })
          self.showData = showData;

          // self.pjtzmxDetailInfo = res.obj.esData[0] || {};

          // if (self.flag) {
          //   if (self.pjtzmxDetailInfo.discount_rate == "") {
          //     self.discount_rate = "";
          //   } else {
          //     self.discount_rate = (parseInt(self.pjtzmxDetailInfo.discount_rate) * 100).toFixed(4) + ' %';
          //   }
          //   self.issue_date = self.formatdatetest(self.pjtzmxDetailInfo.issue_date);
          //   self.due_date = self.formatdatetest(self.pjtzmxDetailInfo.due_date);
          //   self.endorse_date = self.formatdatetest(self.pjtzmxDetailInfo.endorse_date);
          //   self.receive_date = self.formatdatetest(self.pjtzmxDetailInfo.receive_date);
          //   self.discount_date = self.formatdatetest(self.pjtzmxDetailInfo.discount_date);
          //   self.begin_time = self.formatdatetest(self.pjtzmxDetailInfo.begin_time);
          //   self.cdrq = self.formatdatetest(self.pjtzmxDetailInfo.cdrq);
          //   self.end_time = self.formatdatetest(self.pjtzmxDetailInfo.end_time);
          //   self.accept_date = self.formatdatetest(self.pjtzmxDetailInfo.accept_date);
          // } else {
          //   // todo
          //   self.ysissue_date = self.formatdatetest(self.pjtzmxDetailInfo.ysissue_date);
          //   self.ysdue_date = self.formatdatetest(self.pjtzmxDetailInfo.ysdue_date);
          //   self.ysbegin_time = self.formatdatetest(self.pjtzmxDetailInfo.ysbegin_time);
          //   self.yspay_date = self.formatdatetest(self.pjtzmxDetailInfo.yspay_date);
          //   self.ysend_time = self.formatdatetest(self.pjtzmxDetailInfo.ysend_time);
          //   self.ysaccept_date = self.formatdatetest(self.pjtzmxDetailInfo.ysaccept_date);
          // }
          var pjmxModalId = '#' + self.pjmxModalId;
          $(pjmxModalId).modal('show').appendTo('body');
        });
      },

      //判断合同基础信息字段类型（时间或是金钱）
      judgeBaseMesType: function (fieldType, value) {
        if (!value) {
          return '--';
        }
        if (fieldType == '3') {
          if (value.indexOf("3000") == -1) {
            return value.substring(0, 10);
          } else {
            return '--';
          }
        }
        if (fieldType == '4') {
          return formateMoney(value, this.metric);
        }
        return value;
      },

      // 金额格式化函数
      dividemoney: function (val) {
        if (val == "") {
          return "--";
        } else {
          console.log(formateMoney(val, this.metric));
          return formateMoney(val, this.metric);
        }
      },

      // 时间格式化函数
      formatdatetest: function (val) {
        if (val == "") {
          return;
        } else {
          var testdate = new Date(val).Format("yyyy-MM-dd");
        }
        return testdate;
      },
    }
  });
});