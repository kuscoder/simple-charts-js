var f = Object.defineProperty;
var O = (l, t, e) => t in l ? f(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var h = (l, t, e) => (O(l, typeof t != "symbol" ? t + "" : t, e), e);
class g extends Error {
  constructor(t) {
    super(t), this.name = "GraphError";
  }
}
class i extends g {
  constructor(t) {
    super(t), this.name = "GraphOptionsError";
  }
}
const A = class A {
  constructor(t, e = {}) {
    /* Options */
    h(this, "WIDTH");
    h(this, "HEIGHT");
    h(this, "PADDING");
    h(this, "ROWS_COUNT");
    h(this, "MONTHS_NAMES");
    h(this, "X_AXIS_DATA");
    h(this, "Y_AXIS_DATA");
    /* Styles */
    h(this, "STYLES");
    /* Calculated */
    h(this, "DPI_WIDTH");
    h(this, "DPI_HEIGHT");
    h(this, "VIEW_WIDTH");
    h(this, "VIEW_HEIGHT");
    h(this, "Y_BOUNDARIES");
    h(this, "X_RATIO");
    h(this, "Y_RATIO");
    h(this, "ROWS_STEP");
    h(this, "TEXT_STEP");
    h(this, "X_AXIS_DATA_COUNT");
    h(this, "X_AXIS_DATA_STEP");
    /* DOM */
    h(this, "container");
    h(this, "canvas");
    h(this, "ctx");
    var a;
    const s = A.getOptions(e), o = ((a = s.data.xAxis) == null ? void 0 : a.values.length) || 0, n = s.data.yAxis[0].values.length;
    this.WIDTH = s.width, this.HEIGHT = s.height, this.PADDING = s.padding, this.ROWS_COUNT = s.rowsCount, this.MONTHS_NAMES = s.i18n.months, this.X_AXIS_DATA = s.data.xAxis, this.Y_AXIS_DATA = s.data.yAxis, this.STYLES = {
      textFont: s.style.textFont,
      textColor: s.style.textColor,
      secondaryColor: s.style.secondaryColor
    }, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_BOUNDARIES = this.getBoundariesY(this.Y_AXIS_DATA), this.X_RATIO = this.VIEW_WIDTH / (n - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = o && Math.round(o / this.X_AXIS_DATA_COUNT), this.container = t, this.canvas = document.createElement("canvas"), this.ctx = this.canvas.getContext("2d"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, s.immediate && this.initialize();
  }
  // prettier-ignore
  static validateOptions(t = {}) {
    const {
      width: e,
      height: s,
      padding: o,
      rowsCount: n,
      i18n: { months: a } = {},
      data: { xAxis: r, yAxis: p } = {},
      style: { textFont: c, textColor: y, secondaryColor: u } = {},
      immediate: w
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
    if (n) {
      if (typeof n != "number")
        throw new i("rowsCount should be a number");
      if (n <= 0)
        throw new i("rowsCount should be greater than 0");
    }
    if (a) {
      if (!Array.isArray(a))
        throw new i("i18n.months should be an array");
      if (a.length !== 12)
        throw new i("i18n.months should have 12 elements");
    }
    if (r) {
      if (typeof r != "object")
        throw new i("data.xAxis should be an object");
      if (typeof r.type != "string")
        throw new i("data.xAxis.type should be a string");
      if (!["date"].includes(r.type))
        throw new i('data.xAxis.type should be "date"');
      if (!Array.isArray(r.values))
        throw new i("data.xAxis.values should be an array");
      r.type === "date" && r.values.forEach((d, x) => {
        if (typeof d != "number")
          throw new i(`data.xAxis.values[${x}] should be a number`);
      });
    }
    if (p) {
      if (!Array.isArray(p))
        throw new i("data.columns should be an array");
      p.forEach((d, x) => {
        if (typeof d.name != "string")
          throw new i(`data.yAxis[${x}].name should be a string`);
        if (typeof d.color != "string")
          throw new i(`data.yAxis[${x}].color should be a string`);
        if (!Array.isArray(d.values))
          throw new i(`data.yAxis[${x}].values should be an array`);
        d.values.forEach((_, I) => {
          if (typeof _ != "number")
            throw new i(`data.yAxis[${x}].values[${I}] should be a number`);
        });
      });
    }
    if (c && typeof c != "string")
      throw new i("style.textFont should be a string");
    if (y && typeof y != "string")
      throw new i("style.textColor should be a string");
    if (u && typeof u != "string")
      throw new i("style.secondaryColor should be a string");
    if (w && typeof w != "boolean")
      throw new i("immediate should be a boolean");
  }
  static getOptions(t = {}) {
    var e, s, o, n, a, r;
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
        textColor: ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor,
        secondaryColor: ((n = t.style) == null ? void 0 : n.secondaryColor) || this.presetOptions.style.secondaryColor
      },
      data: {
        xAxis: ((a = t.data) == null ? void 0 : a.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((r = t.data) == null ? void 0 : r.yAxis) || this.presetOptions.data.yAxis
      },
      immediate: t.immediate ?? this.presetOptions.immediate
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {Partial<IGraphOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  static changePresetOptions(t = {}) {
    var e, s, o, n, a, r;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding || this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.i18n.months = ((e = t.i18n) == null ? void 0 : e.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((s = t.style) == null ? void 0 : s.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((n = t.style) == null ? void 0 : n.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.data.xAxis = ((a = t.data) == null ? void 0 : a.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((r = t.data) == null ? void 0 : r.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.immediate = t.immediate || this.presetOptions.immediate;
  }
  /* Initializes the component by appending the canvas to the container element and drawing the graph */
  initialize() {
    this.container.appendChild(this.canvas), this.draw();
  }
  /* Destroys the component from the DOM */
  destroy() {
    this.container.removeChild(this.canvas);
  }
  draw() {
    this.drawAxisX(), this.drawAxisY(), this.drawLines();
  }
  drawAxisX() {
    if (this.X_AXIS_DATA) {
      this.ctx.fillStyle = this.STYLES.textColor, this.ctx.font = this.STYLES.textFont, this.ctx.beginPath();
      for (let t = 1; t <= this.X_AXIS_DATA.values.length; t += this.X_AXIS_DATA_STEP) {
        const e = this.getDate(this.X_AXIS_DATA.values[t - 1]);
        this.ctx.fillText(e, this.getX(t), this.DPI_HEIGHT - 10);
      }
      this.ctx.closePath();
    }
  }
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLES.secondaryColor, this.ctx.fillStyle = this.STYLES.textColor, this.ctx.font = this.STYLES.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const e = String(Math.round(this.Y_BOUNDARIES[1] - this.TEXT_STEP * t)), s = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(e, 5, s - 10), this.ctx.moveTo(0, s), this.ctx.lineTo(this.DPI_WIDTH, s);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  drawLines() {
    this.ctx.lineWidth = 4;
    for (const t of this.Y_AXIS_DATA) {
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let e = 0; e < t.values.length; e++) {
        const s = this.getX(e), o = this.getY(t.values[e]);
        this.ctx.lineTo(s, o);
      }
      this.ctx.stroke(), this.ctx.closePath();
    }
  }
  getBoundariesY(t) {
    let e = null, s = null;
    for (const o of t)
      for (const n of o.values)
        e = e === null || n < e ? n : e, s = s === null || n > s ? n : s;
    return [e, s];
  }
  getDate(t) {
    const e = new Date(t), s = e.getDate(), o = e.getMonth(), n = this.MONTHS_NAMES;
    return `${s} ${n[o]}`;
  }
  getX(t) {
    return Math.floor(t * this.X_RATIO);
  }
  getY(t) {
    return Math.floor(this.DPI_HEIGHT - this.PADDING - t * this.Y_RATIO);
  }
};
h(A, "presetOptions", {
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
let T = A;
export {
  T as Graph,
  g as GraphError,
  i as GraphOptionsError
};
