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
            main: resolve(__dirname, 'src/index.ts')
         },
         external: []
      },
      lib: {
         entry: resolve(__dirname, 'src/index.ts'),
         name: 'SimpleGraphsJS',
         fileName: 'index'
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
