export class ChartError extends Error {
   constructor(message: string) {
      super(message)
      this.name = 'ChartError'
   }
}

export class ChartOptionsError extends ChartError {
   constructor(message: string) {
      super(message)
      this.name = 'ChartOptionsError'
   }
}
