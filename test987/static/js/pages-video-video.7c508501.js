(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-video-video"],{1952:function(e,t,n){"use strict";n.r(t);var i=n("d7dc"),a=n("a741");for(var u in a)["default"].indexOf(u)<0&&function(e){n.d(t,e,(function(){return a[e]}))}(u);var o=n("f0c5"),r=Object(o["a"])(a["default"],i["b"],i["c"],!1,null,"73366496",null,!1,i["a"],void 0);t["default"]=r.exports},"41d9":function(e,t,n){"use strict";n("7a82"),Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i={data:function(){return{url:""}},onLoad:function(e){this.url="/hybrid/html/player.html?url="+e.url},onReady:function(){var e=this,t=0,n=0;uni.getSystemInfo({success:function(e){console.log(e),t=e.screenHeight+e.statusBarHeight,n=e.statusBarHeight},complete:function(){}}),setTimeout((function(){var i=e.$scope.$getAppWebview(),a=i.children()[0];a.setStyle({top:-n,height:t})}),200)},methods:{handleMessage:function(e){console.log(e),"back"===e.detail.data[0]&&uni.navigateBack()}}};t.default=i},a741:function(e,t,n){"use strict";n.r(t);var i=n("41d9"),a=n.n(i);for(var u in i)["default"].indexOf(u)<0&&function(e){n.d(t,e,(function(){return i[e]}))}(u);t["default"]=a.a},d7dc:function(e,t,n){"use strict";n.d(t,"b",(function(){return i})),n.d(t,"c",(function(){return a})),n.d(t,"a",(function(){}));var i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("v-uni-view",[e.url?n("v-uni-web-view",{staticClass:"webview-container",attrs:{src:e.url},on:{message:function(t){arguments[0]=t=e.$handleEvent(t),e.handleMessage.apply(void 0,arguments)}}}):e._e()],1)},a=[]}}]);