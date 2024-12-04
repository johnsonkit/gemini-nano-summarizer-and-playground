import { resolve } from 'path'

export default {
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                playground: resolve(__dirname, 'playground/index.html')
            },
        },
    }
}