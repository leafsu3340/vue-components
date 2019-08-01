/**
 * 基于easyui-datagrid\tree-grid封装的vue组件
 * 组件事件：onDblClickCell, onClickCell, finishDraw，onDblClickRow，onClickRow, lazyLoadTreeGrid
 */
define(['vue',
  'text!./index.html',
  'utils/datagrid-formatter',
  'js/gwzjjk-const',
  'css!./css/datagrid.css',
  'easyui',
], function (Vue, template, Formatters, ZJJK_CONST) {
  return Vue.extend({
    name: 'datagrid',
    template: template,
    props: {
      gridTableId: {
        // 表格table-ID
        type: String,
        default: 'data-grid'
      },
      gridContainerId: {
        // 表格container-ID
        type: String,
        default: 'grid-container'
      },
      rootOrganId: {
        // 树形表根节点ID
        type: String,
        default: ZJJK_CONST.gwOrganId,
      },
      pTreeNodeKey: {
        // 树形表格父节点字段
        type: String,
        default: 'p_organ_id'
      },
      treeNodeKey: {
        // 树形表格子节点字段
        key: String,
        default: 'organ_id'
      },
      gridHeight: {
        // 固定表格高度
        type: Number,
        default: 400
      },
      subHeight: {
        // 自适应表格应该减少的高度像素
        type: Number,
        default: 0
      },
      metric: {
        // 计量单位
        type: Number,
        default: 1
      },
      columnsFormat: {
        // 普通列单元格格式化函数
        type: Function,
        default: Formatters.baseFormat
      },
      frozenColumnsFormat: {
        // 冻结列单元格格式化
        type: Function,
        default: Formatters.baseFormat
      },
      selectable: {
        // 表格行数据是否可选
        type: Boolean,
        default: false
      },
      hightLightFields: {
        // 高亮列
        type: Array,
        default: function () {
          return []
        }
      },
      singleSelect: {
        // 是否单选
        type: Boolean,
        default: true
      },
      checkAble: {
        // 可勾选条件
        type: Object,
        default: function () {
          return {
            key: 'isCheckable',
            value: [1]
          }
        }
      },
      checkAllAble: {
        // 是否可勾选全部
        type: Boolean,
        default: true
      },
      showCheckBox: {
        // 是否显示勾选列
        type: Boolean,
        default: false
      },
      isRowNumbers: {
        // 是否显示序号
        type: Boolean,
        default: false
      },
      pageSize: {
        type: Number,
        default: 0
      },
      pageNumber: {
        type: Number,
        default: 1
      },
      initNodeExpand: {
        // 树形表格初始节点是否展示
        type: Boolean,
        default: true
      }
    },
    data: function () {
      return {
        editIndex: undefined,
        optionData: {}, // 表格配置数据
        headerColumns: {}, // 表头field不为空的列集合
        tableHeight: 400, // 表格高度
        bodyDataIsEmpty: false, // 判断body是否为空
        heightOfTableHead: 0, // 表头的高
        gridData: null, // 表格数据
        scrollCanRun: false, // 表格滚动加载开发
      }
    },
    created: function () {
      this.computeGridHeight();
    },
    mounted: function () {
      var self = this;
      // 覆盖datagrid原有的回调方法
      $.extend($.fn.datagrid.methods, {
        editCell: function (jq, param) {
          return jq.each(function () {
            var opts = $(this).datagrid('options');
            var fields = $(this).datagrid('getColumnFields', true).concat($(this).datagrid('getColumnFields'));
            var size = fields.length;
            for (var i = 0; i < size; i++) {
              var col = $(this).datagrid('getColumnOption', fields[i]);
              col.editor1 = col.editor;
              if (fields[i] != param.field) {
                col.editor = null;
              }
            }

            $(this).datagrid('beginEdit', param.index);
            for (var i = 0; i < size; i++) {
              var col = $(this).datagrid('getColumnOption', fields[i]);
              col.editor = col.editor1;
            }
          });
        },
        fixRowHeight: function () {
          return; // 避免性能问题，适用于文本不自动折行的grid
        }
      });
      //编辑表格只能输入数字      扩展数字编辑器
      $.extend($.fn.datagrid.defaults.editors, {
        number: {
          init: function (container, options) {
            var $input = $('<input type="number" autofocus="autofocus" class="datagrid-editable-input">');
            $input.appendTo(container);
            return $input;
          },
          destroy: function (target) {
            $(target).remove();
          },
          getValue: function (target) {
            var $val = $(target).val().trim();
            if ($val.length == 0) {
              MAT.utils.notific('请输入正确汇率', 'warn');
              $val = parseFloat($("#editvalue").val()).toFixed(4);
            }
            return parseFloat($val).toFixed(4);
          },
          setValue: function (target, value) {
            value = (parseFloat(value)).toFixed(4);
            $(target).val(value);
          },
          resize: function (target, width) {
            $(target)._outerWidth(width);
          }
        }
      });
      // 隐藏的dom元素 存值
      $("#" + self.gridContainerId).append("<input id='editvalue' style='display:none;'>")
    },
    methods: {
      endEditing: function () {
        var self = this;
        if (self.editIndex === undefined) {
          return true;
        }
        if ($('#' + this.gridTableId).datagrid('validateRow', self.editIndex)) {
          $('#' + this.gridTableId).datagrid('endEdit', self.editIndex);
          self.editIndex = undefined;
          return true;
        } else {
          return false;
        }
      },
      /**
       * 初始化表头
       */
      initGridHeader: function (optionData, metric) {
        if (JSON.stringify(optionData) == '{}') {
          return;
        }
        var self = this;
        if (metric != undefined) {
          self.metric = metric;
        }
        self.computeGridHeight();
        self.optionData = optionData;
        var headerColumns = {};
        var checkField = '';
        // 普通表头
        if (optionData.columns) {
          $.each(optionData.columns, function (i, arr) {
            $.each(arr, function (j, item) {
              // 扩展表头字段-固定列宽
              if (item['fixed']) {
                item.fixed = true;
              }
              // 勾选列
              if (item.isChecked) {
                item.checkbox = true;
                checkField = item.field;
                item.hidden = !self.showCheckBox;
              }
              // 列排序
              if (item['orderable'] == 1) {
                item.sortable = true;
              }
              // 非空字段
              if (item.field) {
                headerColumns[item.field] = item;
              }
            })
          });
        }
        // 冻结表头
        if (optionData.frozenColumns) {
          $.each(optionData.frozenColumns, function (i, arr) {
            $.each(arr, function (j, item) {
              // 扩展表头字段-固定列宽
              if (item['fixed']) {
                item.fixed = true;
              }
              // 勾选列
              if (item.isChecked) {
                item.checkbox = true;
                checkField = item.field;
                item.hidden = !self.showCheckBox;
              }
              // 列排序
              if (item['orderable'] == 1) {
                item.sortable = true;
              }
              // 非空字段
              if (item.field) {
                headerColumns[item.field] = item;
              }
            })
          });
        }
        self.columnsFormat(optionData.columns, self.metric, self.hightLightFields, self.pageSize, self.pageNumber);
        self.frozenColumnsFormat(optionData.frozenColumns, self.metric, self.hightLightFields, self.pageSize, self.pageNumber);

        self.checkField = checkField;
        self.headerColumns = headerColumns;
        self.$emit('getHeaderColumns', headerColumns);
      },
      /**
       * 初始化表格主体
       */
      initGridBody: function (gridData) {
        if (JSON.stringify(gridData) == '{}') {
          return;
        }
        var self = this;
        self.scrollCanRun = false;
        self.gridData = gridData;
        var gridId = '#' + self.gridTableId;
        var containerId = '#' + self.gridContainerId;
        if (!gridData.rows) {
          return;
        }
        if (!gridData.rows.length) {
          self.bodyDataIsEmpty = true;
        } else {
          self.bodyDataIsEmpty = false;
        }
        var tableHtml = '<table id="' + self.gridTableId +
          '" class="datagrid-grid mat-table-normal stripe hover" style="height:' +
          self.tableHeight + 'px"></table>';

        if (!self.optionData.gridProperty.tableType) {
          // 仅刷新数据
          if (gridData.refreshOnly) {
            $(gridId).treegrid('loadData', gridData);
            $('.datagrid-view2 .datagrid-body').perfectScrollbar('update');
            self.$emit('finishDraw');
            return;
          }
          $(containerId).html(tableHtml);
          self.initTreeGrid(gridData);
        } else {
          // 求底部合计行
          if (!gridData.footer && gridData.showFooter) {
            gridData.footer = self.computeFooter(gridData.rows, self.headerColumns);
          }
          // 仅刷新数据
          if (gridData.refreshOnly) {
            $(gridId).datagrid('loadData', gridData);
            $('.datagrid-view2 .datagrid-body').perfectScrollbar('update');
            self.$emit('finishDraw');
            return;
          }
          $(containerId).html(tableHtml);
          self.initDataGrid(gridData);
        }
      },
      /**
       * 初始化树形表格TreeGrid;
       */
      initTreeGrid: function (gridData) {
        var self = this;
        var optionData = self.optionData;
        var idField = optionData.gridProperty.idField;
        self.idFormat(gridData.rows);
        var gridId = '#' + self.gridTableId;
        // easyui-treegrid配置
        $(gridId).treegrid({
          idField: idField,
          treeField: optionData.gridProperty.treeField,
          frozenColumns: optionData.frozenColumns,
          columns: optionData.columns,
          data: gridData,
          fit: true,
          fitColumns: optionData.gridProperty.fitColumns,
          striped: true,
          nowrap: true,
          scrollbarSize: 4,
          singleSelect: self.singleSelect,
          rownumbers: self.isRowNumbers,
          showFooter: !!gridData.showFooter,
          loadMsg: '数据加载中，请稍等...',
          emptyMsg: '<span>暂无数据</span>',
          animate: true,
          // 双击单元格事件
          onDblClickCell: function (field, row) {
            self.$emit('onDblClickCell', {
              field: field,
              row: row,
              column: self.headerColumns[field]
            });
          },
          // 单击单元格事件
          onClickCell: function (field, row) {
            self.$emit('onClickCell', {
              field: field,
              row: row,
              column: self.headerColumns[field]
            });
          },
          // 单击表格行事件
          onClickRow: function (rowData) {
            // 行不可选定高亮
            if (!self.selectable) {
              $(gridId).treegrid('unselect', rowData[idField]);
            }
            self.$emit('onClickRow', {
              rowData: rowData,
            });
          },
          // 双击表格行事件
          onDblClickRow: function (rowData) {
            // 行不可选定高亮
            if (!self.selectable) {
              $(gridId).treegrid('unselect', rowData[idField]);
            }
            self.$emit('onDblClickRow', {
              rowData: rowData,
            });
          },
          // 表格树节点扩展显示事件
          onBeforeExpand: function (row) {
            if (!row.children || row.children.length == 0) {
              self.$emit('lazyLoadTreeGrid', {
                row: row,
                gridId: gridId
              });
              return true;
            }
          },
          // 折叠节点时
          onCollapse: function (row) {
            var scrollPos = $('#' + self.gridContainerId + ' .datagrid-view1 .datagrid-body').scrollTop();
            if (scrollPos) {
               $('#' + self.gridContainerId + ' .datagrid-view2 .datagrid-body').scrollTop(scrollPos);
            }
          },
          // 加载完成
          onLoadSuccess: function (row, data) {
            // 浏览器窗口变化图表重绘
            MAT.event.on("resizeView", function () {
              self.computeGridHeight();
              self.$nextTick(function () {
                $(gridId).treegrid('resize', {
                  height: self.tableHeight,
                });
              });
            });
            // 无数据时显示提示
            self.showNoData = gridData.rows.length == 0;
            // 获取表头的高
            self.heightOfTableHead = $('#' + self.gridContainerId + ' .datagrid-header').height() + 4;
            // 使用perfectScrollbar重定义滚动条
            $('.datagrid-view2 .datagrid-body').perfectScrollbar();

            // 穿透单元格hover样式
            $(".datagrid-container .datagrid-body").on('mouseover', 'td', function () {
              var $span = $($(this).find('.normal-hight-light').parent().get(0));
              $span.addClass("penetrate-highlight");
            }).on('mouseleave', 'td', function () {
              var $span = $($(this).find('.normal-hight-light').parent().get(0));
              $span.removeClass("penetrate-highlight");
            })

            // 完成表格渲染,向外发出完成渲染表格事件
            MAT.event.trigger("resizeView");
            self.$emit('finishDraw');
          }
        });

      },
      /**
       * 初始化普通表格datagrid
       */
      initDataGrid: function (gridData) {
        var self = this;
        var optionData = self.optionData;
        var gridId = '#' + self.gridTableId;
        $(gridId).datagrid({
          columns: optionData.columns,
          frozenColumns: optionData.frozenColumns,
          data: gridData,
          fit: true,
          fitColumns: optionData.gridProperty.fitColumns,
          striped: true,
          nowrap: true,
          fixed: true,
          scrollbarSize: 4,
          singleSelect: self.singleSelect,
          checkOnSelect: false,
          rownumbers: self.isRowNumbers,
          showFooter: !!gridData.showFooter,
          loadMsg: '数据加载中，请稍等...',
          emptyMsg: '<span>暂无数据</span>',
          // rowStyler: function (index, row) {
          //   if (row[self.checkAble.key] == 1) {
          //     return 'background-color:rgb(224, 224, 224);';
          //   }
          // },
          // 双击单元格事件
          onDblClickCell: function (rowIndex, field, value) {
            if (self.endEditing()) {
              $('#' + self.gridTableId).datagrid('selectRow', rowIndex).datagrid('editCell', {
                index: rowIndex,
                field: field
              });
              self.editIndex = rowIndex;
              $("#editvalue").val(value);
            }
            self.$emit('onDblClickCell', {
              field: field,
              rowIndex: rowIndex,
              value: value,
              row: self.gridData.rows[rowIndex],
              column: self.headerColumns[field]
            });
          },
          // 编辑完后执行的函数onAfterEdit 
          onAfterEdit: function (index, row, changes) {
            self.$emit('onafteredit', {
              rowIndex: index,
              rowData: row,
              change: changes,
            });
          },
          // 单击单元格事件
          onClickCell: function (rowIndex, field, value) {
            self.endEditing();
            // 行不可选定高亮
            self.$emit('onClickCell', {
              rowIndex: rowIndex,
              field: field,
              value: value,
              row: self.gridData.rows[rowIndex],
              column: self.headerColumns[field]
            });
          },
          // 双击表格行事件
          onDblClickRow: function (rowIndex, rowData) {
            // 行不可选定高亮
            if (!self.selectable) {
              $(gridId).datagrid('unselectRow', rowIndex);
            }
            self.$emit('onDblClickRow', {
              rowIndex: rowIndex,
              rowData: rowData
            });
          },
          // 单击表格行事件
          onClickRow: function (rowIndex, rowData) {
            // 行不可选定高亮
            if (!self.selectable) {
              $(gridId).datagrid('unselectRow', rowIndex);
            }
            self.$emit('onClickRow', {
              rowIndex: rowIndex,
              rowData: rowData
            });
          },
          // 排序触发
          onSortColumn: function (sort, order) {
            var sortData = {
              orderType: order
            };
            if (!!self.headerColumns[sort]['orderField']) {
              // 若存在排序字段
              sortData.orderField = self.headerColumns[sort]['orderField'];
            } else {
              sortData.orderField = sort;
            }
            self.$emit('onSortColumn', sortData);
          },
          // 勾选一行
          onCheck: function (rowIndex, rowData) {
            // 判断是否全选
            if (self.checkAllAble) {
              var checkedInputsLen = $(".datagrid .datagrid-row-checked .datagrid-cell-check input").length;
              var disabledInputsLen = $(".datagrid .datagrid-cell-check input[disabled]").length;
              var checkInputsLen = $(".datagrid .datagrid-cell-check input").length;
              if ((disabledInputsLen + checkedInputsLen) == checkInputsLen) {
                $('.datagrid-header-check input').get(0).checked = true;
              }
            }

            var checkedArr = $(gridId).datagrid('getChecked');
            self.$emit('onCheck', {
              rowIndex: rowIndex,
              rowData: rowData,
              checkedArr: checkedArr
            });
          },
          // 取消勾选一行
          onUncheck: function (rowIndex, rowData) {
            var checkedArr = $(gridId).datagrid('getChecked');
            self.$emit('onUncheck', {
              rowIndex: rowIndex,
              rowData: rowData,
              checkedArr: checkedArr
            });
          },
          // 勾选全部
          onCheckAll: function (rows) {
            var rowLen = rows.length;
            var realCheckRows = []
            if (rowLen > 0) {
              for (var i = 0; i < rowLen; i++) {
                if (self.checkAble.value.indexOf(rows[i][self.checkAble.key]) == -1) {
                  $(gridId).datagrid('uncheckRow', i);
                } else {
                  realCheckRows.push(rows[i]);
                }
              }
            }
            $('.datagrid-header-check input').get(0).checked = true;
            self.$emit('onCheckAll', {
              rows: rows,
              checkedArr: realCheckRows
            });
          },
          // 取消勾选全部
          onUncheckAll: function (rows) {
            self.$emit('onUncheckAll', {
              rows: rows,
              checkedArr: []
            });
          },
          // 加载完毕
          onLoadSuccess: function (data) {
            //加载完毕后获取所有的checkbox遍历
            //根据isFinanceExamine让某些行不可选
            var rows = data.rows || [];
            var rowLen = rows.length;
            if (!self.checkAllAble) {
              $('.datagrid-header-check input').remove();
            }
            if (rowLen > 0) {
              for (var i = 0; i < rowLen; i++) {
                if (self.checkAble.value.indexOf(rows[i][self.checkAble.key]) == -1) {
                  var check = $(".datagrid .datagrid-cell-check input[type='checkbox']")[i];
                  if (check) {
                    check.disabled = true;
                  }
                }
              }
            }

            // 勾选行切换显示事件
            MAT.event.on('showGridCheck', function () {
              $(gridId).datagrid('showColumn', self.checkField);
            });
            MAT.event.on('hideGridCheck', function () {
              $(gridId).datagrid('uncheckAll');
              $(gridId).datagrid('hideColumn', self.checkField);
            })

            // 表格滚动事件
            self.scrollCanRun = true;
            var gridBodyId = '#' + self.gridContainerId + ' .datagrid-body';
            $(gridBodyId).scroll(function () {
              if (!self.scrollCanRun) {
                // 判断是否已空闲，如果在执行中，则直接return
                return;
              }

              var sheight = $(this)[0].scrollHeight;
              var top = $(this)[0].scrollTop;
              var height = $(this).height();
              if ((top + height + 500) >= sheight) {
                self.scrollCanRun = false;
                self.$emit('onTriggerScroll', self.gridTableId);
              }
            });
            // 滚动加载事件 - 动态加载行数据
            var eventId = self.gridTableId + '-append';
            MAT.event.clear(eventId);
            MAT.event.on(eventId, function (rows) {
              var rowData = rows || [];
              $.each(rowData, function (index, rItem) {
                $(gridId).datagrid('appendRow', rItem);
              })
              self.scrollCanRun = true;
            })
            //合并表格
            var merges = data.merges || [];
            var mergesLen = merges.length;
            for(var i=0; i<mergesLen; i++) {
              $(gridId).datagrid('mergeCells',{
                index:merges[i].index,
                field:merges[i].field,
                rowspan:merges[i].rowspan || 0,
                colspan:merges[i].colspan || 0,
              });
            }
            // 窗口变化图表重绘
            MAT.event.on("resizeView", function () {
              self.computeGridHeight();
              self.$nextTick(function () {
                $(gridId).datagrid('resize', {
                  height: self.tableHeight,
                })
              })
            });
            // 无数据时显示对应提示
            self.showNoData = rows.length == 0;
            //获取表头的高
            self.heightOfTableHead = $('#' + self.gridContainerId + ' .datagrid-header').height() + 4;

            // 使用perfectScrollbar重定义滚动条
            $('.datagrid-view2 .datagrid-body').perfectScrollbar();

            // 穿透单元格hover样式
            $(".datagrid-container .datagrid-body").on('mouseover', 'td', function () {
              var $span = $($(this).find('.normal-hight-light').parent().get(0));
              $span.addClass("penetrate-highlight");
            }).on('mouseleave', 'td', function () {
              var $span = $($(this).find('.normal-hight-light').parent().get(0));
              $span.removeClass("penetrate-highlight");
            })

            // 发出完成渲染表格事件
            MAT.event.trigger("resizeView");
            self.$emit('finishDraw');
          }
        });

      },
      // 树形表格-单位机构ID转化
      idFormat: function (data) {
        var self = this;
        var pOrganIdSet = {};
        $.each(data, function (idx, item) {
          pOrganIdSet[item[self.treeNodeKey]] = item[self.pTreeNodeKey];
          try {
            if (item[self.treeNodeKey] == self.rootOrganId) {
              item['_parentId'] = null;
              if (!item['is_leaf']) {
                item.state = 'open';
              }
            } else {
              item['_parentId'] = item[self.pTreeNodeKey];
              if (!item['is_leaf']) {
                item.state = 'closed';
              }
            }
          } catch (err) {
            throw err;
          }
        });
        $.each(data, function (idx, item) {
          if (!pOrganIdSet.hasOwnProperty(item['_parentId'])) {
            item['_parentId'] = null;
            if ((item[self.treeNodeKey] + '').indexOf(ZJJK_CONST.virtualOrgTag) > -1) {
              item.state = '';
              return true;
            }
            if (item[self.treeNodeKey] == self.rootOrganId) {
              item.state = 'open';
              return true;
            }
            if (!item['is_leaf']) {
              item.state = 'closed';
            }
          }
        });
      },
      // 计算自适应表格高度
      computeGridHeight: function () {
        if (!this.subHeight) {
          this.tableHeight = this.gridHeight;
        } else {
          var height = document.body.clientHeight - this.subHeight;
          this.tableHeight = height < 300 ? 300 : height;
        }
      },
      // 计算表底部合计行
      computeFooter: function (rows, headerColumns) {
        var footerRows = []; // 表底部行数据
        var addFields = []; // 需要合计的列字段
        var footAlias = {}; // 底部行别名
        for (var key in headerColumns) {
          if (headerColumns[key]['foot_alias']) {
            footAlias[key] = headerColumns[key]['foot_alias'];
          }
          if ((headerColumns[key]['isAgg'] !== '0') &&
            ((headerColumns[key]['field_type'] == '4') || (headerColumns[key]['field_type'] == '2'))) {
            addFields.push(key);
          }
        }
        var totalRow = {}; // 合计行
        var tempNum = 0; // 缓存计算变量
        for (var i = 0, len = rows.length; i < len; i++) {
          for (var j = 0, fieldLen = addFields.length; j < fieldLen; j++) {
            if (typeof (rows[i][addFields[j]]) == 'number') {
              tempNum = totalRow[addFields[j]] || 0;
              totalRow[addFields[j]] = tempNum + rows[i][addFields[j]];
            }
          }
        }
        // 合并行
        var result = $.extend({}, totalRow, footAlias);
        footerRows.push(result);
        return footerRows;
      }
    },
  });
});