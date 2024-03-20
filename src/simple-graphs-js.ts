import type {
   ISimpleGraphsJSColumn,
   ISimpleGraphsJSOptionsColumn,
   ISimpleGraphsJSOptions
} from './simple-graphs-js.types'

class SimpleGraphsJS {
   private static presetOptions: ISimpleGraphsJSOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rowsCount: 5,
      i18n: {
         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      data: {
         columns: [],
         dates: []
      },
      style: {
         textFont: 'normal 20px Helvetica,sans-serif',
         textColor: '#96a2aa',
         secondaryColor: '#bbbbbb'
      },
      immediate: true
   }

   // prettier-ignore
   private static validateOptions(options: Partial<ISimpleGraphsJSOptions> = {}): void {
      if (options.width) {
         if (typeof options.width !== 'number') throw new Error('options.width should be a number')
         if (options.width <= 0) throw new Error('options.width should be greater than 0')
         if (options.width % 2 !== 0) throw new Error('options.width should be an even number')
      }

      if (options.height) {
         if (typeof options.height !== 'number') throw new Error('options.height should be a number')
         if (options.height <= 0) throw new Error('options.height should be greater than 0')
         if (options.height % 2 !== 0) throw new Error('options.height should be an even number')
      }

      if (options.padding) {
         if (typeof options.padding !== 'number') throw new Error('options.padding should be a number')
         if (options.padding < 0) throw new Error('options.padding should be greater or equal to 0')
      }

      if (options.rowsCount) {
         if (typeof options.rowsCount !== 'number') throw new Error('options.rowsCount should be a number')
         if (options.rowsCount <= 0) throw new Error('options.rowsCount should be greater than 0')
      }

      if (options.i18n?.months) {
         if (!Array.isArray(options.i18n.months)) throw new Error('options.i18n.months should be an array')
         if (options.i18n.months.length !== 12) throw new Error('options.i18n.months should have 12 elements')
      }

      if (options.data?.dates) {
         if (!Array.isArray(options.data.dates)) throw new Error('options.data.dates should be an array')
         if (options.data.dates.some((date) => typeof date !== 'number')) throw new Error('options.data.dates should be an array of numbers')

      }

      if (options.data?.columns) {
         if (!Array.isArray(options.data.columns)) throw new Error('options.data.columns should be an array')
         // TODO: other checks
      }

      if (options.style?.textFont) {
         if (typeof options.style.textFont !== 'string') throw new Error('options.style.textFont should be a string')
      }

      if (options.style?.textColor) {
         if (typeof options.style.textColor !== 'string') throw new Error('options.style.textColor should be a string')
      }

      if (options.style?.secondaryColor) {
         if (typeof options.style.secondaryColor !== 'string') throw new Error('options.style.secondaryColor should be a string')
      }

      if (options.immediate) {
         if (typeof options.immediate !== 'boolean') throw new Error('options.immediate should be a boolean')
      }
   }

   private static getOptions(options: Partial<ISimpleGraphsJSOptions> = {}): ISimpleGraphsJSOptions {
      this.validateOptions(options)

      return {
         width: options.width || this.presetOptions.width,
         height: options.height || this.presetOptions.height,
         padding: options.padding || this.presetOptions.padding,
         rowsCount: options.rowsCount || this.presetOptions.rowsCount,
         i18n: {
            months: options.i18n?.months || this.presetOptions.i18n.months
         },
         style: {
            textFont: options.style?.textFont || this.presetOptions.style.textFont,
            textColor: options.style?.textColor || this.presetOptions.style.textColor,
            secondaryColor: options.style?.secondaryColor || this.presetOptions.style.secondaryColor
         },
         data: {
            dates: options.data?.dates || this.presetOptions.data.dates,
            columns: options.data?.columns || this.presetOptions.data.columns
         },
         immediate: options.immediate ?? this.presetOptions.immediate
      }
   }

   /**
    * Updates the preset options with the provided options.
    *
    * @param {Partial<ISimpleGraphsJSOptions>} options - The options to update the preset options with. Default is an empty object.
    */
   public static changePresetOptions(options: Partial<ISimpleGraphsJSOptions> = {}) {
      this.validateOptions(options)
      this.presetOptions.width = options.width || this.presetOptions.width
      this.presetOptions.height = options.height || this.presetOptions.height
      this.presetOptions.padding = options.padding || this.presetOptions.padding
      this.presetOptions.rowsCount = options.rowsCount || this.presetOptions.rowsCount
      this.presetOptions.i18n.months = options.i18n?.months || this.presetOptions.i18n.months
      this.presetOptions.style.textFont = options.style?.textFont || this.presetOptions.style.textFont
      this.presetOptions.style.textColor = options.style?.textColor || this.presetOptions.style.textColor
      this.presetOptions.style.secondaryColor = options.style?.secondaryColor || this.presetOptions.style.secondaryColor
      this.presetOptions.data.columns = options.data?.columns || this.presetOptions.data.columns
      this.presetOptions.data.dates = options.data?.dates || this.presetOptions.data.dates
      this.presetOptions.immediate = options.immediate || this.presetOptions.immediate
   }

