var _ = Object.defineProperty;
var I = (a, t, e) => t in a ? _(a, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : a[t] = e;
var i = (a, t, e) => (I(a, typeof t != "symbol" ? t + "" : t, e), e);
const p = class p {
  constructor(t, e = {}) {
    /* Options */
    i(this, "WIDTH");
    i(this, "HEIGHT");
    i(this, "PADDING");
    i(this, "ROWS_COUNT");
    i(this, "MONTHS_NAMES");
    i(this, "X_AXIS_DATA");
    i(this, "Y_AXIS_DATA");
    /* Styles */
    i(this, "STYLES");
    /* Calculated */
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
    /* DOM */
    i(this, "container");
    i(this, "canvas");
    i(this, "ctx");
    var n;
    const s = p.getOptions(e), o = ((n = s.data.xAxis) == null ? void 0 : n.values.length) || 0, r = s.data.yAxis[0].values.length;
    this.WIDTH = s.width, this.HEIGHT = s.height, this.PADDING = s.padding, this.ROWS_COUNT = s.rowsCount, this.MONTHS_NAMES = s.i18n.months, this.X_AXIS_DATA = s.data.xAxis, this.Y_AXIS_DATA = s.data.yAxis, this.STYLES = {
      textFont: s.style.textFont,
      textColor: s.style.textColor,
      secondaryColor: s.style.secondaryColor
    }, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.Y_BOUNDARIES = this.getBoundariesY(this.Y_AXIS_DATA), this.X_RATIO = this.VIEW_WIDTH / (r - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]) / this.ROWS_COUNT, this.X_AXIS_DATA_COUNT = 6, this.X_AXIS_DATA_STEP = o && Math.round(o / this.X_AXIS_DATA_COUNT), this.container = t, this.canvas = document.createElement("canvas"), this.ctx = this.canvas.getContext("2d"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, s.immediate && this.initialize();
  }
  // prettier-ignore
  static validateOptions(t = {}) {
    const {
      width: e,
      height: s,
      padding: o,
      rowsCount: r,
      i18n: { months: n } = {},
      data: { xAxis: h, yAxis: x } = {},
      style: { textFont: A, textColor: y, secondaryColor: c } = {},
      immediate: u
    } = t;
    if (e) {
      if (typeof e != "number")
        throw new Error("options.width should be a number");
      if (e <= 0)
        throw new Error("options.width should be greater than 0");
      if (e % 2 !== 0)
        throw new Error("options.width should be an even number");
    }
    if (s) {
      if (typeof s != "number")
        throw new Error("options.height should be a number");
      if (s <= 0)
        throw new Error("options.height should be greater than 0");
      if (s % 2 !== 0)
        throw new Error("options.height should be an even number");
    }
    if (o) {
      if (typeof o != "number")
        throw new Error("options.padding should be a number");
      if (o < 0)
        throw new Error("options.padding should be greater or equal to 0");
    }
    if (r) {
      if (typeof r != "number")
        throw new Error("options.rowsCount should be a number");
      if (r <= 0)
        throw new Error("options.rowsCount should be greater than 0");
    }
    if (n) {
      if (!Array.isArray(n))
        throw new Error("options.i18n.months should be an array");
      if (n.length !== 12)
        throw new Error("options.i18n.months should have 12 elements");
    }
    if (h) {
      if (typeof h != "object")
        throw new Error("options.data.xAxis should be an object");
      if (typeof h.type != "string")
        throw new Error("options.data.xAxis.type should be a string");
      if (!["date"].includes(h.type))
        throw new Error('options.data.xAxis.type should be "date"');
      if (!Array.isArray(h.values))
        throw new Error("options.data.xAxis.values should be an array");
      h.type === "date" && h.values.forEach((l, d) => {
        if (typeof l != "number")
          throw new Error(`options.data.xAxis.values[${d}] should be a number`);
      });
    }
    if (x) {
      if (!Array.isArray(x))
        throw new Error("options.data.columns should be an array");
      x.forEach((l, d) => {
        if (typeof l.name != "string")
          throw new Error(`options.data.yAxis[${d}].name should be a string`);
        if (typeof l.color != "string")
          throw new Error(`options.data.yAxis[${d}].color should be a string`);
        if (!Array.isArray(l.values))
          throw new Error(`options.data.yAxis[${d}].values should be an array`);
        l.values.forEach((T, E) => {
          if (typeof T != "number")
            throw new Error(`options.data.yAxis[${d}].values[${E}] should be a number`);
        });
      });
    }
    if (A && typeof A != "string")
      throw new Error("options.style.textFont should be a string");
    if (y && typeof y != "string")
      throw new Error("options.style.textColor should be a string");
    if (c && typeof c != "string")
      throw new Error("options.style.secondaryColor should be a string");
    if (u && typeof u != "boolean")
      throw new Error("options.immediate should be a boolean");
  }
  static getOptions(t = {}) {
    var e, s, o, r, n, h;
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
        secondaryColor: ((r = t.style) == null ? void 0 : r.secondaryColor) || this.presetOptions.style.secondaryColor
      },
      data: {
        xAxis: ((n = t.data) == null ? void 0 : n.xAxis) || this.presetOptions.data.xAxis,
        yAxis: ((h = t.data) == null ? void 0 : h.yAxis) || this.presetOptions.data.yAxis
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
    var e, s, o, r, n, h;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding || this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.i18n.months = ((e = t.i18n) == null ? void 0 : e.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((s = t.style) == null ? void 0 : s.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((r = t.style) == null ? void 0 : r.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.data.xAxis = ((n = t.data) == null ? void 0 : n.xAxis) || this.presetOptions.data.xAxis, this.presetOptions.data.yAxis = ((h = t.data) == null ? void 0 : h.yAxis) || this.presetOptions.data.yAxis, this.presetOptions.immediate = t.immediate || this.presetOptions.immediate;
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
      for (const r of o.values)
        e = e === null || r < e ? r : e, s = s === null || r > s ? r : s;
    return [e, s];
  }
  getDate(t) {
    const e = new Date(t), s = e.getDate(), o = e.getMonth(), r = this.MONTHS_NAMES;
    return `${s} ${r[o]}`;
  }
  getX(t) {
    return Math.floor(t * this.X_RATIO);
  }
  getY(t) {
    return Math.floor(this.DPI_HEIGHT - this.PADDING - t * this.Y_RATIO);
  }
};
i(p, "presetOptions", {
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
let w = p;
class O extends Error {
}
export {
  w as Graph,
  O as GraphsError
};
