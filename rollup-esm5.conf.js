export default {
    input: 'tmp/esm5/ngx-serializer.js',
    output: {
        file: 'dist/esm5/ngx-serializer.js',
        format: 'es'
    },
    external: ['@angular/core', '@digitalascetic/ngx-reflection', 'reflect-metadata']
}
