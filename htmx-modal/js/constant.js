define([
    'utils/format-money',
], function (formatMoney) {
    var constant = {
        // 融资明细查询页面-模态框-pie数据
        pieChartOption: function pieChartOption(metric, seriesData, globalParams) {
            var metricName = {
                '1': '元',
                '10000': '万元',
                '100000000': '亿元',
            }
            if (seriesData.length <= 0) {
                return {
                	excelTitle: '融资合同全生命信息',
                	globalParams: globalParams,
                	metric: [metricName[metric]],
                    title: {
                        text: '暂无数据',
                        x: 'center',
                        y: 'center',
                        textStyle: {
                            color: '#eaeaea',
                            fontFamily: 'MicroSoft Yahei',
                            fontSize: '18',
                        }
                    },
                    tooltip: {
                        show: false
                    },
                    series: {
                        name: '金额',
                        type: 'pie',
                        radius: ['40%', '60%'],
                        color: ['#eaeaea', '#eaeaea', '#eaeaea'],
                        label: {
                            normal: {
                                show: true,
                                fontsize: 12,
                                color: '#333333'
                            },
                        },
                        labelLine: {
                            normal: {
                                show: true,
                            }
                        },
                        data: [0],
                    }
                }
            } else {
                return {
                	excelTitle: '融资合同全生命信息',
                	globalParams: globalParams,
                	metric: [metricName[metric]],
                    title: {
                        show: false
                    },
                    toolbox: {
                        show: false,
                        feature: {
                            dataView: {show: true, readOnly: false},
                            saveAsImage: {show: true}
                        },
                    },
                    tooltip: {
                        show: true,
                        trigger: 'item',
                        formatter: function (params) {
                            var htmlString = "";
                            htmlString +=
                                params.seriesName + "<br/>" + params.name + ":" + formatMoney(params.value, metric) + metricName[metric] + "(" + params.percent + "%)";
                            return htmlString;
                        }
                    },
                    series: {
                        name: '金额',
                        type: 'pie',
                        radius: ['40%', '60%'],
                        color: ['#49abe6', '#40d1b7', '#99ce7e'],
                        label: {
                            normal: {
                                show: true,
                                fontsize: 12,
                                color: '#333333'
                            },
                        },
                        labelLine: {
                            normal: {
                                show: true,
                            }
                        },
                        data: seriesData,
                        formatterData: [formatMoney]
                    }
                }
            }
        },
        metricName: {
            '1': '元',
            '10000': '万元',
            '100000000': '亿元',
        },
        //计息id
        jxInfoListId: ["jxf", "rate_cal_rule", "jxr", "jxjs", "jxzq", "zxll", "accrual"],
        //原币
        sum_money_wb: ["bjye_wb", "lj_dkje_wb", "lj_hkje_wb", "lj_jhhkje_wb", "accrual_wb", "contract_money_wb"],
        // //本位币
        // sum_money:["bjye", "lj_dkje", "lj_hkje", "lj_jhhkje","accrual","contract_money"],
        //融资台账模态框所需字段
        needFields: '402,403,404,405,406,407,408,409,876,410,411,412,413,414,415,416,417,418,419,420,421,422,871,872,873,874,875,897,426,425,423,482,479,867,778,779,478,480,877,878,424,485,1110,1103,1105,1106,1104,1107,2188,2209',
    };
    return constant;
});