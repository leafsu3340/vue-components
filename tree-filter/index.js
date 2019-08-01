/**
 * 树形筛选框
 * 
 * @description 提供两种模式，多选及单选。多选模式下checkbox可用，选中项以“,”分隔
 * @events - selectTreeNode
 * 
 * 数据结构：
 * filterList: [{
 *    id: '1',            // 当前节点ID
 *    pid: '0',           // 父节点ID
 *    name: 'title',      // 显示名称
 *    is_leaf: 0          // 是否叶子节点  1 - 是,0 - 否.
 *    node_disable: true  // 节点是否可选，true - 不可选;false - 可选.
 * }]
 * 
 */
define(['vue',
  'text!./index.html',
  './js/mutiJstree',
  'jstree',
  'css!./css/treefilter.css'
], function (Vue, template, mutiJstree) {
  return Vue.extend({
    name: 'Treefilter',
    template: template,
    props: {
      labelTitle: {
        // title标签
        type: String,
        default: '树形选择器'
      },
      filterId: {
        // 实例Id，vue实例唯一ID
        type: String,
        default: 'muti-tree-filter'
      },
      defaultNodeId: {
        // 初始Id,初始化时已选择的节点ID
        type: String,
        default: '',
        require: true
      },
      multipleAble: {
        // 是否多选，true - checkbox可用；false - checkbox不可用
        type: Boolean,
        default: true
      },
      filterList: {
        // 筛选框数据(该属性为必填) 
        require: true,
        type: Array,
        default: function(){
          return []
        }
      }
    },
    data: function data() {
      return {
        selectedNodeNames: '',
      }
    },
    mounted: function mounted() {
      var self = this;
      self.initMutiSelect();
    },
    watch: {
       multipleAble: function () {
    		this.initMutiSelect();
       }
    },
    methods: {
      /**
       * 树形筛选框初始化
       * @param {String} defaultId - 初始化被选中的节点ID，直接调用该方法情况下可选提供
       */
      initMutiSelect: function (defaultId) {
        var self = this;
        var defaultNodeId = '';
        if (!defaultId) {
          // 取组件初始化默认节点ID
          defaultNodeId = self.defaultNodeId;
        } else {
          // 取直接提供的节点ID
          defaultNodeId = defaultId;
        }
        // 操作节点时回调函数
        var changeNode = function (node, selectedNodes) {
          var selectedNodeNames = '';
          $.each(selectedNodes, function (idx, item) {
            selectedNodeNames += (item.text + '，');
          })
          self.selectedNodeNames = selectedNodeNames.substring(0, (selectedNodeNames.length - 1));
          var result = {
            node: node,
            selectedNodes: selectedNodes
          };
          self.$emit('selectTreeNode', result);
        }
        // 初始化jsTree，并绑定事件
        var filterId = '#' + self.filterId;
        mutiJstree.init(filterId, changeNode, self.filterList, defaultNodeId, self.multipleAble);
      },
      /**
       * 直接调用该方法选中jsTree中的某一个节点
       * @param {String} nodeId - 需要被选中的节点ID 
       */
      selectTreeNode: function selectTreeNode(nodeId) {
        var self = this;
        var treeId = '#' + self.filterId + '-tree-container';
        $(treeId).jstree('select_node', nodeId);
      }
    },
  });
});