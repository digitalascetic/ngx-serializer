export default {
    input: 'tmp/esm2015/ngx-serializer.js',
    output: {
        file: 'dist/esm2015/ngx-serializer.js',
        format: 'es'
    },
    external: ['@angular/core', '@digitalascetic/ngx-reflection', 'reflect-metadata']
}
