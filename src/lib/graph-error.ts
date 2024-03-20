export class GraphError extends Error {
   constructor(message: string) {
      super(message)
      this.name = 'GraphError'
   }
}

export class GraphOptionsError extends GraphError {
   constructor(message: string) {
      super(message)
      this.name = 'GraphOptionsError'
   }
}
