(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-my-updateAvatar-updateAvatar"],{"31f2":function(e,t,a){"use strict";var n=a("f025"),r=a.n(n);r.a},"332d":function(e,t,a){"use strict";a.d(t,"b",(function(){return n})),a.d(t,"c",(function(){return r})),a.d(t,"a",(function(){}));var n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("layout",{attrs:{hasTabbar:!1}},[a("v-navbar",{attrs:{title:"修改头像"}}),a("v-uni-view",{staticClass:"page_box"},[a("v-uni-view",{staticClass:"avatar",on:{click:function(t){arguments[0]=t=e.$handleEvent(t),e.chooseImage.apply(void 0,arguments)}}},[e.path?a("v-uni-image",{attrs:{src:e.path}}):e._e()],1),a("v-uni-view",{staticClass:"btn btn_active",on:{click:function(t){arguments[0]=t=e.$handleEvent(t),e.saveData.apply(void 0,arguments)}}},[e._v("保存")])],1)],1)},r=[]},"84ae":function(e,t,a){"use strict";a.r(t);var n=a("cf2b"),r=a.n(n);for(var i in n)["default"].indexOf(i)<0&&function(e){a.d(t,e,(function(){return n[e]}))}(i);t["default"]=r.a},"98f4":function(e,t,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(t,"__esModule",{value:!0}),t.uploadMedia=t.uploadArr=void 0;var r=n(a("c7eb")),i=n(a("1da1"));a("d3b7"),a("14d9");var u=a("e38f"),o=function(e){return new Promise((function(t,a){uni.showLoading({title:"Loading...",mask:!0}),console.log("uploadFile:"+u.uploadUrl+"/upload"),console.log(e),uni.uploadFile({url:u.uploadUrl+"/upload",filePath:e,name:"upfile",success:function(e){var a;console.log(e),uni.hideLoading();try{if(a=JSON.parse(e.data),200!=a.code)throw"error"}catch(n){return void uni.showToast({title:"上传失败",duration:2e3,icon:"error"})}t(a.data)},fail:function(){t("")}})}))};t.uploadMedia=o;t.uploadArr=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];return new Promise(function(){var t=(0,i.default)((0,r.default)().mark((function t(a,n){var i,u,c;return(0,r.default)().wrap((function(t){while(1)switch(t.prev=t.next){case 0:uni.showLoading({title:"Loading...",mask:!0}),i=[],u=0;case 3:if(!(u<e.length)){t.next=11;break}return t.next=6,o(e[u]);case 6:c=t.sent,i.push(c);case 8:u++,t.next=3;break;case 11:uni.hideLoading(),a(i);case 13:case"end":return t.stop()}}),t)})));return function(e,a){return t.apply(this,arguments)}}())}},b169:function(e,t,a){"use strict";a.r(t);var n=a("332d"),r=a("84ae");for(var i in r)["default"].indexOf(i)<0&&function(e){a.d(t,e,(function(){return r[e]}))}(i);a("31f2");var u=a("f0c5"),o=Object(u["a"])(r["default"],n["b"],n["c"],!1,null,"36a4c11c",null,!1,n["a"],void 0);t["default"]=o.exports},cbb1:function(e,t,a){var n=a("24fb");t=n(!1),t.push([e.i,'@charset "UTF-8";\r\n/**\r\n * 这里是uni-app内置的常用样式变量\r\n *\r\n * uni-app 官方扩展插件及插件市场（https://ext.dcloud.net.cn）上很多三方插件均使用了这些样式变量\r\n * 如果你是插件开发者，建议你使用scss预处理，并在插件代码中直接使用这些变量（无需 import 这个文件），方便用户通过搭积木的方式开发整体风格一致的App\r\n *\r\n */\r\n/**\r\n * 如果你是App开发者（插件使用者），你可以通过修改这些变量来定制自己的插件主题，实现自定义主题功能\r\n *\r\n * 如果你的项目同样使用了scss预处理，你也可以直接在你的 scss 代码中使用如下变量，同时无需 import 这个文件\r\n */\r\n/* 颜色变量 */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.clearfix[data-v-36a4c11c]{zoom:1}.clearfix[data-v-36a4c11c]:after{content:"";clear:both;height:0;line-height:0;display:block;visibility:hidden}.page_box[data-v-36a4c11c]{text-align:center}.page_box .avatar[data-v-36a4c11c]{margin:%?77?% auto 0;width:%?300?%;height:%?300?%;border-radius:50%;overflow:hidden;border:1px solid #565c68}.page_box .avatar uni-image[data-v-36a4c11c]{width:100%;height:100%}.page_box .btn[data-v-36a4c11c]{position:fixed;width:%?580?%;height:%?88?%;text-align:center;line-height:%?88?%;color:#fff;background:#16202a;border:2px solid #565c68;border-radius:%?44?%;bottom:%?153?%;left:0;right:0;margin-left:auto;margin-right:auto}',""]),e.exports=t},cf2b:function(e,t,a){"use strict";a("7a82");var n=a("4ea4").default;Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=n(a("c7eb")),i=n(a("1da1")),u=n(a("5530")),o=a("98f4"),c=a("4b93"),s=a("26cb"),d={data:function(){return{path:""}},computed:(0,u.default)({},(0,s.mapState)(["userInfo","defaultSetting"])),onShow:function(){this.path=this.userInfo.header?this.userInfo.header:this.defaultSetting.client?this.defaultSetting.client.header:""},methods:(0,u.default)((0,u.default)({},(0,s.mapMutations)(["SetOnlyUserInfo"])),{},{chooseImage:function(){var e=this;uni.chooseImage({count:1,success:function(){var t=(0,i.default)((0,r.default)().mark((function t(a){var n;return(0,r.default)().wrap((function(t){while(1)switch(t.prev=t.next){case 0:return console.log(a),t.next=3,(0,o.uploadMedia)(a.tempFilePaths[0]);case 3:n=t.sent,n&&(e.path=n);case 5:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()})},saveData:function(){var e=this;return(0,i.default)((0,r.default)().mark((function t(){var a,n;return(0,r.default)().wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(e.path){t.next=2;break}return t.abrupt("return");case 2:if(!e.defaultSetting.client||e.path!==e.defaultSetting.client.header){t.next=4;break}return t.abrupt("return");case 4:return t.next=6,c.user.changeheader({header:e.path});case 6:if(a=t.sent,n=a.code,200===n){t.next=10;break}return t.abrupt("return");case 10:e.SetOnlyUserInfo((0,u.default)((0,u.default)({},e.userInfo),{},{header:e.path})),e.$success("修改成功");case 12:case"end":return t.stop()}}),t)})))()}})};t.default=d},f025:function(e,t,a){var n=a("cbb1");n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[e.i,n,""]]),n.locals&&(e.exports=n.locals);var r=a("4f06").default;r("cfa7008a",n,!0,{sourceMap:!1,shadowMode:!1})}}]);