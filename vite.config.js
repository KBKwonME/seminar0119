// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                basicChatbot: resolve(__dirname, 'basicChatbot.html'),
                basicInputs: resolve(__dirname, "basicInputs.html"),
             },
         },
     },
})
