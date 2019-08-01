define(['vue',
    'text!./index.html',
    './js/constant',
    'utils/format-date',
    'utils/format-money',
    'echarts',
    'js/gwzjjk-const',
    'utils/option-handler',
    'css!./css/htmx-modal.css'
], function (Vue, template, Constant, formatDate, formateMoney, echarts, ZJJK_CONST, optionHandler) {
    return Vue.extend({
        name: 'HtmxModal',
        template: template,
        props: {
            reqParams: {   // 合同详情请求参数
                type: Object,
                default: function () {
                    return {
                        reportId: '1016',
                        tday: '',
                        organ_id: '',
                        organName: '',
                        contract_id: '',
                        bizhong: '',
                    }
                }
            },
            htmxModalId: {  // modalID
                type: String,
                default: 'rzfxmx-modal'
            },
            metric: {  // 计量单位
                type: Number,
                default: 1
            }
        },
        data: function () {
            return {
                modalBizhong: 'sum_money', //币种 sum_money本 sum_money_wb原
                dkDataOfChart: [], // 到款chart-data
                hkDataOfChart: [], // 还款chart-data
                dkPieChart: null, // 到款echart
                hkPieChart: null, // 还款echart
                dkChartOption: null,//到款图option数据
                hkChartOption: null,//还款图option数据
                detailOfDkChart: {},//到款图表之上金额详情 wdkMoney未到款金额
                detailOfHkChart: {},//还款图表之上金额详情 wdkMoney未到款金额 bjye
                htDetailInfo: {}, // 合同详情
                showDkxx: true, // true:显示到款信息;false:显示还款信息
                htdkData: [], // 合同到款记录
                hthkData: [], // 合同还款记录
                baseMsg: [], //合同基础信息
                jxInfo: [], //计息信息
                esData: [],//全局
                generalList: [],//全局
                resOfPayOrRepay: {},//到还款全局res
                //到还款合计
                sumOfdhk: {
                    sumOfjhhk: '', // 预计还款合计
                    sumOfsjhk: '', // 实际还款合计
                    sumOfdkje: ''  //到款金额合计
                }
            };
        },
        mounted: function () {
            var self = this;
            optionHandler.loadtoolbox("dkPie-toolbox", "dkPieChart");
            optionHandler.loadtoolbox("hkPie-toolbox", "hkPieChart");
            //表格渲染
            if ($(".mat-table-normal")) {
                // 穿透单元格hover样式，指定某列高亮
                $(".mat-table-normal > table > tbody").on('click', 'tr', function () {
                    $(".mat-table-normal > table > tbody > tr").removeClass("penetrate-highlight");
                    $(this).addClass("penetrate-highlight");
                })
            }
            $('#' + self.htmxModalId).on('shown.bs.modal', function () {
                // 模态框渲染完成后请求数据渲染表格

                self.hkChartOptionCom();
                self.dkChartOptionCom();
                self.showDkxxTab(self.showDkxx);
            })
        },
        methods: {
            //导出
            detailInfoImport: function detailInfoImport() {
                var self = this;
                var expParam = {
                    constactId: self.reqParams.contract_id,
                    reportId: self.reqParams.reportId,
                    tday: self.reqParams.tday,
                    organName: self.reqParams.organName,
                    organ_id: self.reqParams.organ_id,
                    unit: self.metric,
                    unitName: Constant.metricName[self.metric],
                    showDkxx: self.showDkxx,
                    modalBizhong: self.modalBizhong,
                    isExp: 1,
                    serviceName: 'findRztzHtExportInfo'
                };
                var params = 'params=' + encodeURI(encodeURI(JSON.stringify(expParam)));
                var url = '/gwzjjk/ztfx/rzfx/exportExcel?' + params;
                MAT.utils.downloadFile(url);
            },
            // 模态框更换币种
            switchModalBizhong: function switchModalBizhong(val) {
                this.modalBizhong = val;
                this.dealDataByBizhong(this.esData, this.generalList)
                this.dealDatagridByBiz(this.resOfPayOrRepay);
            },
            // 还款日期显示
            computeHkDate: function computeHkDate(item) {
                if (!item) {
                    return '--'
                } else {
                    return this.formatHkDate(item['ywdate'])
                }
            },
            // 还款金额显示 到款金额显示
            computeHkMoney: function computeHkMoney(item) {
                var bizhong = this.modalBizhong;
                if (!item) {
                    return '--'
                } else {
                    return item[bizhong] ? formateMoney(item[bizhong], this.metric) : '--';
                }
            },
            //千分位
            formateMoneyPart: function formateMoneyPart(item) {
                return formateMoney(item, this.metric);
            },
            // 计算距离合同终止时间
            computeDate: function computeDate(closeTime) {
                var startDate = new Date(closeTime);
                //选择的时间
                var tday = this.reqParams.tday;
                tday = tday.substring(0, 4) + '/' + tday.substring(4, 6) + '/' + tday.substring(6);
                var tdayDate = new Date(tday);
                //三种情况为空
                if (!closeTime || closeTime.indexOf("3000") >= 0 || tdayDate > startDate) {
                    return '--';
                } else {
                    var endDate = new Date();
                    var sDate = Date.parse(startDate);
                    var eDate = Date.parse(endDate);
                    var dateSpan = sDate - eDate;
                    dateSpan = Math.abs(dateSpan);
                    var iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
                    return iDays;
                }
            },
            // 日期转换
            formatHkDate: function formatHkDate(val) {
                if (!val) {
                    return '--'
                } else {
                    return formatDate(new Date(val), 'YYYY-MM-dd');
                }
            },
            //初始化穿透图表
            showDkxxTab: function showDkxxTab(val) {
                var self = this;
                self.showDkxx = val;
                if (val) {
                    if (self.dkPieChart) {
                        self.dkPieChart.setOption(self.dkChartOption);
                    } else {
                        self.dkPieChart = echarts.init(document.getElementById('dkPieChart'));
                        self.dkPieChart.setOption(self.dkChartOption);
                    }
                } else {
                    if (self.hkPieChart) {
                        self.hkPieChart.setOption(self.hkChartOption);
                    } else {
                        self.hkPieChart = echarts.init(document.getElementById('hkPieChart'));
                        self.hkPieChart.setOption(self.hkChartOption);
                    }
                }
            },
            //判断合同基础信息字段类型（时间或是金钱）
            judgeBaseMesType: function (fieldType, value) {
                if (value === 0) {
                    return 0
                }
                if (!value || value === '') {
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
            // 还款chart
            hkChartOptionCom: function () {
                this.hkChartOption = Constant.pieChartOption(this.metric, this.hkDataOfChart, this.reqParams);
            },
            // 到款chart
            dkChartOptionCom: function () {
                this.dkChartOption = Constant.pieChartOption(this.metric, this.dkDataOfChart, this.reqParams);
            },
            // 获取合同详情明细数据
            getHtmxData: function getHtmxData(contractId) {
                var self = this;
                self.modalBizhong = self.reqParams.bizhong || 'sum_money';
                // 根据合同id获取合同详情
                self.reqParams.contract_id = contractId;
                if (self.reqParams.reportId == '1016') {
                    self.reqParams.needFields = Constant.needFields;
                }

                MAT.utils.getUrl('/gwzjjk/common/report/getReportObject', {
                    params: JSON.stringify(self.reqParams)
                }, function (res) {

                    self.esData = (res.obj.esData || [])[0] || {};
                    self.generalList = res.obj.headerMap.generalList[0] || [];
                    self.dealDataByBizhong(self.esData, self.generalList);

                    //更新图表
                    self.hkChartOptionCom();
                    self.dkChartOptionCom();
                    self.$nextTick(function () {
                        self.showDkxxTab(self.showDkxx);
                    })

                    $('.repay-table-body').perfectScrollbar();
                    $('.pay-table-body').perfectScrollbar();
                });

                // 请求合同到还款信息数据
                var dkParams = {
                    constactId: contractId
                };
                MAT.utils.getUrl('/gwzjjk/ztfx/rzfx/findRztzHtInfo', {
                    params: JSON.stringify(dkParams)
                }, function (res) {
                    self.resOfPayOrRepay = res;
                    self.dealDatagridByBiz(res);
                });
            },
            // 针对原本位币数据处理（基础信息和计息信息）
            dealDataByBizhong: function (dataObj, generalList) {
                var self = this;
                var esItem = dataObj;
                if (self.modalBizhong == 'sum_money_wb') {
                    esItem = JSON.parse(JSON.stringify(esItem));
                    esItem.bjye = dataObj.bjye_wb;
                    esItem.lj_dkje = dataObj.lj_dkje_wb;
                    esItem.lj_hkje = dataObj.lj_hkje_wb;
                    esItem.lj_jhhkje = dataObj.lj_jhhkje_wb;
                    esItem.accrual = dataObj.accrual_wb;
                    esItem.contract_money = dataObj.contract_money_wb;
                }

                //计算图表及之上的详情
                self.detailOfDkChart.wdkMoney = esItem.contract_money - esItem.lj_dkje;
                self.detailOfHkChart.bjye = esItem.bjye;
                self.detailOfHkChart.wdkMoney = esItem.contract_money - esItem.lj_dkje

                var dkDataOfChart = []; //到款pai图概要
                var hkDataOfChart = []; //还款pai图概要
                // $.each(esData, function (index, esItem) {
                dkDataOfChart = [{
                    value: esItem.lj_dkje,
                    name: '实际到款'
                },
                    {
                        value: esItem.contract_money - esItem.lj_dkje,
                        name: '未到款'
                    }];

                hkDataOfChart = [{
                    value: esItem.lj_hkje,
                    name: '实际还款'
                },
                    {
                        value: esItem.bjye - (esItem.lj_jhhkje - esItem.lj_hkje),
                        name: '未到期还款'
                    },
                    {
                        value: esItem.lj_jhhkje - esItem.lj_hkje,
                        name: '逾期未还款'
                    }];

                //定义基础信息
                var baseMsg = [];
                //定义计息信息
                var jxInfo = [];
                var generalList = generalList;
                //合同基础数据
                var jxInfoListId = Constant.jxInfoListId;
                var sumMoneyWb = Constant.sum_money_wb;
                $.each(generalList, function (index, genItem) {
                    if (genItem.field == "organ_name") {
                        baseMsg.push({
                            title: genItem.title,
                            field_type: genItem.field_type,
                            value: esItem.organ_name,
                        });
                    } else if (jxInfoListId.indexOf(genItem.field) < 0) {
                        if (sumMoneyWb.indexOf(genItem.field) < 0) {
                            baseMsg.push({
                                title: genItem.title,
                                field_type: genItem.field_type,
                                value: esItem[genItem.field],
                            })
                        }
                    } else {
                        jxInfo.push({
                            title: genItem.title,
                            field_type: genItem.field_type,
                            value: esItem[genItem.field],
                        })
                    }
                })
                // })
                //pai图去掉为零值
                var dkDataOfChartLen = dkDataOfChart.length;
                for (var i = 0; i < dkDataOfChartLen; i++) {
                    if (dkDataOfChart[i].value == 0) {
                        dkDataOfChart.splice(i, 1);
                        i--;
                        dkDataOfChartLen--;
                    }
                }
                //pai图去掉为零值
                var hkDataOfChartLen = hkDataOfChart.length;
                for (var i = 0; i < hkDataOfChartLen; i++) {
                    if (hkDataOfChart[i].value == 0) {
                        hkDataOfChart.splice(i, 1);
                        i--;
                        hkDataOfChartLen--;
                    }
                }
                self.dkDataOfChart = dkDataOfChart;
                self.hkDataOfChart = hkDataOfChart;
                self.baseMsg = baseMsg;
                self.jxInfo = jxInfo;

                // 模态框添加到body层
                var htmxModalId = '#' + self.htmxModalId;
                $(htmxModalId).modal('show').prependTo('body');


                //更新图表
                self.hkChartOptionCom();
                self.dkChartOptionCom();
                self.showDkxxTab(self.showDkxx);
            },
            //表格原本位币数据处理
            dealDatagridByBiz: function (res) {
                var self = this;
                // 显示合同到款信息
                var htdkData = res.obj.htEsData.htdk || [];
                var sumOfdkje = 0;
                $.each(htdkData, function (index, item) {
                    sumOfdkje += item[self.modalBizhong];
                });
                self.htdkData = htdkData;
                self.sumOfdhk.sumOfdkje = sumOfdkje;

                // 合同还款
                var htsjhkData = res.obj.htEsData.htsjhk || [];
                var htjhhkData = res.obj.htEsData.htjhhk || [];
                var hthkData = [];
                var sumOfjhhk = 0;
                var sumOfsjhk = 0;
                //计划还款
                $.each(htjhhkData, function (jhIndex, jhItem) {
                    hthkData.push({
                        jhhk: jhItem
                    });
                    sumOfjhhk += jhItem[self.modalBizhong];
                });
                //实际还款
                $.each(htsjhkData, function (sjIndex, sjItem) {
                    if (!hthkData[sjIndex]) {
                        hthkData.push({
                            sjhk: sjItem
                        });
                        sumOfsjhk += sjItem[self.modalBizhong];
                    } else {
                        hthkData[sjIndex]['sjhk'] = sjItem;
                        sumOfsjhk += sjItem[self.modalBizhong];
                    }
                });
                self.sumOfdhk.sumOfjhhk = sumOfjhhk;
                self.sumOfdhk.sumOfsjhk = sumOfsjhk;
                self.hthkData = hthkData;
            }
        },
    });
});