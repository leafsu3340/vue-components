define(['jstree'], function () {
  var updateLogs = {
    /**
     * 初始化
     * 
     * @method init
     */
    init: function (initNode, changeNode, defaultNode, multipleAble) {
      var me = this;
      me.nodeId = "";
      me.multipleAble = multipleAble;
      me.data = {};
      me.$element = $(initNode);
      MAT.utils.getUrl('/rest/gwzjjk/security/survey/getTaskList', {}, function (res) {
        var nodeList = res.obj || [];
        me.renderNodeTree(me, defaultNode, nodeList, initNode, changeNode);
      });
    },
    bindEvent: function () {
      var me = this;
      var elem = me.$element;
      elem.on('mousedown', 'input,.arrow-down', function (event) {
        event.stopPropagation();
        var $target = $(this).siblings('.tree-container');
        if ($target.hasClass('hide')) {
          elem.find('.tree-container').addClass('hide');
          $target.removeClass('hide');
          // 搜索定位
          var $nodeTree = elem.find('.node-tree-container');
          var searchResult = $($nodeTree).jstree('search', $(elem.find('.form-field')).val());
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
     * @method renderNodeTree
     */
    renderNodeTree: function (me, defaultNode, nodeList, initNode, changeNode) {
      var me = this;
      var d = [];
      for (var i = 0, len = nodeList.length; i < len; i++) {
        var state = {};
        var nodeTemp = nodeList[i];
        if (!nodeTemp.prwid) {
          nodeTemp.prwid = 'root';
          state.opened = true;
        }
        if (!me.multipleAble) {
          state.disabled = nodeTemp.is_leaf == 0;
        } else {
          state.disabled = !!nodeTemp.node_disable;
        }

        d.push({
          id: nodeTemp.rwid,
          text: nodeTemp.rw_bjcap,
          pid: nodeTemp.prwid,
          a_attr: {
            title: nodeTemp.rw_bjcap
          },
          state: state,
          children: nodeTemp.is_leaf == 0 ? [{
            text: 'cache'
          }] : [],
          rw_caption: nodeTemp.rw_caption,
          rwid_tree: nodeTemp.rwid_tree,
        });
      }
      var sortNodeList = nodeList.sort(function (a, b) {
        return a['sort_num'] - b['sort_num'];
      })
      me.data.nodeId = sortNodeList[sortNodeList.length - 1].rwid;
      var treeContainer = initNode + '-tree-container';
      var $nodeTree = $(treeContainer);
      me.buildTree($nodeTree, d, "ygmat-org");

      // 树数据加载完成事件
      $nodeTree.on("loaded.jstree", function (e, data) {
        if (defaultNode != undefined && defaultNode != "") {
          if (me.multipleAble) {
            var ids = defaultNode.split(',');
            var idArr = [];
            $.each(ids, function (idx, item) {
              idArr.push({
                id: item
              });
            })
            data.instance.check_node(idArr);
          } else {
            data.instance.select_node(defaultNode);
          }
        } else {
          data.instance.select_node(me.data.nodeId);
        }
        $nodeTree.addClass('hide');
      });

      // 选择树节点点击事件
      $nodeTree.on("select_node.jstree", function (e, data) {
        var selectedNodeid = data.node.id;
        me.data.nodeId = selectedNodeid;
        if (me.multipleAble) {
          if(defaultNode){
        	  var defaultArr = defaultNode.split(',');
              if (selectedNodeid == defaultArr[defaultArr.length - 1]){
            	  var selectedNodes = data.instance.get_checked(true);
                  changeNode(data.node, selectedNodes);
                  defaultNode = '';
              }; 
          } else {
        	var selectedNodes = data.instance.get_checked(true);
            changeNode(data.node, selectedNodes);
          }
        } else {
          changeNode(data.node, [data.node]);
          $nodeTree.addClass('hide');
        }
      });
      // 勾选树节点点击事件
      $nodeTree.on("check_node.jstree", function (e, data) {
        var selectedNodes = data.instance.get_checked(true);
        changeNode(data.node, selectedNodes);
      });

      // 取消选择树节点点击事件
      $nodeTree.on("deselect_node.jstree", function (e, data) {
        me.data.nodeId = data.node.id;
        if (me.multipleAble) {
          var selectedNodes = data.instance.get_checked(true);
          changeNode(data.node, selectedNodes);
        } else {
          changeNode(data.node, [data.node]);
          $nodeTree.addClass('hide');
        }
      });


      $nodeTree.on("activate_node.jstree", function (obj, e) {
        // 处理代码
        // 获取当前节点
        // console.log(obj, e);
      });

      $nodeTree.on("open_node.jstree", function (e, data) {
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
            // MAT.utils.getUrl('/gwzjjk/common/organ/getOrganList', {
            //   organId: pNode.id
            // }, function (res) {
            //   // 结果处理
            //   var resData = res.obj || [];
            //   for (var i = 0, len = resData.length; i < len; i++) {
            //     var resTemp = resData[i];
            //     instance.create_node(pNode, {
            //       id: resTemp.rwid,
            //       text: resTemp.rw_bjcap,
            //       pid: resTemp.prwid ? resTemp.prwid : 'root',
            //       a_attr: {
            //         title: resTemp.organname
            //       },
            //       children: resTemp.is_leaf == 0 ? [{
            //         text: 'cache'
            //       }] : [],
            //       rw_caption: resTemp.rw_caption,
            //       rwid_tree: resTemp.rwid_tree,
            //     });
            //   };
            // }, function (e) {
            //   console.log(e)
            // })
          }
          instance.open_node(pNode);
        }
      });
    },
    /**
     * 创建树（及转化为jstree格式的树结构）
     * @method buildTree
     */
    buildTree: function ($container, data, icon) {
      var me = this;
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
      var plugins = me.multipleAble ? ["types", "wholerow", "themes", "search", "checkbox"] : ["types", "wholerow", "themes", "search"];
      $container.jstree({
        core: {
          "multiple": me.multipleAble,
          'data': treeData,
          'dblclick_toggle': false,
          "themes": {
            "icons": !me.multipleAble,
            //"variant": "large", //加大  
            "ellipsis": true //文字多时省略  
          },
          'check_callback': true,
          'strings': {
            'Loading ...': '加载中 ...'
          }
        },
        "types": {
          "default": {
            "icon": me.multipleAble ? "" : (icon || "ygmat-folder-o")
          }
        },
        "plugins": plugins
      })
    },
  };

  return updateLogs;
})