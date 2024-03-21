import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => ({
   root: resolve(__dirname, 'src'),
   build: {
      emptyOutDir: true,
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
         output: {
            assetFileNames: 'index.css'
         },
         input: {
            main: resolve(__dirname, 'src/index.ts')
         },
         external: []
      },
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'SimpleChartsJS',
         fileName: 'index'
      }
   },
   resolve: {
      alias: {
         '@': resolve(__dirname, 'src')
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
