-- Adapil.ai — Multi-Tenant Row-Level Security (RLS) Migration for Neon PostgreSQL

ALTER TABLE reses_aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reses_aspirations FORCE ROW LEVEL SECURITY;

ALTER TABLE budget_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_documents FORCE ROW LEVEL SECURITY;

ALTER TABLE hearing_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearing_briefs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_reses_aspirations ON reses_aspirations;
CREATE POLICY tenant_isolation_reses_aspirations
  ON reses_aspirations
  USING (workspace_id = current_setting('app.current_workspace_id', true))
  WITH CHECK (workspace_id = current_setting('app.current_workspace_id', true));

DROP POLICY IF EXISTS tenant_isolation_budget_documents ON budget_documents;
CREATE POLICY tenant_isolation_budget_documents
  ON budget_documents
  USING (workspace_id = current_setting('app.current_workspace_id', true))
  WITH CHECK (workspace_id = current_setting('app.current_workspace_id', true));

DROP POLICY IF EXISTS tenant_isolation_hearing_briefs ON hearing_briefs;
CREATE POLICY tenant_isolation_hearing_briefs
  ON hearing_briefs
  USING (
    EXISTS (
      SELECT 1
      FROM budget_documents bd
      WHERE bd.id = hearing_briefs.document_id
        AND bd.workspace_id = current_setting('app.current_workspace_id', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM budget_documents bd
      WHERE bd.id = hearing_briefs.document_id
        AND bd.workspace_id = current_setting('app.current_workspace_id', true)
    )
  );
