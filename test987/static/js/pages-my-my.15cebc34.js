(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-my-my"],{1885:function(t,e,a){"use strict";a.d(e,"b",(function(){return i})),a.d(e,"c",(function(){return o})),a.d(e,"a",(function(){return n}));var n={uSwiper:a("e938").default,uButton:a("5d68").default},i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("layout",{attrs:{showPading:!1}},[n("v-uni-view",{staticClass:"container"},[t._e(),t._e(),n("v-uni-view",{staticClass:"cell_box"},[n("div",{staticClass:"cell_item",on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.jumpPath("/pages/my/income/income")}}},[n("div",{staticClass:"cell_title"},[n("v-uni-image",{staticClass:"icon",attrs:{src:"/static/image/icon/icon_about.png"}}),n("v-uni-text",{staticClass:"title"},[t._v("个人中心")])],1),n("div",{staticClass:"value_box"},[n("v-uni-image",{staticClass:"right",attrs:{src:a("b4a5")}})],1)]),n("div",{staticClass:"cell_item",on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.jumpPath("/pages/my/livestream/livestream")}}},[n("div",{staticClass:"cell_title"},[n("v-uni-image",{staticClass:"icon",attrs:{src:"/static/image/icon/icon_service.png"}}),n("v-uni-text",{staticClass:"title"},[t._v("开播")])],1),n("div",{staticClass:"value_box"},[n("v-uni-image",{staticClass:"right",attrs:{src:a("b4a5")}})],1)]),n("div",{staticClass:"cell_item",on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.jumpPath("/pages/my/accountSafety/accountSafety")}}},[n("div",{staticClass:"cell_title"},[n("v-uni-image",{staticClass:"icon",attrs:{src:"/static/image/icon/icon_topic.png"}}),n("v-uni-text",{staticClass:"title"},[t._v("设置")])],1),n("div",{staticClass:"value_box"},[n("v-uni-image",{staticClass:"right",attrs:{src:a("b4a5")}})],1)]),n("div",{staticClass:"cell_item",on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.jumpPath("/pages/my/beautystream/beautystream")}}},[n("div",{staticClass:"cell_title"},[n("v-uni-image",{staticClass:"icon",attrs:{src:"/static/image/icon/bar_mine.png"}}),n("v-uni-text",{staticClass:"title"},[t._v("美颜")])],1),n("div",{staticClass:"value_box"},[n("v-uni-image",{staticClass:"right",attrs:{src:a("b4a5")}})],1)])]),n("v-uni-view",{staticStyle:{padding:"40upx"}},[n("u-button",{staticClass:"logout-btn",attrs:{shape:"circle",type:"primary",text:"退出登录"},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.logoutFun()}}})],1)],1)],1)},o=[]},"1fb7":function(t,e,a){var n=a("f1c1");n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);var i=a("4f06").default;i("487c2026",n,!0,{sourceMap:!1,shadowMode:!1})},"24fb0":function(t,e,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i=n(a("c7eb")),o=n(a("1da1")),r=n(a("5530")),c=a("4b93"),s=a("26cb"),l=a("ffd9"),f={data:function(){return{bgList:[],current:0,fanNav:[{name:"关注",num:0},{name:"粉丝",num:0},{name:"访客",num:0}],menuNav:[{name:"我的钱包",icon:"",path:"/pages/my/wallet/wallet"},{name:"收益提现",icon:"",path:"/pages/my/income/income"},{name:"会员中心",icon:"",path:"/pages/member/member",pathType:"tabBar"}],userInfo:{nickName:"nickName",picture:"nickName",loginNumber:"loginNumber",sign:"sign"},version:"",onlineServe:""}},computed:(0,r.default)({},(0,s.mapState)(["userData"])),onLoad:function(){},onShow:function(){this.userData.init||this.updateUserdata()},methods:(0,r.default)((0,r.default)({},(0,s.mapActions)(["updateUserdata","logoutAction"])),{},{openService:function(){var t=this;return(0,o.default)((0,i.default)().mark((function e(){var a;return(0,i.default)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return console.log("openService"),e.next=3,(0,c.getServiceUrl)();case 3:a=e.sent,console.log(a),a.data?plus.runtime.openURL(a.data):t.$toast("网络异常");case 6:case"end":return e.stop()}}),e)})))()},renderNumStr:function(t){return(0,l.numberToStr)(t)},getUserInfo:function(){var t=this;return(0,o.default)((0,i.default)().mark((function e(){var a,n,o,s,l;return(0,i.default)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,c.API.userData();case 2:a=e.sent,console.log(a),n=a.data.data,o=n.nickName,s=n.loginNumber,l=n.sign,t.userInfo=(0,r.default)((0,r.default)({},t.userInfo),{},{nickName:o,loginNumber:s,sign:l});case 6:case"end":return e.stop()}}),e)})))()},previewImg:function(t){uni.previewImage({current:t,urls:this.bgList})},jumpPath:function(t){uni.navigateTo({url:t})},jumpHandle:function(t){return"tabBar"==t.pathType?(getApp().globalData.index=2,void uni.switchTab({url:t.path})):"/pages/my/proxy/proxy"===t.path?this.$toast("暂未开通"):void uni.navigateTo({url:t.path})},jumpFans:function(t){},logoutFun:function(){var t=this;return(0,o.default)((0,i.default)().mark((function e(){return(0,i.default)().wrap((function(e){while(1)switch(e.prev=e.next){case 0:t.logoutAction();case 1:case"end":return e.stop()}}),e)})))()}})};e.default=f},"7fcc":function(t,e,a){"use strict";a.r(e);var n=a("24fb0"),i=a.n(n);for(var o in n)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return n[t]}))}(o);e["default"]=i.a},8538:function(t,e,a){"use strict";var n=a("1fb7"),i=a.n(n);i.a},"92b4":function(t,e,a){"use strict";a.r(e);var n=a("1885"),i=a("7fcc");for(var o in i)["default"].indexOf(o)<0&&function(t){a.d(e,t,(function(){return i[t]}))}(o);a("8538");var r=a("f0c5"),c=Object(r["a"])(i["default"],n["b"],n["c"],!1,null,"4ef5e0af",null,!1,n["a"],void 0);e["default"]=c.exports},b4a5:function(t,e){t.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAqCAYAAACpxZteAAAAAXNSR0IArs4c6QAAA9JJREFUWEetll1oXEUUx/9nbpuWYBJbW1Dog9KiFqwPxQqKpW6lzX4FtWwn2Wirbe5mU0qh+lwhoD77RaXbu4lKJMneVUE22Zsa2pRGLaXggwq+5EGkoFC0pAlpu/bOkbskobvuzu7d7X2dOb/fPTNnzgwBwNlxZ5cQOAHwJiZxvoNvfiKlLHhjzX6UykwEBMQUCC33wKYXsPjy21LealpgZZwrIH62HESgyXYsHGg2E7Iy+VsgrK/0p8T4up0Wu6WUbqOZeII5ELZWAxBopB0LRxqVkGWfOwa4n+r+kBhWnwwliYj9ZkJegJVxPgbxCa0E+MiU4ZMNCZiZ0tkpC+A+vUS8b8rgKT+SYgbeZ9u2Mc9tIyCOayVE75gHQ+/VK1kVrErQlgX4VR1AEN7qOxj+sB5JiWBZ0nITbd8yOKgBsAEaOCpDZ2tJ/ifwAlK5XKuxtGaCiQMagCKIN00ZHKlRHJWHT9szD6zj298x8XNVAQwXCj2JePir6udIo0/Z0x2C714A8U6NpKCUOpCMRycrdoNaazhs5ze7jAsgPKWR3HYVRQfiofPlcyruQfmk0/bkwy1MsyBs00iWCNhvdod/uHdOXQIvwPoyv4XWYpYJj2ok88y0r78ndHVlTt0CLyBtT21jqBkAW6puKtPfLqlAUkZ+8eb4EhRLeDT3pDCMSyBs1mTyh2p1tye7urxl8/9Zo87TMPgiCBuqRxs9CdmZaUhQ3BPbSeua40o7aUiQzjqnmPldXe4u3OcHZNdl34KhbP6kYnxQoz2MmjL8mu9NHradfhd8RlccBDjtWHxl5bFQdwZD2anDitVnAISmRGfc1rtRr3p8nQNrLB+DwDgIhgZ++Q6t339cBhZ9neTU2ERECPFN2cOs1MP0k6I1e5Ny37yvXnRmzHnJEDxR7d1UhDF+NQh7j8rwdV/dNGU7LwjmcyC0ak7sXIF493EZ+avq0lUa8B7DRDwNQkf1Ncfv/C92J14PX6tRsqXDKXtyh8Fihokf0gReI4iAKYNztRpNSZkO2c4Titnr+7pGdh2s9iR6or/VgpcctNR4fqsQuKhrxWDcgEsvJnpDP9cDXxV4lwnW0iUQP6bZ0HmluDMZj1ypF14ULN+534PwuAa+BKWCiXh01g+8KEhnnM+Z+A0N/A5c7kr0Rqb9wosCK5O/AcKDFYMZBQJiZnc41wh8RfBPxZuJ4bIhevtjQbtRuG6JmAQdMWOhL5qBFwWp0dwmYRh5EHYt95YCGcYxM9Y53Cx8tUwHBwfFI9uf2UOgjVwwfkweCv55P+AlB+1+Acs5/wHGBm06RGUjaAAAAABJRU5ErkJggg=="},f1c1:function(t,e,a){var n=a("24fb");e=n(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * 这里是uni-app内置的常用样式变量\r\n *\r\n * uni-app 官方扩展插件及插件市场（https://ext.dcloud.net.cn）上很多三方插件均使用了这些样式变量\r\n * 如果你是插件开发者，建议你使用scss预处理，并在插件代码中直接使用这些变量（无需 import 这个文件），方便用户通过搭积木的方式开发整体风格一致的App\r\n *\r\n */\r\n/**\r\n * 如果你是App开发者（插件使用者），你可以通过修改这些变量来定制自己的插件主题，实现自定义主题功能\r\n *\r\n * 如果你的项目同样使用了scss预处理，你也可以直接在你的 scss 代码中使用如下变量，同时无需 import 这个文件\r\n */\r\n/* 颜色变量 */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.clearfix[data-v-4ef5e0af]{zoom:1}.clearfix[data-v-4ef5e0af]:after{content:"";clear:both;height:0;line-height:0;display:block;visibility:hidden}.container[data-v-4ef5e0af]{line-height:1}.container .default-img[data-v-4ef5e0af]{width:100%;height:%?322?%}.container .swiper_box[data-v-4ef5e0af]{position:relative}.container .swiper_box .secret_icon[data-v-4ef5e0af]{width:%?38?%;height:%?38?%;position:absolute;right:%?32?%;top:%?88?%;z-index:99}.container .swiper_box .indicator[data-v-4ef5e0af]{display:flex;flex-direction:row;justify-content:center}.container .swiper_box .indicator__dot[data-v-4ef5e0af]{height:%?20?%;width:%?20?%;border-radius:100px;background-color:hsla(0,0%,100%,.35);margin:0 %?20?%;transition:background-color .3s}.container .swiper_box .indicator__dot--active[data-v-4ef5e0af]{background-color:#1d9be8}.container .content_box .user_info_box[data-v-4ef5e0af]{padding:%?27?% 0 0 %?37?%;margin-bottom:%?10?%}.container .content_box .user_info_box .member_bg[data-v-4ef5e0af]{float:left;height:%?100?%;width:%?100?%;box-sizing:border-box;position:relative;position:relative;z-index:1000}.container .content_box .user_info_box .member_bg .vip[data-v-4ef5e0af]{width:100%;height:100%;position:absolute;top:0;left:0;z-index:2}.container .content_box .user_info_box .member_bg .avatar[data-v-4ef5e0af]{width:100%;height:100%;border-radius:50%}.container .content_box .fan_box[data-v-4ef5e0af]{float:right;line-height:1;color:#fff;display:flex;align-items:center}.container .content_box .fan_box .fan_item[data-v-4ef5e0af]{padding:0 %?40?%;text-align:center;position:relative}.container .content_box .fan_box .fan_item[data-v-4ef5e0af]::after{display:block;content:"";width:1px;height:%?35?%;background-color:#9aa8b5;position:absolute;top:50%;right:0;margin-top:%?-17.5?%}.container .content_box .fan_box .fan_item[data-v-4ef5e0af]:last-child::after{width:0}.container .content_box .fan_box .fan_item .title[data-v-4ef5e0af]{color:#9aa8b5;font-size:%?24?%;margin-bottom:%?17?%}.container .content_box .fan_box .fan_item .value[data-v-4ef5e0af]{font-size:%?30?%}.container .content_box .user_info[data-v-4ef5e0af]{padding:0 %?20?%}.container .content_box .user_info .user_name_box[data-v-4ef5e0af]{display:flex;align-items:center;margin-bottom:%?22?%}.container .content_box .user_info .user_name_box .user_name[data-v-4ef5e0af]{color:#fff;font-size:%?30?%;margin-right:%?20?%}.container .content_box .user_info .user_name_box .grade[data-v-4ef5e0af]{width:%?35?%;height:%?35?%;margin-right:%?20?%}.container .content_box .user_info .user_name_box .member[data-v-4ef5e0af]{width:%?30?%;height:%?30?%}.container .content_box .user_info .id_box[data-v-4ef5e0af]{color:#9aa8b5;padding-bottom:%?20?%;border-bottom:1px solid #222a3a}.container .content_box .sign_box[data-v-4ef5e0af]{padding:%?23?% %?40?% %?36?% %?20?%;color:#9aa8b5;font-size:%?26?%;line-height:%?40?%}.container .content_box .menu_nav[data-v-4ef5e0af]{padding:0 %?36?%;display:flex;align-items:center;justify-content:flex-start;margin-bottom:%?37?%}.container .content_box .menu_nav .menu_item[data-v-4ef5e0af]{width:%?162?%;height:%?64?%;box-sizing:border-box;background:#11161e;padding:%?16?% %?14?% %?14?% %?11?%;border-radius:%?10?%;margin-right:%?15?%}.container .content_box .menu_nav .menu_item .icon[data-v-4ef5e0af]{width:%?34?%;height:%?34?%;margin-right:%?9?%;vertical-align:middle}.container .content_box .menu_nav .menu_item .text[data-v-4ef5e0af]{font-size:%?24?%;color:#fff;vertical-align:middle}.container .cell_box[data-v-4ef5e0af]{background-color:#131b24;padding:%?68?% 0}.container .cell_box .cell_item[data-v-4ef5e0af]{display:flex;align-items:center;justify-content:space-between;padding:0 %?43?% 0 %?58?%;margin-bottom:%?65?%}.container .cell_box .cell_item[data-v-4ef5e0af]:last-child{margin-bottom:0}.container .cell_box .cell_item .cell_title .icon[data-v-4ef5e0af]{width:%?34?%;height:%?34?%;vertical-align:middle;margin-right:%?30?%}.container .cell_box .cell_item .cell_title .title[data-v-4ef5e0af]{color:#fff;font-size:%?30?%;vertical-align:middle}.container .cell_box .cell_item .value_box .right[data-v-4ef5e0af]{width:%?12?%;height:%?20?%;vertical-align:middle;margin-left:%?2?%}.container .cell_box .cell_item .value_box .tet[data-v-4ef5e0af]{vertical-align:middle;font-size:%?24?%;color:#9aa8b5}.logout-btn[data-v-4ef5e0af]{width:%?600?%}',""]),t.exports=e}}]);