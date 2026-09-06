-- Multiempresa: Empresa + MembroEmpresa; CRM_OWNER vira flag isCrmOwner; role sai de Usuario.

CREATE TABLE "Empresa" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MembroEmpresa" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembroEmpresa_pkey" PRIMARY KEY ("id")
);

-- Empresa demo para migrar memberships existentes
INSERT INTO "Empresa" ("id", "nome", "createdAt", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000001', 'Empresa Demo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE "Usuario" ADD COLUMN "isCrmOwner" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Usuario" SET "isCrmOwner" = true WHERE "role" = 'CRM_OWNER';

-- Memberships: quem não é CRM_OWNER de plataforma entra na empresa demo com a role antiga
INSERT INTO "MembroEmpresa" ("id", "usuarioId", "empresaId", "role", "createdAt", "updatedAt")
SELECT gen_random_uuid(), u."id", '00000000-0000-4000-8000-000000000001',
       CASE WHEN u."role"::text = 'CRM_OWNER' THEN 'OWNER'::"Role" ELSE u."role" END,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Usuario" u
WHERE u."isCrmOwner" = false;

-- CRM_OWNER de plataforma não precisa de membership; se quiser operar o tenant demo, login com empresaId

ALTER TABLE "Usuario" DROP COLUMN "role";

CREATE TYPE "Role_new" AS ENUM ('OWNER', 'ADMIN', 'USER');

ALTER TABLE "MembroEmpresa" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "MembroEmpresa" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "MembroEmpresa" ALTER COLUMN "role" SET DEFAULT 'USER'::"Role_new";

DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

ALTER TABLE "MembroEmpresa" ADD CONSTRAINT "MembroEmpresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembroEmpresa" ADD CONSTRAINT "MembroEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "MembroEmpresa_usuarioId_empresaId_key" ON "MembroEmpresa"("usuarioId", "empresaId");
CREATE INDEX "MembroEmpresa_empresaId_idx" ON "MembroEmpresa"("empresaId");

-- No máximo um CRM_OWNER de plataforma
CREATE UNIQUE INDEX "Usuario_crm_owner_unico" ON "Usuario" ("isCrmOwner") WHERE "isCrmOwner" = true;
