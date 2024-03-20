var y = Object.defineProperty;
var E = (d, t, e) => t in d ? y(d, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : d[t] = e;
var i = (d, t, e) => (E(d, typeof t != "symbol" ? t + "" : t, e), e);
const c = class c {
  constructor(t, e = {}) {
    /* Options */
    i(this, "WIDTH");
    i(this, "HEIGHT");
    i(this, "PADDING");
    i(this, "ROWS_COUNT");
    i(this, "MONTHS_NAMES");
    i(this, "DATES");
    i(this, "COLUMNS");
    /* Styles */
    i(this, "STYLES");
    /* Calculated */
    i(this, "DPI_WIDTH");
    i(this, "DPI_HEIGHT");
    i(this, "VIEW_WIDTH");
    i(this, "VIEW_HEIGHT");
    i(this, "BOUNDARIES");
    i(this, "X_RATIO");
    i(this, "Y_RATIO");
    i(this, "ROWS_STEP");
    i(this, "TEXT_STEP");
    i(this, "DATE_COUNT");
    i(this, "DATE_STEP");
    /* DOM */
    i(this, "container");
    i(this, "canvas");
    i(this, "ctx");
    const s = c.getOptions(e);
    this.WIDTH = s.width, this.HEIGHT = s.height, this.PADDING = s.padding, this.ROWS_COUNT = s.rowsCount, this.MONTHS_NAMES = s.i18n.months, this.DATES = s.data.dates, this.STYLES = {
      textFont: s.style.textFont,
      textColor: s.style.textColor,
      secondaryColor: s.style.secondaryColor
    }, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.BOUNDARIES = this.getBoundaries(s.data.columns), this.X_RATIO = this.VIEW_WIDTH / (s.data.columns[0].values.length - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.BOUNDARIES[1] - this.BOUNDARIES[0]), this.COLUMNS = this.getColumns(s.data.columns), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.BOUNDARIES[1] - this.BOUNDARIES[0]) / this.ROWS_COUNT, this.DATE_COUNT = 6, this.DATE_STEP = Math.round(this.DATES.length / this.DATE_COUNT), this.container = t, this.canvas = document.createElement("canvas"), this.ctx = this.canvas.getContext("2d"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, s.immediate && this.initialize();
  }
  // prettier-ignore
  static validateOptions(t = {}) {
    var e, s, o, r, h, n;
    if (t.width) {
      if (typeof t.width != "number")
        throw new Error("options.width should be a number");
      if (t.width <= 0)
        throw new Error("options.width should be greater than 0");
      if (t.width % 2 !== 0)
        throw new Error("options.width should be an even number");
    }
    if (t.height) {
      if (typeof t.height != "number")
        throw new Error("options.height should be a number");
      if (t.height <= 0)
        throw new Error("options.height should be greater than 0");
      if (t.height % 2 !== 0)
        throw new Error("options.height should be an even number");
    }
    if (t.padding) {
      if (typeof t.padding != "number")
        throw new Error("options.padding should be a number");
      if (t.padding < 0)
        throw new Error("options.padding should be greater or equal to 0");
    }
    if (t.rowsCount) {
      if (typeof t.rowsCount != "number")
        throw new Error("options.rowsCount should be a number");
      if (t.rowsCount <= 0)
        throw new Error("options.rowsCount should be greater than 0");
    }
    if ((e = t.i18n) != null && e.months) {
      if (!Array.isArray(t.i18n.months))
        throw new Error("options.i18n.months should be an array");
      if (t.i18n.months.length !== 12)
        throw new Error("options.i18n.months should have 12 elements");
    }
    if ((s = t.data) != null && s.dates) {
      if (!Array.isArray(t.data.dates))
        throw new Error("options.data.dates should be an array");
      if (t.data.dates.some((a) => typeof a != "number"))
        throw new Error("options.data.dates should be an array of numbers");
    }
    if ((o = t.data) != null && o.columns) {
      if (!Array.isArray(t.data.columns))
        throw new Error("options.data.columns should be an array");
      t.data.columns.forEach((a, l) => {
        if (typeof a.type != "string")
          throw new Error(`options.data.columns[${l}].type should be a string`);
        if (!["x", "y"].includes(a.type))
          throw new Error(`options.data.columns[${l}].type should be 'x' or 'y'`);
        if (typeof a.name != "string")
          throw new Error(`options.data.columns[${l}].name should be a string`);
        if (typeof a.color != "string")
          throw new Error(`options.data.columns[${l}].color should be a string`);
        if (!Array.isArray(a.values))
          throw new Error(`options.data.columns[${l}].values should be an array`);
        if (a.values.some((w) => typeof w != "number"))
          throw new Error(`options.data.columns[${l}].values should be an array of numbers`);
      });
    }
    if ((r = t.style) != null && r.textFont && typeof t.style.textFont != "string")
      throw new Error("options.style.textFont should be a string");
    if ((h = t.style) != null && h.textColor && typeof t.style.textColor != "string")
      throw new Error("options.style.textColor should be a string");
    if ((n = t.style) != null && n.secondaryColor && typeof t.style.secondaryColor != "string")
      throw new Error("options.style.secondaryColor should be a string");
    if (t.immediate && typeof t.immediate != "boolean")
      throw new Error("options.immediate should be a boolean");
  }
  static getOptions(t = {}) {
    var e, s, o, r, h, n;
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
        dates: ((h = t.data) == null ? void 0 : h.dates) || this.presetOptions.data.dates,
        columns: ((n = t.data) == null ? void 0 : n.columns) || this.presetOptions.data.columns
      },
      immediate: t.immediate ?? this.presetOptions.immediate
    };
  }
  /**
   * Updates the preset options with the provided options.
   *
   * @param {Partial<ISimpleGraphsJSOptions>} options - The options to update the preset options with. Default is an empty object.
   */
  static changePresetOptions(t = {}) {
    var e, s, o, r, h, n;
    this.validateOptions(t), this.presetOptions.width = t.width || this.presetOptions.width, this.presetOptions.height = t.height || this.presetOptions.height, this.presetOptions.padding = t.padding || this.presetOptions.padding, this.presetOptions.rowsCount = t.rowsCount || this.presetOptions.rowsCount, this.presetOptions.i18n.months = ((e = t.i18n) == null ? void 0 : e.months) || this.presetOptions.i18n.months, this.presetOptions.style.textFont = ((s = t.style) == null ? void 0 : s.textFont) || this.presetOptions.style.textFont, this.presetOptions.style.textColor = ((o = t.style) == null ? void 0 : o.textColor) || this.presetOptions.style.textColor, this.presetOptions.style.secondaryColor = ((r = t.style) == null ? void 0 : r.secondaryColor) || this.presetOptions.style.secondaryColor, this.presetOptions.data.columns = ((h = t.data) == null ? void 0 : h.columns) || this.presetOptions.data.columns, this.presetOptions.data.dates = ((n = t.data) == null ? void 0 : n.dates) || this.presetOptions.data.dates, this.presetOptions.immediate = t.immediate || this.presetOptions.immediate;
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
    this.ctx.fillStyle = this.STYLES.textColor, this.ctx.font = this.STYLES.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.DATES.length; t += this.DATE_STEP) {
      const e = this.getDate(this.DATES[t - 1]);
      this.ctx.fillText(e, this.getX(t), this.DPI_HEIGHT - 10);
    }
    this.ctx.closePath();
  }
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = this.STYLES.secondaryColor, this.ctx.fillStyle = this.STYLES.textColor, this.ctx.font = this.STYLES.textFont, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      const e = String(Math.round(this.BOUNDARIES[1] - this.TEXT_STEP * t)), s = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(e, 5, s - 10), this.ctx.moveTo(0, s), this.ctx.lineTo(this.DPI_WIDTH, s);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  drawLines() {
    this.ctx.lineWidth = 4;
    for (const t of this.COLUMNS) {
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (const [e, s] of t.values)
        this.ctx.lineTo(e, s);
      this.ctx.stroke(), this.ctx.closePath();
    }
  }
  getColumns(t) {
    const e = JSON.parse(JSON.stringify(t));
    for (const s of e)
      s.values = s.values.map((o, r) => [this.getX(r), this.getY(o)]);
    return e;
  }
  getBoundaries(t) {
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
i(c, "presetOptions", {
  width: 600,
  height: 250,
  padding: 40,
  rowsCount: 5,
  i18n: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  data: {
    columns: [],
    dates: []
  },
  style: {
    textFont: "normal 20px Helvetica,sans-serif",
    textColor: "#96a2aa",
    secondaryColor: "#bbbbbb"
  },
  immediate: !0
});
let u = c;
export {
  u as default
};
