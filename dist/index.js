var g = Object.defineProperty;
var O = (u, t, s) => t in u ? g(u, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : u[t] = s;
var i = (u, t, s) => (O(u, typeof t != "symbol" ? t + "" : t, s), s);
class D extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class h extends D {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const p = class p {
  /** */
  constructor(t, s = {}) {
    // Options
    i(this, "WIDTH");
    i(this, "HEIGHT");
    i(this, "PADDING");
    i(this, "ROWS_COUNT");
    i(this, "DATA");
    i(this, "I18N");
    i(this, "STYLE");
    i(this, "FLAGS");
    // Calculated
    i(this, "DPI_WIDTH");
    i(this, "DPI_HEIGHT");
    i(this, "VIEW_WIDTH");
    i(this, "VIEW_HEIGHT");
    i(this, "Y_BOUNDARIES");
    i(this, "X_RATIO");
    i(this, "Y_RATIO");
    i(this, "ROWS_STEP");
    i(this, "TEXT_STEP");
    i(this, "X_AXIS_DATA_COUNT");
    i(this, "X_AXIS_DATA_STEP");
    // Interactivity
    i(this, "isInitialized", !1);
    i(this, "rafID", 0);
    i(this, "mouse");
    // DOM
    i(this, "container");
    i(this, "canvas");
    i(this, "ctx");
    i(this, "canvasRect");
    var o;
    const e = p.getOptions(s), a = ((o = e.data.xAxis) == null ? void 0 : o.values.length) || 0, n = e.data.yAxis[0].values.length;
    this.WIDTH = e.width, this.HEIGHT = e.height, this.PADDING = e.padding, this.ROWS_COUNT = e.rowsCount, this.DATA = e.data, this.I18N = e.i18n, this.STYLE = e.style, this.FLAGS = e.flags, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_BOUNDARIES = this.getBoundariesY(this.DATA.yAxis), this.X_RATIO = this.VIEW_WIDTH / (n - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = a && Math.round(a / this.X_AXIS_DATA_COUNT), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawGraph = this.drawGraph.bind(this), this.mouse = new Proxy(
      {},
      {
        set: (...r) => {
          const l = Reflect.set(...r);
          return this.rafID = window.requestAnimationFrame(this.drawGraph), l;
        }
      }
    ), this.container = t, this.canvas = document.createElement("canvas"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, this.ctx = this.canvas.getContext("2d"), this.FLAGS.immediateInit && this.initialize();
  }
  /** Initializes the component by appending the canvas to the container element and drawing the chart */
  initialize() {
    this.isInitialized || (this.isInitialized = !0, this.container.appendChild(this.canvas), this.canvas.addEventListener("mousemove", this.mouseMoveHandler), this.canvas.addEventListener("mouseleave", this.mouseLeaveHandler), this.drawGraph());
  }
  /** Destroys the component from the DOM */
  destroy() {
    this.isInitialized && (this.isInitialized = !1, window.cancelAnimationFrame(this.rafID), this.canvas.removeEventListener("mousemove", this.mouseMoveHandler), this.canvas.removeEventListener("mouseleave", this.mouseLeaveHandler), this.canvas.remove());
  }
  /** */
  drawGraph() {
    this.clearAll(), this.drawAxisX(), this.drawAxisY(), this.drawLines();
  }
  /** */
  clearAll() {
    this.ctx.clearRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT);
  }
  /** */
  drawAxisX() {
    if (this.DATA.xAxis) {
      this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.lineWidth = 2, this.ctx.strokeStyle = this.STYLE.secondaryColor;
      for (let t = 1; t <= this.DATA.xAxis.values.length; t++) {
        const s = this.getX(t);
        if ((t - 1) % this.X_AXIS_DATA_STEP === 0) {
          const e = this.getDate(this.DATA.xAxis.values[t - 1]);
          this.ctx.fillText(e, s, this.DPI_HEIGHT - 10);
        }
        this.drawGuides(s);
      }
    }
  }
  drawGuides(t) {
    var a;
    if (!this.mouse.x || !this.mouse.y)
      return;
    const s = ((a = this.DATA.xAxis) == null ? void 0 : a.values.length) || 0;
    s && Math.abs(t - this.mouse.x) < this.DPI_WIDTH / s / 2 && (this.FLAGS.horGuide && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, 0), this.ctx.lineTo(t, this.DPI_HEIGHT), this.ctx.stroke(), this.ctx.closePath());
  }
  /** */
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const s = String(Math.round(this.Y_BOUNDARIES[1] - this.TEXT_STEP * t)), e = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(s, 5, e - 10), this.ctx.moveTo(0, e), this.ctx.lineTo(this.DPI_WIDTH, e);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** */
  drawLines() {
    this.ctx.lineWidth = 4;
    for (const t of this.DATA.yAxis) {
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let s = 0; s < t.values.length; s++) {
        const e = this.getX(s), a = this.getY(t.values[s]);
        this.ctx.lineTo(e, a);
      }
      this.ctx.stroke(), this.ctx.closePath();
    }
  }
  /** */
  mouseMoveHandler(t) {
    this.canvasRect ?? (this.canvasRect = this.canvas.getBoundingClientRect()), this.mouse.x = (t.clientX - this.canvasRect.left) * 2, this.mouse.y = (t.clientY - this.canvasRect.top) * 2;
  }
  /** */
  mouseLeaveHandler() {
    this.mouse.x = null, this.mouse.y = null;
  }
  /** */
  getBoundariesY(t) {
    let s = null, e = null;
    for (const a of t)
      for (const n of a.values)
        s = s === null || n < s ? n : s, e = e === null || n > e ? n : e;
    return [s, e];
  }
  /** */
  getDate(t) {
    const s = new Date(t), e = s.getDate(), a = s.getMonth();
    return `${e} ${this.I18N.months[a]}`;
  }
  /** */
  getX(t) {
    return t * this.X_RATIO;
  }
  /** */
  getY(t) {
    return this.DPI_HEIGHT - this.PADDING - t * this.Y_RATIO;
  }
  /** */
  static validateOptions(t = {}) {
    const {
      width: s,
      height: e,
      padding: a,
      rowsCount: n,
      data: { xAxis: o, yAxis: r } = {},
      i18n: { months: l } = {},
      style: { textFont: d, textColor: A, secondaryColor: f } = {},
      flags: { horGuide: y, immediateInit: I } = {}
    } = t;
    if (s) {
      if (typeof s != "number")
        throw new h("width should be a number");
      if (s <= 0)
        throw new h("width should be greater than 0");
      if (s % 2 !== 0)
        throw new h("width should be an even number");
    }
    if (e) {
      if (typeof e != "number")
        throw new h("height should be a number");
      if (e <= 0)
        throw new h("height should be greater than 0");
      if (e % 2 !== 0)
        throw new h("height should be an even number");
    }
    if (a) {
      if (typeof a != "number")
        throw new h("padding should be a number");
      if (a < 0)
        throw new h("padding should be greater or equal to 0");
    }
    if (n) {
      if (typeof n != "number")
        throw new h("rowsCount should be a number");
      if (n <= 0)
        throw new h("rowsCount should be greater than 0");
    }
    if (o) {
      if (typeof o != "object")
        throw new h("data.xAxis should be an object");
      if (typeof o.type != "string")
        throw new h("data.xAxis.type should be a string");
      if (!["date"].includes(o.type))
        throw new h('data.xAxis.type should be "date"');
      if (!Array.isArray(o.values))
        throw new h("data.xAxis.values should be an array");
      o.type === "date" && o.values.forEach((c, x) => {
        if (typeof c != "number")
          throw new h(`data.xAxis.values[${x}] should be a number`);
      });
    }
    if (r) {
      if (!Array.isArray(r))
        throw new h("data.columns should be an array");
      r.forEach((c, x) => {
        if (typeof c.name != "string")
          throw new h(`data.yAxis[${x}].name should be a string`);
        if (typeof c.color != "string")
          throw new h(`data.yAxis[${x}].color should be a string`);
        if (!Array.isArray(c.values))
          throw new h(`data.yAxis[${x}].values should be an array`);
        c.values.forEach((m, T) => {
          if (typeof m != "number")
            throw new h(`data.yAxis[${x}].values[${T}] should be a number`);
        });
      });
    }
    if (l) {
      if (!Array.isArray(l))
        throw new h("i18n.months should be an array");
      if (l.length !== 12)
        throw new h("i18n.months should have 12 elements");
    }
    if (d && typeof d != "string")
      throw new h("style.textFont should be a string");
    if (A && typeof A != "string")
      throw new h("style.textColor should be a string");
    if (f && typeof f != "string")
      throw new h("style.secondaryColor should be a string");
    if (y && typeof y != "boolean")
      throw new h("flags.horGuide should be a boolean");
    if (I && typeof I != "boolean")
      throw new h("flags.immediateInit should be a boolean");
  }
  /** */
  static getOptions(t = {}) {
    var s, e, a, n, o, r, l, d;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding || this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      data: {
        xAxis: ((s = t.data) == null ? void 0 : s.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((e = t.data) == null ? void 0 : e.yAxis) || this.presetOptions.data.yAxis
      },
      i18n: {
        months: ((a = t.i18n) == null ? void 0 : a.months) || this.presetOptions.i18n.months
      },
      style: {
        textFont: ((n = t.style) == null ? void 0 : n.textFont) || this.presetOptions.style.textFont,
        textColor: ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((r = t.style) == null ? void 0 : r.secondaryColor) || this.presetOptions.style.secondaryColor
      },
      flags: {
        horGuide: ((l = t.flags) == null ? void 0 : l.horGuide) ?? this.presetOptions.flags.horGuide,
        immediateInit: ((d = t.flags) == null ? void 0 : d.immediateInit) ?? this.presetOptions.flags.immediateInit
      }
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  static changePresetOptions(t = {}) {
    var s, e, a, n, o, r, l, d;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding || this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.i18n.months = ((s = t.i18n) == null ? void 0 : s.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((e = t.style) == null ? void 0 : e.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((a = t.style) == null ? void 0 : a.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((n = t.style) == null ? void 0 : n.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.data.xAxis = ((o = t.data) == null ? void 0 : o.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((r = t.data) == null ? void 0 : r.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.flags.horGuide = ((l = t.flags) == null ? void 0 : l.horGuide) ?? this.presetOptions.flags.horGuide, this.presetOptions.flags.immediateInit = ((d = t.flags) == null ? void 0 : d.immediateInit) ?? this.presetOptions.flags.immediateInit;
  }
};
// Static options preset
i(p, "presetOptions", {
  width: 600,
  height: 250,
  padding: 40,
  rowsCount: 5,
  data: {
    xAxis: null,
    yAxis: []
  },
  i18n: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  style: {
    textFont: "normal 20px Helvetica,sans-serif",
    textColor: "#96a2aa",
    secondaryColor: "#bbbbbb"
  },
  flags: {
    horGuide: !0,
    immediateInit: !0
  }
});
let w = p;
export {
  w as Chart,
  D as ChartError,
  h as ChartOptionsError
};
