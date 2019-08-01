define(['vue',
  'text!./index.html',
  'utils/event-listener.js',
  'css!./popover.css'
], function (Vue, template, EventListener) {
  return Vue.extend({
    name: 'Popover',
    template: template,
    props: {
      // 需要监听的事件
      trigger: {
        type: String,
        default: 'click'
      },
      effect: {
        type: String,
        default: 'fadein'
      },
      title: {
        type: String
      },
      // toolTip消息提示
      content: {
        type: String
      },
      header: {
        type: Boolean,
        default: true
      },
      placement: {
        type: String,
        default: 'top'
      }
    },
    data: function () {
      return {
        // 通过计算所得 气泡位置  
        position: {
          top: 0,
          left: 0
        },
        show: true,
        type: 'delete'
      };
    },
    watch: {
      show: function (val) {
        if (val) {
          var popover = this.$refs.popover;
          var triger = this.$refs.trigger.children[0];
          // 通过placement计算出位子
          switch (this.placement) {
            case 'top':
            this.position.left = triger.offsetLeft - popover.offsetWidth - 2 * triger.offsetWidth;
            this.position.top = - 10 * triger.offsetTop + popover.offsetHeight;
              break;
            case 'left':
              this.position.left = triger.offsetLeft - popover.offsetWidth;
              this.position.top = triger.offsetTop + triger.offsetHeight / 2 - popover.offsetHeight / 2;
              break;
            case 'right':
              this.position.left = triger.offsetLeft + triger.offsetWidth;
              this.position.top = triger.offsetTop + triger.offsetHeight / 2 - popover.offsetHeight / 2;
              break;
            case 'bottom':
              this.position.left = triger.offsetLeft - popover.offsetWidth / 2 + triger.offsetWidth / 2;
              this.position.top = triger.offsetTop + triger.offsetHeight;
              break;
            default:
              console.log('Wrong placement prop');
          }
          popover.style.top = this.position.top + 'px';
          popover.style.left = this.position.left + 'px';
        }
      }
    },
    methods: {
      toggle: function () {
        this.show = !this.show;
      },
      mouseOver: function (e) {
        this.show = true;
      }
    },
    mounted: function () {
      if (!this.$refs.popover) {
        return console.log("Couldn't find popover ref in your component that uses popoverMixin.");
      }
      // // 获取监听对象
      // var self = this;
      var triger = this.$refs.trigger.children[0];
      // $(triger).on('mouseover', function () {
      //   self.show = true;
      // })
      // $(triger).on('mouseout', function () {
      //   self.show = false;
      // })
      // // 根据trigger监听特定事件
      if (this.trigger === 'hover') {
        this._mouseenterEvent = EventListener.listen(triger, 'mouseenter', () => {
          this.show = true;
        });
        this._mouseleaveEvent = EventListener.listen(triger, 'mouseleave', () => {
          this.show = false;
        });
      } else if (this.trigger === 'focus') {
        this._focusEvent = EventListener.listen(triger, 'focus', () => {
          this.show = true;
        });
        this._blurEvent = EventListener.listen(triger, 'blur', () => {
          this.show = false;
        });
      } else {
        this._clickEvent = EventListener.listen(triger, 'click', this.toggle);
      }
      this.show = !this.show;
    },
    // 在组件销毁前移除监听，释放内存
    beforeDestroy: function () {
      if (this._blurEvent) {
        this._blurEvent.remove();
        this._focusEvent.remove();
      }
      if (this._mouseenterEvent) {
        this._mouseenterEvent.remove();
        this._mouseleaveEvent.remove();
      }
      if (this._clickEvent) this._clickEvent.remove();
    }
  })
});