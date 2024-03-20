import { GraphOptionsError } from './graph-error'
import type { IDataAxisX, IDataAxisY, IGraphOptions } from './types'

export class Graph {
   private static presetOptions: IGraphOptions = {
      width: 600,
      height: 250,
      padding: 40,
      rowsCount: 5,
      i18n: {
         months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      data: {
         xAxis: null,
         yAxis: []
      },
      style: {
         textFont: 'normal 20px Helvetica,sans-serif',
         textColor: '#96a2aa',
         secondaryColor: '#bbbbbb'
      },
      immediate: true
   }

   // prettier-ignore
   private static validateOptions(options: Partial<IGraphOptions> = {}): void {
      const {
         width,
         height,
         padding,
         rowsCount,
         i18n: { months } = {},
         data: { xAxis, yAxis } = {},
         style: { textFont, textColor, secondaryColor } = {},
         immediate
      } = options

      if (width) {
         if (typeof width !== 'number') throw new GraphOptionsError('width should be a number')
         if (width <= 0) throw new GraphOptionsError('width should be greater than 0')
         if (width % 2 !== 0) throw new GraphOptionsError('width should be an even number')
      }

      if (height) {
         if (typeof height !== 'number') throw new GraphOptionsError('height should be a number')
         if (height <= 0) throw new GraphOptionsError('height should be greater than 0')
         if (height % 2 !== 0) throw new GraphOptionsError('height should be an even number')
      }

      if (padding) {
         if (typeof padding !== 'number') throw new GraphOptionsError('padding should be a number')
         if (padding < 0) throw new GraphOptionsError('padding should be greater or equal to 0')
      }

      if (rowsCount) {
         if (typeof rowsCount !== 'number') throw new GraphOptionsError('rowsCount should be a number')
         if (rowsCount <= 0) throw new GraphOptionsError('rowsCount should be greater than 0')
      }

      if (months) {
         if (!Array.isArray(months)) throw new GraphOptionsError('i18n.months should be an array')
         if (months.length !== 12) throw new GraphOptionsError('i18n.months should have 12 elements')
      }

      if (xAxis) {
         if (typeof xAxis !== 'object') throw new GraphOptionsError('data.xAxis should be an object')
         if (typeof xAxis.type !== 'string') throw new GraphOptionsError('data.xAxis.type should be a string')
         if (!['date'].includes(xAxis.type)) throw new GraphOptionsError('data.xAxis.type should be "date"')
         if (!Array.isArray(xAxis.values)) throw new GraphOptionsError('data.xAxis.values should be an array')

         if (xAxis.type === 'date') {
            xAxis.values.forEach((value, i) => {
               if (typeof value !== 'number') throw new GraphOptionsError(`data.xAxis.values[${i}] should be a number`)
            })
         }
      }

      if (yAxis) {
         if (!Array.isArray(yAxis)) throw new GraphOptionsError('data.columns should be an array')

         yAxis.forEach((col, i) => {
            if (typeof col.name !== 'string') throw new GraphOptionsError(`data.yAxis[${i}].name should be a string`)
            if (typeof col.color !== 'string') throw new GraphOptionsError(`data.yAxis[${i}].color should be a string`)
            if (!Array.isArray(col.values)) throw new GraphOptionsError(`data.yAxis[${i}].values should be an array`)

            col.values.forEach((value, j) => {
               if (typeof value !== 'number') throw new GraphOptionsError(`data.yAxis[${i}].values[${j}] should be a number`)
            })
         })
      }

      if (textFont) {
         if (typeof textFont !== 'string') throw new GraphOptionsError('style.textFont should be a string')
      }

      if (textColor) {
         if (typeof textColor !== 'string') throw new GraphOptionsError('style.textColor should be a string')
      }

      if (secondaryColor) {
         if (typeof secondaryColor !== 'string') throw new GraphOptionsError('style.secondaryColor should be a string')
      }

      if (immediate) {
         if (typeof immediate !== 'boolean') throw new GraphOptionsError('immediate should be a boolean')
      }
   }

   private static getOptions(options: Partial<IGraphOptions> = {}): IGraphOptions {
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
            xAxis: options.data?.xAxis || this.presetOptions.data.xAxis,
            yAxis: options.data?.yAxis || this.presetOptions.data.yAxis
         },
         immediate: options.immediate ?? this.presetOptions.immediate
      }
   }

   /**
    * Updates the preset options with the provided options.
    *
    * @param {Partial<IGraphOptions>} options - The options to update the preset options with. Default is an empty object.
    */
   public static changePresetOptions(options: Partial<IGraphOptions> = {}) {
      this.validateOptions(options)
      this.presetOptions.width = options.width || this.presetOptions.width
      this.presetOptions.height = options.height || this.presetOptions.height
      this.presetOptions.padding = options.padding || this.presetOptions.padding
      this.presetOptions.rowsCount = options.rowsCount || this.presetOptions.rowsCount
      this.presetOptions.i18n.months = options.i18n?.months || this.presetOptions.i18n.months
      this.presetOptions.style.textFont = options.style?.textFont || this.presetOptions.style.textFont
      this.presetOptions.style.textColor = options.style?.textColor || this.presetOptions.style.textColor
      this.presetOptions.style.secondaryColor = options.style?.secondaryColor || this.presetOptions.style.secondaryColor
      this.presetOptions.data.xAxis = options.data?.xAxis || this.presetOptions.data.xAxis
      this.presetOptions.data.yAxis = options.data?.yAxis || this.presetOptions.data.yAxis
      this.presetOptions.immediate = options.immediate || this.presetOptions.immediate
   }

   /* Options */
   private readonly WIDTH: number
   private readonly HEIGHT: number
   private readonly PADDING: number
   private readonly ROWS_COUNT: number
   private readonly MONTHS_NAMES: string[]
   private readonly X_AXIS_DATA: IDataAxisX | null
   private readonly Y_AXIS_DATA: IDataAxisY[]

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
   private readonly Y_BOUNDARIES: [number, number]
   private readonly X_RATIO: number
   private readonly Y_RATIO: number
   private readonly ROWS_STEP: number
   private readonly TEXT_STEP: number
   private readonly X_AXIS_DATA_COUNT: number
   private readonly X_AXIS_DATA_STEP: number

   /* DOM */
   private readonly container: HTMLElement
   private readonly canvas: HTMLCanvasElement
   private readonly ctx: CanvasRenderingContext2D

   constructor(container: HTMLElement, options: Partial<IGraphOptions> = {}) {
      const formattedOptions = Graph.getOptions(options)

      const xLength = formattedOptions.data.xAxis?.values.length || 0
      const yLength = formattedOptions.data.yAxis[0].values.length

      /* Options */
      this.WIDTH = formattedOptions.width
      this.HEIGHT = formattedOptions.height
      this.PADDING = formattedOptions.padding
      this.ROWS_COUNT = formattedOptions.rowsCount
      this.MONTHS_NAMES = formattedOptions.i18n.months
      this.X_AXIS_DATA = formattedOptions.data.xAxis
      this.Y_AXIS_DATA = formattedOptions.data.yAxis

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

      this.Y_BOUNDARIES = this.getBoundariesY(this.Y_AXIS_DATA)
      this.X_RATIO = this.VIEW_WIDTH / (yLength - 1)
      this.Y_RATIO = this.VIEW_HEIGHT / (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0])

      this.ROWS_STEP = this.VIEW_HEIGHT / this.ROWS_COUNT
      this.TEXT_STEP = (this.Y_BOUNDARIES[1] - this.Y_BOUNDARIES[0]) / this.ROWS_COUNT

      this.X_AXIS_DATA_COUNT = 6
      this.X_AXIS_DATA_STEP = xLength && Math.round(xLength / this.X_AXIS_DATA_COUNT)

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
      if (!this.X_AXIS_DATA) return

      this.ctx.fillStyle = this.STYLES.textColor
      this.ctx.font = this.STYLES.textFont
      this.ctx.beginPath()

      // TODO: Other X_AXIS_DATA types
      for (let i = 1; i <= this.X_AXIS_DATA.values.length; i += this.X_AXIS_DATA_STEP) {
         const text = this.getDate(this.X_AXIS_DATA.values[i - 1])
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
         const text = String(Math.round(this.Y_BOUNDARIES[1] - this.TEXT_STEP * i))
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

      for (const col of this.Y_AXIS_DATA) {
         this.ctx.strokeStyle = col.color
         this.ctx.beginPath()

         for (let i = 0; i < col.values.length; i++) {
            const x = this.getX(i)
            const y = this.getY(col.values[i])
            this.ctx.lineTo(x, y)
         }

         this.ctx.stroke()
         this.ctx.closePath()
      }
   }

   private getBoundariesY(columns: IDataAxisY[]) {
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