   /* Options */
   private readonly WIDTH: number
   private readonly HEIGHT: number
   private readonly PADDING: number
   private readonly ROWS_COUNT: number
   private readonly MONTHS_NAMES: string[]
   private readonly DATES: number[]
   private readonly COLUMNS: ISimpleGraphsJSColumn[]

   /* Styles */
   private readonly STYLES: {
      textFont: string
      textColor: string
      secondaryColor: string
   }

   /* Calculated */
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

   /* DOM */
   private readonly container: HTMLElement
   private readonly canvas: HTMLCanvasElement
   private readonly ctx: CanvasRenderingContext2D

   constructor(container: HTMLElement, options: Partial<ISimpleGraphsJSOptions> = {}) {
      const formattedOptions = SimpleGraphsJS.getOptions(options)

      /* Options */
      this.WIDTH = formattedOptions.width
      this.HEIGHT = formattedOptions.height
      this.PADDING = formattedOptions.padding
      this.ROWS_COUNT = formattedOptions.rowsCount
      this.MONTHS_NAMES = formattedOptions.i18n.months
      this.DATES = formattedOptions.data.dates

      /* Styles */
      this.STYLES = {
         textFont: formattedOptions.style.textFont,
         textColor: formattedOptions.style.textColor,
         secondaryColor: formattedOptions.style.secondaryColor
      }

      /* Calculated */
      this.DPI_WIDTH = this.WIDTH * 2
      this.DPI_HEIGHT = this.HEIGHT * 2
      this.VIEW_WIDTH = this.DPI_WIDTH
      this.VIEW_HEIGHT = this.DPI_HEIGHT - this.PADDING * 2

      this.BOUNDARIES = this.getBoundaries(formattedOptions.data.columns)
      this.X_RATIO = this.VIEW_WIDTH / (formattedOptions.data.columns[0].values.length - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.BOUNDARIES[1] - this.BOUNDARIES[0])
      this.COLUMNS = this.getColumns(formattedOptions.data.columns)

      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.BOUNDARIES[1] - this.BOUNDARIES[0]) / this.ROWS_COUNT
      this.DATE_COUNT = 6
      this.DATE_STEP = Math.round(this.DATES.length / this.DATE_COUNT)

      /* DOM */
      this.container = container
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')!
      this.canvas.style.width = this.WIDTH + 'px'
      this.canvas.style.height = this.HEIGHT + 'px'
      this.canvas.width = this.DPI_WIDTH
      this.canvas.height = this.DPI_HEIGHT

      if (formattedOptions.immediate) {
         this.initialize()
      }
   }

   /* Initializes the component by appending the canvas to the container element and drawing the graph */
   public initialize() {
      this.container.appendChild(this.canvas)
      this.draw()
   }

   /* Destroys the component from the DOM */
   public destroy() {
      this.container.removeChild(this.canvas)
   }

   private draw() {
      this.drawAxisX()
      this.drawAxisY()
      this.drawLines()
   }

   private drawAxisX() {
      this.ctx.fillStyle = this.STYLES.textColor
      this.ctx.font = this.STYLES.textFont
      this.ctx.beginPath()

      for (let i = 1; i <= this.DATES.length; i += this.DATE_STEP) {
         const text = this.getDate(this.DATES[i - 1])
         this.ctx.fillText(text, this.getX(i), this.DPI_HEIGHT - 10)
      }

      this.ctx.closePath()
   }

   private drawAxisY() {
      this.ctx.lineWidth = 1
      this.ctx.strokeStyle = this.STYLES.secondaryColor
      this.ctx.fillStyle = this.STYLES.textColor
      this.ctx.font = this.STYLES.textFont
      this.ctx.beginPath()

      for (let i = 1; i <= this.ROWS_COUNT; i++) {
         const text = String(Math.round(this.BOUNDARIES[1] - this.TEXT_STEP * i))
         const posY = i * this.ROWS_STEP + this.PADDING
         this.ctx.fillText(text, 5, posY - 10)
         this.ctx.moveTo(0, posY)
         this.ctx.lineTo(this.DPI_WIDTH, posY)
      }

      this.ctx.stroke()
      this.ctx.closePath()
   }

   private drawLines() {
      this.ctx.lineWidth = 4

      for (const col of this.COLUMNS) {
         this.ctx.strokeStyle = col.color
         this.ctx.beginPath()

         for (const [x, y] of col.values) {
            this.ctx.lineTo(x, y)
         }

         this.ctx.stroke()
         this.ctx.closePath()
      }
   }

   private getColumns(columns: ISimpleGraphsJSOptionsColumn[]): ISimpleGraphsJSColumn[] {
      const copiedColumns = JSON.parse(JSON.stringify(columns)) as ISimpleGraphsJSColumn[]

      for (const col of copiedColumns) {
         col.values = col.values.map((y, x) => {
            return [this.getX(x), this.getY(y as unknown as number)]
         })
      }

      return copiedColumns
   }

   private getBoundaries(columns: ISimpleGraphsJSOptionsColumn[]) {
      let yMin: number | null = null
      let yMax: number | null = null

      for (const col of columns) {
         for (const y of col.values) {
            yMin = yMin === null || y < yMin ? y : yMin
            yMax = yMax === null || y > yMax ? y : yMax
         }
      }

      return [yMin, yMax] as [number, number]
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
