var S = Object.defineProperty;
var A = (f, t, e) => t in f ? S(f, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[t] = e;
var a = (f, t, e) => (A(f, typeof t != "symbol" ? t + "" : t, e), e);
function R(f, t) {
  let e;
  return (...i) => {
    clearTimeout(e), e = setTimeout(() => f(...i), t);
  };
}
function _(f, t) {
  let e;
  return (...i) => {
    e || (e = setTimeout(() => {
      f(...i), e = null;
    }, t));
  };
}
function x(f, t) {
  for (const [e, i] of Object.entries(t))
    f.style.setProperty(e, i);
}
class P extends Error {
  constructor(t) {
    super(t), this.name = "ChartError";
  }
}
class s extends P {
  constructor(t) {
    super(t), this.name = "ChartOptionsError";
  }
}
const D = class D {
  /**
   * Constructor for creating a new instance of the Chart class.
   *
   * @param {HTMLElement} containerElement - the HTML element that will contain the chart
   * @param {DeepPartial<IChartOptions>} options - optional chart options
   */
  constructor(t, e = {}) {
    // Options
    a(this, "WIDTH");
    a(this, "HEIGHT");
    a(this, "PADDING");
    a(this, "ROWS_COUNT");
    a(this, "DATA");
    a(this, "I18N");
    a(this, "INTERACTIVITY");
    a(this, "STYLE");
    a(this, "TECHNICAL");
    // Calculated
    a(this, "DPI_WIDTH");
    a(this, "DPI_HEIGHT");
    a(this, "VIEW_WIDTH");
    a(this, "VIEW_HEIGHT");
    a(this, "LINES_VERTICES_BOUNDARIES");
    a(this, "X_RATIO");
    a(this, "Y_RATIO");
    a(this, "ROWS_STEP");
    a(this, "TEXT_STEP");
    a(this, "TIMELINE_ITEMS_COUNT");
    a(this, "TIMELINE_ITEMS_STEP");
    // Interactivity
    a(this, "mouse");
    a(this, "rafID", 0);
    a(this, "isInitialized", !1);
    // DOM
    a(this, "containerElement");
    a(this, "wrapperElement");
    a(this, "canvasElement");
    a(this, "tooltipElement");
    a(this, "canvasRect");
    a(this, "ctx");
    var o;
    const i = D.getOptions(e), l = ((o = i.data.timeline) == null ? void 0 : o.values.length) || 0, r = this.getLinesVerticesLongestLength(i.data.lines);
    this.containerElement = t, this.WIDTH = i.width, this.HEIGHT = i.height, this.PADDING = i.padding, this.ROWS_COUNT = i.rowsCount, this.DATA = i.data, this.I18N = i.i18n, this.INTERACTIVITY = i.interactivity, this.STYLE = i.style, this.TECHNICAL = i.technical, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.LINES_VERTICES_BOUNDARIES = this.getLinesVerticesBoundaries(this.DATA.lines), this.X_RATIO = this.VIEW_WIDTH / (r - 1), this.Y_RATIO = (this.LINES_VERTICES_BOUNDARIES[1] - this.LINES_VERTICES_BOUNDARIES[0]) / this.VIEW_HEIGHT, this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.LINES_VERTICES_BOUNDARIES[1] - this.LINES_VERTICES_BOUNDARIES[0]) / this.ROWS_COUNT, this.TIMELINE_ITEMS_COUNT = 6, this.TIMELINE_ITEMS_STEP = l && Math.round(l / this.TIMELINE_ITEMS_COUNT), this.resizeHandler = R(this.resizeHandler.bind(this), 100), this.mouseMoveHandler = this.mouseMoveHandler.bind(this), this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this), this.drawChart = _(this.drawChart.bind(this), 1e3 / this.INTERACTIVITY.fpsLimit), this.mouse = new Proxy(
      {
        value: {
          mouseX: null,
          mouseY: null,
          tooltipLeft: null,
          tooltipTop: null
        }
      },
      {
        set: (...d) => {
          const h = Reflect.set(...d);
          return this.rafID = window.requestAnimationFrame(this.drawChart), h;
        }
      }
    ), this.createDOMElements(), this.TECHNICAL.immediateInit && this.initialize();
  }
  /**
   * Initializes the component by appending the canvas to the container element and drawing the chart.
   *
   * @return {boolean} Returns true if the chart is successfully initialized, false otherwise.
   */
  initialize() {
    return this.isInitialized ? (this.TECHNICAL.debug && this.debugLog("INITIALIZE", "Chart already initialized"), !1) : (this.isInitialized = !0, this.wrapperElement.appendChild(this.canvasElement), this.wrapperElement.appendChild(this.tooltipElement), this.TECHNICAL.insertMethod === "append" ? this.containerElement.appendChild(this.wrapperElement) : this.TECHNICAL.insertMethod === "prepend" ? this.containerElement.insertBefore(this.wrapperElement, this.containerElement.firstChild) : this.TECHNICAL.insertMethod(this.containerElement, this.wrapperElement), this.INTERACTIVITY.disable || (window.addEventListener("resize", this.resizeHandler), window.addEventListener("orientationchange", this.resizeHandler), this.canvasElement.addEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.addEventListener("mouseleave", this.mouseLeaveHandler)), this.TECHNICAL.debug && this.debugLog("INITIALIZE", "Chart initialized successfully"), this.drawChart(), !0);
  }
  /**
   * Destroys the instance and cleans up all resources.
   *
   * @return {boolean} Returns true if the chart is successfully destroyed, false otherwise.
   */
  destroy() {
    return this.isInitialized ? (this.isInitialized = !1, this.wrapperElement.removeChild(this.tooltipElement), this.wrapperElement.removeChild(this.canvasElement), this.containerElement.removeChild(this.wrapperElement), this.INTERACTIVITY.disable || (window.cancelAnimationFrame(this.rafID), window.removeEventListener("resize", this.resizeHandler), window.removeEventListener("orientationchange", this.resizeHandler), this.canvasElement.removeEventListener("mousemove", this.mouseMoveHandler), this.canvasElement.removeEventListener("mouseleave", this.mouseLeaveHandler)), this.TECHNICAL.debug && this.debugLog("DESTROY", "Chart destroyed successfully"), !0) : (this.TECHNICAL.debug && this.debugLog("DESTROY", "Chart already destroyed"), !1);
  }
  /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
  createDOMElements() {
    this.wrapperElement = document.createElement("div"), this.wrapperElement.className = this.STYLE.classNames.wrapper, this.canvasElement = document.createElement("canvas"), this.canvasElement.className = this.STYLE.classNames.canvas, this.canvasElement.width = this.DPI_WIDTH, this.canvasElement.height = this.DPI_HEIGHT, x(this.canvasElement, {
      width: this.WIDTH + "px",
      height: this.HEIGHT + "px"
    }), this.ctx = this.canvasElement.getContext("2d"), this.tooltipElement = document.createElement("div"), this.tooltipElement.className = this.STYLE.classNames.tooltip, x(this.wrapperElement, {
      "--text-font": this.STYLE.textFont,
      "--text-color": this.STYLE.textColor,
      "--secondary-color": this.STYLE.secondaryColor,
      "--background-color": this.STYLE.backgroundColor
    });
  }
  /** Main method that draws the chart by clearing the canvas. */
  drawChart() {
    this.drawBackground(), this.drawTimeline(), this.drawRows(), this.drawLines(), this.TECHNICAL.debug && this.debugLog("RENDER", "Chart (re)drawn");
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
        const e = this.getDate(this.DATA.timeline.values[t - 1]), i = this.getX(t);
        (t - 1) % this.TIMELINE_ITEMS_STEP === 0 && this.ctx.fillText(e, i, this.DPI_HEIGHT - 10), this.INTERACTIVITY.disable || this.drawGuideLinesIsOver(i, t, e);
      }
    }
  }
  /**
   * Draws the guide lines if the mouse-x is over the vertice
   *
   * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
   * @param {number} i - The original index of the vertice
   * @param {string} text - The title to display in the tooltip
   * @return {boolean} true if the guide lines were drawn, false otherwise
   */
  drawGuideLinesIsOver(t, e, i) {
    const { mouseX: l, mouseY: r } = this.mouse.value;
    if (l && r && this.isMouseVerticeOver(t)) {
      const d = this.PADDING / 2, h = this.DPI_HEIGHT - this.PADDING;
      return this.tooltipShow(
        i,
        this.DATA.lines.map((n) => ({
          name: n.name,
          color: n.color,
          value: n.vertices[e]
        }))
      ), this.INTERACTIVITY.horisontalGuide && r <= h && (this.ctx.beginPath(), this.ctx.setLineDash([20, 25]), this.ctx.moveTo(0, r), this.ctx.lineTo(this.DPI_WIDTH, r), this.ctx.stroke(), this.ctx.closePath()), this.ctx.beginPath(), this.ctx.setLineDash([]), this.ctx.moveTo(t, d), this.ctx.lineTo(t, h), this.ctx.stroke(), this.ctx.closePath(), this.ctx.beginPath(), this.ctx.arc(t, d, 2, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath(), !0;
    }
    return !1;
  }
  /** Draws the rows of the chart. */
  drawRows() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLE.secondaryColor, this.ctx.fillStyle = this.STYLE.textColor, this.ctx.font = this.STYLE.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const e = String(Math.round(this.LINES_VERTICES_BOUNDARIES[1] - this.TEXT_STEP * t)), i = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(e, 5, i - 10), this.ctx.moveTo(0, i), this.ctx.lineTo(this.DPI_WIDTH, i);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  /** Draws the lines of the chart. */
  drawLines() {
    this.ctx.lineWidth = 4, this.ctx.fillStyle = this.STYLE.backgroundColor;
    for (const t of this.DATA.lines) {
      let e = null, i = null;
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let l = 0; l < t.vertices.length; l++) {
        const r = this.getX(l), o = this.getY(t.vertices[l]);
        this.ctx.lineTo(r, o), this.isMouseVerticeOver(r) && (e = r, i = o);
      }
      this.ctx.stroke(), this.ctx.closePath(), this.INTERACTIVITY.disable || e && i && (this.ctx.beginPath(), this.ctx.arc(e, i, this.INTERACTIVITY.guideDotsRadius, 0, 2 * Math.PI), this.ctx.fill(), this.ctx.stroke(), this.ctx.closePath());
    }
  }
  /**
   * Generates the tooltip content and displays it at the specified position.
   *
   * @param {string} title - The title of the tooltip.
   * @param {ITooltipItem[]} items - An array of tooltip items.
   * @return {boolean} Returns true if the tooltip was successfully displayed, false otherwise.
   */
  tooltipShow(t, e) {
    const { tooltipLeft: i, tooltipTop: l } = this.mouse.value;
    if (i && l && this.canvasRect) {
      const r = `
            <h2>${t}</h2>
            <ul>
               ${e.map((m) => `
                  <li style="color: ${m.color}">
                     <h3>${m.value}</h3>
                     <p>${m.name}</p>
                  </li>
               `).join(`
`)}
            </ul>
         `, o = this.tooltipElement.getBoundingClientRect(), d = this.getTooltipCoordinatesByPosition(this.INTERACTIVITY.tooltipPosition, o), h = d.left + o.width + this.canvasRect.x >= window.innerWidth, n = d.left + this.canvasRect.x <= 0, u = d.top + this.canvasRect.y <= 0, c = d.top + o.height + this.canvasRect.y >= window.innerHeight, p = h || n ? d.invertedLeft : d.left, v = u || c ? d.invertedTop : d.top;
      return x(this.tooltipElement, {
        visibility: "visible",
        left: p + "px",
        top: v + "px"
      }), this.tooltipElement.innerHTML = "", this.tooltipElement.insertAdjacentHTML("beforeend", r), !0;
    }
    return !1;
  }
  getTooltipCoordinatesByPosition(t, e, i) {
    const l = this.mouse.value.tooltipLeft || 0, r = this.mouse.value.tooltipTop || 0, { width: o, height: d } = e, h = o / 2, n = d / 2, u = o / 4, c = d / 4, p = t === "top", v = t === "left", m = t === "right", T = t === "bottom", I = t === "top-left", b = t === "top-right", C = t === "bottom-left", O = t === "bottom-right";
    let w = 0, y = 0, E = 0, g = 0;
    return (p || T) && (w = l - h), (v || m) && (y = r - n), (p || I || b) && (y = r - d - c, i || (g = this.getTooltipCoordinatesByPosition("bottom", e, !0).top)), (v || I || C) && (w = l - o - u, i || (E = this.getTooltipCoordinatesByPosition("right", e, !0).left)), (T || C || O) && (y = r + c, i || (g = this.getTooltipCoordinatesByPosition("top", e, !0).top)), (m || b || O) && (w = l + u, i || (E = this.getTooltipCoordinatesByPosition("left", e, !0).left)), { left: w, top: y, invertedLeft: E, invertedTop: g };
  }
  /**
   * Hides the tooltip.
   *
   * @return {boolean} Returns true if the tooltip was successfully hidden, false otherwise.
   */
  tooltipHide() {
    return x(this.tooltipElement, { visibility: "hidden" }), !0;
  }
  /** Event handler that updates the mouse position by canvas coordinates. */
  mouseMoveHandler(t) {
    this.canvasRect ?? (this.canvasRect = this.canvasElement.getBoundingClientRect()), this.mouse.value = {
      mouseX: (t.clientX - this.canvasRect.left) * 2,
      mouseY: (t.clientY - this.canvasRect.top) * 2,
      tooltipLeft: t.clientX - this.canvasRect.left,
      tooltipTop: t.clientY - this.canvasRect.top
    };
  }
  /** Event handler that resets the mouse position when the mouse leaves the canvas. */
  mouseLeaveHandler() {
    this.tooltipHide(), this.mouse.value = {
      mouseX: null,
      mouseY: null,
      tooltipLeft: null,
      tooltipTop: null
    };
  }
  /** Event handler that update the chart interactivity when the window is resized. */
  resizeHandler() {
    this.canvasRect = this.canvasElement.getBoundingClientRect();
  }
  /**
   * Returns an array containing the minimum and maximum y vertices values in the given lines array.
   *
   * @param {ILine[]} lines - an array of lines
   * @return {[number, number]} an array containing the minimum and maximum y values
   */
  getLinesVerticesBoundaries(t) {
    let e = null, i = null;
    for (const l of t)
      for (const r of l.vertices)
        (e === null || r < e) && (e = r), (i === null || r > i) && (i = r);
    return [e ?? 0, i ?? 0];
  }
  /**
   * Returns a formatted date string for timeline based on the given timestamp.
   *
   * @param {number} timestamp - The timestamp to convert to a date.
   * @return {string} The formatted date string in the format "day month".
   */
  getDate(t) {
    const e = new Date(t), i = e.getDate(), l = e.getMonth();
    return `${i} ${this.I18N.months[l]}`;
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
    return this.DPI_HEIGHT - this.PADDING - (t - this.LINES_VERTICES_BOUNDARIES[0]) / this.Y_RATIO;
  }
  /**
   * Calculate the maximum length of the lines vertices values.
   *
   * @param {?ILine[]} lines - optional parameter for the lines
   * @return {number} the maximum length of the lines vertices values.
   */
  getLinesVerticesLongestLength(t) {
    t ?? (t = this.DATA.lines);
    let e = 0;
    for (const i of t)
      i.vertices.length > e && (e = i.vertices.length);
    return e;
  }
  /**
   * Checks if the mouse-x is hovering over an vertice at its x-coordinate.
   *
   * @param {number} x - The vertice coordinate to check.
   * @return {boolean} true if the mouse-x is hovering over the vertice, false otherwise.
   */
  isMouseVerticeOver(t) {
    const { mouseX: e } = this.mouse.value;
    return e ? Math.abs(t - e) < this.X_RATIO / 2 : !1;
  }
  /**
   * Logs a debug message
   *
   * @param {string} scope - the scope of the debug message
   * @param {string} message - the message to be logged
   */
  debugLog(t, e) {
    this.TECHNICAL.debug && console.log(`[${t}]: ${e}`, this);
  }
  /**
   * Validates the provided options for a chart constructor.
   *
   * @param {DeepPartial<IChartOptions>} options - the options to be validated
   * @throws {ChartOptionsError} if the options are invalid
   * @return {void}
   */
  // prettier-ignore
  static validateOptions(t = {}) {
    const {
      width: e,
      height: i,
      padding: l,
      rowsCount: r,
      data: o,
      i18n: d,
      interactivity: h,
      style: n,
      technical: u
    } = t;
    if (e !== void 0) {
      if (typeof e != "number")
        throw new s("width should be a number");
      if (e <= 0)
        throw new s("width should be greater than 0");
      if (e % 2 !== 0)
        throw new s("width should be an even number");
    }
    if (i !== void 0) {
      if (typeof i != "number")
        throw new s("height should be a number");
      if (i <= 0)
        throw new s("height should be greater than 0");
      if (i % 2 !== 0)
        throw new s("height should be an even number");
    }
    if (l !== void 0) {
      if (typeof l != "number")
        throw new s("padding should be a number");
      if (l < 0)
        throw new s("padding should be greater or equal to 0");
    }
    if (r !== void 0) {
      if (typeof r != "number")
        throw new s("rowsCount should be a number");
      if (r <= 0)
        throw new s("rowsCount should be greater than 0");
    }
    if (o !== void 0) {
      if (typeof o != "object")
        throw new s("data should be an object");
      if (o.timeline !== void 0) {
        if (typeof o.timeline != "object")
          throw new s("data.timeline should be an object");
        if (o.timeline.type !== void 0) {
          if (typeof o.timeline.type != "string")
            throw new s("data.timeline.type should be a string");
          if (!["date"].includes(o.timeline.type))
            throw new s('data.timeline.type should be "date"');
        }
        if (o.timeline.values !== void 0) {
          if (!Array.isArray(o.timeline.values))
            throw new s("data.timeline.values should be an array");
          o.timeline.values.forEach((c, p) => {
            if (typeof c != "number")
              throw new s(`data.timeline.values[${p}] should be a number`);
            if (c < 0)
              throw new s(`data.timeline.values[${p}] should be greater or equal to 0`);
          });
        }
      }
      if (o.lines !== void 0) {
        if (!Array.isArray(o.lines))
          throw new s("data.vertices should be an array");
        o.lines.forEach((c, p) => {
          if (!c.key)
            throw new s(`data.lines[${p}].key required`);
          if (!c.name)
            throw new s(`data.lines[${p}].name required`);
          if (!c.color)
            throw new s(`data.lines[${p}].color required`);
          if (!c.vertices)
            throw new s(`data.lines[${p}].values required`);
          if (typeof c.key != "string")
            throw new s(`data.lines[${p}].key should be a string`);
          if (typeof c.name != "string")
            throw new s(`data.lines[${p}].name should be a string`);
          if (typeof c.color != "string")
            throw new s(`data.lines[${p}].color should be a string`);
          if (!Array.isArray(c.vertices))
            throw new s(`data.lines[${p}].vertices should be an array`);
          c.vertices.forEach((v, m) => {
            if (typeof v != "number")
              throw new s(`data.lines[${p}].vertices[${m}] should be a number`);
          });
        });
      }
    }
    if (d !== void 0) {
      if (typeof d != "object")
        throw new s("i18n should be an object");
      if (d.months !== void 0) {
        if (!Array.isArray(d.months))
          throw new s("i18n.months should be an array");
        if (d.months.length !== 12)
          throw new s("i18n.months should have 12 elements");
      }
    }
    if (h !== void 0) {
      if (typeof h != "object")
        throw new s("interactivity should be an object");
      if (h.tooltipPosition !== void 0) {
        if (typeof h.tooltipPosition != "string")
          throw new s("interactivity.tooltipPosition should be a string");
        if (!["top", "left", "bottom", "right", "top-left", "top-right", "bottom-left", "bottom-right"].includes(h.tooltipPosition))
          throw new s('interactivity.tooltipPosition should be one of "top", "left", "bottom", "right", "top-left", "top-right", "bottom-left", "bottom-right"');
      }
      if (h.horisontalGuide !== void 0 && typeof h.horisontalGuide != "boolean")
        throw new s("interactivity.horisontalGuide should be a boolean");
      if (h.guideDotsRadius !== void 0) {
        if (typeof h.guideDotsRadius != "number")
          throw new s("interactivity.guideDotsRadius should be a number");
        if (h.guideDotsRadius <= 0)
          throw new s("interactivity.guideDotsRadius should be greater than 0");
      }
      if (h.fpsLimit !== void 0) {
        if (typeof h.fpsLimit != "number")
          throw new s("interactivity.fpsLimit should be a number");
        if (h.fpsLimit <= 0)
          throw new s("interactivity.fpsLimit should be greater than 0");
      }
      if (h.disable !== void 0 && typeof h.disable != "boolean")
        throw new s("interactivity.disable should be a boolean");
    }
    if (n !== void 0) {
      if (typeof n != "object")
        throw new s("style should be an object");
      if (n.textFont !== void 0 && typeof n.textFont != "string")
        throw new s("style.textFont should be a string");
      if (n.textColor !== void 0 && typeof n.textColor != "string")
        throw new s("style.textColor should be a string");
      if (n.secondaryColor !== void 0 && typeof n.secondaryColor != "string")
        throw new s("style.secondaryColor should be a string");
      if (n.backgroundColor !== void 0 && typeof n.backgroundColor != "string")
        throw new s("style.backgroundColor should be a string");
      if (n.classNames !== void 0) {
        if (typeof n.classNames != "object")
          throw new s("style.classNames should be an object");
        if (n.classNames.wrapper !== void 0 && typeof n.classNames.wrapper != "string")
          throw new s("style.classNames.wrapper should be a string");
        if (n.classNames.canvas !== void 0 && typeof n.classNames.canvas != "string")
          throw new s("style.classNames.canvas should be a string");
        if (n.classNames.tooltip !== void 0 && typeof n.classNames.tooltip != "string")
          throw new s("style.classNames.tooltip should be a string");
      }
    }
    if (u !== void 0) {
      if (typeof u != "object")
        throw new s("technical should be an object");
      if (u.debug !== void 0 && typeof u.debug != "boolean")
        throw new s("technical.debug should be a boolean");
      if (u.insertMethod !== void 0) {
        if (typeof u.insertMethod != "string" && typeof u.insertMethod != "function")
          throw new s("technical.insertMethod should be a string or function");
        if (typeof u.insertMethod == "string" && !["append", "prepend"].includes(u.insertMethod))
          throw new s('technical.insertMethod should be "append" or "prepend" or function');
      }
      if (u.immediateInit !== void 0 && typeof u.immediateInit != "boolean")
        throw new s("technical.immediateInit should be a boolean");
    }
  }
  /**
   * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
   *
   * @param {DeepPartial<IChartOptions>} options - The options to merge with the preset options.
   * @return {IChartOptions} The merged options.
   */
  static getOptions(t = {}) {
    var e, i, l, r, o, d, h, n, u, c, p, v, m, T, I, b, C, O, w, y, E, g, L, N;
    return this.validateOptions(t), {
      width: t.width ?? this.presetOptions.width,
      height: t.height ?? this.presetOptions.height,
      padding: t.padding ?? this.presetOptions.padding,
      rowsCount: t.rowsCount ?? this.presetOptions.rowsCount,
      data: {
        timeline: {
          type: ((i = (e = t.data) == null ? void 0 : e.timeline) == null ? void 0 : i.type) ?? this.presetOptions.data.timeline.type,
          values: ((r = (l = t.data) == null ? void 0 : l.timeline) == null ? void 0 : r.values) ?? this.presetOptions.data.timeline.values
        },
        lines: ((o = t.data) == null ? void 0 : o.lines) ?? this.presetOptions.data.lines
      },
      i18n: {
        months: ((d = t.i18n) == null ? void 0 : d.months) || this.presetOptions.i18n.months
      },
      interactivity: {
        tooltipPosition: ((h = t.interactivity) == null ? void 0 : h.tooltipPosition) ?? this.presetOptions.interactivity.tooltipPosition,
        horisontalGuide: ((n = t.interactivity) == null ? void 0 : n.horisontalGuide) ?? this.presetOptions.interactivity.horisontalGuide,
        guideDotsRadius: ((u = t.interactivity) == null ? void 0 : u.guideDotsRadius) ?? this.presetOptions.interactivity.guideDotsRadius,
        fpsLimit: ((c = t.interactivity) == null ? void 0 : c.fpsLimit) ?? this.presetOptions.interactivity.fpsLimit,
        disable: ((p = t.interactivity) == null ? void 0 : p.disable) ?? this.presetOptions.interactivity.disable
      },
      style: {
        textFont: ((v = t.style) == null ? void 0 : v.textFont) ?? this.presetOptions.style.textFont,
        textColor: ((m = t.style) == null ? void 0 : m.textColor) ?? this.presetOptions.style.textColor,
        secondaryColor: ((T = t.style) == null ? void 0 : T.secondaryColor) ?? this.presetOptions.style.secondaryColor,
        backgroundColor: ((I = t.style) == null ? void 0 : I.backgroundColor) ?? this.presetOptions.style.backgroundColor,
        classNames: {
          wrapper: ((C = (b = t.style) == null ? void 0 : b.classNames) == null ? void 0 : C.wrapper) ?? this.presetOptions.style.classNames.wrapper,
          canvas: ((w = (O = t.style) == null ? void 0 : O.classNames) == null ? void 0 : w.canvas) ?? this.presetOptions.style.classNames.canvas,
          tooltip: ((E = (y = t.style) == null ? void 0 : y.classNames) == null ? void 0 : E.tooltip) ?? this.presetOptions.style.classNames.tooltip
        }
      },
      technical: {
        debug: ((g = t.technical) == null ? void 0 : g.debug) ?? this.presetOptions.technical.debug,
        insertMethod: ((L = t.technical) == null ? void 0 : L.insertMethod) ?? this.presetOptions.technical.insertMethod,
        immediateInit: ((N = t.technical) == null ? void 0 : N.immediateInit) ?? this.presetOptions.technical.immediateInit
      }
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {DeepPartial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  // prettier-ignore
  static changePresetOptions(t = {}) {
    var e, i, l, r, o, d, h, n, u, c, p, v, m, T, I, b, C, O, w, y, E, g, L, N;
    this.validateOptions(t), this.presetOptions.width = t.width ?? this.presetOptions.width, this.presetOptions.height = t.height ?? this.presetOptions.height, this.presetOptions.padding = t.padding ?? this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount ?? this.presetOptions.rowsCount, this.presetOptions.data.timeline.type = ((i = (e = t.data) == null ? void 0 : e.timeline) == null ? void 0 : i.type) ?? this.presetOptions.data.timeline.type, this.presetOptions.data.timeline.values = ((r = (l = t.data) == null ? void 0 : l.timeline) == null ? void 0 : r.values) ?? this.presetOptions.data.timeline.values, this.presetOptions.data.lines = ((o = t.data) == null ? void 0 : o.lines) ?? this.presetOptions.data.lines, this.presetOptions.i18n.months = ((d = t.i18n) == null ? void 0 : d.months) ?? this.presetOptions.i18n.months, this.presetOptions.interactivity.tooltipPosition = ((h = t.interactivity) == null ? void 0 : h.tooltipPosition) ?? this.presetOptions.interactivity.tooltipPosition, this.presetOptions.interactivity.horisontalGuide = ((n = t.interactivity) == null ? void 0 : n.horisontalGuide) ?? this.presetOptions.interactivity.horisontalGuide, this.presetOptions.interactivity.guideDotsRadius = ((u = t.interactivity) == null ? void 0 : u.guideDotsRadius) ?? this.presetOptions.interactivity.guideDotsRadius, this.presetOptions.interactivity.fpsLimit = ((c = t.interactivity) == null ? void 0 : c.fpsLimit) ?? this.presetOptions.interactivity.fpsLimit, this.presetOptions.interactivity.disable = ((p = t.interactivity) == null ? void 0 : p.disable) ?? this.presetOptions.interactivity.disable, this.presetOptions.style.textFont = ((v = t.style) == null ? void 0 : v.textFont) ?? this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((m = t.style) == null ? void 0 : m.textColor) ?? this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((T = t.style) == null ? void 0 : T.secondaryColor) ?? this.presetOptions.style.secondaryColor, this.presetOptions.style.backgroundColor = ((I = t.style) == null ? void 0 : I.backgroundColor) ?? this.presetOptions.style.backgroundColor, this.presetOptions.style.classNames.wrapper = ((C = (b = t.style) == null ? void 0 : b.classNames) == null ? void 0 : C.wrapper) ?? this.presetOptions.style.classNames.wrapper, this.presetOptions.style.classNames.canvas = ((w = (O = t.style) == null ? void 0 : O.classNames) == null ? void 0 : w.canvas) ?? this.presetOptions.style.classNames.canvas, this.presetOptions.style.classNames.tooltip = ((E = (y = t.style) == null ? void 0 : y.classNames) == null ? void 0 : E.tooltip) ?? this.presetOptions.style.classNames.tooltip, this.presetOptions.technical.debug = ((g = t.technical) == null ? void 0 : g.debug) ?? this.presetOptions.technical.debug, this.presetOptions.technical.insertMethod = ((L = t.technical) == null ? void 0 : L.insertMethod) ?? this.presetOptions.technical.insertMethod, this.presetOptions.technical.immediateInit = ((N = t.technical) == null ? void 0 : N.immediateInit) ?? this.presetOptions.technical.immediateInit;
  }
};
// Static options preset
a(D, "presetOptions", {
  width: 600,
  height: 250,
  padding: 40,
  rowsCount: 5,
  data: {
    timeline: {
      type: "date",
      values: []
    },
    lines: []
  },
  i18n: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  interactivity: {
    tooltipPosition: "top-right",
    horisontalGuide: !0,
    guideDotsRadius: 8,
    fpsLimit: 60,
    disable: !1
  },
  style: {
    textFont: "normal 20px Helvetica,sans-serif",
    textColor: "#96a2aa",
    secondaryColor: "#bbbbbb",
    backgroundColor: "#ffffff",
    classNames: {
      wrapper: "simple-chart",
      canvas: "simple-chart__canvas",
      tooltip: "simple-chart__tooltip"
    }
  },
  technical: {
    debug: !1,
    insertMethod: "append",
    immediateInit: !0
  }
});
let H = D;
export {
  H as Chart,
  P as ChartError,
  s as ChartOptionsError
};
