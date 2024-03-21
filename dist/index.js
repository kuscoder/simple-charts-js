var O = Object.defineProperty;
var _ = (d, t, s) => t in d ? O(d, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : d[t] = s;
var i = (d, t, s) => (_(d, typeof t != "symbol" ? t + "" : t, s), s);
function v(d, t) {
  let s;
  return (...e) => {
    clearTimeout(s), s = setTimeout(() => d(...e), t);
  };
}
class b extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class n extends b {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const f = class f {
  /**
   * Constructor for creating a new instance of the Chart class.
   *
   * @param {HTMLElement} containerElement - the HTML element that will contain the chart
   * @param {Partial<IChartOptions>} options - optional chart options
   */
  constructor(t, s = {}) {
    // Options
    i(this, "WIDTH");
    i(this, "HEIGHT");
    i(this, "PADDING");
    i(this, "ROWS_COUNT");
    i(this, "GUIDE_DOTS_RADIUS");
    i(this, "DATA");
    i(this, "I18N");
    i(this, "STYLE");
    i(this, "FLAGS");
    i(this, "INSERT_METHOD");
    // Calculated
    i(this, "DPI_WIDTH");
    i(this, "DPI_HEIGHT");
    i(this, "VIEW_WIDTH");
    i(this, "VIEW_HEIGHT");
    i(this, "Y_AXIS_DATA_BOUNDARIES");
    i(this, "X_RATIO");
    i(this, "Y_RATIO");
    i(this, "ROWS_STEP");
    i(this, "TEXT_STEP");
    i(this, "X_AXIS_DATA_COUNT");
    i(this, "X_AXIS_DATA_STEP");
    // Interactivity
    i(this, "mouse");
    i(this, "isInitialized", !1);
    i(this, "rafID", 0);
    // DOM
    i(this, "containerElement");
    i(this, "wrapperElement");
    i(this, "canvasElement");
    i(this, "tooltipElement");
    i(this, "canvasRect");
    i(this, "ctx");
    var o;
    const e = f.getOptions(s), h = ((o = e.data.xAxis) == null ? void 0 : o.values.length) || 0, r = this.getAxisYDataLength(e.data.yAxis);
    this.containerElement = t, this.WIDTH = e.width, this.HEIGHT = e.height, this.PADDING = e.padding, this.ROWS_COUNT = e.rowsCount, this.GUIDE_DOTS_RADIUS = e.guideDotsRadius, this.DATA = e.data, this.I18N = e.i18n, this.STYLE = e.style, this.FLAGS = e.flags, this.INSERT_METHOD = e.insertMethod, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_AXIS_DATA_BOUNDARIES = this.getYAxisDataBoundaries(this.DATA.yAxis), this.X_RATIO = this.VIEW_WIDTH / (r - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = h && Math.round(h / this.X_AXIS_DATA_COUNT), this.resizeHandler = v(this.resizeHandler.bind(this), 100), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawChart = this.drawChart.bind(this), this.mouse = new Proxy(
      {},
      {
        set: (...a) => {
          const l = Reflect.set(...a);
          return this.rafID = window.requestAnimationFrame(this.drawChart), l;
        }
      }
    ), this.createDOMElements(), this.FLAGS.immediateInit && this.initialize();
  }
  /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
  createDOMElements() {
    this.wrapperElement = document.createElement("div"), this.wrapperElement.className = "simple-chart", this.canvasElement = document.createElement("canvas"), this.canvasElement.className = "simple-chart__canvas", this.canvasElement.width = this.DPI_WIDTH, this.canvasElement.height = this.DPI_HEIGHT, this.canvasElement.style.width = this.WIDTH + "px", this.canvasElement.style.height = this.HEIGHT + "px", this.ctx = this.canvasElement.getContext("2d"), this.tooltipElement = document.createElement("div"), this.tooltipElement.className = "simple-chart__tooltip";
  }
  /** Initializes the component by appending the canvas to the container element and drawing the chart. */
  initialize() {
    this.isInitialized || (this.isInitialized = !0, this.INSERT_METHOD === "append" ? this.containerElement.appendChild(this.wrapperElement) : this.INSERT_METHOD === "prepend" ? this.containerElement.insertBefore(this.wrapperElement, this.containerElement.firstChild) : this.INSERT_METHOD(this.containerElement, this.wrapperElement), this.wrapperElement.appendChild(this.canvasElement), this.wrapperElement.appendChild(this.tooltipElement), window.addEventListener("resize", this.resizeHandler), window.addEventListener("orientationchange", this.resizeHandler), this.canvasElement.addEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.addEventListener("mouseleave", this.mouseLeaveHandler), this.drawChart());
  }
  /** Destroys the component from the DOM. */
  destroy() {
    this.isInitialized && (this.isInitialized = !1, this.wrapperElement.removeChild(this.tooltipElement), this.wrapperElement.removeChild(this.canvasElement), this.containerElement.removeChild(this.wrapperElement), window.cancelAnimationFrame(this.rafID), window.removeEventListener("resize", this.resizeHandler), window.removeEventListener("orientationchange", this.resizeHandler), this.canvasElement.removeEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.removeEventListener("mouseleave", this.mouseLeaveHandler));
  }
  /** Main method that draws the chart by clearing the canvas. */
  drawChart() {
    console.log("draw"), this.drawBackground(), this.drawAxisX(), this.drawAxisY(), this.drawLines();
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
        const s = this.getX(t);
        if ((t - 1) % this.X_AXIS_DATA_STEP === 0) {
          const e = this.getDate(this.DATA.xAxis.values[t - 1]);
          this.ctx.fillText(e, s, this.DPI_HEIGHT - 10);
        }
        this.drawGuideLinesIsOver(s);
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
      const s = this.isMouseOverYAxisDataItem(t), e = this.PADDING / 2, h = this.DPI_HEIGHT - this.PADDING;
      if (s && this.mouse.y >= e)
        return this.FLAGS.horGuide && this.mouse.y <= h && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, e), this.ctx.lineTo(t, h), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.arc(t, e, 2, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath(), !0;
    }
    return !1;
  }
  /** Draws the Y axis of the chart. */
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const s = String(Math.round(this.Y_AXIS_DATA_BOUNDARIES[1] - this.TEXT_STEP * t)), e = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(s, 5, e - 10), this.ctx.moveTo(0, e), this.ctx.lineTo(this.DPI_WIDTH, e);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** Draws the lines of the chart. */
  drawLines() {
    this.ctx.lineWidth = 4, this.ctx.fillStyle = this.STYLE.backgroundColor;
    for (const t of this.DATA.yAxis) {
      let s = null, e = null;
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let h = 0; h < t.values.length; h++) {
        const r = this.getX(h), o = this.getY(t.values[h]);
        this.ctx.lineTo(r, o), this.isMouseOverYAxisDataItem(r) && (s = r, e = o);
      }
      this.ctx.stroke(), this.ctx.closePath(), s && e && this.mouse.x && this.mouse.y && this.mouse.y >= this.PADDING / 2 && (this.ctx.beginPath(), this.ctx.arc(s, e, this.GUIDE_DOTS_RADIUS, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath());
    }
  }
  /** Event handler that updates the mouse position by canvas coordinates. */
  mouseMoveHandler(t) {
    this.canvasRect ?? (this.canvasRect = this.canvasElement.getBoundingClientRect()), this.mouse.x = (t.clientX - this.canvasRect.left) * 2, this.mouse.y = (t.clientY - this.canvasRect.top) * 2;
  }
  /** Event handler that resets the mouse position when the mouse leaves the canvas. */
  mouseLeaveHandler() {
    this.mouse.x = null, this.mouse.y = null;
  }
  /** Event handler that update the chart interactivity when the window is resized. */
  resizeHandler() {
    this.canvasRect = this.canvasElement.getBoundingClientRect();
  }
  /**
   * Generates boundaries for the y-axis based on the provided columns.
   *
   * @param {IDataAxisY[]} columns - an array of data axis Y values
   * @return {[number, number]} an array containing the minimum and maximum y values
   */
  getYAxisDataBoundaries(t) {
    let s = null, e = null;
    for (const h of t)
      for (const r of h.values)
        (s === null || r < s) && (s = r), (e === null || r > e) && (e = r);
    return [s ?? 0, e ?? 0];
  }
  /**
   * Returns a formatted date string for x-axis based on the given timestamp.
   *
   * @param {number} timestamp - The timestamp to convert to a date.
   * @return {string} The formatted date string in the format "day month".
   */
  getDate(t) {
    const s = new Date(t), e = s.getDate(), h = s.getMonth();
    return `${e} ${this.I18N.months[h]}`;
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
   * Calculate the maximum length of the Y-axis data.
   *
   * @param {?IDataAxisY[]} yAxisData - optional parameter for the Y-axis data
   * @return {number} the maximum length of the Y-axis data.
   */
  getAxisYDataLength(t) {
    t ?? (t = this.DATA.yAxis);
    let s = 0;
    for (const e of t)
      e.values.length > s && (s = e.values.length);
    return s;
  }
  /**
   * Checks if the mouse-x is hovering over an x-axis data item at its x-coordinate.
   *
   * @param {number} x - The x-axis data item coordinate to check.
   * @return {boolean} true if the mouse-x is hovering over the x-axis data item, false otherwise.
   */
  isMouseOverYAxisDataItem(t) {
    const s = this.getAxisYDataLength() - 1;
    return !s || !this.mouse.x ? !1 : Math.abs(t - this.mouse.x) < this.DPI_WIDTH / s / 2;
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
      width: s,
      height: e,
      padding: h,
      rowsCount: r,
      guideDotsRadius: o,
      data: { xAxis: a, yAxis: l } = {},
      i18n: { months: u } = {},
      style: { textFont: c, textColor: A, secondaryColor: g, backgroundColor: w } = {},
      flags: { horGuide: I, immediateInit: E } = {},
      insertMethod: x
    } = t;
    if (s) {
      if (typeof s != "number")
        throw new n("width should be a number");
      if (s <= 0)
        throw new n("width should be greater than 0");
      if (s % 2 !== 0)
        throw new n("width should be an even number");
    }
    if (e) {
      if (typeof e != "number")
        throw new n("height should be a number");
      if (e <= 0)
        throw new n("height should be greater than 0");
      if (e % 2 !== 0)
        throw new n("height should be an even number");
    }
    if (h) {
      if (typeof h != "number")
        throw new n("padding should be a number");
      if (h < 0)
        throw new n("padding should be greater or equal to 0");
    }
    if (r) {
      if (typeof r != "number")
        throw new n("rowsCount should be a number");
      if (r <= 0)
        throw new n("rowsCount should be greater than 0");
    }
    if (o) {
      if (typeof o != "number")
        throw new n("guideDotsRadius should be a number");
      if (o <= 0)
        throw new n("guideDotsRadius should be greater than 0");
    }
    if (a) {
      if (typeof a != "object")
        throw new n("data.xAxis should be an object");
      if (typeof a.type != "string")
        throw new n("data.xAxis.type should be a string");
      if (!["date"].includes(a.type))
        throw new n('data.xAxis.type should be "date"');
      if (!Array.isArray(a.values))
        throw new n("data.xAxis.values should be an array");
      a.type === "date" && a.values.forEach((p, m) => {
        if (typeof p != "number")
          throw new n(`data.xAxis.values[${m}] should be a number`);
      });
    }
    if (l) {
      if (!Array.isArray(l))
        throw new n("data.columns should be an array");
      l.forEach((p, m) => {
        if (typeof p.name != "string")
          throw new n(`data.yAxis[${m}].name should be a string`);
        if (typeof p.color != "string")
          throw new n(`data.yAxis[${m}].color should be a string`);
        if (!Array.isArray(p.values))
          throw new n(`data.yAxis[${m}].values should be an array`);
        p.values.forEach((D, T) => {
          if (typeof D != "number")
            throw new n(`data.yAxis[${m}].values[${T}] should be a number`);
        });
      });
    }
    if (u) {
      if (!Array.isArray(u))
        throw new n("i18n.months should be an array");
      if (u.length !== 12)
        throw new n("i18n.months should have 12 elements");
    }
    if (c && typeof c != "string")
      throw new n("style.textFont should be a string");
    if (A && typeof A != "string")
      throw new n("style.textColor should be a string");
    if (g && typeof g != "string")
      throw new n("style.secondaryColor should be a string");
    if (w && typeof w != "string")
      throw new n("style.backgroundColor should be a string");
    if (I && typeof I != "boolean")
      throw new n("flags.horGuide should be a boolean");
    if (E && typeof E != "boolean")
      throw new n("flags.immediateInit should be a boolean");
    if (x) {
      if (typeof x != "string" && typeof x != "function")
        throw new n("insertMethod should be a string or function");
      if (typeof x == "string" && !["append", "prepend"].includes(x))
        throw new n('insertMethod should be "append" or "prepend" or function');
    }
  }
  /**
   * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
   *
   * @param {Partial<IChartOptions>} options - The options to merge with the preset options.
   * @return {IChartOptions} The merged options.
   */
  static getOptions(t = {}) {
    var s, e, h, r, o, a, l, u, c;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding ?? this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      guideDotsRadius: t.guideDotsRadius || this.presetOptions.guideDotsRadius,
      data: {
        xAxis: ((s = t.data) == null ? void 0 : s.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((e = t.data) == null ? void 0 : e.yAxis) || this.presetOptions.data.yAxis
      },
      i18n: {
        months: ((h = t.i18n) == null ? void 0 : h.months) || this.presetOptions.i18n.months
      },
      style: {
        textFont: ((r = t.style) == null ? void 0 : r.textFont) || this.presetOptions.style.textFont,
        textColor: ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((a = t.style) == null ? void 0 : a.secondaryColor) || this.presetOptions.style.secondaryColor,
        backgroundColor: ((l = t.style) == null ? void 0 : l.backgroundColor) || this.presetOptions.style.backgroundColor
      },
      flags: {
        horGuide: ((u = t.flags) == null ? void 0 : u.horGuide) ?? this.presetOptions.flags.horGuide,
        immediateInit: ((c = t.flags) == null ? void 0 : c.immediateInit) ?? this.presetOptions.flags.immediateInit
      },
      insertMethod: t.insertMethod || this.presetOptions.insertMethod
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {Partial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  // prettier-ignore
  static changePresetOptions(t = {}) {
    var s, e, h, r, o, a, l, u, c;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding ?? this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.guideDotsRadius = t.guideDotsRadius || this.presetOptions.guideDotsRadius, this.presetOptions.i18n.months = ((s = t.i18n) == null ? void 0 : s.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((e = t.style) == null ? void 0 : e.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((h = t.style) == null ? void 0 : h.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((r = t.style) == null ? void 0 : r.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.style.backgroundColor = ((o = t.style) == null ? void 0 : o.backgroundColor) || this.presetOptions.style.backgroundColor, this.presetOptions.data.xAxis = ((a = t.data) == null ? void 0 : a.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((l = t.data) == null ? void 0 : l.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.flags.horGuide = ((u = t.flags) == null ? void 0 : u.horGuide) ?? this.presetOptions.flags.horGuide, this.presetOptions.flags.immediateInit = ((c = t.flags) == null ? void 0 : c.immediateInit) ?? this.presetOptions.flags.immediateInit, this.presetOptions.insertMethod = t.insertMethod || this.presetOptions.insertMethod;
  }
};
// Static options preset
i(f, "presetOptions", {
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
  },
  insertMethod: "append"
});
let y = f;
export {
  y as Chart,
  b as ChartError,
  n as ChartOptionsError
};
