(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-my-exchangeGold-exchangeGold"],{"74aa":function(t,a,n){"use strict";n.r(a);var e=n("a4df"),i=n.n(e);for(var r in e)["default"].indexOf(r)<0&&function(t){n.d(a,t,(function(){return e[t]}))}(r);a["default"]=i.a},"75bc":function(t,a,n){"use strict";n.r(a);var e=n("9bc6"),i=n("74aa");for(var r in i)["default"].indexOf(r)<0&&function(t){n.d(a,t,(function(){return i[t]}))}(r);n("ca44");var o=n("f0c5"),c=Object(o["a"])(i["default"],e["b"],e["c"],!1,null,"4dc13616",null,!1,e["a"],void 0);a["default"]=c.exports},"8ea2":function(t,a,n){var e=n("24fb");a=e(!1),a.push([t.i,'@charset "UTF-8";\r\n/**\r\n * 这里是uni-app内置的常用样式变量\r\n *\r\n * uni-app 官方扩展插件及插件市场（https://ext.dcloud.net.cn）上很多三方插件均使用了这些样式变量\r\n * 如果你是插件开发者，建议你使用scss预处理，并在插件代码中直接使用这些变量（无需 import 这个文件），方便用户通过搭积木的方式开发整体风格一致的App\r\n *\r\n */\r\n/**\r\n * 如果你是App开发者（插件使用者），你可以通过修改这些变量来定制自己的插件主题，实现自定义主题功能\r\n *\r\n * 如果你的项目同样使用了scss预处理，你也可以直接在你的 scss 代码中使用如下变量，同时无需 import 这个文件\r\n */\r\n/* 颜色变量 */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.clearfix[data-v-4dc13616]{zoom:1}.clearfix[data-v-4dc13616]:after{content:"";clear:both;height:0;line-height:0;display:block;visibility:hidden}.page_container[data-v-4dc13616]{padding:%?48?% %?35?%;line-height:1}.page_container .page_title[data-v-4dc13616]{color:#fff;margin-bottom:%?31?%;font-size:%?30?%}.page_container .balance[data-v-4dc13616]{font-size:%?40?%;color:#fff;margin-bottom:%?48?%}.page_container .duihuan_box[data-v-4dc13616]{padding:%?31?% %?25?% %?38?% %?25?%;background-color:#11161e}.page_container .duihuan_box .box_title[data-v-4dc13616]{font-size:%?30?%;color:#9aa8b5;margin-bottom:%?70?%}.page_container .duihuan_box .value_box[data-v-4dc13616]{display:flex;align-items:flex-end;padding-bottom:%?28?%;border-bottom:1px solid #222a3a;margin-bottom:%?35?%}.page_container .duihuan_box .value_box .value_label[data-v-4dc13616]{font-size:%?24?%;color:#9aa8b5;flex:0 0 auto;margin-right:%?30?%;width:%?50?%;vertical-align:bottom}.page_container .duihuan_box .value_box .uni-input[data-v-4dc13616]{color:#f9cd7c;font-size:%?60?%}.page_container .duihuan_box .tootip[data-v-4dc13616]{color:#4c5768;font-size:%?26?%}.page_container .btn[data-v-4dc13616]{width:%?580?%;height:%?88?%;line-height:%?84?%;box-sizing:border-box;text-align:center;background:#16202a;border:2px solid #f9cd7c;border-radius:%?44?%;color:#f9cd7c;position:fixed;bottom:%?139?%;left:0;right:0;margin-left:auto;margin-right:auto}',""]),t.exports=a},"9bc6":function(t,a,n){"use strict";n.d(a,"b",(function(){return e})),n.d(a,"c",(function(){return i})),n.d(a,"a",(function(){}));var e=function(){var t=this,a=t.$createElement,n=t._self._c||a;return n("layout",{attrs:{hasTabbar:!1}},[n("v-navbar",{attrs:{title:"兑换金币"}}),n("v-uni-view",{staticClass:"page_container"},[n("v-uni-view",{staticClass:"page_title"},[t._v("账户余额")]),n("v-uni-view",{staticClass:"balance"},[t._v("￥"+t._s(t.userInfo.current_amount))]),n("v-uni-view",{staticClass:"duihuan_box"},[n("v-uni-view",{staticClass:"box_title"},[t._v("输入兑换金币数额")]),n("v-uni-view",{staticClass:"value_box"},[n("v-uni-view",{staticClass:"value_label"},[t._v("金币")]),n("v-uni-input",{staticClass:"uni-input",attrs:{type:"number",placeholder:"兑换数量"},model:{value:t.num,callback:function(a){t.num=a},expression:"num"}})],1),n("v-uni-view",{staticClass:"tootip"},[t._v("预计消耗账户余额："+t._s(t.coinRenderMoney)+"元")])],1),n("v-uni-view",{staticClass:"btn btn_active",on:{click:function(a){arguments[0]=a=t.$handleEvent(a),t.submit.apply(void 0,arguments)}}},[t._v("提交")])],1)],1)},i=[]},a4df:function(t,a,n){"use strict";n("7a82");var e=n("4ea4").default;Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0,n("acd8");var i=e(n("c7eb")),r=e(n("1da1")),o=e(n("5530")),c=n("26cb"),u=n("4b93"),s={data:function(){return{num:0}},computed:(0,o.default)((0,o.default)({},(0,c.mapState)(["userInfo"])),{},{coinRenderMoney:function(){return parseFloat(this.num/10).toFixed(2)}}),onLoad:function(){this.num=10*this.userInfo.current_amount},methods:(0,o.default)((0,o.default)({},(0,c.mapActions)(["refreshUser"])),{},{submit:function(){var t=this;return(0,r.default)((0,i.default)().mark((function a(){var n;return(0,i.default)().wrap((function(a){while(1)switch(a.prev=a.next){case 0:return a.next=2,u.amount.exchange({point:t.num});case 2:if(n=a.sent,200===n.code){a.next=5;break}return a.abrupt("return");case 5:t.$success("兑换成功"),t.refreshUser(),uni.navigateBack();case 8:case"end":return a.stop()}}),a)})))()}})};a.default=s},b912:function(t,a,n){var e=n("8ea2");e.__esModule&&(e=e.default),"string"===typeof e&&(e=[[t.i,e,""]]),e.locals&&(t.exports=e.locals);var i=n("4f06").default;i("4a1b812c",e,!0,{sourceMap:!1,shadowMode:!1})},ca44:function(t,a,n){"use strict";var e=n("b912"),i=n.n(e);i.a}}]);