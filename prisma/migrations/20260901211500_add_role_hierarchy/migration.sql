-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';
ALTER TYPE "Role" ADD VALUE 'CRM_OWNER';

-- No máximo um CRM_OWNER no banco (dono do produto, não nasce pela API)
CREATE UNIQUE INDEX "Usuario_one_crm_owner" ON "Usuario" (role) WHERE role = 'CRM_OWNER';
