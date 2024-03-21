var O = Object.defineProperty;
var b = (d, t, i) => t in d ? O(d, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : d[t] = i;
var n = (d, t, i) => (b(d, typeof t != "symbol" ? t + "" : t, i), i);
function C(d, t) {
  let i;
  return (...e) => {
    clearTimeout(i), i = setTimeout(() => d(...e), t);
  };
}
class _ extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class s extends _ {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const w = class w {
  /**
   * Constructor for creating a new instance of the Chart class.
   *
   * @param {HTMLElement} containerElement - the HTML element that will contain the chart
   * @param {Partial<IChartOptions>} options - optional chart options
   */
  constructor(t, i = {}) {
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
    var a;
    const e = w.getOptions(i), h = ((a = e.data.xAxis) == null ? void 0 : a.values.length) || 0, r = this.getAxisYDataLength(e.data.yAxis);
    this.containerElement = t, this.WIDTH = e.width, this.HEIGHT = e.height, this.PADDING = e.padding, this.ROWS_COUNT = e.rowsCount, this.DATA = e.data, this.I18N = e.i18n, this.INTERACTIVITY = e.interactivity, this.STYLE = e.style, this.TECHNICAL = e.technical, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_AXIS_DATA_BOUNDARIES = this.getYAxisDataBoundaries(this.DATA.yAxis), this.X_RATIO = this.VIEW_WIDTH / (r - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_AXIS_DATA_BOUNDARIES[1] - this.Y_AXIS_DATA_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = h && Math.round(h / this.X_AXIS_DATA_COUNT), this.resizeHandler = C(this.resizeHandler.bind(this), 100), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawChart = this.drawChart.bind(this), this.mouse = new Proxy(
      {},
      {
        set: (...o) => {
          const l = Reflect.set(...o);
          return this.rafID = window.requestAnimationFrame(this.drawChart), l;
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
        const i = this.getX(t);
        if ((t - 1) % this.X_AXIS_DATA_STEP === 0) {
          const e = this.getDate(this.DATA.xAxis.values[t - 1]);
          this.ctx.fillText(e, i, this.DPI_HEIGHT - 10);
        }
        this.drawGuideLinesIsOver(i);
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
      const i = this.isMouseOverYAxisDataItem(t), e = this.PADDING / 2, h = this.DPI_HEIGHT - this.PADDING;
      if (i && this.mouse.y >= e)
        return this.INTERACTIVITY.horisontalGuide && this.mouse.y <= h && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, e), this.ctx.lineTo(t, h), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.arc(t, e, 2, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath(), !0;
    }
    return !1;
  }
  /** Draws the Y axis of the chart. */
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const i = String(Math.round(this.Y_AXIS_DATA_BOUNDARIES[1] - this.TEXT_STEP * t)), e = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(i, 5, e - 10), this.ctx.moveTo(0, e), this.ctx.lineTo(this.DPI_WIDTH, e);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** Draws the lines of the chart. */
  drawLines() {
    this.ctx.lineWidth = 4, this.ctx.fillStyle = this.STYLE.backgroundColor;
    for (const t of this.DATA.yAxis) {
      let i = null, e = null;
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let h = 0; h < t.values.length; h++) {
        const r = this.getX(h), a = this.getY(t.values[h]);
        this.ctx.lineTo(r, a), this.isMouseOverYAxisDataItem(r) && (i = r, e = a);
      }
      this.ctx.stroke(), this.ctx.closePath(), i && e && this.mouse.x && this.mouse.y && this.mouse.y >= this.PADDING / 2 && (this.ctx.beginPath(), this.ctx.arc(i, e, this.INTERACTIVITY.guideDotsRadius, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath());
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
    let i = null, e = null;
    for (const h of t)
      for (const r of h.values)
        (i === null || r < i) && (i = r), (e === null || r > e) && (e = r);
    return [i ?? 0, e ?? 0];
  }
  /**
   * Returns a formatted date string for x-axis based on the given timestamp.
   *
   * @param {number} timestamp - The timestamp to convert to a date.
   * @return {string} The formatted date string in the format "day month".
   */
  getDate(t) {
    const i = new Date(t), e = i.getDate(), h = i.getMonth();
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
    let i = 0;
    for (const e of t)
      e.values.length > i && (i = e.values.length);
    return i;
  }
  /**
   * Checks if the mouse-x is hovering over an x-axis data item at its x-coordinate.
   *
   * @param {number} x - The x-axis data item coordinate to check.
   * @return {boolean} true if the mouse-x is hovering over the x-axis data item, false otherwise.
   */
  isMouseOverYAxisDataItem(t) {
    const i = this.getAxisYDataLength() - 1;
    return !i || !this.mouse.x ? !1 : Math.abs(t - this.mouse.x) < this.DPI_WIDTH / i / 2;
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
      width: i,
      height: e,
      padding: h,
      rowsCount: r,
      data: { xAxis: a, yAxis: o } = {},
      i18n: { months: l } = {},
      interactivity: { horisontalGuide: p, guideDotsRadius: c, fpsLimit: u } = {},
      style: { textFont: m, textColor: x, secondaryColor: I, backgroundColor: E } = {},
      technical: { insertMethod: A, immediateInit: g } = {}
    } = t;
    if (i) {
      if (typeof i != "number")
        throw new s("width should be a number");
      if (i <= 0)
        throw new s("width should be greater than 0");
      if (i % 2 !== 0)
        throw new s("width should be an even number");
    }
    if (e) {
      if (typeof e != "number")
        throw new s("height should be a number");
      if (e <= 0)
        throw new s("height should be greater than 0");
      if (e % 2 !== 0)
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
    if (a) {
      if (typeof a != "object")
        throw new s("data.xAxis should be an object");
      if (typeof a.type != "string")
        throw new s("data.xAxis.type should be a string");
      if (!["date"].includes(a.type))
        throw new s('data.xAxis.type should be "date"');
      if (!Array.isArray(a.values))
        throw new s("data.xAxis.values should be an array");
      a.type === "date" && a.values.forEach((f, y) => {
        if (typeof f != "number")
          throw new s(`data.xAxis.values[${y}] should be a number`);
      });
    }
    if (o) {
      if (!Array.isArray(o))
        throw new s("data.columns should be an array");
      o.forEach((f, y) => {
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
    if (l) {
      if (!Array.isArray(l))
        throw new s("i18n.months should be an array");
      if (l.length !== 12)
        throw new s("i18n.months should have 12 elements");
    }
    if (m && typeof m != "string")
      throw new s("style.textFont should be a string");
    if (x && typeof x != "string")
      throw new s("style.textColor should be a string");
    if (I && typeof I != "string")
      throw new s("style.secondaryColor should be a string");
    if (E && typeof E != "string")
      throw new s("style.backgroundColor should be a string");
    if (A) {
      if (typeof A != "string" && typeof A != "function")
        throw new s("technical.insertMethod should be a string or function");
      if (typeof A == "string" && !["append", "prepend"].includes(A))
        throw new s('technical.insertMethod should be "append" or "prepend" or function');
    }
    if (g && typeof g != "boolean")
      throw new s("technical.immediateInit should be a boolean");
  }
  /**
   * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
   *
   * @param {Partial<IChartOptions>} options - The options to merge with the preset options.
   * @return {IChartOptions} The merged options.
   */
  static getOptions(t = {}) {
    var i, e, h, r, a, o, l, p, c, u, m, x;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding ?? this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      data: {
        xAxis: ((i = t.data) == null ? void 0 : i.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((e = t.data) == null ? void 0 : e.yAxis) || this.presetOptions.data.yAxis
      },
      i18n: {
        months: ((h = t.i18n) == null ? void 0 : h.months) || this.presetOptions.i18n.months
      },
      interactivity: {
        horisontalGuide: ((r = t.interactivity) == null ? void 0 : r.horisontalGuide) || this.presetOptions.interactivity.horisontalGuide,
        guideDotsRadius: ((a = t.interactivity) == null ? void 0 : a.guideDotsRadius) || this.presetOptions.interactivity.guideDotsRadius,
        fpsLimit: ((o = t.interactivity) == null ? void 0 : o.fpsLimit) || this.presetOptions.interactivity.fpsLimit
      },
      style: {
        textFont: ((l = t.style) == null ? void 0 : l.textFont) || this.presetOptions.style.textFont,
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
    var i, e, h, r, a, o, l, p, c, u, m, x;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding ?? this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.data.xAxis = ((i = t.data) == null ? void 0 : i.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((e = t.data) == null ? void 0 : e.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.i18n.months = ((h = t.i18n) == null ? void 0 : h.months) || this.presetOptions.i18n.months, this.presetOptions.interactivity.horisontalGuide = ((r = t.interactivity) == null ? void 0 : r.horisontalGuide) || this.presetOptions.interactivity.horisontalGuide, this.presetOptions.interactivity.guideDotsRadius = ((a = t.interactivity) == null ? void 0 : a.guideDotsRadius) || this.presetOptions.interactivity.guideDotsRadius, this.presetOptions.interactivity.fpsLimit = ((o = t.interactivity) == null ? void 0 : o.fpsLimit) || this.presetOptions.interactivity.fpsLimit, this.presetOptions.style.textFont = ((l = t.style) == null ? void 0 : l.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((p = t.style) == null ? void 0 : p.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((c = t.style) == null ? void 0 : c.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.style.backgroundColor = ((u = t.style) == null ? void 0 : u.backgroundColor) || this.presetOptions.style.backgroundColor, this.presetOptions.technical.insertMethod = ((m = t.technical) == null ? void 0 : m.insertMethod) || this.presetOptions.technical.insertMethod, this.presetOptions.technical.immediateInit = ((x = t.technical) == null ? void 0 : x.immediateInit) || this.presetOptions.technical.immediateInit;
  }
};
// Static options preset
n(w, "presetOptions", {
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
let T = w;
export {
  T as Chart,
  _ as ChartError,
  s as ChartOptionsError
};
