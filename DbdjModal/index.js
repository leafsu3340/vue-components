/**
 * 督办单据模态框
 */
define(['vue', 'upload',
  'text!./index.html',
  'utils/format-date',
  'utils/page-params',
  'utils/handle-loginContent',
  'utils/format-money',
  './js/dbdj-const',
  'js/gwzjjk-const',
  './js/ajaxFileUpload',
  'css!./css/dbdj-modal.css'
], function (Vue, upload, template, formatDate,
  pageParams, handleLoginContent, formatMoney,
  DBDJ_CONST, ZJJK_CONST, ajaxFileUpload) {
  return Vue.extend({
    name: 'DbdjModal',
    template: template,
    props: {
      tday: { // tday
        type: String,
        default: ''
      },
      dbdjModalId: { // 模态框ID
        type: String,
        default: 'dbdj-modal'
      },
      modalTitle: { // modal-title
        type: String,
        default: '风险督办通知单'
      },
      metric: { // 计量单位
        type: Number,
        default: 1
      },
      dbdjModalParam: { // 督办单据模态框参数
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    data: function data() {
      return {
        businessInfo: [], // 业务信息
        ruleItems: [], // 规则信息
        dealPersons: [], // 处理人列表
        selectedPersons: [], // 已选处理人
        configPersons: [], // 确定处理人
        launchData: {}, // 发起环节数据
        showPersonPanel: false, // 显示处理人选择面板
        showPopover: false, // 显示处理人提示框
        // popoverInfo: {}, // 提示框信息
        feedbackListNames: DBDJ_CONST.feedbackListNames, // 反馈下拉框名称
        feedbackList: DBDJ_CONST.feedbackList, // 反馈下拉框名称列表
        feedbackSituation: DBDJ_CONST.feedbackSituation, // 反馈情况
        auditSituation: DBDJ_CONST.auditSituation,
        fkqkNames: DBDJ_CONST.fkqkNames, // 反馈情况名称
        fklsArray: [], // 反馈历史
        shlsArray: [], // 审核历史
        replyComment: '', // 回复的讨论信息
        toUserName: '', // 评论指定人
        toUserId: '', // 回复的用户ID
        toForumSq: '', // 回复的评论顺序号
        toOrganid: '', // 回复的用户所属单位ID
        toOrganname: '', // 回复的用户所属单位名
        searchPerson: '', // 处理人面板搜索框
        fkTime: '', // 反馈时间
        fkOpinion: '', // 反馈意见
        initFkOpinion: '', // 初始化意见
        discussArray: [], // 讨论数据
        initPersons: [], // 初始人员
        groupMap: {}, // roleids
        currentFkInfo: {}, // 最新的风险单位反馈情况
        currentShInfo: {}, // 最新的风险单位审核情况
        initSelectedUserids: [], // 初始人员userid集合
        uploadFileNames: [], // 上传的文件名
        uploadFiles: [], // 上传的文件
        initFiles: [], // 初始化文件
        deleteFileGuids: [], // 删除的文件guid
        deleteFiles: [], // 删除的原文件
        dbdjStatus: '1', // 风险督办状态:1-未发起、2-待反馈、4-待审核、8-系统关闭，16-督办关闭，32-非风险, 63-全部，默认1-未发起
        businessObj: {}, // 业务信息对象
        fklsPageIndex: 0,
        shlsPageIndex: 0,
        fxdjClass: DBDJ_CONST.fxdjClass, // 风险等级样式
        fxdjText: DBDJ_CONST.fxdjText, // 风险等级文本
        dbdjStatusClass: DBDJ_CONST.dbdjStatusClass, // 督办单据状态样式
        dbdjStatusText: DBDJ_CONST.dbdjStatusText, // 督办单据状态文本
        showClrPanel: false,
        showFilePanel: false,
        disabledSave: false,
        userInfo: {} // 展示的用户信息
      };
    },
    created: function () {
      ajaxFileUpload.ajaxFile();
    },
    mounted: function () {
      var self = this;
      var modalId = '#' + self.dbdjModalId;
      $(modalId).on('shown.bs.modal', function () {
        // 模态框渲染完成后,更新岗位下拉选择器
        if (self.isYj !== 1) {
          $('.yj-position').hide();
        } else {
          $('.yj-position').show();
        }
        // 系统关闭、督办关闭情况下不允许编辑
        if (self.dbdjEditable) {
          $('.feedback-input').removeAttr("disabled");
          $('.feedback-container .arrow-down').show();
          // 对没权限操作的feek-back-input 设置 disabled
          $('.disabled-feekback').attr("disabled", "disabled");
          $('.hide-angle-down').hide();
        } else {
          $('.feedback-input').attr("disabled", "disabled");
          $('.feedback-container .arrow-down').hide();
        }
      });
    },
    methods: {
      splitSpace: function (item) {
        return (item + '').split(' ')[0];
      },
      // 验证输入框文字长度
      verifyWordLength: function (word) {
        if (word.length >= 300) {
          MAT.utils.notific('字数超过300汉字，请修改内容后提交。', 'warn');
        }
      },
      // 人员信息提示框
      lsdiusMouseover: function (type, showItem, e) {
        var target = e.currentTarget;
        var userName = (type == 'discuss') ? (showItem.username || '--') : (showItem.showname || '--');
        var organName = (type == 'discuss') ? (showItem['u_organname'] || '--') : (showItem.name || '--');
        var html = "<div title=\"" + userName + "\" class=\"userName\">" +
          userName +
          "</div><div class=\"subItem\">" +
          "  <div class=\"itemIco dep\"></div>" +
          "  <div title=\"" + organName + "\" class=\"itemVal\">" +
          organName +
          "</div></div>" +
          "<div class=\"subItem\">" +
          "  <div class=\"itemIco pos\"></div>" +
          "  <div title=\"" + (showItem.position || '--') + "\" class=\"itemVal\">" + (showItem.position || '--') + "</div>" +
          "</div>" +
          "<div class=\"subItem\">" +
          "  <div class=\"itemIco eml\"></div>" +
          "  <div title=\"" + (showItem.mail || '--') + "\" class=\"itemVal\">" + (showItem.mail || '--') + "</div>" +
          "</div>" +
          "<div class=\"subItem\">" +
          "  <div class=\"itemIco tph\"></div>" +
          "  <div title=\"" + (showItem.mobilephone || '--') + "\" class=\"itemVal\">" + (showItem.mobilephone || '--') + "</div>" +
          "</div>";
        if (type == 'fkls' || type == 'shls') {
          var content = showItem.content || '--';
          if (content.length > 35) {
            content = content.substring(0, 35) + "...";
          }
          html += "<div class=\"subItem\" title=\"" + showItem.content + "\">" +
            "<div class=\"itemIco xxs\"></div>" +
            "<div class=\"itemVal\">" + content + "</div>" +
            "</div>";
        }
        $("#user-info").html(html);
        tooltip.pop(target, '#user-info', {
          position: (type == 'discuss') ? 1 : 0,
          offsetY: (type == 'discuss') ? 5 : 22,
          offsetX: (type == 'discuss') ? -20 : 0,
          effect: 'slide'
        });
      },
      // 显示的文件名
      showFileName: function (file) {
        var fileName = '';
        var tempName = file.tempname;
        if (!tempName) {
          fileName = file.filename + '.' + file.keyid;
        } else {
          fileName = file.filename;
        }
        return fileName;
      },
      // 千分位格式化金额
      formatShowMoney: function (val) {
        if (!val) {
          return val;
        } else {
          return formatMoney(val, this.metric) + ZJJK_CONST.metricMoneyNames[this.metric];
        }
      },
      // 检查上传文件大小
      checkFile: function (obj) {
        var self = this;
        var fileName = obj.name;
        var fileSize = obj.size;
        if ($.inArray(fileName, self.uploadFileNames) > -1) {
          MAT.utils.notific("您已上传过此文件，请重新选择！", 'warn');
          return true;
        }
        var size = fileSize / 1024;
        if (size > 4000) {
          MAT.utils.notific("附件大小不能超过4M，请重新上传！", 'warn');
          return true;
        }
        return false;
      },
      // 上传文件
      fileUpload: function (e) {
        var self = this;
        $.upload({
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          url: MAT.utils.getContextPath() + '/rest/gwzjjk/fxgl/file/upload',
          prepareFn: function (e) {
            if (self.checkFile(e)) {
              return false;
            }
            return true;
          },
          successFn: function (res) {
            if (res.msg.indexOf("【") > -1) {
              MAT.utils.notific(res.msg);
            }
            var data = res.obj || [];
            var fileName = "";
            for (var i = 0, len = data.length; i < len; i++) {
              fileName = data[i].filename;
              if ($.inArray(fileName, self.uploadFileNames) > -1) {
                continue;
              }
              // 督办单ID赋值
              data[i].dbdid = self.dbdjModalParam.taskid;
              self.uploadFileNames.push(fileName);
              self.uploadFiles.push(data[i]);
            }
          },
          errorFn: function (e) {
            console.log(e);
          }
        });
      },
      // 下载文件
      downloadFile: function (file) {
        var fileName = '';
        var tempName = file.tempname;
        if (!tempName) {
          fileName = file.filename + '.' + file.keyid;
        } else {
          fileName = file.filename;
        }
        var relativePath = file.urlfj;
        var reqParam = {
          fileName: fileName,
          relativePath: relativePath,
          tempName: tempName
        };
        // 请求
        var params = 'params=' + encodeURI(encodeURI(JSON.stringify(reqParam)));
        var action = "/rest/gwzjjk/fxgl/file/download?" + params;
        MAT.utils.downloadFile(action);
      },
      // 删除初始化文件
      deleteInitFile: function (fileIndex, file) {
        this.initFiles.splice(fileIndex, 1);
        this.deleteFiles.push(file);
        this.deleteFileGuids.push(file.guid);
      },
      // 删除上传的文件
      deleteAddFile: function (fileIndex, file) {
        this.uploadFiles.splice(fileIndex, 1);
        this.uploadFileNames.splice(fileIndex, 1);
        this.deleteFileGuids.push(file.guid);
      },
      /**
       * 通知单预览
       */
      exportWord: function () {
        var preview = this.ruleItems[0].preview;
        var params = this.ruleItems[0].params;
        var reqParam = {};
        // 部门名称
        reqParam.bmmc = this.exportWordBmmc;
        // 预览内容
        reqParam.content = this.formatContent(preview, params);
        // 规则名称
        reqParam.rules_name = this.ruleItems[0].rules_name;
        // 督办单号
        reqParam.ywkey = this.launchData.ywkey;
        // 发起人名称
        reqParam.fqr_name = this.launchData.username;
        // 发起人组织机构名称
        reqParam.fqr_organname = this.launchData.pend_organname;
        // 单位名称
        reqParam.organname = this.businessMap.organname;
        // 请求
        var params = 'params=' + encodeURI(encodeURI(JSON.stringify(reqParam)));
        var action = "/rest/gwzjjk/fxgl/file/exportWord?" + params;
        MAT.utils.downloadFile(action);
      },
      /**
       * 督办预览内容转换.
       * 
       * @param preview 预览内容.
       * @param params  参数.
       */
      formatContent: function (preview, params) {
        if (params) {
          var arr = params.split(",");
          var len = arr.length;
          var key = "";
          var val = "";
          for (var i = 0; i < len; i++) {
            key = arr[i];
            // 高风险支付监控FIXME
            if (key == 'risk_desc') {
              var desc = [];
              if (this.businessMap['is_large_id'] == '1') {
                desc.push('大额');
              }
              if (this.businessMap['is_repeat_id'] == '1') {
                desc.push('重复');
              }
              if (this.businessMap['is_con_acc_id'] == '1') {
                desc.push('账外');
              }
              if (this.businessMap['is_out_acc_id'] == '1') {
                desc.push('未达');
              }
              preview = preview.replace('risk_desc', desc.join('、'));
              continue;
            }
            if (this.businessMapType[key] == '4') {
              val = formatMoney(this.businessMap[key], this.metric);
            } else {
              val = this.businessMap[key];
            }
            preview = preview.replace(key, val);
          }
        }
        if (preview.indexOf("metric") > -1) {
          preview = preview.replace(/metric/g, ZJJK_CONST.metricMoneyNames[this.metric]);
        }
        return preview;
      },
      // 格式化时间戳
      formatTimestamp: function (time) {
        if (!time) {
          return '--'
        } else {
          return formatDate(new Date(time), 'YYYY-MM-dd HH:mm:ss');
        }
      },
      // 校验反馈无意见
      verifyUnOpinion: function (val) {
        if (val === '' || val === 4 || val === undefined) {
          return true;
        } else {
          return false;
        }
      },
      // 输入讨论框 @username 显示
      formatToUser: function (toUsername) {
        if (!toUsername) {
          return toUsername;
        } else {
          return '@' + toUsername + ' ';
        }
      },
      // 更改反馈状态
      changeFeedback: function (feedback, backItem, feedBackIndex) { // 更改反馈意见
        var newObj = this.feedbackSituation[feedBackIndex];
        newObj.value = backItem.value;
        newObj.valTitle = backItem.title;
        this.$set(this.feedbackSituation, feedBackIndex, newObj);
        if (feedback.serial == 6) {
          this.currentFkInfo.userid = this.loginContent.id;
        }
      },
      // 更改审核状态
      changeExamine: function (auditItem, audit, auditIndex) { // 更改审核意见
        var newObj = this.auditSituation[auditIndex];
        newObj.value = audit.value;
        newObj.valTitle = audit.title;
        this.$set(this.auditSituation, auditIndex, newObj);
        if (auditItem.serial == 6) {
          this.currentShInfo.userid = this.loginContent.id;
        }
      },
      // 更新反馈情况
      updateFeedbackSituation: function (initSituation, groupMap) {
        var self = this;
        $.each(self.feedbackSituation, function (fIndex, fItem) {
          fItem.value = initSituation[fItem.field];
          fItem.initValue = initSituation[fItem.field];
          fItem.valTitle = self.feedbackListNames[initSituation[fItem.field]];
          fItem.roleid = groupMap[fItem.roleField];
          self.$set(self.feedbackSituation, fIndex, fItem);
        })
      },
      // 更新审核情况
      updateExamineSituation: function (initSituation, groupMap) {
        var self = this;
        $.each(self.auditSituation, function (aIndex, aItem) {
          aItem.value = initSituation[aItem.field];
          aItem.initValue = initSituation[aItem.field];
          aItem.valTitle = self.feedbackListNames[initSituation[aItem.field]];
          aItem.roleid = groupMap[aItem.roleField];
          self.$set(self.auditSituation, aIndex, aItem);
        })
      },
      // 回复评论
      triggerReply: function (chatItem) {
        this.toUserId = chatItem['userid'];
        this.toUserName = chatItem.username;
        this.replyComment = '@' + chatItem.username + ' ';
        this.toForumSq = chatItem['forumsq'];
        this.toOrganid = chatItem['u_organid'];
        this.toOrganname = chatItem['u_organname'];
      },
      // 插入消息
      insertDiscuss: function () {
        var self = this;
        if (!this.replyComment.trim()) {
          return false;
        }
        var reqParam = {
          taskid: this.dbdjModalParam.taskid,
          rulesid: this.dbdjModalParam.rulesid,
          userid: this.loginContent.id,
          username: this.loginContent.showname,
          u_organid: this.rootOrganId,
          u_organname: this.organMap[this.rootOrganId],
          comments: this.replyComment.replace('@' + this.toUserName + ' ', ''),
          is_reply: this.isReply, // 是否回复：0-发起评论，1-回复
          to_userid: this.toUserId,
          to_username: this.toUserName,
          to_u_organid: this.toOrganid,
          to_u_organname: this.toOrganname,
          to_forumsq: this.toForumSq,
        };
        MAT.utils.postUrl('/rest/gwzjjk/fxgl/supervise/insertDiscuss', {
          params: JSON.stringify(reqParam)
        }, function (res) {
          $('#dbdjChatDiv').scrollTop(0);
          self.replyComment = '';
          // 重新获取讨论信息
          self.getDiscuss();
        })
      },
      // 获取讨论信息
      getDiscuss: function () {
        var self = this;
        var reqParam = {
          taskid: this.dbdjModalParam.taskid
        };
        MAT.utils.getUrl('/rest/gwzjjk/fxgl/supervise/getDiscussInfo', {
          params: JSON.stringify(reqParam)
        }, function (res) {
          var discussArray = res.obj || [];
          self.discussArray = discussArray.sort(function (a, b) {
            return b.forumsq - a.forumsq;
          })
        })
      },
      // 更新讨论信息(更新为已读)
      updateDiscuss: function () {
        var reqParam = {
          taskid: this.dbdjModalParam.taskid,
          to_userid: this.loginContent.id
        };
        MAT.utils.postUrl('/rest/gwzjjk/fxgl/supervise/updateDiscuss', {
          params: JSON.stringify(reqParam)
        }, function (res) {})
      },
      /**
       * 获取督办单数据并初始化模态框
       */
      getDbdjData: function (params) {
        var self = this;
        var dbdjModalParam = {};
        // 初始化数据
        if (params) {
          dbdjModalParam = params;
          self.dbdjModalParam = params;
        } else {
          dbdjModalParam = self.dbdjModalParam;
        }
        // 初始化页面数据
        $.extend(this.$data, this.$options.data());
        MAT.utils.getUrl('/rest/gwzjjk/fxgl/supervise/getSuperviseObject', {
          params: JSON.stringify(dbdjModalParam)
        }, function (res) {
          // 更新消息已读
          self.updateDiscuss();
          // 业务信息
          var resObj = res.obj || {};
          self.businessObj = resObj.business || {};
          self.businessInfo = self.businessObj.business || [];
          self.dbdjStatus = self.businessObj.status || '1';
          self.ruleItems = self.businessObj.rule || [];
          // 处理人员
          var handling = resObj.handling || {};
          // 待选全部处理人
          self.dealPersons = handling.person || [];
          // 已选择处理人
          self.initPersons = handling.selected || [];
          // 默认选择处理人
          var defaultPersons = handling.default || [];
          self.computeSelectedPersons(self.dealPersons, self.initPersons, defaultPersons);
          // [1 - 督办未发起, 32-非风险]  未发起时默认发起人为当前用户
          if (self.isLaunchStatus) {
            self.launchData = {
              username: '--',
              organname: dbdjModalParam.riskOrganname,
              comments: '',
              stime: ''
            }
          } else {
            self.launchData = (resObj.launch || [])[0] || {};
          }
          // 附件
          self.initFiles = resObj.enclosure || [];
          // 反馈、审核历史
          self.fklsArray = resObj.feedback || [];
          self.fklsPageIndex = self.fklsPages === 0 ? 0 : (self.fklsPages - 1);
          self.computeShowFkInfo(self.fklsArray);
          self.shlsArray = resObj.toexamine || [];
          self.shlsPageIndex = self.shlsPages === 0 ? 0 : (self.shlsPages - 1);
          self.computeCurrentExamine(self.shlsArray);
          var discussArray = resObj.discuss || [];
          self.discussArray = discussArray.sort(function (a, b) {
            return b.forumsq - a.forumsq;
          })
          // 用户组角色ID处理
          var groupArr = resObj.groupid || [];
          var groupMap = {};
          $.each(groupArr, function (idx, item) {
            groupMap[item.csmc] = item.csz
          })
          self.groupMap = groupMap;
          // 反馈情况
          self.updateFeedbackSituation(self.fklsArray[0] || {}, groupMap);
          self.updateExamineSituation(self.shlsArray[0] || {}, groupMap);
          self.fkTime = formatDate(new Date(), 'YYYY-MM-dd HH:mm:ss');
          if (self.isYj !== 1) {
            $('.yj-position').hide();
          } else {
            $('.yj-position').show();
          }
          // 显示模态框
          $('#' + self.dbdjModalId).modal('show').prependTo('body');
        })
      },
      // 最近的风险单位审核信息
      computeCurrentExamine: function (shlsArray) {
        var currentShInfo = {};
        $.each(shlsArray, function (idx, item) {
          if (item.fkstep == 6) {
            currentShInfo = item;
            return false;
          }
        })
        this.currentShInfo = currentShInfo;
      },
      // 最近的风险单位反馈信息(显示到反馈情况中)
      computeShowFkInfo: function (fklsArray) {
        var showInfo = {};
        $.each(fklsArray, function (idx, fItem) {
          if (fItem.fkstep == 6) {
            showInfo = fItem;
            return false;
          }
        })
        this.currentFkInfo = showInfo;

        // 最新的反馈意见
        var currentOpinion = '';
        $.each(fklsArray, function (idx, fItem) {
          if (fItem.content.indexOf("新增反馈意见：") > -1) {
            currentOpinion = fItem.content;
            return false;
          }
        })

        this.fkOpinion = (currentOpinion || '')
          .replaceAll("修改为：'非风险';", "")
          .replaceAll("修改为：'整改中';", "")
          .replaceAll("修改为：'已整改';", "")
          .replaceAll("修改为：'不可整改';", "")
          .replaceAll("修改为：", "")
          .replaceAll("新增反馈意见：", "")
          .replaceAll("'", "")
          .replaceAll(";", "");
        this.initFkOpinion = this.fkOpinion;
      },
      // 计算已选择的处理人
      computeSelectedPersons: function (dealPersons, initPersons, defaultPersons) {
        var initSelectedUserids = [];
        var configPersons = [];
        // 未发起或非风险、已选择人员为空时，取默认处理人员
        if (this.isLaunchStatus || initPersons.length === 0) {
          $.each(defaultPersons, function (idx, user) {
            initSelectedUserids.push(user.id);
          });
          configPersons = defaultPersons;
        } else {
          $.each(initPersons, function (idx, user) {
            initSelectedUserids.push(user.userid);
          });
          $.each(dealPersons, function (idx, person) {
            if (initSelectedUserids.indexOf(person.id) > -1) {
              configPersons.push(person);
            }
          });
        }
        this.initSelectedUserids = initSelectedUserids;
        this.configPersons = configPersons;
      },
      // 选择处理人
      selectDealPerson: function (person, index) {
        if (!person.selected) {
          this.selectedPersons.push(person);
        } else {
          var selectedIndex = this.selectedPersonIds.indexOf(person.id);
          this.selectedPersons.splice(selectedIndex, 1);
        }
      },
      // 删除处理人
      deleteDealPerson: function (person, index) {
        var selectedIndex = this.selectedPersonIds.indexOf(person.id);
        this.selectedPersons.splice(selectedIndex, 1);
        this.configPersons.splice(index, 1);
      },
      // 完成处理人选择面板
      confirmPersonPanel: function () {
        this.showPersonPanel = false;
        this.configPersons = this.selectedPersons.concat();
      },
      // 退出处理人选择面板
      cancelPersonPanel: function () {
        this.showPersonPanel = false;
      },
      // 打开处理人面板
      openPersonPanel: function () {
        this.showPersonPanel = true;
        this.searchPerson = '';
        this.selectedPersons = this.configPersons.concat();
      },
      // 保存督办单
      saveSupervise: function (actionType) {
        var self = this;
        if (this.disabledSave) {
          return;
        }
        this.disabledSave = true;
        var dbdjStatus = '';
        switch (actionType) {
          // 风险督办状态:1-未发起、2-待反馈、4-待审核、8-系统关闭，16-督办关闭，32-非风险,63-全部，默认1-未发起
          case 'save': // 保存
            if (!this.isAdjustInfo) {
              MAT.utils.notific('没有调整督办信息，请调整后保存', 'warn');
              this.disabledSave = false;
              return false;
            }
            if ((this.feedbackSteps.length > 0) ||
              (this.toExamineSteps.length > 0)) {
              dbdjStatus = '4'
            } else {
              dbdjStatus = this.dbdjStatus;
            }
            // 系统自动关单条件校验
            if (this.autoCloseDbd) {
              dbdjStatus = '8'
            }
            break;
          case 'launch': // 发起
            if (!this.verifyLaunchAuthority) {
              MAT.utils.notific('您暂无权限发起该风险督办单，请联系系统管理员！', 'warn');
              this.disabledSave = false;
              return false;
            }
            if ((this.feedbackSteps.length > 0) ||
              (this.toExamineSteps.length > 0)) {
              dbdjStatus = '4'
            } else {
              dbdjStatus = '2'
            }
            // 系统自动关单条件校验
            if (this.autoCloseDbd) {
              dbdjStatus = '8'
            }
            break;
          case 'reLaunch': // 重新发起
            dbdjStatus = '4'
            break;
          case 'close': // 关闭
            // 督办关闭条件校验(风险单位、二级财务、二级运监)
            if (this.isYj === 1) {
              if (this.verifyUnOpinion(this.fkSituation.fk6) || this.verifyUnOpinion(this.shSituation.sh6)) {
                MAT.utils.notific('不满足“风险单位必须填写反馈状态和审核状态”，请联系风险单位处理。', 'warn');
                this.disabledSave = false;
                return false;
              }
              if (this.verifyUnOpinion(this.dbSituation.db5)) {
                MAT.utils.notific('不满足“二级财务反馈状态和审核状态必须填写一项”，请联系二级财务处理。', 'warn');
                this.disabledSave = false;
                return false;
              }
              if (this.verifyUnOpinion(this.dbSituation.db2)) {
                MAT.utils.notific('不满足“二级运监反馈状态和审核状态必须填写一项”，请联系二级运监处理。', 'warn');
                this.disabledSave = false;
                return false;
              }
            } else {
              if (this.verifyUnOpinion(this.fkSituation.fk6) &&
                this.verifyUnOpinion(this.fkSituation.fk4) &&
                this.verifyUnOpinion(this.fkSituation.fk5)) {
                MAT.utils.notific('不满足反馈环节“风险单位、二级财务、总部财务必须填写一项”，请联系对应单位处理。', 'warn');
                this.disabledSave = false;
                return false;
              }
              if (this.verifyUnOpinion(this.shSituation.sh6) &&
                this.verifyUnOpinion(this.shSituation.sh4) &&
                this.verifyUnOpinion(this.shSituation.sh5)) {
                MAT.utils.notific('不满足审核环节“风险单位、二级财务、总部财务必须填写一项”，请联系对应单位处理。', 'warn');
                this.disabledSave = false;
                return false;
              }
            }
            // 海投
            if (this.businessMap['is_jwzh'] == '1') {
              if (this.verifyUnOpinion(this.dbSituation.db7)) {
                MAT.utils.notific('不满足“境外账号发生的业务，海投公司反馈状态和审核状态必须填写一项”，请联系海投公司处理。', 'warn');
                this.disabledSave = false;
                return false;
              }
            }
            dbdjStatus = '16';
            break;
          default:
            break;
        }
        var reqParam = {
          taskid: this.dbdjModalParam.taskid,
          tyear: this.dbdjModalParam.tyear,
          riskid: this.dbdjModalParam.riskid,
          userid: this.loginContent.id,
          rulesid: this.dbdjModalParam.rulesid,
          organid: this.rootOrganId, // 发起人organID
          launchComments: this.launchData.comments.replace(/[\r\n]/g, ""),
          riskOrganid: this.dbdjModalParam.riskOrganid, // 风险单位ID
          fxdj: this.dbdjModalParam.fxdj, // 风险等级
          tablename: this.businessObj.tablename,
          reportid: this.businessObj.reportid,
          deletePersons: {
            userids: this.deleteUserIds
          },
          insertPersons: {
            userids: this.insertUserIds
          },
          feedback: {
            comments: this.fkOpinion == this.initFkOpinion ? '' : this.fkOpinion,
            fkstep: this.feedbackSteps.join(','),
            saveFilesInfo: this.saveFilesInfo,
            deleteFilesInfo: this.deleteFilesInfo
          },
          toExamine: {
            appstep: this.toExamineSteps.join(',')
          },
          guids: this.deleteFileGuids.join(','),
          saveFiles: this.uploadFiles,
          dbdjStatus: dbdjStatus,
          action: actionType
        };
        $.each(self.feedbackSituation, function (index, feedback) {
          reqParam.feedback[feedback.alias] = feedback.value;
        });
        $.each(self.auditSituation, function (index, audit) {
          reqParam.toExamine[audit.alias] = audit.value;
        });
        $.extend(reqParam, self.dbSituation);
        MAT.utils.postUrl('/rest/gwzjjk/fxgl/supervise/saveSupervise', {
          params: JSON.stringify(reqParam)
        }, function (res) {
          self.disabledSave = false;
          $('#' + self.dbdjModalId).modal('hide');
          self.$emit('saveDbdjSucceed')
        }, function (e) {
          MAT.utils.notific(e.message, 'warn');
          self.disabledSave = false;
        })
        if (this.deleteFileGuids.length > 0) {
          MAT.utils.postUrl('/rest/gwzjjk/fxgl/file/delete', {
            guids: self.deleteFileGuids.join(',')
          }, function (res) {})
        }
      },
      // 非运监控情况下只保留风险单位、二级财务、总部财务的意见即可，其他四项隐藏或者置灰
      getFeedbackClass: function (fItem) {
        // 是否运监
        if (DBDJ_CONST.fyjPosition.indexOf(fItem.roleField) > -1) {
          return 'fyj-position';
        } else {
          return 'yj-position';
        }
      },
      // 反馈权限校验
      verifyAuthority: function (roleid) {
        var userRoles = this.loginContent.roleids || [];
        if (userRoles.indexOf(roleid) > -1) {
          return false;
        } else {
          return true;
        }
      },
      // 审核权限校验
      verifyAuditAuthority: function (roleid) {
        var userRoles = this.loginContent.roleids || [];
        if (userRoles.indexOf(roleid) > -1) {
          return false;
        } else {
          return true;
        }
      },
      // 风险单位反馈、审核状态校验
      verifyFxdwAuthority: function (type, fieldItem, e) {
        if (fieldItem.serial == 6) {
          // 风险单位状态权限控制
          if (type == 'fkls' && (this.loginContent.id == this.currentShInfo.userid)) {
            MAT.utils.notific('不满足“风险单位的反馈状态和审核状态不允许为同一用户填写”，请知悉。', 'warn');
            e.stopPropagation();
          } else if (type == 'shls' && (this.loginContent.id == this.currentFkInfo.userid)) {
            MAT.utils.notific('不满足“风险单位的反馈状态和审核状态不允许为同一用户填写”，请知悉。', 'warn');
            e.stopPropagation();
          }
        }
      },
      // 滚动反馈历史面板
      moveFklsPanel: function (type) {
        if (type == 'left') {
          this.fklsPageIndex = this.fklsPageIndex - 1;
        } else {
          this.fklsPageIndex = this.fklsPageIndex + 1;
        }
      },
      // 滚动审核历史面板
      moveShlsPanel: function (type) {
        if (type == 'left') {
          this.shlsPageIndex = this.shlsPageIndex - 1;
        } else {
          this.shlsPageIndex = this.shlsPageIndex + 1;
        }
      },
      // 退出督办单
      dropOutDbdj: function () {
        var self = this;
        if (this.isAdjustInfo && (!this.isLaunchStatus)) {
          // 提示模态框
          this.$nextTick(function () {
            $('#dropout-tip').modal('show').prependTo('#' + self.dbdjModalId);
          })
        } else {
          $('#' + self.dbdjModalId).modal('hide');
        }
      },
      // 确认保存
      confirmSave: function () {
        $('#dropout-tip').modal('hide');
        this.saveSupervise('save');
      },
      // 关闭提示弹框
      closeTipModal: function () {
        $('#dropout-tip').modal('hide');
      },
      // 取消保存
      cancelSave: function () {
        var self = this;
        var guids = [];
        $.each(self.uploadFiles, function (idx, item) {
          guids.push(item.guid);
        });
        if (self.deleteFileGuids.length > 0) {
          MAT.utils.postUrl('/rest/gwzjjk/fxgl/file/delete', {
            guids: guids.join(',')
          }, function (res) {
            console.log(res);
          })
        }
        $('#dropout-tip').modal('hide');
        $('#' + self.dbdjModalId).modal('hide');
      },
    },
    watch: {
      replyComment: function (nVal) {
        if (nVal.indexOf('@' + this.toUserName + ' ') == -1) {
          this.toUserId = '';
          this.toForumSq = '';
          this.toOrganid = '';
          this.toOrganname = '';
          this.toUserName = '';
        }
      }
    },
    computed: {
      // 删除的附件信息
      deleteFilesInfo: function () {
        var self = this;
        if (self.deleteFiles.length === 0) {
          return '';
        } else {
          var resArr = [];
          var tempName = '';
          var fileName = '';
          $.each(self.deleteFiles, function (idx, file) {
            tempName = file.tempname;
            if (!tempName) {
              fileName = file.filename + '.' + file.keyid;
            } else {
              fileName = file.filename;
            }
            resArr.push(fileName);
          })
          return resArr.join('、');
        }
      },
      // 新增附件信息
      saveFilesInfo: function () {
        var self = this;
        if (self.uploadFiles.length === 0) {
          return '';
        } else {
          var resArr = [];
          var tempName = '';
          var fileName = '';
          $.each(self.uploadFiles, function (idx, file) {
            tempName = file.tempname;
            if (!tempName) {
              fileName = file.filename + '.' + file.keyid;
            } else {
              fileName = file.filename;
            }
            resArr.push(fileName);
          })
          return resArr.join('、');
        }
      },
      // 组织机构映射关系
      organMap: function () {
        return handleLoginContent.getOrganMap();
      },
      // 所属organid
      rootOrganId: function () {
        return pageParams.getPageParam().rootOrgan;
      },
      // 已选人员userid集合
      selectedPersonIds: function () {
        var self = this;
        var arr = [];
        $.each(self.selectedPersons, function (idx, item) {
          arr.push(item.id);
        });
        return arr;
      },
      // 删除的处理人员ID
      deleteUserIds: function () {
        var self = this;
        var arr = [];
        var result = [];
        $.each(self.configPersons, function (idx, item) {
          arr.push(item.id);
        });
        $.each(self.initPersons, function (idx, item) {
          if (arr.indexOf(item.userid) == -1) {
            result.push(item.userid);
          }
        });
        return result.join(',');
      },
      // 添加人员ID
      insertUserIds: function () {
        var self = this;
        var result = [];
        if (self.isLaunchStatus || self.initPersons.length == 0) {
          $.each(self.configPersons, function (idx, item) {
            result.push(item.id);
          });
        } else {
          $.each(self.configPersons, function (idx, item) {
            if (self.initSelectedUserids.indexOf(item.id) == -1) {
              result.push(item.id);
            }
          });
        }
        return result.join(',');
      },
      // 待选人员
      showPersons: function () {
        var self = this;
        var arr = [];
        $.each(self.dealPersons, function (idx, item) {
          if (self.selectedPersonIds.indexOf(item.id) > -1) {
            item.selected = true;
          } else {
            item.selected = false;
          }
          if (item.showname.indexOf(self.searchPerson) >= 0) {
            arr.push(item);
          }
        });
        return arr;
      },
      // 登录人员信息
      loginContent: function () {
        return JSON.parse(MAT.utils.getItem('loginContent')) || {};
      },
      // 是否回复：0-发起评论，1-回复
      isReply: function () {
        var placeIndex = this.replyComment.indexOf('@' + this.toUserName + ' ');
        if (placeIndex >= 0 && this.toUserId) {
          return 1;
        } else {
          return 0;
        }
      },
      // 业务信息对象
      businessMap: function () {
        var self = this;
        var result = {};
        var field_value = "";
        $.each(self.businessInfo, function (idx, bItem) {
          field_value = bItem['field_value'] || "";
          if (bItem['field_type'] === "3") {
            field_value = field_value.split(" ")[0];
          }
          result[bItem['field_code']] = field_value;
        })
        return result;
      },
      // 业务数据类型
      businessMapType: function () {
        var self = this;
        var result = {};
        $.each(self.businessInfo, function (idx, bItem) {
          result[bItem['field_code']] = bItem['field_type'];
        })
        return result;
      },
      // 反馈历史面板滚动页数
      fklsPages: function () {
        return Math.ceil(this.fklsArray.length / 4);
      },
      // 反馈历史倒序
      reverseFklsArray: function () {
        var newArr = this.fklsArray.concat();
        newArr.reverse();
        var startRow = this.fklsPageIndex * 4;
        return newArr.splice(startRow, 4);
      },
      // 审核历史面板滚动页数
      shlsPages: function () {
        return Math.ceil(this.shlsArray.length / 4)
      },
      // 审核历史倒序
      reverseShlsArray: function () {
        var newArr = this.shlsArray.concat();
        newArr.reverse();
        var startRow = this.shlsPageIndex * 4;
        return newArr.splice(startRow, 4);
      },
      // 是否风险单位(该权限下 反馈意见可编辑、可上传文件、可删除文件）
      isFxdwPosition: function () {
        var roleid = this.groupMap[DBDJ_CONST.fxdwVerifyid] || '';
        var userRoles = this.loginContent.roleids || [];
        if (userRoles.indexOf(roleid) > -1) {
          return true;
        } else {
          return false;
        }
      },
      // 预览通知单的部门名称
      exportWordBmmc: function () {
        var self = this;
        var launchRoleId = this.launchData['role_id'] || '';
        var yjRoleid = '';
        var bmmc = '财务资产部';
        $.each(DBDJ_CONST.yjVerifyIds, function (idx, id) {
          yjRoleid = self.groupMap[id];
          if (launchRoleId.indexOf(yjRoleid) > -1) {
            bmmc = '运营监测（控）中心';
            return false;
          }
        })
        return bmmc;
      },
      // 显示保存按钮
      showSaveBtn: function () {
        // 除了  [1-未发起 、32-非风险] 情况下显示督办发起
        return !this.isLaunchStatus;
      },
      // 显示督办发起按钮
      showDbfqBtn: function () {
        // [1-未发起 、32-非风险] - 情况下显示督办发起
        return this.isLaunchStatus;
      },
      // 显示督办关闭按钮
      showDbgbBtn: function () {
        // [2-待反馈、4-待审核] - 情况下显示督办关闭
        var index = ['2', '4'].indexOf(this.dbdjStatus);
        return (index > -1) ? true : false;
      },
      // 显示重新发起按钮
      showCxfqBtn: function () {
        // [8-系统关闭、16-督办关闭] - 情况下显示重新发起
        var index = ['8', '16'].indexOf(this.dbdjStatus);
        return (index > -1) ? true : false;
      },
      // 反馈改动步骤
      feedbackSteps: function () {
        var self = this;
        var fkstep = [];
        $.each(self.feedbackSituation, function (index, feedback) {
          if (feedback.value !== feedback.initValue) {
            fkstep.push(feedback.serial);
          }
        });
        return fkstep;
      },
      // 审核改动步骤
      toExamineSteps: function () {
        var self = this;
        var appstep = [];
        $.each(self.auditSituation, function (index, audit) {
          if (audit.value !== audit.initValue) {
            appstep.push(audit.serial);
          }
        });
        return appstep;
      },
      // 督办单信息是否有调整
      isAdjustInfo: function () {
        if ((this.fkOpinion != this.initFkOpinion) ||
          (this.deleteUserIds.length > 0) ||
          (this.insertUserIds.length > 0) ||
          (this.feedbackSteps.length > 0) ||
          (this.toExamineSteps.length > 0) ||
          (this.deleteFileGuids.length > 0) ||
          (this.uploadFiles.length > 0)
        ) {
          return true;
        } else {
          return false;
        }
      },
      // 关闭规则按照谁发起谁关闭的原则处理,重新发起则是谁发起才有权限重新发起
      enableCloseAndRelaunch: function () {
        if (this.launchData.userid &&
          (this.launchData.userid == this.loginContent.id)) {
          return true;
        } else {
          return false;
        }
      },
      // 未发起状态，发起信息是否可编辑，讨论区隐藏
      isLaunchStatus: function () {
        // 1-未发起；32-非风险
        return (this.dbdjStatus == '1') || (this.dbdjStatus == '32')
      },
      // 显示预览按钮
      showExportWord: function () {
        if ((this.dbdjStatus != '1') || this.launchData.ywkey) {
          return true;
        } else {
          return false;
        }
      },
      /*
       * 自动关单
       * 
       * 如果涉及境外账户的督办单，需要海投的意见也为“非风险”才可以自动关闭。
       * 注意：备用金监控一定要满足“90天前职工备用金科目余额≤90天前贷方累计发生额”才可以按照条件自动关闭。
       * 风险单位审核为非风险，并反馈不为空方可自动关闭
       */
      autoCloseDbd: function () {
        if (this.shSituation.sh6 !== 0) {
          return false;
        } else if ((typeof (this.fkSituation.fk6) !== 'number') ||
          this.fkSituation.fk6 == 4) {
          return false;
        }
        if (this.isYj === 1) {
          // 运监 - 满足风险单位、二级财务、二级运监填写的审核状态都为“非风险”的时候督办单自动关闭，同时风险单位的反馈必填
          if ((this.dbSituation.db2 !== 0) ||
            (this.dbSituation.db5 !== 0)) {
            return false;
          }

        } else {
          // 非运监 - 满足风险单位与二级财务、或风险单位与总部财务填写的审核状态都为“非风险”的时候督办单自动关闭，同时风险单位的反馈必填
          if ((this.dbSituation.db4 === 0) ||
            (this.dbSituation.db5 === 0)) {
            return true;
          } else {
            return false;
          }
        }

        // 境外账户
        if (this.businessMap['is_jwzh'] == '1') {
          // 海投
          if (this.dbSituation.db7 !== 0) {
            return false;
          }
        }
        // 判断备用金监控督办单关闭规则
        if (this.launchData['rules_id'] == 9) {
          if (parseFloat(this.businessMap["ago_amount"]) > parseFloat(this.businessMap["occ_amount"])) {
            return false;
          }
        }
        return true;
      },
      // 督办单状态，对应岗位若其审核状态为无意见，则取其反馈状态
      dbSituation: function () {
        var self = this;
        var dbSituation = {};
        var tempValue = null;
        $.each(self.auditSituation, function (index, audit) {
          if (audit.value === 0) {
            tempValue = 0;
          } else if (audit.value == 4) {
            tempValue = self.feedbackSituation[index].value;
          } else {
            tempValue = audit.value || self.feedbackSituation[index].value;
          }
          dbSituation['db' + audit.serial] = tempValue;
        });
        return dbSituation;
      },
      // 审核状态
      shSituation: function () {
        var self = this;
        var situation = {};
        $.each(self.auditSituation, function (index, audit) {
          situation[audit.alias] = audit.value;
        });
        return situation;
      },
      // 反馈状态
      fkSituation: function () {
        var self = this;
        var situation = {};
        $.each(self.feedbackSituation, function (index, feedback) {
          situation[feedback.alias] = feedback.value;
        });
        return situation;
      },
      // 发起权限校验
      verifyLaunchAuthority: function () {
        var self = this;
        var userRoles = this.loginContent.roleids || [];
        var launchId = '';
        var flag = false;
        // 是否运监
        if (this.isYj === 1) {
          // 运监的督办单的发起：三级运监、二级运监、总部财务、总部运监、海投可以发起督办单
          $.each(DBDJ_CONST.verifyIsYjLaunchIds, function (idx, id) {
            launchId = self.groupMap[id];
            if (userRoles.indexOf(launchId) > -1) {
              flag = true;
              return false;
            }
          })
        } else {
          // 非运监的督办单的发起：风险单位、二级财务、总部财务、海投可以发起督办单
          $.each(DBDJ_CONST.verifyNotYjLaunchIds, function (idx, id) {
            launchId = self.groupMap[id];
            if (userRoles.indexOf(launchId) > -1) {
              flag = true;
              return false;
            }
          })
        }
        return flag;
      },
      // 发起备注高度
      fqRemarkHeight: function () {
        var comments = this.launchData.comments || '';
        var len = comments.length;
        return (Math.ceil(len / 80) * 20) || 20;
      },
      // 回复输入框高度大小
      replyHeight: function () {
        var reply = this.replyComment || '';
        var len = reply.length;
        var row = Math.ceil(len / 100);
        return row * 30 || 30;
      },
      // 反馈情况输入框高度
      fkOpinionHeight: function () {
        var opinion = this.fkOpinion || '';
        var len = opinion.length;
        var row = Math.ceil(len / 100);
        return row * 30 || 30;
      },
      // 显示处理人
      showConfigPersons: function () {
        return this.configPersons.slice(0, 4);
      },
      // 是否运监
      isYj: function () {
        return (this.ruleItems[0] || {})['is_yj'];
      },
      // 督办单是否可编辑  督办状态为系统关闭和督办关闭时不可编辑
      dbdjEditable: function () {
        if (this.dbdjStatus == '8' || this.dbdjStatus == '16') {
          return false;
        } else {
          return true;
        }
      }
    }
  });
});