export default {
    input: 'tmp/esm5/ngx-serializer.js',
    output: {
        file: 'dist/bundles/ngx-serializer.umd.js',
        format: 'umd'
    },
    name: 'ngx-serializer',
    external: ['@angular/core', '@digitalascetic/ngx-reflection', 'reflect-metadata'],
    globals: {
        '@angular/core': 'ng.core',
        '@digitalascetic/ngx-reflection': 'ngxReflection'
    }
}
