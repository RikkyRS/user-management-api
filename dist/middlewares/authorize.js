const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new Error('Não autorizado'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new Error('Acesso negado'));
        }
        next();
    };
};
export default authorize;
//# sourceMappingURL=authorize.js.map