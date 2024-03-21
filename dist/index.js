var O = Object.defineProperty;
var _ = (c, t, e) => t in c ? O(c, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : c[t] = e;
var h = (c, t, e) => (_(c, typeof t != "symbol" ? t + "" : t, e), e);
class b extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class i extends b {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const f = class f {
  /**
   * Constructor for creating a new instance of the Chart class.
   *
   * @param {HTMLElement} container - the HTML element that will contain the chart
   * @param {Partial<IChartOptions>} options - optional chart options
   */
  constructor(t, e = {}) {
    // Options
    h(this, "WIDTH");
    h(this, "HEIGHT");
    h(this, "PADDING");
    h(this, "ROWS_COUNT");
    h(this, "GUIDE_DOTS_RADIUS");
    h(this, "DATA");
    h(this, "I18N");
    h(this, "STYLE");
    h(this, "FLAGS");
    // Calculated
    h(this, "DPI_WIDTH");
    h(this, "DPI_HEIGHT");
    h(this, "VIEW_WIDTH");
    h(this, "VIEW_HEIGHT");
    h(this, "Y_AXIS_DATA_BOUNDARIES");
    h(this, "X_RATIO");
    h(this, "Y_RATIO");
    h(this, "ROWS_STEP");
    h(this, "TEXT_STEP");
    h(this, "X_AXIS_DATA_COUNT");
    h(this, "X_AXIS_DATA_STEP");
    // Interactivity
    h(this, "isInitialized", !1);
    h(this, "rafID", 0);
    h(this, "mouse");
    // DOM
    h(this, "container");
    h(this, "canvas");
    h(this, "ctx");
    h(this, "canvasRect");
    var r;
    const s = f.getOptions(e), o = ((r = s.data.xAxis) == null ? void 0 : r.values.length) || 0, a = s.data.yAxis[0].values.length;
    this.WIDTH = s.width, this.HEIGHT = s.height, this.PADDING = s.padding, this.ROWS_COUNT = s.rowsCount, this.GUIDE_DOTS_RADIUS = s.guideDotsRadius, this.DATA = s.data, this.I18N = s.i18n, this.STYLE = s.style, this.FLAGS = s.flags, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_AXIS_DATA_BOUNDARIES = this.getYAxisDataBoundaries(this.DATA.yAxis), this.X_RATIO = this.VIEW_WIDTH / (a - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = o && Math.round(o / this.X_AXIS_DATA_COUNT), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawChart = this.drawChart.bind(this), this.mouse = new Proxy(
      {},
      {
        set: (...n) => {
          const l = Reflect.set(...n);
          return this.rafID = window.requestAnimationFrame(this.drawChart), l;
        }
      }
    ), this.container = t, this.canvas = document.createElement("canvas"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, this.ctx = this.canvas.getContext("2d"), this.FLAGS.immediateInit && this.initialize();
  }
  /** Initializes the component by appending the canvas to the container element and drawing the chart. */
  initialize() {
    this.isInitialized || (this.isInitialized = !0, this.container.appendChild(this.canvas), this.canvas.addEventListener("mousemove", this.mouseMoveHandler), this.canvas.addEventListener("mouseleave", this.mouseLeaveHandler), this.drawChart());
  }
  /** Destroys the component from the DOM. */
  destroy() {
    this.isInitialized && (this.isInitialized = !1, window.cancelAnimationFrame(this.rafID), this.canvas.removeEventListener("mousemove", this.mouseMoveHandler), this.canvas.removeEventListener("mouseleave", this.mouseLeaveHandler), this.canvas.remove());
  }
  /** Main method that draws the chart by clearing the canvas. */
  drawChart() {
    this.drawBackground(), this.drawAxisX(), this.drawAxisY(), this.drawLines();
  }
  /** Draws the background of the chart. */
  drawBackground() {
    this.ctx.fillStyle = this.STYLE.backgroundColor, this.ctx.fillRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT);
  }
  /** Draws the X axis of the chart and guide lines. */
  drawAxisX() {
    if (this.DATA.xAxis) {
      this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.lineWidth = 2, this.ctx.strokeStyle = this.STYLE.secondaryColor;
      for (let t = 1; t <= this.DATA.xAxis.values.length; t++) {
        const e = this.getX(t);
        if ((t - 1) % this.X_AXIS_DATA_STEP === 0) {
          const s = this.getDate(this.DATA.xAxis.values[t - 1]);
          this.ctx.fillText(s, e, this.DPI_HEIGHT - 10);
        }
        this.drawGuideLinesIsOver(e);
      }
    }
  }
  /**
   * Draws the guide lines if the mouse-x is over the y-axis data item.
   *
   * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
   * @return {boolean} true if the guide lines were drawn, false otherwise
   */
  drawGuideLinesIsOver(t) {
    if (this.mouse.x && this.mouse.y) {
      const e = this.isMouseOverYAxisDataItem(t), s = this.PADDING / 2, o = this.DPI_HEIGHT - this.PADDING;
      if (e && this.mouse.y >= s)
        return this.FLAGS.horGuide && this.mouse.y <= o && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, s), this.ctx.lineTo(t, o), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.arc(t, s, 2, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath(), !0;
    }
    return !1;
  }
  /** Draws the Y axis of the chart. */
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const e = String(Math.round(this.Y_AXIS_DATA_BOUNDARIES[1] - this.TEXT_STEP * t)), s = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(e, 5, s - 10), this.ctx.moveTo(0, s), this.ctx.lineTo(this.DPI_WIDTH, s);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** Draws the lines of the chart. */
  drawLines() {
    this.ctx.lineWidth = 4, this.ctx.fillStyle = this.STYLE.backgroundColor;
    for (const t of this.DATA.yAxis) {
      let e = null, s = null;
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let o = 0; o < t.values.length; o++) {
        const a = this.getX(o), r = this.getY(t.values[o]);
        this.ctx.lineTo(a, r), this.isMouseOverYAxisDataItem(a) && (e = a, s = r);
      }
      this.ctx.stroke(), this.ctx.closePath(), e && s && this.mouse.x && this.mouse.y && this.mouse.y >= this.PADDING / 2 && (this.ctx.beginPath(), this.ctx.arc(e, s, this.GUIDE_DOTS_RADIUS, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath());
    }
  }
  /**
   * Checks if the mouse-x is hovering over an x-axis data item at its x-coordinate.
   *
   * @param {number} x - The x-axis data item coordinate to check.
   * @return {boolean} true if the mouse-x is hovering over the x-axis data item, false otherwise.
   */
  isMouseOverYAxisDataItem(t) {
    var s;
    const e = (s = this.DATA.xAxis) == null ? void 0 : s.values.length;
    return !e || !this.mouse.x ? !1 : Math.abs(t - this.mouse.x) < this.DPI_WIDTH / e / 2;
  }
  /** Event handler that updates the mouse position by canvas coordinates. */
  mouseMoveHandler(t) {
    this.canvasRect ?? (this.canvasRect = this.canvas.getBoundingClientRect()), this.mouse.x = (t.clientX - this.canvasRect.left) * 2, this.mouse.y = (t.clientY - this.canvasRect.top) * 2;
  }
  /** Event handler that resets the mouse position when the mouse leaves the canvas. */
  mouseLeaveHandler() {
    this.mouse.x = null, this.mouse.y = null;
  }
  /**
   * Generates boundaries for the y-axis based on the provided columns.
   *
   * @param {IDataAxisY[]} columns - an array of data axis Y values
   * @return {[number, number]} an array containing the minimum and maximum y values
   */
  getYAxisDataBoundaries(t) {
    let e = null, s = null;
    for (const o of t)
      for (const a of o.values)
        (e === null || a < e) && (e = a), (s === null || a > s) && (s = a);
    return [e ?? 0, s ?? 0];
  }
  /**
   * Returns a formatted date string for x-axis based on the given timestamp.
   *
   * @param {number} timestamp - The timestamp to convert to a date.
   * @return {string} The formatted date string in the format "day month".
   */
  getDate(t) {
    const e = new Date(t), s = e.getDate(), o = e.getMonth();
    return `${s} ${this.I18N.months[o]}`;
  }
  /**
   * Converts x coordinate from x-axis data to canvas coordinate.
   *
   * @param {number} x - x coordinate in x-axis data
   * @return {number} x coordinate in canvas
   */
  getX(t) {
    return t * this.X_RATIO;
  }
  /**
   * Converts x coordinate from y-axis data to canvas coordinate.
   *
   * @param {number} y - y coordinate in y-axis data
   * @return {number} y coordinate in canvas
   */
  getY(t) {
    return this.DPI_HEIGHT - this.PADDING - t * this.Y_RATIO;
  }
  /**
   * Validates the provided options for a chart constructor.
   *
   * @param {Partial<IChartOptions>} options - the options to be validated
   * @throws {ChartOptionsError} if the options are invalid
   * @return {void}
   */
  // prettier-ignore
  static validateOptions(t = {}) {
    const {
      width: e,
      height: s,
      padding: o,
      rowsCount: a,
      guideDotsRadius: r,
      data: { xAxis: n, yAxis: l } = {},
      i18n: { months: d } = {},
      style: { textFont: u, textColor: I, secondaryColor: g, backgroundColor: y } = {},
      flags: { horGuide: p, immediateInit: D } = {}
    } = t;
    if (e) {
      if (typeof e != "number")
        throw new i("width should be a number");
      if (e <= 0)
        throw new i("width should be greater than 0");
      if (e % 2 !== 0)
        throw new i("width should be an even number");
    }
    if (s) {
      if (typeof s != "number")
        throw new i("height should be a number");
      if (s <= 0)
        throw new i("height should be greater than 0");
      if (s % 2 !== 0)
        throw new i("height should be an even number");
    }
    if (o) {
      if (typeof o != "number")
        throw new i("padding should be a number");
      if (o < 0)
        throw new i("padding should be greater or equal to 0");
    }
    if (a) {
      if (typeof a != "number")
        throw new i("rowsCount should be a number");
      if (a <= 0)
        throw new i("rowsCount should be greater than 0");
    }
    if (r) {
      if (typeof r != "number")
        throw new i("guideDotsRadius should be a number");
      if (r <= 0)
        throw new i("guideDotsRadius should be greater than 0");
    }
    if (n) {
      if (typeof n != "object")
        throw new i("data.xAxis should be an object");
      if (typeof n.type != "string")
        throw new i("data.xAxis.type should be a string");
      if (!["date"].includes(n.type))
        throw new i('data.xAxis.type should be "date"');
      if (!Array.isArray(n.values))
        throw new i("data.xAxis.values should be an array");
      n.type === "date" && n.values.forEach((x, A) => {
        if (typeof x != "number")
          throw new i(`data.xAxis.values[${A}] should be a number`);
      });
    }
    if (l) {
      if (!Array.isArray(l))
        throw new i("data.columns should be an array");
      l.forEach((x, A) => {
        if (typeof x.name != "string")
          throw new i(`data.yAxis[${A}].name should be a string`);
        if (typeof x.color != "string")
          throw new i(`data.yAxis[${A}].color should be a string`);
        if (!Array.isArray(x.values))
          throw new i(`data.yAxis[${A}].values should be an array`);
        x.values.forEach((m, T) => {
          if (typeof m != "number")
            throw new i(`data.yAxis[${A}].values[${T}] should be a number`);
        });
      });
    }
    if (d) {
      if (!Array.isArray(d))
        throw new i("i18n.months should be an array");
      if (d.length !== 12)
        throw new i("i18n.months should have 12 elements");
    }
    if (u && typeof u != "string")
      throw new i("style.textFont should be a string");
    if (I && typeof I != "string")
      throw new i("style.textColor should be a string");
    if (g && typeof g != "string")
      throw new i("style.secondaryColor should be a string");
    if (y && typeof y != "string")
      throw new i("style.backgroundColor should be a string");
    if (p && typeof p != "boolean")
      throw new i("flags.horGuide should be a boolean");
    if (D && typeof D != "boolean")
      throw new i("flags.immediateInit should be a boolean");
  }
  /**
   * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
   *
   * @param {Partial<IChartOptions>} options - The options to merge with the preset options.
   * @return {IChartOptions} The merged options.
   */
  static getOptions(t = {}) {
    var e, s, o, a, r, n, l, d, u;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding ?? this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      guideDotsRadius: t.guideDotsRadius || this.presetOptions.guideDotsRadius,
      data: {
        xAxis: ((e = t.data) == null ? void 0 : e.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((s = t.data) == null ? void 0 : s.yAxis) || this.presetOptions.data.yAxis
      },
      i18n: {
        months: ((o = t.i18n) == null ? void 0 : o.months) || this.presetOptions.i18n.months
      },
      style: {
        textFont: ((a = t.style) == null ? void 0 : a.textFont) || this.presetOptions.style.textFont,
        textColor: ((r = t.style) == null ? void 0 : r.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((n = t.style) == null ? void 0 : n.secondaryColor) || this.presetOptions.style.secondaryColor,
        backgroundColor: ((l = t.style) == null ? void 0 : l.backgroundColor) || this.presetOptions.style.backgroundColor
      },
      flags: {
        horGuide: ((d = t.flags) == null ? void 0 : d.horGuide) ?? this.presetOptions.flags.horGuide,
        immediateInit: ((u = t.flags) == null ? void 0 : u.immediateInit) ?? this.presetOptions.flags.immediateInit
      }
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  // prettier-ignore
  static changePresetOptions(t = {}) {
    var e, s, o, a, r, n, l, d, u;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding ?? this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.guideDotsRadius = t.guideDotsRadius || this.presetOptions.guideDotsRadius, this.presetOptions.i18n.months = ((e = t.i18n) == null ? void 0 : e.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((s = t.style) == null ? void 0 : s.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((a = t.style) == null ? void 0 : a.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.style.backgroundColor = ((r = t.style) == null ? void 0 : r.backgroundColor) || this.presetOptions.style.backgroundColor, this.presetOptions.data.xAxis = ((n = t.data) == null ? void 0 : n.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((l = t.data) == null ? void 0 : l.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.flags.horGuide = ((d = t.flags) == null ? void 0 : d.horGuide) ?? this.presetOptions.flags.horGuide, this.presetOptions.flags.immediateInit = ((u = t.flags) == null ? void 0 : u.immediateInit) ?? this.presetOptions.flags.immediateInit;
  }
};
// Static options preset
h(f, "presetOptions", {
  width: 600,
  height: 250,
  padding: 40,
  rowsCount: 5,
  guideDotsRadius: 8,
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
    secondaryColor: "#bbbbbb",
    backgroundColor: "#ffffff"
  },
  flags: {
    horGuide: !0,
    immediateInit: !0
  }
});
let w = f;
export {
  w as Chart,
  b as ChartError,
  i as ChartOptionsError
};
