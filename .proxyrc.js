module.exports = function (app) {
    app.use((req, res, next) => {
        res.removeHeader('Cross-Origin-Resource-Policy');
        res.removeHeader('Cross-Origin-Embedder-Policy');
        next();
    });
};
