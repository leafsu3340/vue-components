/**
 * 暂时弃用
 */
define(['vue',
  'text!components/datatable/index.html',
  'css!components/datatable/css/datatable.css',
  'datatables',
  './js/dataTables.fixedColumns',
  './js/dataTables.scroller',
], function (Vue, template) {
  return Vue.extend({
    name: 'DataTable',
    template: template,
    props: {
      fixCol: {
        type: Number,
        default: 0,
      }
    },
    data: function data() {
      return {
        headerHtml: '',
        columns: [],
        gridData: [],
        headerData: [],
        gridHeight: 400,
        tableData: [],
      }
    },
    mounted: function mounted() {
      var self = this;
      self.gridHeight = document.body.clientHeight - 315 || 400;
      MAT.event.clear('initTableHeader');
      MAT.event.clear('initTableBody');
      MAT.event.clear('removeDataTable');
      MAT.event.on('initTableHeader', function (headerData, headerColumns) {
        self.initHeader(headerData, headerColumns);
      });
      MAT.event.on('initTableBody', function (tableData) {
        self.initDataTable(tableData);
      })
      MAT.event.on('removeDataTable', function () {
        if ($.fn.DataTable.isDataTable('#data-table')) {
          $('#data-table').DataTable().destroy();
          $('#data-table').empty();
        }
      })

    },
    methods: {
      /**
       * 初始化复杂表头
       */
      initHeader: function initHeader(headerData, headerColumns) {
        this.columns = headerColumns;

        var headerHtml = "<thead>";
        $.each(headerData, function (index, item) {
          headerHtml += "<tr>"
          $.each(item, function (idx, val) {
            if (!val.field) {
              var htm = "<th rowspan='" + val.rowspan + "' colspan='" + val.colspan + "' data-ruleid='" + val.ruleId + "'>" +
                val.title + "</th>";
              headerHtml += htm;
            } else {
              var htm = "<th data-head='" + val.field + "' rowspan='" + val.rowspan + "' colspan='" + val.colspan + "' data-ruleid='" + val.ruleId + "'>" +
                val.title + "</th>";
              headerHtml += htm;
            }
          })
          headerHtml += "</tr>"
        })
        this.headerHtml = headerHtml + "</thead>";
      },
      // 初始化表格
      initDataTable: function initDataTable(tableData) {
        var self = this;
        self.tableData = tableData;
        if ($.fn.DataTable.isDataTable('#data-table')) {
          $('#data-table').DataTable().destroy();
          $('#data-table').empty();
        }

        $('#data-table').html(self.headerHtml);
        var dataTable = $('#data-table').DataTable({
          paging: false,
          searching: false,
          autoWidth: true,
          scrollX: true,
          deferRender: true,
          scrollCollapse: true,
          scroller: true,
          scrollY: self.gridHeight,
          fixedColumns: {
            leftColumns: 1
          },
          ordering: false,
          data: tableData,
          columns: self.columns,
          info: false,
          initComplete: function () {
            this.api().row(10).scrollTo();
          },
          columnDefs: [
            {
              targets: "_all",
              createdCell: function (td, cellData, rowData, row, col) {
                var colInfo = self.columns[col];
                var isLeaf = parseInt(rowData["is_leaf"], 10);
                var cellClass = "";
                var cellHtml = "";
                var cellSpan = "";
                if (colInfo.type === "STRING") {
                  cellClass = "text-left";
                } else {
                  cellClass = "text-right";
                }
                if (col === 0 && !isLeaf) {
                  cellSpan = '<span class="fa fa-arrow-left hasChildren" style="cursor: pointer;" data-organid="' + rowData.organ_id + '"></span>'
                }

                cellHtml = '<p class="' + cellClass + '">' + cellSpan + cellData + '<p>';
                $(td).html(cellHtml);
              }
            },
            // {
            //   targets: 0,
            //   orderable: false,
            //   render: function (data, type, full, meta) {
            //     // console.log( data, type, full, meta )
            //     var isLeaf = parseInt(full["is_leaf"], 10);
            //     if (!isLeaf) {
            //       return '<p><span class="fa fa-arrow-left hasChildren" data-organid="' + full["is_leaf"] + '></span>'
            //         + data + '</p>';
            //     } else {
            //       return '<p>' + data + '</p>';
            //     }
            //   }
            // }
          ],
          // headercallback: function (thead, data, start, end, display) {
          //   console.log(data);
          // },
          createdRow: function (row, rowData, dataIndex) {
            // console.log(row, rowData, dataIndex);
            var isLeaf = parseInt(rowData["is_leaf"], 10);
            if (!isLeaf) {
              // console.log("test")
            }
          }
        });

        // 单元格高亮
        $('#data-table tbody').on('mouseover', 'td', function () {
          $(this).addClass('highlight');
        }).on('mouseleave', 'td', function () {
          $(this).removeClass('highlight');
        });


        // 穿透操作
        $('#data-table tbody').on('dblclick', 'td', function () {
          var cell = dataTable.cell(this);
          var colIdx = cell.index().column;
          var rowIdx = cell.index().row;
          // var colIdx = $(this).prevAll().length;
          // var rowIdx = $(this).parent().prevAll().length;

          var colheader = dataTable.column(colIdx).header(); // 获取头
          var rowData = dataTable.row(rowIdx).data();        // row对相应的数据
          // var rowData = self.tableData[rowIdx];   // row对相应的数据
          var headVal = $(colheader).data('head');
          var ruleId = $(colheader).data('ruleid');
          if (!ruleId) {
            MAT.utils.notific('该单元格无法穿透', 'warn');
            return;
          }
          var queryParam = {
            ruleId: ruleId,
            headVal: headVal,
            organId: rowData.organId,
          };
          self.$emit('penetrateGrid', queryParam);
        })

        // TODO: 表格数据树扩展
        $('#data-table tbody').on('click', 'td', function () {
          var childrenLen = $(this).find('span.hasChildren').length;
          if (!childrenLen) {
            return;
          } else {
            var rowIdx = dataTable.cell(this).index().row;
            var row = dataTable.row(rowIdx);
            if (row.child.isShown()) {
              row.child.hide();
            } else {
              row.child(
                $("<tr role='row'>" +
                  "<td><span style='cursor:pointer;' class='hasChildren'>##<span>1</td>" +
                  "<td>" + rowIdx + ".2</td>" +
                  "<td>" + rowIdx + ".3</td>" +
                  "<td>" + rowIdx + ".4</td>" +
                  "<td>" + rowIdx + ".5</td>" +
                  "<td>" + rowIdx + ".6</td>" +
                  "</tr>")).show();
              dataTable.draw();
            }
          }
        })

        // 窗口变化图表重绘
        MAT.event.on("resizeView", function () {
          self.gridHeight = document.body.clientHeight - 315 || 400;
          dataTable.columns.adjust().draw();
        })

        self.$emit('finishDraw');
      }
    },
  });
});
