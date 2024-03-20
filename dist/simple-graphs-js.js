var l = Object.defineProperty;
var S = (a, t, s) => t in a ? l(a, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : a[t] = s;
var h = (a, t, s) => (S(a, typeof t != "symbol" ? t + "" : t, s), s);
const e = class e {
  constructor(t, s = {}) {
    h(this, "WIDTH");
    h(this, "HEIGHT");
    h(this, "PADDING");
    h(this, "ROWS_COUNT");
    h(this, "MONTHS_NAMES");
    h(this, "TEXT_FONT");
    h(this, "TEXT_COLOR");
    h(this, "COLUMNS");
    h(this, "DATES");
    h(this, "DPI_WIDTH");
    h(this, "DPI_HEIGHT");
    h(this, "VIEW_WIDTH");
    h(this, "VIEW_HEIGHT");
    h(this, "BOUNDARIES");
    h(this, "X_RATIO");
    h(this, "Y_RATIO");
    h(this, "ROWS_STEP");
    h(this, "TEXT_STEP");
    h(this, "DATE_COUNT");
    h(this, "DATE_STEP");
    h(this, "canvas");
    h(this, "ctx");
    var i, T, O, E, I;
    this.WIDTH = s.width || e.DEFAULT_OPTIONS.width, this.HEIGHT = s.height || e.DEFAULT_OPTIONS.height, this.PADDING = s.padding || e.DEFAULT_OPTIONS.padding, this.ROWS_COUNT = s.rows || e.DEFAULT_OPTIONS.rows, this.MONTHS_NAMES = ((i = s.i18n) == null ? void 0 : i.months) || e.DEFAULT_OPTIONS.i18n.months, this.TEXT_FONT = ((T = s.style) == null ? void 0 : T.textFont) || e.DEFAULT_OPTIONS.style.textFont, this.TEXT_COLOR = ((O = s.style) == null ? void 0 : O.textColor) || e.DEFAULT_OPTIONS.style.textColor, this.COLUMNS = ((E = s.data) == null ? void 0 : E.columns) || e.DEFAULT_OPTIONS.data.columns, this.DATES = ((I = s.data) == null ? void 0 : I.dates) || e.DEFAULT_OPTIONS.data.dates, this.DPI_WIDTH = this.WIDTH * 2, this.DPI_HEIGHT = this.HEIGHT * 2, this.VIEW_WIDTH = this.DPI_WIDTH, this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2, this.BOUNDARIES = this.getBoundaries(), this.X_RATIO = this.VIEW_WIDTH / (this.COLUMNS[0].values.length - 1), this.Y_RATIO = this.VIEW_HEIGHT / (this.BOUNDARIES[1] - this.BOUNDARIES[0]), this.COLUMNS = this.prepareColumns(), this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT, this.TEXT_STEP = (this.BOUNDARIES[1] - this.BOUNDARIES[0]) / this.ROWS_COUNT, this.DATE_COUNT = 6, this.DATE_STEP = Math.round(this.DATES.length / this.DATE_COUNT), this.canvas = t, this.ctx = this.canvas.getContext("2d"), this.canvas.style.width = this.WIDTH + "px", this.canvas.style.height = this.HEIGHT + "px", this.canvas.width = this.DPI_WIDTH, this.canvas.height = this.DPI_HEIGHT, this.draw();
  }
  static setDefaultOptions(t = {}) {
    var s, i, T, O, E;
    this.DEFAULT_OPTIONS.width = t.width || this.DEFAULT_OPTIONS.width, this.DEFAULT_OPTIONS.height = t.height || this.DEFAULT_OPTIONS.height, this.DEFAULT_OPTIONS.padding = t.padding || this.DEFAULT_OPTIONS.padding, this.DEFAULT_OPTIONS.rows = t.rows || this.DEFAULT_OPTIONS.rows, this.DEFAULT_OPTIONS.i18n.months = ((s = t.i18n) == null ? void 0 : s.months) || this.DEFAULT_OPTIONS.i18n.months, this.DEFAULT_OPTIONS.style.textFont = ((i = t.style) == null ? void 0 : i.textFont) || this.DEFAULT_OPTIONS.style.textFont, this.DEFAULT_OPTIONS.style.textColor = ((T = t.style) == null ? void 0 : T.textColor) || this.DEFAULT_OPTIONS.style.textColor, this.DEFAULT_OPTIONS.data.columns = ((O = t.data) == null ? void 0 : O.columns) || this.DEFAULT_OPTIONS.data.columns, this.DEFAULT_OPTIONS.data.dates = ((E = t.data) == null ? void 0 : E.dates) || this.DEFAULT_OPTIONS.data.dates;
  }
  draw() {
    this.drawAxisX(), this.drawAxisY(), this.drawLines();
  }
  drawAxisX() {
    this.ctx.fillStyle = this.TEXT_COLOR, this.ctx.font = this.TEXT_FONT, this.ctx.beginPath();
    for (let t = 1; t <= this.DATES.length; t += this.DATE_STEP) {
      let s = this.getDate(this.DATES[t - 1]);
      this.ctx.fillText(s, this.getX(t), this.DPI_HEIGHT - 10);
    }
    this.ctx.closePath();
  }
  drawAxisY() {
    this.ctx.lineWidth = 1, this.ctx.strokeStyle = "#bbbbbb", this.ctx.fillStyle = this.TEXT_COLOR, this.ctx.font = this.TEXT_FONT, this.ctx.beginPath();
    for (let t = 1; t <= this.ROWS_COUNT; t++) {
      let s = String(Math.round(this.BOUNDARIES[1] - this.TEXT_STEP * t)), i = t * this.ROWS_STEP + this.PADDING;
      this.ctx.fillText(s, 5, i - 10), this.ctx.moveTo(0, i), this.ctx.lineTo(this.DPI_WIDTH, i);
    }
    this.ctx.stroke(), this.ctx.closePath();
  }
  drawLines() {
    this.ctx.lineWidth = 4;
    for (let t of this.COLUMNS) {
      this.ctx.strokeStyle = t.color, this.ctx.beginPath();
      for (let [s, i] of t.values)
        this.ctx.lineTo(s, i);
      this.ctx.stroke(), this.ctx.closePath();
    }
  }
  getBoundaries() {
    let t = null, s = null;
    for (let i of this.COLUMNS)
      for (let T of i.values)
        t = t === null || T < t ? T : t, s = s === null || T > s ? T : s;
    return [t, s];
  }
  prepareColumns() {
    const t = [];
    for (let s of this.COLUMNS)
      s.values = s.values.map((i, T) => [this.getX(T), this.getY(i)]), t.push(s);
    return t;
  }
  getDate(t) {
    const s = new Date(t), i = s.getDate(), T = s.getMonth(), O = this.MONTHS_NAMES;
    return `${i} ${O[T]}`;
  }
  getX(t) {
    return Math.floor(t * this.X_RATIO);
  }
  getY(t) {
    return Math.floor(this.DPI_HEIGHT - this.PADDING - t * this.Y_RATIO);
  }
};
h(e, "DEFAULT_OPTIONS", {
  width: 600,
  height: 250,
  padding: 40,
  rows: 5,
  i18n: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  style: {
    textFont: "normal 20px Helvetica,sans-serif",
    textColor: "#96a2aa"
  },
  data: {
    columns: [],
    dates: []
  }
});
let D = e;
export {
  D as default
};
