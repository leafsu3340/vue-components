define(['utils/loader', 'jstree'], function (Loader) {
  var updateLogs = {
    /**
     * 初始化
     * 
     * @method init
     */
    init: function (filterId, changeNode, nodeList, defaultNode, multipleAble) {
      var me = this;
      me.nodeId = "";
      me.multipleAble = multipleAble;
      me.data = {};
      me.$element = $(filterId);
      me.$treeContainer = me.$element.find('.tree-container');
      me.nodeList = nodeList || [];
      me.filterId = filterId;
      me.renderNodeTree(defaultNode, changeNode);
      me.$element.unbind();
      me.bindEvent();
    },
    /**
     * 绑定事件
     * 
     * @method bindEvent
     */
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
    renderNodeTree: function (defaultNode, changeNode) {
      var me = this;
      var d = [];
      var filterId = me.filterId;
      var $treeContainer = me.$treeContainer;
      var $nodeTree = $(filterId + '-tree-container');
      var nodeList = me.nodeList;
      for (var i = 0, len = nodeList.length; i < len; i++) {
        var state = {};
        var nodeTemp = nodeList[i];
        if (!nodeTemp.pid) {
          nodeTemp.pid = 'root';
          // 第一级自动展开
          state.opened = true;
        }

        if (!me.multipleAble) {
          // 多选模式下，父级ID不可选
          state.disabled = nodeTemp.is_leaf == 0;
        } else {
          // 单选模式下，node_disable属性决定该节点是否可选
          state.disabled = !!nodeTemp.node_disable;
        }

        d.push({
          id: nodeTemp.id,
          text: nodeTemp.name,
          pid: nodeTemp.pid,
          a_attr: {
            title: nodeTemp.name
          },
          state: state,
          children: nodeTemp.is_leaf == 0 ? [{
            text: 'cache'
          }] : [],
          node_data: nodeTemp
        });
      }

      // 创建树
      me.buildTree($nodeTree, d, "ygmat-org");

      // 树数据加载完成事件
      $nodeTree.on("loaded.jstree", function (e, data) {
        // 增添搜索框
        var $searchInput = $(filterId + '-search');
        // jstree搜索框执行函数
        var searchFunc = function () {
          Loader.block({
            "$container": $(".node-tree-container"),
            "backgroundColor": "#fff"
          });
          var searchVal = $searchInput.val() || '';
          var showOnlySearch = false;
          var emptyFlag = !searchVal.replace(/ /g, '');
          if (emptyFlag) {
            showOnlySearch = false;
          } else {
            showOnlySearch = true;
          }
          var searchResult = $($nodeTree).jstree('search', searchVal, false, showOnlySearch);
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
            "$container": $(".node-tree-container")
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
        var searchIconID = filterId + '__search-icon';
        $(searchIconID).unbind();
        $(searchIconID).click(function () {
          searchFunc();
        });

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
        $treeContainer.addClass('hide');
      });

      // 选择树节点点击事件
      $nodeTree.on("select_node.jstree", function (e, data) {
        var selectedNodeid = data.node.id;
        me.data.nodeId = selectedNodeid;
        if (me.multipleAble) {
          if (defaultNode) {
            var defaultArr = defaultNode.split(',');
            if (selectedNodeid == defaultArr[defaultArr.length - 1]) {
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
          $treeContainer.addClass('hide');
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
          $treeContainer.addClass('hide');
        }
      });

      // 展开节点时
      $nodeTree.on("open_node.jstree", function (e, data) {
        var instance = data.instance;
        var pNode = data.node;
        // 若该节点非叶子节点且无子节点数据，可异步加载节点数据
        if (pNode.children.length === 1) {
          var cacheId = pNode.children[0];
          var cacheNode = instance.get_node({
            id: cacheId
          });
          if (cacheNode.text === 'cache') {
            instance.delete_node(cacheNode);
            // TODO: 异步加载子节点
            // MAT.utils.getUrl('/gwzjjk/common/organ/getOrganList', {
            //   organId: pNode.id
            // }, function (res) {
            //   // 结果处理
            //   var resData = res.obj || [];
            //   for (var i = 0, len = resData.length; i < len; i++) {
            //     var resTemp = resData[i];
            //     instance.create_node(pNode, {
            //       id: resTemp.id,
            //       text: resTemp.name,
            //       pid: resTemp.pid ? resTemp.pid : 'root',
            //       a_attr: {
            //         title: resTemp.organname
            //       },
            //       children: resTemp.is_leaf == 0 ? [{
            //         text: 'cache'
            //       }] : [],
            //       node_data: resTemp
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
     * 
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