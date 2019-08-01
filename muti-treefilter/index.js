define(['vue',
  'text!./index.html',
  './js/mutiJstree',
  'jstree',
  'css!./css/organfilter.css'
], function (Vue, template, mutiJstree) {
  return Vue.extend({
    name: 'MutiTreefilter',
    template: template,
    props: {
      labelTitle: {
        // title标签
        type: String,
        default: '任务名称'
      },
      filterId: {
        // 实例Id
        type: String,
        default: 'muti-tree-filter'
      },
      defaultNodeId: {
        // 初始Id
        type: String,
        default: '',
        require: true
      },
      multipleAble: {
        // 是否多选
        type: Boolean,
        default: true
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
       * 选择器初始化
       */
      initMutiSelect: function (defaultId) {
        var self = this;
        var defaultNodeId = '';
        if (!defaultId) {
          defaultNodeId = self.defaultNodeId;
        } else {
          defaultNodeId = defaultId;
        }
        var changeNode = function (node, selectedNodes) {
          var selectedNodeNames = '';
          $.each(selectedNodes, function (idx, item) {
        	if(item.parent != '#'){
        		selectedNodeNames += ((item.original||{})['rw_caption'] + '，');
        	}
          })
          self.selectedNodeNames = selectedNodeNames.substring(0, (selectedNodeNames.length - 1));
          var result = {
            node: node,
            selectedNodes: selectedNodes
          };
          self.$emit('selectTreeNode', result);
        }
        // 初始化jsTree
        var filterId = '#' + self.filterId;
        mutiJstree.init(filterId, changeNode, defaultNodeId, self.multipleAble);
        $(filterId).unbind();
        mutiJstree.bindEvent();
      },
      // 选中jsTree中的某一个节点
      selectTreeNode: function selectTreeNode(nodeId) {
        var self = this;
        var treeId = '#' + self.filterId + '-tree-container';
        $(treeId).jstree('select_node', nodeId);
      }
    },
  });
});