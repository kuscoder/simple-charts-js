var O = Object.defineProperty;
var b = (a, t, e) => t in a ? O(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var n = (a, t, e) => (b(a, typeof t != "symbol" ? t + "" : t, e), e);
function C(a, t) {
  let e;
  return (...i) => {
    clearTimeout(e), e = setTimeout(() => a(...i), t);
  };
}
function _(a, t) {
  let e;
  return (...i) => {
    e || (e = setTimeout(() => {
      a(...i), e = null;
    }, t));
  };
}
class H extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class s extends H {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const I = class I {
  /**
   * Constructor for creating a new instance of the Chart class.
   *
   * @param {HTMLElement} containerElement - the HTML element that will contain the chart
   * @param {Partial<IChartOptions>} options - optional chart options
   */
  constructor(t, e = {}) {
    // Options
    n(this, "WIDTH");
    n(this, "HEIGHT");
    n(this, "PADDING");
    n(this, "ROWS_COUNT");
    n(this, "DATA");
    n(this, "I18N");
    n(this, "INTERACTIVITY");
    n(this, "STYLE");
    n(this, "TECHNICAL");
    // Calculated
    n(this, "DPI_WIDTH");
    n(this, "DPI_HEIGHT");
    n(this, "VIEW_WIDTH");
    n(this, "VIEW_HEIGHT");
    n(this, "Y_AXIS_DATA_BOUNDARIES");
    n(this, "X_RATIO");
    n(this, "Y_RATIO");
    n(this, "ROWS_STEP");
    n(this, "TEXT_STEP");
    n(this, "X_AXIS_DATA_COUNT");
    n(this, "X_AXIS_DATA_STEP");
    // Interactivity
    n(this, "mouse");
    n(this, "isInitialized", !1);
    n(this, "rafID", 0);
    // DOM
    n(this, "containerElement");
    n(this, "wrapperElement");
    n(this, "canvasElement");
    n(this, "tooltipElement");
    n(this, "canvasRect");
    n(this, "ctx");
    var o;
    const i = I.getOptions(e), h = ((o = i.data.xAxis) == null ? void 0 : o.values.length) || 0, r = this.getAxisYDataLength(i.data.yAxis);
    this.containerElement = t, this.WIDTH = i.width, this.HEIGHT = i.height, this.PADDING = i.padding, this.ROWS_COUNT = i.rowsCount, this.DATA = i.data, this.I18N = i.i18n, this.INTERACTIVITY = i.interactivity, this.STYLE = i.style, this.TECHNICAL = i.technical, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_AXIS_DATA_BOUNDARIES = this.getYAxisDataBoundaries(this.DATA.yAxis), this.X_RATIO = this.VIEW_WIDTH / (r - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = h && Math.round(h / this.X_AXIS_DATA_COUNT), this.resizeHandler = C(this.resizeHandler.bind(this), 100), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawChart = _(this.drawChart.bind(this), 1e3 / this.INTERACTIVITY.fpsLimit), this.mouse = new Proxy(
      {},
      {
        set: (...l) => {
          const d = Reflect.set(...l);
          return this.rafID = window.requestAnimationFrame(this.drawChart), d;
        }
      }
    ), this.createDOMElements(), this.TECHNICAL.immediateInit && this.initialize();
  }
  /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
  createDOMElements() {
    this.wrapperElement = document.createElement("div"), this.wrapperElement.className = "simple-chart", this.canvasElement = document.createElement("canvas"), this.canvasElement.className = "simple-chart__canvas", this.canvasElement.width = this.DPI_WIDTH, this.canvasElement.height = this.DPI_HEIGHT, this.canvasElement.style.width = this.WIDTH + "px", this.canvasElement.style.height = this.HEIGHT + "px", this.ctx = this.canvasElement.getContext("2d"), this.tooltipElement = document.createElement("div"), this.tooltipElement.className = "simple-chart__tooltip";
  }
  /** Initializes the component by appending the canvas to the container element and drawing the chart. */
  initialize() {
    this.isInitialized || (this.isInitialized = !0, this.TECHNICAL.insertMethod === "append" ? this.containerElement.appendChild(this.wrapperElement) : this.TECHNICAL.insertMethod === "prepend" ? this.containerElement.insertBefore(this.wrapperElement, this.containerElement.firstChild) : this.TECHNICAL.insertMethod(this.containerElement, this.wrapperElement), this.wrapperElement.appendChild(this.canvasElement), this.wrapperElement.appendChild(this.tooltipElement), window.addEventListener("resize", this.resizeHandler), window.addEventListener("orientationchange", this.resizeHandler), this.canvasElement.addEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.addEventListener("mouseleave", this.mouseLeaveHandler), this.drawChart());
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
        const e = this.getX(t);
        if ((t - 1) % this.X_AXIS_DATA_STEP === 0) {
          const i = this.getDate(this.DATA.xAxis.values[t - 1]);
          this.ctx.fillText(i, e, this.DPI_HEIGHT - 10);
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
      const e = this.isMouseOverYAxisDataItem(t), i = this.PADDING / 2, h = this.DPI_HEIGHT - this.PADDING;
      if (e && this.mouse.y >= i)
        return this.INTERACTIVITY.horisontalGuide && this.mouse.y <= h && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, i), this.ctx.lineTo(t, h), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.arc(t, i, 2, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath(), !0;
    }
    return !1;
  }
  /** Draws the Y axis of the chart. */
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const e = String(Math.round(this.Y_AXIS_DATA_BOUNDARIES[1] - this.TEXT_STEP * t)), i = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(e, 5, i - 10), this.ctx.moveTo(0, i), this.ctx.lineTo(this.DPI_WIDTH, i);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** Draws the lines of the chart. */
  drawLines() {
    this.ctx.lineWidth = 4, this.ctx.fillStyle = this.STYLE.backgroundColor;
    for (const t of this.DATA.yAxis) {
      let e = null, i = null;
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let h = 0; h < t.values.length; h++) {
        const r = this.getX(h), o = this.getY(t.values[h]);
        this.ctx.lineTo(r, o), this.isMouseOverYAxisDataItem(r) && (e = r, i = o);
      }
      this.ctx.stroke(), this.ctx.closePath(), e && i && this.mouse.x && this.mouse.y && this.mouse.y >= this.PADDING / 2 && (this.ctx.beginPath(), this.ctx.arc(e, i, this.INTERACTIVITY.guideDotsRadius, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath());
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
    let e = null, i = null;
    for (const h of t)
      for (const r of h.values)
        (e === null || r < e) && (e = r), (i === null || r > i) && (i = r);
    return [e ?? 0, i ?? 0];
  }
  /**
   * Returns a formatted date string for x-axis based on the given timestamp.
   *
   * @param {number} timestamp - The timestamp to convert to a date.
   * @return {string} The formatted date string in the format "day month".
   */
  getDate(t) {
    const e = new Date(t), i = e.getDate(), h = e.getMonth();
    return `${i} ${this.I18N.months[h]}`;
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
    let e = 0;
    for (const i of t)
      i.values.length > e && (e = i.values.length);
    return e;
  }
  /**
   * Checks if the mouse-x is hovering over an x-axis data item at its x-coordinate.
   *
   * @param {number} x - The x-axis data item coordinate to check.
   * @return {boolean} true if the mouse-x is hovering over the x-axis data item, false otherwise.
   */
  isMouseOverYAxisDataItem(t) {
    const e = this.getAxisYDataLength() - 1;
    return !e || !this.mouse.x ? !1 : Math.abs(t - this.mouse.x) < this.DPI_WIDTH / e / 2;
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
      height: i,
      padding: h,
      rowsCount: r,
      data: { xAxis: o, yAxis: l } = {},
      i18n: { months: d } = {},
      interactivity: { horisontalGuide: p, guideDotsRadius: c, fpsLimit: u } = {},
      style: { textFont: m, textColor: x, secondaryColor: w, backgroundColor: T } = {},
      technical: { insertMethod: A, immediateInit: E } = {}
    } = t;
    if (e) {
      if (typeof e != "number")
        throw new s("width should be a number");
      if (e <= 0)
        throw new s("width should be greater than 0");
      if (e % 2 !== 0)
        throw new s("width should be an even number");
    }
    if (i) {
      if (typeof i != "number")
        throw new s("height should be a number");
      if (i <= 0)
        throw new s("height should be greater than 0");
      if (i % 2 !== 0)
        throw new s("height should be an even number");
    }
    if (h) {
      if (typeof h != "number")
        throw new s("padding should be a number");
      if (h < 0)
        throw new s("padding should be greater or equal to 0");
    }
    if (r) {
      if (typeof r != "number")
        throw new s("rowsCount should be a number");
      if (r <= 0)
        throw new s("rowsCount should be greater than 0");
    }
    if (p && typeof p != "boolean")
      throw new s("interactivity.horisontalGuide should be a boolean");
    if (c) {
      if (typeof c != "number")
        throw new s("interactivity.guideDotsRadius should be a number");
      if (c <= 0)
        throw new s("interactivity.guideDotsRadius should be greater than 0");
    }
    if (u) {
      if (typeof u != "number")
        throw new s("interactivity.fpsLimit should be a number");
      if (u <= 0)
        throw new s("interactivity.fpsLimit should be greater than 0");
    }
    if (o) {
      if (typeof o != "object")
        throw new s("data.xAxis should be an object");
      if (typeof o.type != "string")
        throw new s("data.xAxis.type should be a string");
      if (!["date"].includes(o.type))
        throw new s('data.xAxis.type should be "date"');
      if (!Array.isArray(o.values))
        throw new s("data.xAxis.values should be an array");
      o.type === "date" && o.values.forEach((f, y) => {
        if (typeof f != "number")
          throw new s(`data.xAxis.values[${y}] should be a number`);
      });
    }
    if (l) {
      if (!Array.isArray(l))
        throw new s("data.columns should be an array");
      l.forEach((f, y) => {
        if (typeof f.name != "string")
          throw new s(`data.yAxis[${y}].name should be a string`);
        if (typeof f.color != "string")
          throw new s(`data.yAxis[${y}].color should be a string`);
        if (!Array.isArray(f.values))
          throw new s(`data.yAxis[${y}].values should be an array`);
        f.values.forEach((v, D) => {
          if (typeof v != "number")
            throw new s(`data.yAxis[${y}].values[${D}] should be a number`);
        });
      });
    }
    if (d) {
      if (!Array.isArray(d))
        throw new s("i18n.months should be an array");
      if (d.length !== 12)
        throw new s("i18n.months should have 12 elements");
    }
    if (m && typeof m != "string")
      throw new s("style.textFont should be a string");
    if (x && typeof x != "string")
      throw new s("style.textColor should be a string");
    if (w && typeof w != "string")
      throw new s("style.secondaryColor should be a string");
    if (T && typeof T != "string")
      throw new s("style.backgroundColor should be a string");
    if (A) {
      if (typeof A != "string" && typeof A != "function")
        throw new s("technical.insertMethod should be a string or function");
      if (typeof A == "string" && !["append", "prepend"].includes(A))
        throw new s('technical.insertMethod should be "append" or "prepend" or function');
    }
    if (E && typeof E != "boolean")
      throw new s("technical.immediateInit should be a boolean");
  }
  /**
   * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
   *
   * @param {Partial<IChartOptions>} options - The options to merge with the preset options.
   * @return {IChartOptions} The merged options.
   */
  static getOptions(t = {}) {
    var e, i, h, r, o, l, d, p, c, u, m, x;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding ?? this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      data: {
        xAxis: ((e = t.data) == null ? void 0 : e.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((i = t.data) == null ? void 0 : i.yAxis) || this.presetOptions.data.yAxis
      },
      i18n: {
        months: ((h = t.i18n) == null ? void 0 : h.months) || this.presetOptions.i18n.months
      },
      interactivity: {
        horisontalGuide: ((r = t.interactivity) == null ? void 0 : r.horisontalGuide) || this.presetOptions.interactivity.horisontalGuide,
        guideDotsRadius: ((o = t.interactivity) == null ? void 0 : o.guideDotsRadius) || this.presetOptions.interactivity.guideDotsRadius,
        fpsLimit: ((l = t.interactivity) == null ? void 0 : l.fpsLimit) || this.presetOptions.interactivity.fpsLimit
      },
      style: {
        textFont: ((d = t.style) == null ? void 0 : d.textFont) || this.presetOptions.style.textFont,
        textColor: ((p = t.style) == null ? void 0 : p.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((c = t.style) == null ? void 0 : c.secondaryColor) || this.presetOptions.style.secondaryColor,
        backgroundColor: ((u = t.style) == null ? void 0 : u.backgroundColor) || this.presetOptions.style.backgroundColor
      },
      technical: {
        insertMethod: ((m = t.technical) == null ? void 0 : m.insertMethod) || this.presetOptions.technical.insertMethod,
        immediateInit: ((x = t.technical) == null ? void 0 : x.immediateInit) || this.presetOptions.technical.immediateInit
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
    var e, i, h, r, o, l, d, p, c, u, m, x;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding ?? this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.data.xAxis = ((e = t.data) == null ? void 0 : e.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((i = t.data) == null ? void 0 : i.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.i18n.months = ((h = t.i18n) == null ? void 0 : h.months) || this.presetOptions.i18n.months, this.presetOptions.interactivity.horisontalGuide = ((r = t.interactivity) == null ? void 0 : r.horisontalGuide) || this.presetOptions.interactivity.horisontalGuide, this.presetOptions.interactivity.guideDotsRadius = ((o = t.interactivity) == null ? void 0 : o.guideDotsRadius) || this.presetOptions.interactivity.guideDotsRadius, this.presetOptions.interactivity.fpsLimit = ((l = t.interactivity) == null ? void 0 : l.fpsLimit) || this.presetOptions.interactivity.fpsLimit, this.presetOptions.style.textFont = ((d = t.style) == null ? void 0 : d.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((p = t.style) == null ? void 0 : p.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((c = t.style) == null ? void 0 : c.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.style.backgroundColor = ((u = t.style) == null ? void 0 : u.backgroundColor) || this.presetOptions.style.backgroundColor, this.presetOptions.technical.insertMethod = ((m = t.technical) == null ? void 0 : m.insertMethod) || this.presetOptions.technical.insertMethod, this.presetOptions.technical.immediateInit = ((x = t.technical) == null ? void 0 : x.immediateInit) || this.presetOptions.technical.immediateInit;
  }
};
// Static options preset
n(I, "presetOptions", {
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
  interactivity: {
    horisontalGuide: !0,
    guideDotsRadius: 8,
    fpsLimit: 60
  },
  style: {
    textFont: "normal 20px Helvetica,sans-serif",
    textColor: "#96a2aa",
    secondaryColor: "#bbbbbb",
    backgroundColor: "#ffffff"
  },
  technical: {
    insertMethod: "append",
    immediateInit: !0
  }
});
let g = I;
export {
  g as Chart,
  H as ChartError,
  s as ChartOptionsError
};
