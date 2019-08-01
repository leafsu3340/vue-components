define(['utils/organ-cache', 'utils/loader', 'jstree'], function (organCache, Loader) {
  var updateLogs = {
    /**
     * 初始化
     * 
     * @method init
     */
    init: function (initNode, changeOrgan, defaultOrgan, rootOrgan, organType, level, hideOrganArr) {
      var me = this;
      me.organid = "";
      me.data = {};
      me.hideOrganArr = hideOrganArr || [];
      me.$element = $(initNode);
      me.$treeContainer = me.$element.find('.tree-container');
      if (!rootOrgan) {
        return;
      }
      // 扩展传递参数
      var extendOrg = {
        initNode: initNode,
        changeOrgan: changeOrgan,
        level: level
      };
      organCache.getOrganList(me, rootOrgan, defaultOrgan, me.renderorgTree, organType, extendOrg);
    },
    /**
     * 绑定事件
     * 
     * @method bindEvent
     */
    bindEvent: function () {
      var me = this;
      var elem = me.$element;
      elem.on('mousedown', '.filter-input,.arrow-down', function (event) {
        event.stopPropagation();
        var $target = $(this).siblings('.tree-container');
        if ($target.hasClass('hide')) {
          elem.find('.tree-container').addClass('hide');
          $target.removeClass('hide');
          // 搜索定位
          var $orgTree = elem.find('.org-tree-container');
          me.$element.find('.jstree-search-input').val('');
          var searchResult = $($orgTree).jstree('search', $(elem.find('.filter-input')).val(), false, false);
          var searchDom = $(searchResult).find('.jstree-search');
          $.each(searchDom, function (index, dom) {
            if (!$(dom).hasClass('jstree-clicked')) {
              $(dom).removeClass('jstree-search');
            } else {
              $(dom).focus();
            }
          })
        } else {
          $target.addClass('hide');
        }
      });

      elem.on('mousedown', '.tree-container', function (event) {
        event.stopPropagation();
      });

      $("body").on('mousedown', function () {
        elem.find('.tree-container').addClass('hide');
      });
    },
    /**
     * 渲染树结构
     * 
     * @method renderorgTree
     */
    renderorgTree: function (me, rootOrgan, defaultOrgan, orgList, extendOrg) {
      var initNode = extendOrg.initNode;
      var changeOrgan = extendOrg.changeOrgan;
      var level = extendOrg.level;
      var hideOrganArr = me.hideOrganArr;
      var d = [];
      for (var i = 0, len = orgList.length; i < len; i++) {
        var state = {};
        var orgTemp = orgList[i];
        // 隐藏某些组织机构
    	if ((hideOrganArr.length > 0) && hideOrganArr.indexOf(orgTemp.organ_id) > -1) {
    		continue;
    	}
        if (!orgTemp.p_organ_id || orgTemp.organ_id == rootOrgan) {
          me.data.orgId = orgTemp.organ_id;
          orgTemp.p_organ_id = 'root';
          state.opened = true;
          if (level && (orgTemp.treelevel === level)) {
            orgTemp.is_leaf = 1;
          }
        } else {
          if (level && (orgTemp.treelevel === level)) {
            orgTemp.is_leaf = 1;
          }
          if (level && (orgTemp.treelevel > level)) {
            continue;
          }
        }

        state.disabled = !!orgTemp.node_disable;
        d.push({
          id: orgTemp.organ_id,
          text: orgTemp.organshortname,
          pid: orgTemp.p_organ_id,
          a_attr: {
            title: orgTemp.organname
          },
          state: state,
          children: orgTemp.is_leaf == 0 ? [{
            text: 'cache'
          }] : [],
          organcode: orgTemp.organcode,
          treelevel: orgTemp.treelevel,
          org: orgTemp
        });
      }

      var elem = me.$element;
      var $treeContainer = me.$treeContainer;
      var treeContainer = initNode + '-tree-container';
      var $orgTree = $(treeContainer);
      me.buildTree($orgTree, d, "ygmat-org");

      /**
       * jstree加载完成事件
       */
      $orgTree.on("loaded.jstree", function (e, data) {
        // 增添搜索框
        var $searchInput = me.$element.find('.jstree-search-input');
        // jstree搜索框执行函数
        var searchFunc = function () {
          Loader.block({
            "$container": $(".org-tree-container"),
            "backgroundColor": "#fff"
          });
          var searchVal = '';
          var showOnlySearch = false;
          var emptyFlag = !$searchInput.val().replace(/ /g, '');
          if (emptyFlag) {
            searchVal = elem.find('.filter-input').val();
            showOnlySearch = false;
          } else {
            searchVal = $searchInput.val().replace(/ /g, '');
            showOnlySearch = true;
          }
          var searchResult = $($orgTree).jstree('search', searchVal, false, showOnlySearch);
          if (emptyFlag) {
            // 搜索定位已选单位
            var searchDom = $(searchResult).find('.jstree-search');
            $.each(searchDom, function (index, dom) {
              if (!$(dom).hasClass('jstree-clicked')) {
                $(dom).removeClass('jstree-search');
              } else {
                $(dom).focus();
                $searchInput.focus();
              }
            })
          }
          Loader.unblock({
            "$container": $(".org-tree-container")
          });
        };
        // 输入框enter事件
        $searchInput.unbind();
        $searchInput.keyup(function (e) {
          if (e.keyCode == "13") {
            searchFunc();
          }
        });
        // 输入框图标事件
        var searchIconID = initNode + '__search-icon';
        $(searchIconID).unbind();
        $(searchIconID).click(function () {
          searchFunc();
        });
        // 默认选择节点
        if (defaultOrgan != undefined && defaultOrgan != "") {
          data.instance.select_node(defaultOrgan);
        } else {
          data.instance.select_node(me.data.orgId);
        }
      });

      /**
       * 树节点点击事件
       */
      $orgTree.on("select_node.jstree", function (e, data) {
        me.data.orgId = data.node.id;
        me.data.orgName = data.node.text;
        $treeContainer.addClass('hide');
        me.$element.find('input').val(data.node.text);
        changeOrgan(data.node.id, data.node.text, data.node.original.treelevel, data.node);
      });

      $orgTree.on("activate_node.jstree", function (obj, e) {
        // 处理代码
        // 获取当前节点
        // console.log(obj, e);
      });

      $orgTree.on("open_node.jstree", function (e, data) {
        var instance = data.instance;
        var pNode = data.node;
        if (pNode.children.length === 1) {
          var cacheId = pNode.children[0];
          var cacheNode = instance.get_node({
            id: cacheId
          });
          if (cacheNode.text === 'cache') {
            instance.delete_node(cacheNode);
            // 异步加载子节点
            MAT.utils.getUrl('/gwzjjk/common/organ/getOrganList', {
              organId: pNode.id
            }, function (res) {
              // 结果处理
              var resData = res.obj || [];
              for (var i = 0, len = resData.length; i < len; i++) {
                var resTemp = resData[i];
                instance.create_node(pNode, {
                  id: resTemp.organ_id,
                  text: resTemp.organshortname,
                  pid: resTemp.p_organ_id ? resTemp.p_organ_id : 'root',
                  a_attr: {
                    title: resTemp.organname
                  },
                  children: resTemp.is_leaf == 0 ? [{
                    text: 'cache'
                  }] : [],
                  organcode: resTemp.organcode,
                  treelevel: resTemp.treelevel,
                });
              };
            }, function (e) {
              console.log(e)
            })
          }
          instance.open_node(pNode);
        }
      });
    },
    /**
     * 创建树（及转化为jstree格式的树结构）
     * 
     * @method buildTree
     */
    buildTree: function ($container, data, icon) {
      var treeData = [];
      var treeDataMap = {};
      for (var i = 0, len = data.length; i < len; i++) {
        var temp = data[i];
        if (!treeDataMap[temp.id]) {
          treeDataMap[temp.id] = temp;
        }
      }
      for (var i = 0, len = data.length; i < len; i++) {
        var pID = data[i].pid;
        if (!pID || pID == 'root') {
          treeData.push(data[i]);
        } else {
          if (treeDataMap[pID]) {
            if (treeDataMap[pID].children[0]) {
              if (treeDataMap[pID].children[0].text === "cache") {
                treeDataMap[pID].children[0] = data[i];
              } else {
                treeDataMap[pID].children.push(data[i]);
              }
            }
          }
        }
      }
      $container.jstree("destroy");
      // $container.data('jstree', false).empty();
      $container.jstree({
        core: {
          "multiple": false,
          'data': treeData,
          'dblclick_toggle': false,
          'check_callback': true,
          'strings': {
            'Loading ...': '加载中 ...'
          }
        },
        "types": {
          "default": {
            "icon": icon || "ygmat-folder-o"
          }
        },
        "search": {
          "show_only_matches": true,
        },
        "plugins": ["types", "wholerow", "search"]
      })
    },
  };

  return updateLogs;
})