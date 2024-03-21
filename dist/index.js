var b = Object.defineProperty;
var D = (a, t, i) => t in a ? b(a, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : a[t] = i;
var n = (a, t, i) => (D(a, typeof t != "symbol" ? t + "" : t, i), i);
function H(a, t) {
  let i;
  return (...e) => {
    clearTimeout(i), i = setTimeout(() => a(...e), t);
  };
}
function A(a, t) {
  let i;
  return (...e) => {
    i || (i = setTimeout(() => {
      a(...e), i = null;
    }, t));
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
const T = class T {
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
    n(this, "VERTICES_BOUNDARIES");
    n(this, "X_RATIO");
    n(this, "Y_RATIO");
    n(this, "ROWS_STEP");
    n(this, "TEXT_STEP");
    n(this, "TIMELINE_ITEMS_COUNT");
    n(this, "TIMELINE_ITEMS_STEP");
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
    const e = T.getOptions(i), r = ((o = e.data.timeline) == null ? void 0 : o.values.length) || 0, h = this.getVerticesLongestLength(e.data.vertices);
    this.containerElement = t, this.WIDTH = e.width, this.HEIGHT = e.height, this.PADDING = e.padding, this.ROWS_COUNT = e.rowsCount, this.DATA = e.data, this.I18N = e.i18n, this.INTERACTIVITY = e.interactivity, this.STYLE = e.style, this.TECHNICAL = e.technical, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.VERTICES_BOUNDARIES = this.getVerticesBoundaries(this.DATA.vertices), this.X_RATIO = this.VIEW_WIDTH / (h - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.VERTICES_BOUNDARIES[1] - this.VERTICES_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.VERTICES_BOUNDARIES[1] - this.VERTICES_BOUNDARIES[0]) / this.ROWS_COUNT, this.TIMELINE_ITEMS_COUNT = 6, this.TIMELINE_ITEMS_STEP = r && Math.round(r / this.TIMELINE_ITEMS_COUNT), this.resizeHandler = H(this.resizeHandler.bind(this), 100), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawChart = A(this.drawChart.bind(this), 1e3 / this.INTERACTIVITY.fpsLimit), this.mouse = new Proxy({}, {
      set: (...l) => {
        const c = Reflect.set(...l);
        return this.rafID = window.requestAnimationFrame(this.drawChart), c;
      }
    }), this.createDOMElements(), this.TECHNICAL.immediateInit && this.initialize();
  }
  /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
  createDOMElements() {
    this.wrapperElement = document.createElement("div"), this.wrapperElement.className = "simple-chart", this.canvasElement = document.createElement("canvas"), this.canvasElement.className = "simple-chart__canvas", this.canvasElement.width = this.DPI_WIDTH, this.canvasElement.height = this.DPI_HEIGHT, this.canvasElement.style.width = this.WIDTH + "px", this.canvasElement.style.height = this.HEIGHT + "px", this.ctx = this.canvasElement.getContext("2d"), this.tooltipElement = document.createElement("div"), this.tooltipElement.className = "simple-chart__tooltip";
  }
  /** Initializes the component by appending the canvas to the container element and drawing the chart. */
  initialize() {
    this.isInitialized || (this.isInitialized = !0, this.wrapperElement.appendChild(this.canvasElement), this.wrapperElement.appendChild(this.tooltipElement), this.TECHNICAL.insertMethod === "append" ? this.containerElement.appendChild(this.wrapperElement) : this.TECHNICAL.insertMethod === "prepend" ? this.containerElement.insertBefore(this.wrapperElement, this.containerElement.firstChild) : this.TECHNICAL.insertMethod(this.containerElement, this.wrapperElement), window.addEventListener("resize", this.resizeHandler), window.addEventListener("orientationchange", this.resizeHandler), this.canvasElement.addEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.addEventListener("mouseleave", this.mouseLeaveHandler), this.drawChart());
  }
  /** Destroys the component from the DOM. */
  destroy() {
    this.isInitialized && (this.isInitialized = !1, this.wrapperElement.removeChild(this.tooltipElement), this.wrapperElement.removeChild(this.canvasElement), this.containerElement.removeChild(this.wrapperElement), window.cancelAnimationFrame(this.rafID), window.removeEventListener("resize", this.resizeHandler), window.removeEventListener("orientationchange", this.resizeHandler), this.canvasElement.removeEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.removeEventListener("mouseleave", this.mouseLeaveHandler));
  }
  /** Main method that draws the chart by clearing the canvas. */
  drawChart() {
    this.drawBackground(), this.drawTimeline(), this.drawRows(), this.drawLines();
  }
  /** Draws the background of the chart. */
  drawBackground() {
    this.ctx.fillStyle = this.STYLE.backgroundColor, this.ctx.fillRect(0, 0, this.DPI_WIDTH, this.DPI_HEIGHT);
  }
  /** Draws the timeline of the chart and guide lines. */
  drawTimeline() {
    if (this.DATA.timeline) {
      this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.lineWidth = 2, this.ctx.strokeStyle = this.STYLE.secondaryColor;
      for (let t = 1; t <= this.DATA.timeline.values.length; t++) {
        const i = this.getX(t);
        if ((t - 1) % this.TIMELINE_ITEMS_STEP === 0) {
          const e = this.getDate(this.DATA.timeline.values[t - 1]);
          this.ctx.fillText(e, i, this.DPI_HEIGHT - 10);
        }
        this.drawGuideLinesIsOver(i);
      }
    }
  }
  /**
   * Draws the guide lines if the mouse-x is over the vertice
   *
   * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
   * @return {boolean} true if the guide lines were drawn, false otherwise
   */
  drawGuideLinesIsOver(t) {
    if (this.mouse.x && this.mouse.y) {
      const i = this.isMouseVerticeOver(t), e = this.PADDING / 2, r = this.DPI_HEIGHT - this.PADDING;
      if (i && this.mouse.y >= e)
        return this.INTERACTIVITY.horisontalGuide && this.mouse.y <= r && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, this.mouse.y), this.ctx.lineTo(this.DPI_WIDTH, this.mouse.y), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, e), this.ctx.lineTo(t, r), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.arc(t, e, 2, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath(), !0;
    }
    return !1;
  }
  /** Draws the rows of the chart. */
  drawRows() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const i = String(Math.round(this.VERTICES_BOUNDARIES[1] - this.TEXT_STEP * t)), e = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(i, 5, e - 10), this.ctx.moveTo(0, e), this.ctx.lineTo(this.DPI_WIDTH, e);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** Draws the lines of the chart. */
  drawLines() {
    this.ctx.lineWidth = 4, this.ctx.fillStyle = this.STYLE.backgroundColor;
    for (const t of this.DATA.vertices) {
      let i = null, e = null;
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let r = 0; r < t.values.length; r++) {
        const h = this.getX(r), o = this.getY(t.values[r]);
        this.ctx.lineTo(h, o), this.isMouseVerticeOver(h) && (i = h, e = o);
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
   * Returns an array containing the minimum and maximum y values in the given vertices array.
   *
   * @param {IVertices[]} vertices - an array of vertices
   * @return {[number, number]} an array containing the minimum and maximum y values
   */
  getVerticesBoundaries(t) {
    let i = null, e = null;
    for (const r of t)
      for (const h of r.values)
        (i === null || h < i) && (i = h), (e === null || h > e) && (e = h);
    return [i ?? 0, e ?? 0];
  }
  /**
   * Returns a formatted date string for timeline based on the given timestamp.
   *
   * @param {number} timestamp - The timestamp to convert to a date.
   * @return {string} The formatted date string in the format "day month".
   */
  getDate(t) {
    const i = new Date(t), e = i.getDate(), r = i.getMonth();
    return `${e} ${this.I18N.months[r]}`;
  }
  /**
   * Calculates the x-coordinate value based on the given input value.
   *
   * @param {number} value - The input value used to calculate the x-coordinate.
   * @return {number} The calculated x-coordinate value.
   */
  getX(t) {
    return t * this.X_RATIO;
  }
  /**
   * Calculates the y-coordinate value based on the given input value.
   *
   * @param {number} value - The input value used to calculate the y-coordinate.
   * @return {number} The calculated y-coordinate value.
   */
  getY(t) {
    return this.DPI_HEIGHT - this.PADDING - t * this.Y_RATIO;
  }
  /**
   * Calculate the maximum length of the vertices item.
   *
   * @param {?IVertices[]} vertices - optional parameter for the vertices
   * @return {number} the maximum length of the vertices item.
   */
  getVerticesLongestLength(t) {
    t ?? (t = this.DATA.vertices);
    let i = 0;
    for (const e of t)
      e.values.length > i && (i = e.values.length);
    return i;
  }
  /**
   * Checks if the mouse-x is hovering over an vertice at its x-coordinate.
   *
   * @param {number} x - The vertice coordinate to check.
   * @return {boolean} true if the mouse-x is hovering over the vertice, false otherwise.
   */
  isMouseVerticeOver(t) {
    return this.mouse.x ? Math.abs(t - this.mouse.x) < this.X_RATIO / 2 : !1;
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
      padding: r,
      rowsCount: h,
      data: { timeline: o, vertices: l } = {},
      i18n: { months: c } = {},
      interactivity: { horisontalGuide: m, guideDotsRadius: d, fpsLimit: u } = {},
      style: { textFont: p, textColor: E, secondaryColor: v, backgroundColor: y } = {},
      technical: { insertMethod: w, immediateInit: g } = {}
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
    if (r) {
      if (typeof r != "number")
        throw new s("padding should be a number");
      if (r < 0)
        throw new s("padding should be greater or equal to 0");
    }
    if (h) {
      if (typeof h != "number")
        throw new s("rowsCount should be a number");
      if (h <= 0)
        throw new s("rowsCount should be greater than 0");
    }
    if (m && typeof m != "boolean")
      throw new s("interactivity.horisontalGuide should be a boolean");
    if (d) {
      if (typeof d != "number")
        throw new s("interactivity.guideDotsRadius should be a number");
      if (d <= 0)
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
        throw new s("data.timeline should be an object");
      if (typeof o.type != "string")
        throw new s("data.timeline.type should be a string");
      if (!["date"].includes(o.type))
        throw new s('data.timeline.type should be "date"');
      if (!Array.isArray(o.values))
        throw new s("data.timeline.values should be an array");
      o.type === "date" && o.values.forEach((f, I) => {
        if (typeof f != "number")
          throw new s(`data.timeline.values[${I}] should be a number`);
      });
    }
    if (l) {
      if (!Array.isArray(l))
        throw new s("data.vertices should be an array");
      l.forEach((f, I) => {
        if (typeof f.name != "string")
          throw new s(`data.vertices[${I}].name should be a string`);
        if (typeof f.color != "string")
          throw new s(`data.vertices[${I}].color should be a string`);
        if (!Array.isArray(f.values))
          throw new s(`data.vertices[${I}].values should be an array`);
        f.values.forEach((C, x) => {
          if (typeof C != "number")
            throw new s(`data.vertices[${I}].values[${x}] should be a number`);
        });
      });
    }
    if (c) {
      if (!Array.isArray(c))
        throw new s("i18n.months should be an array");
      if (c.length !== 12)
        throw new s("i18n.months should have 12 elements");
    }
    if (p && typeof p != "string")
      throw new s("style.textFont should be a string");
    if (E && typeof E != "string")
      throw new s("style.textColor should be a string");
    if (v && typeof v != "string")
      throw new s("style.secondaryColor should be a string");
    if (y && typeof y != "string")
      throw new s("style.backgroundColor should be a string");
    if (w) {
      if (typeof w != "string" && typeof w != "function")
        throw new s("technical.insertMethod should be a string or function");
      if (typeof w == "string" && !["append", "prepend"].includes(w))
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
    var i, e, r, h, o, l, c, m, d, u, p, E;
    return this.validateOptions(t), {
      width: t.width || this.presetOptions.width,
      height: t.height || this.presetOptions.height,
      padding: t.padding ?? this.presetOptions.padding,
      rowsCount: t.rowsCount || this.presetOptions.rowsCount,
      data: {
        timeline: ((i = t.data) == null ? void 0 : i.timeline) || this.presetOptions.data.timeline,
        vertices: ((e = t.data) == null ? void 0 : e.vertices) || this.presetOptions.data.vertices
      },
      i18n: {
        months: ((r = t.i18n) == null ? void 0 : r.months) || this.presetOptions.i18n.months
      },
      interactivity: {
        horisontalGuide: ((h = t.interactivity) == null ? void 0 : h.horisontalGuide) || this.presetOptions.interactivity.horisontalGuide,
        guideDotsRadius: ((o = t.interactivity) == null ? void 0 : o.guideDotsRadius) || this.presetOptions.interactivity.guideDotsRadius,
        fpsLimit: ((l = t.interactivity) == null ? void 0 : l.fpsLimit) || this.presetOptions.interactivity.fpsLimit
      },
      style: {
        textFont: ((c = t.style) == null ? void 0 : c.textFont) || this.presetOptions.style.textFont,
        textColor: ((m = t.style) == null ? void 0 : m.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((d = t.style) == null ? void 0 : d.secondaryColor) || this.presetOptions.style.secondaryColor,
        backgroundColor: ((u = t.style) == null ? void 0 : u.backgroundColor) || this.presetOptions.style.backgroundColor
      },
      technical: {
        insertMethod: ((p = t.technical) == null ? void 0 : p.insertMethod) || this.presetOptions.technical.insertMethod,
        immediateInit: ((E = t.technical) == null ? void 0 : E.immediateInit) || this.presetOptions.technical.immediateInit
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
    var i, e, r, h, o, l, c, m, d, u, p, E;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding ?? this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.data.timeline = ((i = t.data) == null ? void 0 : i.timeline) || this.presetOptions.data.timeline, this.presetOptions.data.vertices = ((e = t.data) == null ? void 0 : e.vertices) || this.presetOptions.data.vertices, this.presetOptions.i18n.months = ((r = t.i18n) == null ? void 0 : r.months) || this.presetOptions.i18n.months, this.presetOptions.interactivity.horisontalGuide = ((h = t.interactivity) == null ? void 0 : h.horisontalGuide) || this.presetOptions.interactivity.horisontalGuide, this.presetOptions.interactivity.guideDotsRadius = ((o = t.interactivity) == null ? void 0 : o.guideDotsRadius) || this.presetOptions.interactivity.guideDotsRadius, this.presetOptions.interactivity.fpsLimit = ((l = t.interactivity) == null ? void 0 : l.fpsLimit) || this.presetOptions.interactivity.fpsLimit, this.presetOptions.style.textFont = ((c = t.style) == null ? void 0 : c.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((m = t.style) == null ? void 0 : m.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((d = t.style) == null ? void 0 : d.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.style.backgroundColor = ((u = t.style) == null ? void 0 : u.backgroundColor) || this.presetOptions.style.backgroundColor, this.presetOptions.technical.insertMethod = ((p = t.technical) == null ? void 0 : p.insertMethod) || this.presetOptions.technical.insertMethod, this.presetOptions.technical.immediateInit = ((E = t.technical) == null ? void 0 : E.immediateInit) || this.presetOptions.technical.immediateInit;
  }
};
// Static options preset
n(T, "presetOptions", {
  width: 600,
  height: 250,
  padding: 40,
  rowsCount: 5,
  data: {
    timeline: null,
    vertices: []
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
let O = T;
export {
  O as Chart,
  _ as ChartError,
  s as ChartOptionsError
};
