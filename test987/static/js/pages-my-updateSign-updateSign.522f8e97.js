(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-my-updateSign-updateSign"],{"2d8b":function(t,a,e){"use strict";e.r(a);var n=e("fd6e"),r=e.n(n);for(var i in n)["default"].indexOf(i)<0&&function(t){e.d(a,t,(function(){return n[t]}))}(i);a["default"]=r.a},6878:function(t,a,e){var n=e("e043");n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);var r=e("4f06").default;r("435b2670",n,!0,{sourceMap:!1,shadowMode:!1})},"68a5":function(t,a,e){"use strict";e.r(a);var n=e("fd66"),r=e("2d8b");for(var i in r)["default"].indexOf(i)<0&&function(t){e.d(a,t,(function(){return r[t]}))}(i);e("963f");var o=e("f0c5"),s=Object(o["a"])(r["default"],n["b"],n["c"],!1,null,"c73def12",null,!1,n["a"],void 0);a["default"]=s.exports},"963f":function(t,a,e){"use strict";var n=e("6878"),r=e.n(n);r.a},e043:function(t,a,e){var n=e("24fb");a=n(!1),a.push([t.i,'@charset "UTF-8";\r\n/**\r\n * 这里是uni-app内置的常用样式变量\r\n *\r\n * uni-app 官方扩展插件及插件市场（https://ext.dcloud.net.cn）上很多三方插件均使用了这些样式变量\r\n * 如果你是插件开发者，建议你使用scss预处理，并在插件代码中直接使用这些变量（无需 import 这个文件），方便用户通过搭积木的方式开发整体风格一致的App\r\n *\r\n */\r\n/**\r\n * 如果你是App开发者（插件使用者），你可以通过修改这些变量来定制自己的插件主题，实现自定义主题功能\r\n *\r\n * 如果你的项目同样使用了scss预处理，你也可以直接在你的 scss 代码中使用如下变量，同时无需 import 这个文件\r\n */\r\n/* 颜色变量 */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.clearfix[data-v-c73def12]{zoom:1}.clearfix[data-v-c73def12]:after{content:"";clear:both;height:0;line-height:0;display:block;visibility:hidden}.page_box[data-v-c73def12]{padding:%?44?% %?20?%}.page_box .value_[data-v-c73def12]{background-color:#131b24;width:100%;height:%?495?%;border-radius:%?10?%;box-sizing:border-box;padding:%?42?% %?35?%;font-size:%?30?%;color:#fff;padding-bottom:%?80?%}.page_box .btn[data-v-c73def12]{position:fixed;width:%?580?%;height:%?88?%;text-align:center;line-height:%?88?%;color:#fff;background:#16202a;border:2px solid #565c68;border-radius:%?44?%;bottom:%?153?%;left:0;right:0;margin-left:auto;margin-right:auto}.page_box .value_box[data-v-c73def12]{position:relative}.page_box .value_box .num[data-v-c73def12]{position:absolute;right:%?38?%;bottom:%?41?%;color:#9aa8b5}',""]),t.exports=a},fd66:function(t,a,e){"use strict";e.d(a,"b",(function(){return n})),e.d(a,"c",(function(){return r})),e.d(a,"a",(function(){}));var n=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("layout",{attrs:{hasTabbar:!1}},[e("v-navbar",{attrs:{title:"个性签名"}}),e("v-uni-view",{staticClass:"page_box"},[e("v-uni-view",{staticClass:"value_box"},[e("v-uni-textarea",{staticClass:"value_",attrs:{placeholder:"请输入个性签名",maxlength:300,cols:"300",rows:"10"},model:{value:t.sign,callback:function(a){t.sign=a},expression:"sign"}}),e("v-uni-view",{staticClass:"num"},[t._v(t._s(t.sign.length?t.sign.length:0)+"/300")])],1),e("v-uni-view",{staticClass:"btn btn_active",on:{click:function(a){arguments[0]=a=t.$handleEvent(a),t.saveData()}}},[t._v("保存")])],1)],1)},r=[]},fd6e:function(t,a,e){"use strict";e("7a82");var n=e("4ea4").default;Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0;var r=n(e("c7eb")),i=n(e("1da1")),o=n(e("5530")),s=e("4b93"),u=e("26cb"),d={data:function(){return{sign:""}},computed:(0,o.default)({},(0,u.mapState)(["userData"])),onShow:function(){this.sign=this.userData.sign},methods:(0,o.default)((0,o.default)({},(0,u.mapActions)(["setUserData"])),{},{saveData:function(){var t=this;return(0,i.default)((0,r.default)().mark((function a(){var e,n,i;return(0,r.default)().wrap((function(a){while(1)switch(a.prev=a.next){case 0:return a.next=2,s.API.userDataUpdate({sign:t.sign});case 2:if(n=a.sent,console.log(n),0==(null===n||void 0===n||null===(e=n.data)||void 0===e?void 0:e.code)){a.next=7;break}return t.$toast(null!==n&&void 0!==n&&null!==(i=n.data)&&void 0!==i&&i.msg?n.data.msg:"修改失败"),a.abrupt("return");case 7:t.$toast("修改成功"),t.setUserData({sign:t.sign});case 9:case"end":return a.stop()}}),a)})))()}})};a.default=d}}]);