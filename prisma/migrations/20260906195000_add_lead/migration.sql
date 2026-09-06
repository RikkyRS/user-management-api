-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'EM_ATENDIMENTO', 'QUALIFICADO', 'PROPOSTA', 'NEGOCIACAO', 'CLIENTE', 'PERDIDO');

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "origem" TEXT,
    "interesse" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "responsavelUsuarioId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_empresaId_idx" ON "Lead"("empresaId");

-- CreateIndex
CREATE INDEX "Lead_empresaId_responsavelUsuarioId_idx" ON "Lead"("empresaId", "responsavelUsuarioId");

-- CreateIndex
CREATE INDEX "Lead_empresaId_status_idx" ON "Lead"("empresaId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_empresaId_telefone_key" ON "Lead"("empresaId", "telefone");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_responsavelUsuarioId_fkey" FOREIGN KEY ("responsavelUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
