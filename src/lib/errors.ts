export class MultiplasEmpresasError extends Error {
    readonly empresas: Array<{
        id: string;
        nome: string;
        role: string;
    }>;

    constructor(
        empresas: Array<{ id: string; nome: string; role: string }>
    ) {
        super('Múltiplas empresas');
        this.name = 'MultiplasEmpresasError';
        this.empresas = empresas;
    }
}
