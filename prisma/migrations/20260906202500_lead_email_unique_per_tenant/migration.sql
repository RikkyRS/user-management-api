-- E-mail de Lead único por tenant quando informado (vários NULL ok no Postgres).
CREATE UNIQUE INDEX "Lead_empresaId_email_key" ON "Lead"("empresaId", "email");
