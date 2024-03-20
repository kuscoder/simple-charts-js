var I = Object.defineProperty;
var O = (l, t, e) => t in l ? I(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var i = (l, t, e) => (O(l, typeof t != "symbol" ? t + "" : t, e), e);
class v extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class h extends v {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const u = class u {
  /** */
  constructor(t, e = {}) {
    // Options
    i(this, "WIDTH");
    i(this, "HEIGHT");
    i(this, "PADDING");
    i(this, "ROWS_COUNT");
    i(this, "MONTHS_NAMES");
    i(this, "DATA");
    i(this, "STYLES");
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
    i(this, "mouse", {
      isOver: !1,
      x: 0,
      y: 0
    });
    // DOM
    i(this, "container");
    i(this, "canvas");
    i(this, "ctx");
    i(this, "canvasRect");
    var r;
    const s = u.getOptions(e), n = ((r = s.data.xAxis) == null ? void 0 : r.values.length) || 0, o = s.data.yAxis[0].values.length;
    this.WIDTH = s.width, this.HEIGHT = s.height, this.PADDING = s.padding, this.ROWS_COUNT = s.rowsCount, this.MONTHS_NAMES = s.i18n.months, this.DATA = {
      xAxis: s.data.xAxis,
      yAxis: s.data.yAxis
    }, this.STYLES = {
      textFont: s.style.textFont,
      textColor: s.style.textColor,
      secondaryColor: s.style.secondaryColor
    }, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_BOUNDARIES = this.getBoundariesY(this.DATA.yAxis), this.X_RATIO = this.VIEW_WIDTH / (o - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = n && Math.round(n / this.X_AXIS_DATA_COUNT), this.mouseEnterHandler = this.mouseEnterHandler.bind(this), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawGraph = this.drawGraph.bind(this), this.mouse = new Proxy(this.mouse, {
      set: (...a) => {
        const c = Reflect.set(...a);
        return this.rafID = window.requestAnimationFrame(this.drawGraph), c;
      }
    }), this.container = t, this.canvas = document.createElement("canvas"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, this.ctx = this.canvas.getContext("2d"), s.immediate && this.initialize();
  }
  /** Initializes the component by appending the canvas to the container element and drawing the chart */
  initialize() {
    this.isInitialized || (this.isInitialized = !0, this.container.appendChild(this.canvas), this.canvas.addEventListener("mouseenter", this.mouseEnterHandler), this.canvas.addEventListener("mousemove", this.mouseMoveHandler), this.canvas.addEventListener("mouseleave", this.mouseLeaveHandler), this.drawGraph());
  }
  /** Destroys the component from the DOM */
  destroy() {
    this.isInitialized && (this.isInitialized = !1, window.cancelAnimationFrame(this.rafID), this.canvas.removeEventListener("mouseenter", this.mouseEnterHandler), this.canvas.removeEventListener("mousemove", this.mouseMoveHandler), this.canvas.removeEventListener("mouseleave", this.mouseLeaveHandler), this.canvas.remove());
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
      this.ctx.fillStyle = this.STYLES.textColor, this.ctx.font = this.STYLES.textFont, this.ctx.lineWidth = 2, this.ctx.strokeStyle = this.STYLES.secondaryColor;
      for (let t = 1; t <= this.DATA.xAxis.values.length; t++) {
        const e = this.getX(t);
        if ((t - 1) % this.X_AXIS_DATA_STEP === 0) {
          const s = this.getDate(this.DATA.xAxis.values[t - 1]);
          this.ctx.fillText(s, e, this.DPI_HEIGHT - 10);
        }
        this.mouse.isOver && this.drawGuides(e);
      }
    }
  }
  drawGuides(t) {
    var n;
    const e = ((n = this.DATA.xAxis) == null ? void 0 : n.values.length) || 0;
    e && Math.abs(t - this.mouse.x) < this.DPI_WIDTH / e / 2 && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, 0), this.ctx.lineTo(t, this.DPI_HEIGHT), this.ctx.stroke(), this.ctx.closePath());
  }
  /** */
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLES.secondaryColor, this.ctx.fillStyle = this.STYLES.textColor, this.ctx.font = this.STYLES.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const e = String(Math.round(this.Y_BOUNDARIES[1] - this.TEXT_STEP * t)), s = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(e, 5, s - 10), this.ctx.moveTo(0, s), this.ctx.lineTo(this.DPI_WIDTH, s);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** */
  drawLines() {
    this.ctx.lineWidth = 4;
    for (const t of this.DATA.yAxis) {
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let e = 0; e < t.values.length; e++) {
        const s = this.getX(e), n = this.getY(t.values[e]);
        this.ctx.lineTo(s, n);
      }
      this.ctx.stroke(), this.ctx.closePath();
    }
  }
  /** */
  mouseEnterHandler() {
    this.mouse.isOver = !0;
  }
  /** */
  mouseMoveHandler(t) {
    this.canvasRect ?? (this.canvasRect = this.canvas.getBoundingClientRect()), this.mouse.x = (t.clientX - this.canvasRect.left) * 2, this.mouse.y = (t.clientY - this.canvasRect.top) * 2;
  }
  /** */
  mouseLeaveHandler() {
    this.mouse.isOver = !1;
  }
  /** */
  getBoundariesY(t) {
    let e = null, s = null;
    for (const n of t)
      for (const o of n.values)
        e = e === null || o < e ? o : e, s = s === null || o > s ? o : s;
    return [e, s];
  }
  /** */
  getDate(t) {
    const e = new Date(t), s = e.getDate(), n = e.getMonth(), o = this.MONTHS_NAMES;
    return `${s} ${o[n]}`;
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
      width: e,
      height: s,
      padding: n,
      rowsCount: o,
      i18n: { months: r } = {},
      data: { xAxis: a, yAxis: c } = {},
      style: { textFont: A, textColor: y, secondaryColor: m } = {},
      immediate: p
    } = t;
    if (e) {
      if (typeof e != "number")
        throw new h("width should be a number");
      if (e <= 0)
        throw new h("width should be greater than 0");
      if (e % 2 !== 0)
        throw new h("width should be an even number");
    }
    if (s) {
      if (typeof s != "number")
        throw new h("height should be a number");
      if (s <= 0)
        throw new h("height should be greater than 0");
      if (s % 2 !== 0)
        throw new h("height should be an even number");
    }
    if (n) {
      if (typeof n != "number")
        throw new h("padding should be a number");
      if (n < 0)
        throw new h("padding should be greater or equal to 0");
    }
    if (o) {
      if (typeof o != "number")
        throw new h("rowsCount should be a number");
      if (o <= 0)
        throw new h("rowsCount should be greater than 0");
    }
    if (r) {
      if (!Array.isArray(r))
        throw new h("i18n.months should be an array");
      if (r.length !== 12)
        throw new h("i18n.months should have 12 elements");
    }
    if (a) {
      if (typeof a != "object")
        throw new h("data.xAxis should be an object");
      if (typeof a.type != "string")
        throw new h("data.xAxis.type should be a string");
      if (!["date"].includes(a.type))
        throw new h('data.xAxis.type should be "date"');
      if (!Array.isArray(a.values))
        throw new h("data.xAxis.values should be an array");
      a.type === "date" && a.values.forEach((d, x) => {
        if (typeof d != "number")
          throw new h(`data.xAxis.values[${x}] should be a number`);
      });
    }
    if (c) {
      if (!Array.isArray(c))
        throw new h("data.columns should be an array");
      c.forEach((d, x) => {
        if (typeof d.name != "string")
          throw new h(`data.yAxis[${x}].name should be a string`);
        if (typeof d.color != "string")
          throw new h(`data.yAxis[${x}].color should be a string`);
        if (!Array.isArray(d.values))
          throw new h(`data.yAxis[${x}].values should be an array`);
        d.values.forEach((T, f) => {
          if (typeof T != "number")
            throw new h(`data.yAxis[${x}].values[${f}] should be a number`);
        });
      });
    }
    if (A && typeof A != "string")
      throw new h("style.textFont should be a string");
    if (y && typeof y != "string")
      throw new h("style.textColor should be a string");
    if (m && typeof m != "string")
      throw new h("style.secondaryColor should be a string");
    if (p && typeof p != "boolean")
      throw new h("immediate should be a boolean");
  }
  /** */
  static getOptions(t = {}) {
    var e, s, n, o, r, a;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding || this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      i18n: {
        months: ((e = t.i18n) == null ? void 0 : e.months) || this.presetOptions.i18n.months
      },
      style: {
        textFont: ((s = t.style) == null ? void 0 : s.textFont) || this.presetOptions.style.textFont,
        textColor: ((n = t.style) == null ? void 0 : n.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((o = t.style) == null ? void 0 : o.secondaryColor) || this.presetOptions.style.secondaryColor
      },
      data: {
        xAxis: ((r = t.data) == null ? void 0 : r.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((a = t.data) == null ? void 0 : a.yAxis) || this.presetOptions.data.yAxis
      },
      immediate: t.immediate ?? this.presetOptions.immediate
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  static changePresetOptions(t = {}) {
    var e, s, n, o, r, a;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding || this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.i18n.months = ((e = t.i18n) == null ? void 0 : e.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((s = t.style) == null ? void 0 : s.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((n = t.style) == null ? void 0 : n.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((o = t.style) == null ? void 0 : o.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.data.xAxis = ((r = t.data) == null ? void 0 : r.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((a = t.data) == null ? void 0 : a.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.immediate = t.immediate || this.presetOptions.immediate;
  }
};
// Static options preset
i(u, "presetOptions", {
  width: 600,
  height: 250,
  padding: 40,
  rowsCount: 5,
  i18n: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  data: {
    xAxis: null,
    yAxis: []
  },
  style: {
    textFont: "normal 20px Helvetica,sans-serif",
    textColor: "#96a2aa",
    secondaryColor: "#bbbbbb"
  },
  immediate: !0
});
let w = u;
export {
  w as Chart,
  v as ChartError,
  h as ChartOptionsError
};
