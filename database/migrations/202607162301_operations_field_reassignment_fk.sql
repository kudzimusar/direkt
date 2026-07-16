ALTER TABLE operations.field_work_items
  DROP CONSTRAINT operations_field_work_items_replaced_by_work_item_id_fkey;

ALTER TABLE operations.field_work_items
  ADD CONSTRAINT operations_field_work_items_replaced_by_work_item_id_fkey
  FOREIGN KEY (replaced_by_work_item_id)
  REFERENCES operations.field_work_items(id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

COMMENT ON CONSTRAINT operations_field_work_items_replaced_by_work_item_id_fkey
  ON operations.field_work_items IS
  'Deferred so one transaction can close an old work item and create its scoped replacement atomically.';
