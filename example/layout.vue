<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider
      :trigger='show ? "中午" :"中文"'
      collapsible
      v-model="collapsed"
      style="background: rgba(25,35,60,1);position : relative;z-index:100000000;"
    >
      <div class="logo">
        <a-tooltip
          v-if="collapsed"
          placement="right"
        >
          <template slot='title'>
            众相
          </template>
          <a-icon
            type="deployment-unit"
            style="font-size: 28px;line-height: 68px;font-weight: bold;"
          />
        </a-tooltip>
        <span v-else>{{$t('众相')}}</span>
      </div>
      <menu-list style="height: calc(100% - 54px);overflow-y: auto;"></menu-list>
    </a-layout-sider>
  </a-layout>
</template>
<script>
import MenuList from './menuList'
//水印
export default {
  name: 'layout',
  components: { MenuList },
  data() {
    return {
      viewType: false,
      collapsed: false,
      ticket: '',
      isIframe: false,
      y: document.body.clientHeight - 140
    }
  },
  methods: {
    urlF(key) {
      this.current = key;
      this.$store.state.currentType = false;
      this.$nextTick(() => {
        this.$store.state.currentType = true;
      });
    },
    onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1)
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    },
    /**获取当前时间**/
    queryDateFomatter(date) {
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hours = date.getHours();
      var minu = date.getMinutes();
      var sec = date.getSeconds();
      function ret(data) {
        if (data < 10) {
          data = '0' + data;
        }
        return data;
      }
      return year + '' + ret(month) + '' + ret(day) + '' + ret(hours) + '' + ret(minu) + '' + ret(sec);
    },

    //子页面路由
    breadcrumbF(breadStr, url) {
      this.$router.push(url);
      if (breadStr.indexOf(',')) {
        this.$store.state.routes = breadStr.split(',');
      } else {
        this.$store.state.routes[0] = breadStr;
      }
    },
  }
}
</script>
<style lang="less" src="../../../static/less/index.less" ></style>

<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 58px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}
#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}
#components-layout-demo-custom-trigger .logo {
  height: 54px;
  text-align: center;
  color: #fff;
  line-height: 54px;
  font-size: 18px;
  background-color: rgba(18, 26, 44, 1);
}
/*.ant-menu.ant-menu-dark .ant-menu-item-selected, .ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected{
	background-color : #1C6AEB!important;
}*/
</style>
