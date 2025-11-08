module.exports = [
"[project]/code/node_modules/leaflet/dist/leaflet-src.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/c180d_leaflet_dist_leaflet-src_0940aa47.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/code/node_modules/leaflet/dist/leaflet-src.js [app-ssr] (ecmascript)");
    });
});
}),
];