/**
 * 下拉多选框vue组件
 * 事件：selectFilters，返回筛选框选定的情况
 * -example-
 * filtersData:[{ 
 *   enumvalue: 'filterName',
 *   id: 'filterId',
 *   notShow: false,  区分是否匹配搜索内容，默认undefined，不可定义
 *   value: true,     checkbox值，默认undefined，不可定义
 *   other...
 * }]
 */
define(['vue',
  'text!./index.html',
  'css!./css/dropfilter.css'
], function (Vue, template) {
  return Vue.extend({
    name: 'DropFilter',
    template: template,
    props: {
      filtersData: {
        // 筛选框数据
        type: Array,
        default: function () {
          return []
        }
      },
      filterTitle: {
        // title标签名
        type: String,
        require: true,
        default: '筛选器'
      },
      phyIdKey: {
        // 字段Id名称
        type: String,
        default: 'id'
      },
      filterName: {
        // 过滤字段名称
        type: String,
        default: 'enumvalue'
      },
      initIds: {
        // 初始的id字符串
        type: String,
        default: ''
      },
      dropLiWidth: {
        // li-item宽度
        type: String,
        default: 'width:182px;',
      },
      searchWidth: {
        // search-input宽度
        type: String,
        default: 'width:146px;',
      }
    },
    data: function () {
      return {
        searchWord: "",
        filterTarget: this.filtersData,
        dropId: 'rzfxRzfsId'
      };
    },
    created: function () {
      // 初始化唯一的dropfilter-ID
      this.dropId = MAT.utils.uuid();
    },
    mounted: function () {
      var self = this;
      $('.filter-container .dropdown-menu').click(function (e) {
        e.stopPropagation();
      });
      $('#' + self.dropId).on('shown.bs.dropdown', function () {
        $('.dropdown-list ul').perfectScrollbar('update');
      })
      this.$nextTick(function () {
        this.setInitValue();
        $('.dropdown-list ul').perfectScrollbar();
      });
    },
    watch: {
      // 模糊搜索
      searchWord: function (nVal) {
        var searchKey = nVal;
        var len = this.filterTarget.length;
        for (var i = 0; i < len; i += 1) {
          var flag = this.filterTarget[i][this.filterName].indexOf(searchKey);
          if (flag < 0) {
            var newObj = this.filterTarget[i];
            newObj.notShow = true;
            this.$set(this.filterTarget, i, newObj)
          } else {
            var newObj = this.filterTarget[i];
            newObj.notShow = false;
            this.$set(this.filterTarget, i, newObj)
          }
        }
      },
      filtersData: function (nVal) {
        this.filterTarget = nVal;
      },
      initIds: function (nVal) {
        var valArr = nVal.split(',');
        var len = this.filterTarget.length;
        for (var i = 0; i < len; i++) {
          var newObj = this.filterTarget[i];
          var filterId = this.filterTarget[i][this.phyIdKey];
          var idStr = '';
          if (typeof (filterId) == 'number') {
            idStr = filterId.toString();
          } else {
            idStr = filterId;
          }
          if (valArr.indexOf(idStr) >= 0) {
            newObj.value = true;
          } else {
            newObj.value = false;
          }
          this.$set(this.filterTarget, i, newObj)
        }
        this.$emit('selectFilters', this.selectedTarget);
      }
    },
    methods: {
      // 设置筛选框默认值
      setInitValue: function (ids) {
        var valArr = [];
        if (!ids) {
          valArr = this.initIds.split(',');
        } else {
          valArr = ids.split(',');
        }
        var len = this.filterTarget.length;
        for (var i = 0; i < len; i++) {
          var newObj = this.filterTarget[i];
          var filterId = this.filterTarget[i][this.phyIdKey];
          var idStr = '';
          if (typeof (filterId) == 'number') {
            idStr = filterId.toString();
          } else {
            idStr = filterId;
          }
          if (valArr.indexOf(idStr) >= 0) {
            newObj.value = true;
          } else {
            newObj.value = false;
          }
          this.$set(this.filterTarget, i, newObj)
        }
        this.$emit('selectFilters', this.selectedTarget);
      },
      // 下拉框全选
      selectAll: function (flag) {
        var len = this.filterTarget.length;
        for (var i = 0; i < len; i++) {
          var newObj = this.filterTarget[i];
          newObj.value = flag;
          this.$set(this.filterTarget, i, newObj)
        }
        // 全选时 selectedIds 设为空
        var result = this.selectedTarget;
        result.selectedIds = '';
        this.$emit('selectFilters', result);
      },
      // 选择下拉框其中一个选项
      selectOneTarget: function (index, val) {
        var newObj = this.filterTarget[index];
        newObj.value = !val;
        this.$set(this.filterTarget, index, newObj)
        this.$nextTick(function () {
          this.$emit('selectFilters', this.selectedTarget);
        })
      },
    },
    computed: {
      // 选中的筛选项集合
      selectedTarget: function () {
        var filters = this.filterTarget;
        var len = filters.length;
        var selectedItems = []; // 选中的Items集合
        var selectedNames = ""; // 选中的item-name集合
        var selectedIds = ""; // 选中的item-id集合
        var isAllSelected = true;
        for (var i = 0; i < len; i++) {
          if (filters[i].value) {
            selectedItems.push(filters[i]);
            selectedNames += filters[i][this.filterName] + ',';
            selectedIds += filters[i][this.phyIdKey] + ',';
          } else {
            isAllSelected = false;
          };
        };
        if ((!selectedNames) && (!isAllSelected)) {
          selectedNames = '全部';
        } else if (isAllSelected) {
          selectedNames = '全部';
        };
        // if(self.selectedAllFlag){
        //   selectedIds = 'all'
        // };
        return {
          selectedItems: selectedItems,
          selectedIds: selectedIds,
          selectedNames: selectedNames
        };
      },
      // 判断是否所有筛选项被选中
      selectedAllFlag: function () {
        var filters = this.filterTarget;
        var len = filters.length;
        var flag = true;
        for (var i = 0; i < len; i++) {
          if (!filters[i].value) {
            flag = false;
            return;
          };
        };
        return flag;
      },
      // 判断无匹配的结果
      noSearchResult: function () {
        var filters = this.filterTarget;
        var len = filters.length;
        for (var i = 0; i < len; i++) {
          if (!filters[i].notShow) {
            return false;
          }
        }
        return true;
      }
    }
  });
});