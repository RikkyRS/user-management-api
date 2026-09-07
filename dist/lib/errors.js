export class MultiplasEmpresasError extends Error {
    empresas;
    constructor(empresas) {
        super('Múltiplas empresas');
        this.name = 'MultiplasEmpresasError';
        this.empresas = empresas;
    }
}
//# sourceMappingURL=errors.js.map