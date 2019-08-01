define([
  'utils/format-money',
], function (formatMoney) {
  var constant = {
    // 融资明细查询页面-模态框-pie数据
    pieChartOption: function pieChartOption(metric) {
      var metricName = {
        '1': '元',
        '10000': '万元',
        '100000000': '亿元',
        }
      return {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            var htmlString = "";
            htmlString +=
              params.seriesName + "<br/>" + params.name + ":" + formatMoney(params.value, metric) +metricName[metric]+ "(" + params.percent + "%)";
            return htmlString;
          }
        },
        series: [{
          name: '占比',
          type: 'pie',
          radius: ['40%', '60%'],
          color: ['#49abe6', '#40d1b7', '#99ce7e'],
          label: {
            normal: {
              show: true,
              fontsize: 12,
              color: '#737373'
            },
          },
          labelLine: {
            normal: {
              show: true,
            }
          },
          data: [],
        }]
      }
    },
    // 合同基础信息
    baseMsg: [{
      name: "二级单位",
      id: "lev2_shortname",
      value: ""
    },
    {
      name: "所属单位",
      id: "organ_name",
      value: ""
    },
    {
      name: "合同类型",
      id: "contract_type_id",
      value: ""
    },
    {
      name: "合同编号",
      id: "contract_code",
      value: ""
    },
    {
      name: "合同名称",
      id: "contract_name",
      value: ""
    },
    {
      name: "合同金额",
      id: "contract_money",
      value: ""
    },
    {
      name: "开始日期",
      id: "open_time",
      value: ""
    },
    {
      name: "终止日期",
      id: "close_time",
      value: ""
    },
    {
      name: "实际终止日期",
      id: "close_time",
      value: ""
    },
    {
      name: "融资机构",
      id: "rzbank_name",
      value: ""
    },
    {
      name: "融资方式",
      id: "rzfs_name",
      value: ""
    },
    {
      name: "担保性质",
      id: "sure_kind_name",
      value: ""
    },
    {
      name: "境内外融资",
      id: "home_or_abroad_name",
      value: ""
    },
    {
      name: "内外部融资",
      id: "in_or_outside_name",
      value: ""
    },
    {
      name: "融资用途",
      id: "rzuse_name",
      value: ""
    },
    ],
    // 计息信息
    jxInfo: [{
      name: "计息法",
      id: "jxf",
      value: ""
    },
    {
      name: "利率计算依据",
      id: "rate_cal_rule",
      value: ""
    },
    {
      name: "结息日",
      id: "jxr",
      value: ""
    },
    {
      name: "计息基数",
      id: "jxjs",
      value: ""
    },
    {
      name: "结息周期",
      id: "jxzq",
      value: ""
    },
    {
      name: "执行利率",
      id: "zxll",
      value: ""
    },
    ],
  };

  return constant;
});