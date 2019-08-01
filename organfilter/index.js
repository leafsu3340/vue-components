define(['vue',
  'text!./index.html',
  './js/organJstree',
  'utils/page-params',
  'js/gwzjjk-const',
  'jstree',
  'css!./css/organfilter.css'
], function (Vue, template, organJstree, pageParams, ZJJK_CONST) {
  return Vue.extend({
    template: template,
    components: {},
    props: {
      labelTitle: {
        // title标签
        type: String,
        default: '单位名称'
      },
      filterId: {
        // 实例Id
        type: String,
        default: 'organfilterId'
      },
      defaultOrgan: {
        // 初始机构Id
        type: String,
        default: '',
        require: true
      },
      rootOrgan: {
        // 初始机构Id
        type: String,
        default: '',
        require: true
      },
      levelDefine: {
        // 定义层级函数 组织机构类型 0 - 所有层级； 1 - 一层级；2 - 两层级；
        type: Function,
        default: function(rootOrgan){
          return 0;
        }
      },
      organType: {
    	// 定义层级函数 组织机构类型 0 - 国网； 1 - 山东；
    	  type: Number,
    	  default: 0
      },
      hideOrganArr: {
     	 // 需要定制隐藏不显示的组织机构ID集合
     	 type: Array,
     	 default: function(){
     		 return [];
     	 }
       }
    },
    data: function data() {
      return {
        organName: '',
      }
    },
    mounted: function mounted() {
      var self = this;
      self.initOrganSelect();
      // 监控切换organId
      MAT.event.on("changeOrgan", function (organId) {
        // 销毁jstree、清空jstree数据
        var treeId = '#' + self.filterId + '-tree-container';
        $(treeId).jstree("destroy");
        $(treeId).data('jstree', false).empty();
        self.initOrganSelect(organId, organId);
      });
    },
    methods: {
      /**
       * 单位选择器初始化
       */
      initOrganSelect: function initOrganSelect(defaultOrganId, rootOrganId) {
        var self = this;
        var defaultOrgan = '';
        var rootOrgan = '';
        if ((!defaultOrganId) && (!rootOrganId)) {
          defaultOrgan = self.defaultOrgan;
          rootOrgan = self.rootOrgan;
        } else {
          defaultOrgan = defaultOrganId;
          rootOrgan = rootOrganId;
        }
        var changeOrgan = function (id, text, treelevel, orgItem) {
          var org = orgItem.original.org || {};
          var realLevel = null;
          if ((org.treelevel == 3) && (org['p_v_organ_id'] == ZJJK_CONST.gwOrganId)) {
        	  realLevel = 2;
          } else {
        	  realLevel = treelevel;
          }
          var result = {
            organName: text,
            organId: id,
            treelevel: realLevel,
            orgItem: orgItem
          };
          var pParam = {
            organId: id,
          };
          pageParams.setPageParams(pParam);
          self.$emit('organChange', result);
        }
        // 初始化jsTree
        var filterId = '#' + self.filterId;
        var level = self.levelDefine(rootOrgan);
        organJstree.init(filterId, changeOrgan, defaultOrgan, rootOrgan, self.organType, level, self.hideOrganArr);
        $(filterId).unbind();
        organJstree.bindEvent();
      },
      // 选中jsTree中的某一个节点
      selectTreeNode: function selectTreeNode(nodeId) {
        var treeId = '#' + this.filterId + '-tree-container';
        $(treeId).jstree('select_node', nodeId);
      }
    },
  });
});