-- Migration de dados: copia permissoes existentes para a tabela de permissoes manuais
-- Garante que usuarios existentes mantenham suas permissoes como "manuais"
-- ate que perfis sejam atribuidos a eles.
INSERT INTO user_manual_permissions ("userId", permission, "grantedAt")
SELECT "userId", permission, "grantedAt" FROM user_permissions
ON CONFLICT DO NOTHING;