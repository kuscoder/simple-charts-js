import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => ({
   root: resolve(__dirname, 'src'),
   build: {
      emptyOutDir: true,
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
         input: {
            main: resolve(__dirname, 'src/simple-graphs-js.ts')
         },
         external: []
      },
      lib: {
         entry: resolve(__dirname, 'src/simple-graphs-js.ts'),
         name: 'SimpleGraphsJS',
         fileName: 'simple-graphs-js'
      }
   },
   plugins: [
      dts({
         entryRoot: resolve(__dirname, 'src'),
         tsconfigPath: resolve(__dirname, 'tsconfig.json'),
         copyDtsFiles: true
      })
   ]
}))
