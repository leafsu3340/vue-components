define(['vue',
  'text!./index.html',
  'components/datepicker/index',
  'utils/format-date',
  'css!./css/zhmx-modal.css',
  'css! css/zjjk-common.css', 
], function (Vue, template, DatePicker, formatDate) {
  return Vue.extend({
    name: 'ZhmxModal',
    template: template,
    components: {
    	'date-picker': DatePicker
    },
    props: {
      reqParams: { // 合同详情请求参数
        type: Object,
        default: function () {
          return {
            reportId: '1025',
            tday: '',
            organ_id: '',
            account_id: '',
          }
        }
      },
      zhmxModalId: { // modalID
        type: String,
        default: 'zhmx-modal'
      },
      showdzcx: {  //是否显示对账查询
    	type: Boolean,
    	default: true
      },
      contentHeight: {
        type: Number,
        default: 500
      },
      metric: { // 计量单位
        type: Number,
        default: 1
      },
      colorTheme: {
        // 颜色主题参数  green-dark-theme：绿黑主题
        type: String,
        default: ''
      },
      accountCheck: {
        // 对账查询功能显示与否
        type: Boolean,
        default: true
      }
    },
    data: function () {
      return {
        zhtzmxDetailInfo: {}, //   账户台帐明细弹出框信息 
        kpkhrq: '', //卡片 格式化后开户日期
        kpxhrq: '', //卡片 格式化后销户日期
        sqrq: '', //卡片 格式化后授权日期
        is_jw: '0',
      };
    },
    methods: {
    	getObj: function () {
    		var dllToolObj = null;
    		if (window.addEventListener) {
    			dllToolObj = document.getElementById("dlltool");
    			if(dllToolObj == null) {
    				dllToolObj = document.createElement("embed");
    			}
    			dllToolObj.id = "dlltool";
    			dllToolObj.type = "application/rpygtooljs";
    			dllToolObj.width = 1;
    			dllToolObj.height = 1;
    			var ddd = document.getElementsByTagName("BODY");
    			ddd[0].appendChild(dllToolObj);
    		} else {
    			dllToolObj = new ActiveXObject('dllAdapter.dllAdapter');
    			dllToolObj.utf8 = 0;
    		}
    		return dllToolObj;
    	},
    	
    	runExe: function (fieldName, params) {
    	    if(params == null){
    	        params = "";
    	    }
    	    var obj = this.getObj();
    		obj.runExe(fieldName + "\0", params + "\0");
    	},
    	//获取对账查询的年月日期
		onDzcxDateChange: function(val) {
			var _self = this;
			if(val){				
				var reqParams = {
					// 单位ID 
					compid : _self.zhtzmxDetailInfo.organ_id,
					// 账号
					dxdm : _self.zhtzmxDetailInfo.account,
					// 对账期间
					dzym : val.replaceAll("-", "").substring(0, 6)
				};
				var url = "/gwzjjk/common/relationQuery/getReconciliations";
				var params = {
		          params : JSON.stringify(reqParams)
		        };				
				MAT.utils.getUrl(url, params, function (res) {
					if(res.code == 200) {
						var url = res.msg;
						if(!url || ("账号在系统中不存在" == url)) {
							MAT.utils.notific("账号在系统中不存在", "warn");
						} else {
							_self.runExe("iexplore.exe", url);
						}						
					}
		        });
			}
		},
    	
       // 获取合同详情明细数据
      getZhmxData: function (accountId) {
        var self = this;
        // 根据合同id获取合同详情
        var reqParams = self.reqParams;
        reqParams.account_id = accountId;
        MAT.utils.getUrl('/gwzjjk/common/report/getReportObject', {
          params: JSON.stringify(reqParams)
        }, function (res) {
          self.zhtzmxDetailInfo = res.obj.esData[0] || {};
          self.is_jw = self.zhtzmxDetailInfo.is_jwzh;
          self.kpkhrq = self.formatdatetest(self.zhtzmxDetailInfo.open_account_time);
          self.kpxhrq = self.formatdatetest(self.zhtzmxDetailInfo.close_account_time);
          self.sqrq = self.formatdatetest(self.zhtzmxDetailInfo.accredit_time);
          var zhmxModalId = '#' + self.zhmxModalId;
          $(zhmxModalId).modal('show').appendTo('body');
        });
      },
      formatdatetest: function formatdatetest(val) {
        if (val == "") {
          return;
        } else {
          var testdate = new Date(val).Format("yyyy-MM-dd");
        }
        if (testdate == "3000-01-01") {
        	testdate = "--";
        }
        return testdate;
      },
    }
  });
});