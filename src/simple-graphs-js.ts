import type { ISimpleGraphsJSColumn, ISimpleGraphsJSOptions } from './simple-graphs-js.types'

class SimpleGraphsJS {
   private static DEFAULT_OPTIONS: ISimpleGraphsJSOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rows: 5,

      i18n: {
         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },

      style: {
         textFont: 'normal 20px Helvetica,sans-serif',
         textColor: '#96a2aa'
      },

      data: {
         columns: [],
         dates: []
      }
   }

   public static setDefaultOptions(options: Partial<ISimpleGraphsJSOptions> = {}) {
      this.DEFAULT_OPTIONS.width = options.width || this.DEFAULT_OPTIONS.width
      this.DEFAULT_OPTIONS.height = options.height || this.DEFAULT_OPTIONS.height
      this.DEFAULT_OPTIONS.padding = options.padding || this.DEFAULT_OPTIONS.padding
      this.DEFAULT_OPTIONS.rows = options.rows || this.DEFAULT_OPTIONS.rows
      this.DEFAULT_OPTIONS.i18n.months = options.i18n?.months || this.DEFAULT_OPTIONS.i18n.months
      this.DEFAULT_OPTIONS.style.textFont = options.style?.textFont || this.DEFAULT_OPTIONS.style.textFont
      this.DEFAULT_OPTIONS.style.textColor = options.style?.textColor || this.DEFAULT_OPTIONS.style.textColor
      this.DEFAULT_OPTIONS.data.columns = options.data?.columns || this.DEFAULT_OPTIONS.data.columns
      this.DEFAULT_OPTIONS.data.dates = options.data?.dates || this.DEFAULT_OPTIONS.data.dates
   }

   private readonly WIDTH: number
   private readonly HEIGHT: number
   private readonly PADDING: number
   private readonly ROWS_COUNT: number
   private readonly MONTHS_NAMES: string[]
   private readonly TEXT_FONT: string
   private readonly TEXT_COLOR: string
   private readonly COLUMNS: ISimpleGraphsJSColumn<true | false>[]
   private readonly DATES: number[]

   private readonly DPI_WIDTH: number
   private readonly DPI_HEIGHT: number
   private readonly VIEW_WIDTH: number
   private readonly VIEW_HEIGHT: number
   private readonly BOUNDARIES: [number, number]
   private readonly X_RATIO: number
   private readonly Y_RATIO: number
   private readonly ROWS_STEP: number
   private readonly TEXT_STEP: number
   private readonly DATE_COUNT: number
   private readonly DATE_STEP: number

   private readonly canvas: HTMLCanvasElement
   private readonly ctx: CanvasRenderingContext2D

   constructor(canvas: HTMLCanvasElement, options: Partial<ISimpleGraphsJSOptions> = {}) {
      this.WIDTH = options.width || SimpleGraphsJS.DEFAULT_OPTIONS.width
      this.HEIGHT = options.height || SimpleGraphsJS.DEFAULT_OPTIONS.height
      this.PADDING = options.padding || SimpleGraphsJS.DEFAULT_OPTIONS.padding
      this.ROWS_COUNT = options.rows || SimpleGraphsJS.DEFAULT_OPTIONS.rows
      this.MONTHS_NAMES = options.i18n?.months || SimpleGraphsJS.DEFAULT_OPTIONS.i18n.months
      this.TEXT_FONT = options.style?.textFont || SimpleGraphsJS.DEFAULT_OPTIONS.style.textFont
      this.TEXT_COLOR = options.style?.textColor || SimpleGraphsJS.DEFAULT_OPTIONS.style.textColor
      this.COLUMNS = options.data?.columns || SimpleGraphsJS.DEFAULT_OPTIONS.data.columns
      this.DATES = options.data?.dates || SimpleGraphsJS.DEFAULT_OPTIONS.data.dates

      this.DPI_WIDTH = this.WIDTH * 2
      this.DPI_HEIGHT = this.HEIGHT * 2
      this.VIEW_WIDTH = this.DPI_WIDTH
      this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2
      this.BOUNDARIES = this.getBoundaries()
      this.X_RATIO = this.VIEW_WIDTH / (this.COLUMNS[0].values.length - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.BOUNDARIES[1] - this.BOUNDARIES[0])
      this.COLUMNS = this.prepareColumns()
      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.BOUNDARIES[1] - this.BOUNDARIES[0]) / this.ROWS_COUNT
      this.DATE_COUNT = 6
      this.DATE_STEP = Math.round(this.DATES.length / this.DATE_COUNT)

      this.canvas = canvas
      this.ctx = this.canvas.getContext('2d')!
      this.canvas.style.width = this.WIDTH + 'px'
      this.canvas.style.height = this.HEIGHT + 'px'
      this.canvas.width = this.DPI_WIDTH
      this.canvas.height = this.DPI_HEIGHT

      this.draw()
   }

   private draw() {
      this.drawAxisX()
      this.drawAxisY()
      this.drawLines()
   }

   private drawAxisX() {
      this.ctx.fillStyle = this.TEXT_COLOR
      this.ctx.font = this.TEXT_FONT
      this.ctx.beginPath()

      for (let i = 1; i <= this.DATES.length; i += this.DATE_STEP) {
         let text = this.getDate(this.DATES[i - 1])
         this.ctx.fillText(text, this.getX(i), this.DPI_HEIGHT - 10)
      }

      this.ctx.closePath()
   }

   private drawAxisY() {
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = '#bbbbbb'
      this.ctx.fillStyle = this.TEXT_COLOR
      this.ctx.font = this.TEXT_FONT
      this.ctx.beginPath()

      for (let i = 1; i <= this.ROWS_COUNT; i++) {
         let text = String(Math.round(this.BOUNDARIES[1] - this.TEXT_STEP * i))
         let posY = i * this.ROWS_STEP + this.PADDING
         this.ctx.fillText(text, 5, posY - 10)
         this.ctx.moveTo(0, posY)
         this.ctx.lineTo(this.DPI_WIDTH, posY)
      }

      this.ctx.stroke()
      this.ctx.closePath()
   }

   private drawLines() {
      this.ctx.lineWidth = 4

      for (let col of this.COLUMNS as ISimpleGraphsJSColumn<true>[]) {
         this.ctx.strokeStyle = col.color
         this.ctx.beginPath()

         for (let [x, y] of col.values) {
            this.ctx.lineTo(x, y)
         }

         this.ctx.stroke()
         this.ctx.closePath()
      }
   }

   private getBoundaries() {
      let yMin: number | null = null
      let yMax: number | null = null

      for (let col of this.COLUMNS as ISimpleGraphsJSColumn<false>[]) {
         for (let y of col.values) {
            yMin = yMin === null || y < yMin ? y : yMin
            yMax = yMax === null || y > yMax ? y : yMax
         }
      }

      return [yMin, yMax] as [number, number]
   }

   private prepareColumns() {
      const coords = []

      for (let col of this.COLUMNS as ISimpleGraphsJSColumn<false>[]) {
         col.values = col.values.map((y, x) => [this.getX(x), this.getY(y)]) as unknown as [number, number]
         coords.push(col)
      }

      return coords
   }

   private getDate(timestamp: number) {
      const date = new Date(timestamp)
      const day = date.getDate()
      const month = date.getMonth()
      const months = this.MONTHS_NAMES

      return `${day} ${months[month]}`
   }

   private getX(x: number) {
      return Math.floor(x * this.X_RATIO)
   }

   private getY(y: number) {
      return Math.floor(this.DPI_HEIGHT - this.PADDING - y * this.Y_RATIO)
   }
}

export default SimpleGraphsJS
