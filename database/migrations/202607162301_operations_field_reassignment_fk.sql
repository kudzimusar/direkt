DO $$
DECLARE
  existing_constraint_name text;
BEGIN
  SELECT constraints.conname
  INTO existing_constraint_name
  FROM pg_constraint AS constraints
  JOIN pg_attribute AS attributes
    ON attributes.attrelid = constraints.conrelid
   AND attributes.attnum = ANY (constraints.conkey)
  WHERE constraints.conrelid = 'operations.field_work_items'::regclass
    AND constraints.contype = 'f'
    AND attributes.attname = 'replaced_by_work_item_id'
  ORDER BY constraints.oid
  LIMIT 1;

  IF existing_constraint_name IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE operations.field_work_items DROP CONSTRAINT %I',
      existing_constraint_name
    );
  END IF;
END;
$$;

ALTER TABLE operations.field_work_items
  ADD CONSTRAINT operations_field_work_items_replaced_by_work_item_id_fkey
  FOREIGN KEY (replaced_by_work_item_id)
  REFERENCES operations.field_work_items(id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

COMMENT ON CONSTRAINT operations_field_work_items_replaced_by_work_item_id_fkey
  ON operations.field_work_items IS
  'Deferred so one transaction can close an old work item and create its scoped replacement atomically.';
