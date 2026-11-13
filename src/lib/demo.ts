/**
 * Modo demonstração: uma empresa de exemplo com dados fictícios, aberta para
 * quem visitar o painel (recrutador, cliente). Os IDs são fixos para que o
 * seed consiga recriar os dados e o login de demonstração saiba quem é quem.
 */
export const DEMO_EMPRESA_ID = '00000000-0000-4000-8000-00000000d3e0';
export const DEMO_USUARIO_ID = '00000000-0000-4000-8000-00000000d3e1';
export const DEMO_EMAIL = 'demo@crm.demo';

/** O login de demonstração só existe se DEMO_MODE=true. */
export const demoAtivo = () => process.env.DEMO_MODE === 'true';
