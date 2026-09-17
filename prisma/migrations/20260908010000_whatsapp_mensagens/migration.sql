-- CreateEnum
CREATE TYPE "MensagemDirecao" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateTable
CREATE TABLE "WhatsappConfig" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "displayPhone" TEXT,
    "accessToken" TEXT NOT NULL,
    "appSecret" TEXT NOT NULL,
    "verifyToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "direcao" "MensagemDirecao" NOT NULL,
    "texto" TEXT NOT NULL,
    "waMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappConfig_empresaId_key" ON "WhatsappConfig"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappConfig_phoneNumberId_key" ON "WhatsappConfig"("phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "Mensagem_waMessageId_key" ON "Mensagem"("waMessageId");

-- CreateIndex
CREATE INDEX "Mensagem_empresaId_leadId_createdAt_idx" ON "Mensagem"("empresaId", "leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "WhatsappConfig" ADD CONSTRAINT "WhatsappConfig_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
