(function(a,l){typeof exports=="object"&&typeof module<"u"?l(exports):typeof define=="function"&&define.amd?define(["exports"],l):(a=typeof globalThis<"u"?globalThis:a||self,l(a.SimpleChartsJS={}))})(this,function(a){"use strict";var S=Object.defineProperty;var L=(a,l,y)=>l in a?S(a,l,{enumerable:!0,configurable:!0,writable:!0,value:y}):a[l]=y;var n=(a,l,y)=>(L(a,typeof l!="symbol"?l+"":l,y),y);const l="";function y(w,t){let i;return(...e)=>{clearTimeout(i),i=setTimeout(()=>w(...e),t)}}function C(w,t){let i;return(...e)=>{i||(i=setTimeout(()=>{w(...e),i=null},t))}}class v extends Error{constructor(t){super(t),this.name="ChartError"}}class s extends v{constructor(t){super(t),this.name="ChartOptionsError"}}const E=class E{constructor(t,i={}){n(this,"WIDTH");n(this,"HEIGHT");n(this,"PADDING");n(this,"ROWS_COUNT");n(this,"DATA");n(this,"I18N");n(this,"INTERACTIVITY");n(this,"STYLE");n(this,"TECHNICAL");n(this,"DPI_WIDTH");n(this,"DPI_HEIGHT");n(this,"VIEW_WIDTH");n(this,"VIEW_HEIGHT");n(this,"Y_AXIS_DATA_BOUNDARIES");n(this,"X_RATIO");n(this,"Y_RATIO");n(this,"ROWS_STEP");n(this,"TEXT_STEP");n(this,"X_AXIS_DATA_COUNT");n(this,"X_AXIS_DATA_STEP");n(this,"mouse");n(this,"isInitialized",!1);n(this,"rafID",0);n(this,"containerElement");n(this,"wrapperElement");n(this,"canvasElement");n(this,"tooltipElement");n(this,"canvasRect");n(this,"ctx");var o;const e=E.getOptions(i),h=((o=e.data.xAxis)==null?void 0:o.values.length)||0,r=this.getAxisYDataLength(e.data.yAxis);this.containerElement=t,this.WIDTH=e.width,this.HEIGHT=e.height,this.PADDING=e.padding,this.ROWS_COUNT=e.rowsCount,this.DATA=e.data,this.I18N=e.i18n,this.INTERACTIVITY=e.interactivity,this.STYLE=e.style,this.TECHNICAL=e.technical,this.DPI_WIDTH=this.WIDTH*2,this.DPI_HEIGHT=this.HEIGHT*2,this.VIEW_WIDTH=this.DPI_WIDTH,this.VIEW_HEIGHT=this.DPI_HEIGHT-this.PADDING*2,this.Y_AXIS_DATA_BOUNDARIES=this.getYAxisDataBoundaries(this.DATA.yAxis),this.X_RATIO=this.VIEW_WIDTH/(r-1),this.Y_RATIO=this.VIEW_HEIGHT/(this.Y_AXIS_DATA_BOUNDARIES[1]-this.Y_AXIS_DATA_BOUNDARIES[0]),this.ROWS_STEP=this.VIEW_HEIGHT/this.ROWS_COUNT,this.TEXT_STEP=(this.Y_AXIS_DATA_BOUNDARIES[1]-this.Y_AXIS_DATA_BOUNDARIES[0])/this.ROWS_COUNT,this.X_AXIS_DATA_COUNT=6,this.X_AXIS_DATA_STEP=h&&Math.round(h/this.X_AXIS_DATA_COUNT),this.resizeHandler=y(this.resizeHandler.bind(this),100),this.mouseMoveHandler=this.mouseMoveHandler.bind(this),this.mouseLeaveHandler=this.mouseLeaveHandler.bind(this),this.drawChart=C(this.drawChart.bind(this),1e3/this.INTERACTIVITY.fpsLimit),this.mouse=new Proxy({},{set:(...d)=>{const c=Reflect.set(...d);return this.rafID=window.requestAnimationFrame(this.drawChart),c}}),this.createDOMElements(),this.TECHNICAL.immediateInit&&this.initialize()}createDOMElements(){this.wrapperElement=document.createElement("div"),this.wrapperElement.className="simple-chart",this.canvasElement=document.createElement("canvas"),this.canvasElement.className="simple-chart__canvas",this.canvasElement.width=this.DPI_WIDTH,this.canvasElement.height=this.DPI_HEIGHT,this.canvasElement.style.width=this.WIDTH+"px",this.canvasElement.style.height=this.HEIGHT+"px",this.ctx=this.canvasElement.getContext("2d"),this.tooltipElement=document.createElement("div"),this.tooltipElement.className="simple-chart__tooltip"}initialize(){this.isInitialized||(this.isInitialized=!0,this.TECHNICAL.insertMethod==="append"?this.containerElement.appendChild(this.wrapperElement):this.TECHNICAL.insertMethod==="prepend"?this.containerElement.insertBefore(this.wrapperElement,this.containerElement.firstChild):this.TECHNICAL.insertMethod(this.containerElement,this.wrapperElement),this.wrapperElement.appendChild(this.canvasElement),this.wrapperElement.appendChild(this.tooltipElement),window.addEventListener("resize",this.resizeHandler),window.addEventListener("orientationchange",this.resizeHandler),this.canvasElement.addEventListener("mousemove",this.mouseMoveHandler),this.canvasElement.addEventListener("mouseleave",this.mouseLeaveHandler),this.drawChart())}destroy(){this.isInitialized&&(this.isInitialized=!1,this.wrapperElement.removeChild(this.tooltipElement),this.wrapperElement.removeChild(this.canvasElement),this.containerElement.removeChild(this.wrapperElement),window.cancelAnimationFrame(this.rafID),window.removeEventListener("resize",this.resizeHandler),window.removeEventListener("orientationchange",this.resizeHandler),this.canvasElement.removeEventListener("mousemove",this.mouseMoveHandler),this.canvasElement.removeEventListener("mouseleave",this.mouseLeaveHandler))}drawChart(){console.log("draw"),this.drawBackground(),this.drawAxisX(),this.drawAxisY(),this.drawLines()}drawBackground(){this.ctx.fillStyle=this.STYLE.backgroundColor,this.ctx.fillRect(0,0,this.DPI_WIDTH,this.DPI_HEIGHT)}drawAxisX(){if(this.DATA.xAxis){this.ctx.fillStyle=this.STYLE.textColor,this.ctx.font=this.STYLE.textFont,this.ctx.lineWidth=2,this.ctx.strokeStyle=this.STYLE.secondaryColor;for(let t=1;t<=this.DATA.xAxis.values.length;t++){const i=this.getX(t);if((t-1)%this.X_AXIS_DATA_STEP===0){const e=this.getDate(this.DATA.xAxis.values[t-1]);this.ctx.fillText(e,i,this.DPI_HEIGHT-10)}this.drawGuideLinesIsOver(i)}}}drawGuideLinesIsOver(t){if(this.mouse.x&&this.mouse.y){const i=this.isMouseOverYAxisDataItem(t),e=this.PADDING/2,h=this.DPI_HEIGHT-this.PADDING;if(i&&this.mouse.y>=e)return this.INTERACTIVITY.horisontalGuide&&this.mouse.y<=h&&(this.ctx.beginPath(),this.ctx.setLineDash([20,25]),this.ctx.moveTo(0,this.mouse.y),this.ctx.lineTo(this.DPI_WIDTH,this.mouse.y),this.ctx.stroke(),this.ctx.closePath()),this.ctx.beginPath(),this.ctx.setLineDash([]),this.ctx.moveTo(t,e),this.ctx.lineTo(t,h),this.ctx.stroke(),this.ctx.closePath(),this.ctx.beginPath(),this.ctx.arc(t,e,2,0,2*Math.PI),this.ctx.fill(),this.ctx.stroke(),this.ctx.closePath(),!0}return!1}drawAxisY(){this.ctx.lineWidth=1,this.ctx.strokeStyle=this.STYLE.secondaryColor,this.ctx.fillStyle=this.STYLE.textColor,this.ctx.font=this.STYLE.textFont,this.ctx.beginPath();for(let t=1;t<=this.ROWS_COUNT;t++){const i=String(Math.round(this.Y_AXIS_DATA_BOUNDARIES[1]-this.TEXT_STEP*t)),e=t*this.ROWS_STEP+this.PADDING;this.ctx.fillText(i,5,e-10),this.ctx.moveTo(0,e),this.ctx.lineTo(this.DPI_WIDTH,e)}this.ctx.stroke(),this.ctx.closePath()}drawLines(){this.ctx.lineWidth=4,this.ctx.fillStyle=this.STYLE.backgroundColor;for(const t of this.DATA.yAxis){let i=null,e=null;this.ctx.strokeStyle=t.color,this.ctx.beginPath();for(let h=0;h<t.values.length;h++){const r=this.getX(h),o=this.getY(t.values[h]);this.ctx.lineTo(r,o),this.isMouseOverYAxisDataItem(r)&&(i=r,e=o)}this.ctx.stroke(),this.ctx.closePath(),i&&e&&this.mouse.x&&this.mouse.y&&this.mouse.y>=this.PADDING/2&&(this.ctx.beginPath(),this.ctx.arc(i,e,this.INTERACTIVITY.guideDotsRadius,0,2*Math.PI),this.ctx.fill(),this.ctx.stroke(),this.ctx.closePath())}}mouseMoveHandler(t){this.canvasRect??(this.canvasRect=this.canvasElement.getBoundingClientRect()),this.mouse.x=(t.clientX-this.canvasRect.left)*2,this.mouse.y=(t.clientY-this.canvasRect.top)*2}mouseLeaveHandler(){this.mouse.x=null,this.mouse.y=null}resizeHandler(){this.canvasRect=this.canvasElement.getBoundingClientRect()}getYAxisDataBoundaries(t){let i=null,e=null;for(const h of t)for(const r of h.values)(i===null||r<i)&&(i=r),(e===null||r>e)&&(e=r);return[i??0,e??0]}getDate(t){const i=new Date(t),e=i.getDate(),h=i.getMonth();return`${e} ${this.I18N.months[h]}`}getX(t){return t*this.X_RATIO}getY(t){return this.DPI_HEIGHT-this.PADDING-t*this.Y_RATIO}getAxisYDataLength(t){t??(t=this.DATA.yAxis);let i=0;for(const e of t)e.values.length>i&&(i=e.values.length);return i}isMouseOverYAxisDataItem(t){const i=this.getAxisYDataLength()-1;return!i||!this.mouse.x?!1:Math.abs(t-this.mouse.x)<this.DPI_WIDTH/i/2}static validateOptions(t={}){const{width:i,height:e,padding:h,rowsCount:r,data:{xAxis:o,yAxis:d}={},i18n:{months:c}={},interactivity:{horisontalGuide:m,guideDotsRadius:u,fpsLimit:p}={},style:{textFont:f,textColor:x,secondaryColor:D,backgroundColor:O}={},technical:{insertMethod:T,immediateInit:b}={}}=t;if(i){if(typeof i!="number")throw new s("width should be a number");if(i<=0)throw new s("width should be greater than 0");if(i%2!==0)throw new s("width should be an even number")}if(e){if(typeof e!="number")throw new s("height should be a number");if(e<=0)throw new s("height should be greater than 0");if(e%2!==0)throw new s("height should be an even number")}if(h){if(typeof h!="number")throw new s("padding should be a number");if(h<0)throw new s("padding should be greater or equal to 0")}if(r){if(typeof r!="number")throw new s("rowsCount should be a number");if(r<=0)throw new s("rowsCount should be greater than 0")}if(m&&typeof m!="boolean")throw new s("interactivity.horisontalGuide should be a boolean");if(u){if(typeof u!="number")throw new s("interactivity.guideDotsRadius should be a number");if(u<=0)throw new s("interactivity.guideDotsRadius should be greater than 0")}if(p){if(typeof p!="number")throw new s("interactivity.fpsLimit should be a number");if(p<=0)throw new s("interactivity.fpsLimit should be greater than 0")}if(o){if(typeof o!="object")throw new s("data.xAxis should be an object");if(typeof o.type!="string")throw new s("data.xAxis.type should be a string");if(!["date"].includes(o.type))throw new s('data.xAxis.type should be "date"');if(!Array.isArray(o.values))throw new s("data.xAxis.values should be an array");o.type==="date"&&o.values.forEach((A,I)=>{if(typeof A!="number")throw new s(`data.xAxis.values[${I}] should be a number`)})}if(d){if(!Array.isArray(d))throw new s("data.columns should be an array");d.forEach((A,I)=>{if(typeof A.name!="string")throw new s(`data.yAxis[${I}].name should be a string`);if(typeof A.color!="string")throw new s(`data.yAxis[${I}].color should be a string`);if(!Array.isArray(A.values))throw new s(`data.yAxis[${I}].values should be an array`);A.values.forEach((_,H)=>{if(typeof _!="number")throw new s(`data.yAxis[${I}].values[${H}] should be a number`)})})}if(c){if(!Array.isArray(c))throw new s("i18n.months should be an array");if(c.length!==12)throw new s("i18n.months should have 12 elements")}if(f&&typeof f!="string")throw new s("style.textFont should be a string");if(x&&typeof x!="string")throw new s("style.textColor should be a string");if(D&&typeof D!="string")throw new s("style.secondaryColor should be a string");if(O&&typeof O!="string")throw new s("style.backgroundColor should be a string");if(T){if(typeof T!="string"&&typeof T!="function")throw new s("technical.insertMethod should be a string or function");if(typeof T=="string"&&!["append","prepend"].includes(T))throw new s('technical.insertMethod should be "append" or "prepend" or function')}if(b&&typeof b!="boolean")throw new s("technical.immediateInit should be a boolean")}static getOptions(t={}){var i,e,h,r,o,d,c,m,u,p,f,x;return this.validateOptions(t),{width:t.width||this.presetOptions.width,height:t.height||this.presetOptions.height,padding:t.padding??this.presetOptions.padding,rowsCount:t.rowsCount||this.presetOptions.rowsCount,data:{xAxis:((i=t.data)==null?void 0:i.xAxis)||this.presetOptions.data.xAxis,yAxis:((e=t.data)==null?void 0:e.yAxis)||this.presetOptions.data.yAxis},i18n:{months:((h=t.i18n)==null?void 0:h.months)||this.presetOptions.i18n.months},interactivity:{horisontalGuide:((r=t.interactivity)==null?void 0:r.horisontalGuide)||this.presetOptions.interactivity.horisontalGuide,guideDotsRadius:((o=t.interactivity)==null?void 0:o.guideDotsRadius)||this.presetOptions.interactivity.guideDotsRadius,fpsLimit:((d=t.interactivity)==null?void 0:d.fpsLimit)||this.presetOptions.interactivity.fpsLimit},style:{textFont:((c=t.style)==null?void 0:c.textFont)||this.presetOptions.style.textFont,textColor:((m=t.style)==null?void 0:m.textColor)||this.presetOptions.style.textColor,secondaryColor:((u=t.style)==null?void 0:u.secondaryColor)||this.presetOptions.style.secondaryColor,backgroundColor:((p=t.style)==null?void 0:p.backgroundColor)||this.presetOptions.style.backgroundColor},technical:{insertMethod:((f=t.technical)==null?void 0:f.insertMethod)||this.presetOptions.technical.insertMethod,immediateInit:((x=t.technical)==null?void 0:x.immediateInit)||this.presetOptions.technical.immediateInit}}}static changePresetOptions(t={}){var i,e,h,r,o,d,c,m,u,p,f,x;this.validateOptions(t),this.presetOptions.width=t.width||this.presetOptions.width,this.presetOptions.height=t.height||this.presetOptions.height,this.presetOptions.padding=t.padding??this.presetOptions.padding,this.presetOptions.rowsCount=t.rowsCount||this.presetOptions.rowsCount,this.presetOptions.data.xAxis=((i=t.data)==null?void 0:i.xAxis)||this.presetOptions.data.xAxis,this.presetOptions.data.yAxis=((e=t.data)==null?void 0:e.yAxis)||this.presetOptions.data.yAxis,this.presetOptions.i18n.months=((h=t.i18n)==null?void 0:h.months)||this.presetOptions.i18n.months,this.presetOptions.interactivity.horisontalGuide=((r=t.interactivity)==null?void 0:r.horisontalGuide)||this.presetOptions.interactivity.horisontalGuide,this.presetOptions.interactivity.guideDotsRadius=((o=t.interactivity)==null?void 0:o.guideDotsRadius)||this.presetOptions.interactivity.guideDotsRadius,this.presetOptions.interactivity.fpsLimit=((d=t.interactivity)==null?void 0:d.fpsLimit)||this.presetOptions.interactivity.fpsLimit,this.presetOptions.style.textFont=((c=t.style)==null?void 0:c.textFont)||this.presetOptions.style.textFont,this.presetOptions.style.textColor=((m=t.style)==null?void 0:m.textColor)||this.presetOptions.style.textColor,this.presetOptions.style.secondaryColor=((u=t.style)==null?void 0:u.secondaryColor)||this.presetOptions.style.secondaryColor,this.presetOptions.style.backgroundColor=((p=t.style)==null?void 0:p.backgroundColor)||this.presetOptions.style.backgroundColor,this.presetOptions.technical.insertMethod=((f=t.technical)==null?void 0:f.insertMethod)||this.presetOptions.technical.insertMethod,this.presetOptions.technical.immediateInit=((x=t.technical)==null?void 0:x.immediateInit)||this.presetOptions.technical.immediateInit}};n(E,"presetOptions",{width:600,height:250,padding:40,rowsCount:5,data:{xAxis:null,yAxis:[]},i18n:{months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]},interactivity:{horisontalGuide:!0,guideDotsRadius:8,fpsLimit:60},style:{textFont:"normal 20px Helvetica,sans-serif",textColor:"#96a2aa",secondaryColor:"#bbbbbb",backgroundColor:"#ffffff"},technical:{insertMethod:"append",immediateInit:!0}});let g=E;a.Chart=g,a.ChartError=v,a.ChartOptionsError=s,Object.defineProperty(a,Symbol.toStringTag,{value:"Module"})});
