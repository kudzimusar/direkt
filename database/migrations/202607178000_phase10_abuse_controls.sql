CREATE SCHEMA IF NOT EXISTS security;

CREATE TABLE security.rate_limit_buckets (
  policy_key text NOT NULL,
  subject_hash character(64) NOT NULL,
  window_started_at timestamptz NOT NULL,
  window_seconds integer NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (policy_key, subject_hash, window_started_at),
  CONSTRAINT rate_limit_policy_format CHECK (policy_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  CONSTRAINT rate_limit_subject_hash_format CHECK (subject_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT rate_limit_window_bounded CHECK (window_seconds BETWEEN 1 AND 86400),
  CONSTRAINT rate_limit_count_positive CHECK (request_count > 0),
  CONSTRAINT rate_limit_expiry_after_window CHECK (expires_at > window_started_at)
);

CREATE INDEX rate_limit_buckets_expiry_idx
  ON security.rate_limit_buckets (expires_at);

CREATE FUNCTION security.consume_rate_limit(
  target_policy_key text,
  target_subject_hash character(64),
  target_window_seconds integer,
  target_request_limit integer,
  observed_at timestamptz DEFAULT now()
)
RETURNS TABLE (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer,
  current_count integer,
  window_expires_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  bucket_started_at timestamptz;
  bucket_expires_at timestamptz;
  bucket_count integer;
BEGIN
  IF target_policy_key !~ '^[a-z][a-z0-9_]{2,79}$' THEN
    RAISE EXCEPTION 'Rate-limit policy key is invalid';
  END IF;
  IF target_subject_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Rate-limit subject hash is invalid';
  END IF;
  IF target_window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'Rate-limit window is outside the bounded range';
  END IF;
  IF target_request_limit NOT BETWEEN 1 AND 100000 THEN
    RAISE EXCEPTION 'Rate-limit request limit is outside the bounded range';
  END IF;

  bucket_started_at := to_timestamp(
    floor(extract(epoch FROM observed_at) / target_window_seconds) * target_window_seconds
  );
  bucket_expires_at := bucket_started_at + make_interval(secs => target_window_seconds);

  INSERT INTO security.rate_limit_buckets (
    policy_key,
    subject_hash,
    window_started_at,
    window_seconds,
    request_count,
    expires_at
  ) VALUES (
    target_policy_key,
    target_subject_hash,
    bucket_started_at,
    target_window_seconds,
    1,
    bucket_expires_at
  )
  ON CONFLICT (policy_key, subject_hash, window_started_at)
  DO UPDATE SET
    request_count = security.rate_limit_buckets.request_count + 1,
    updated_at = observed_at
  RETURNING request_count INTO bucket_count;

  RETURN QUERY SELECT
    bucket_count <= target_request_limit,
    greatest(target_request_limit - bucket_count, 0),
    greatest(ceil(extract(epoch FROM bucket_expires_at - observed_at))::integer, 1),
    bucket_count,
    bucket_expires_at;
END;
$$;

CREATE FUNCTION security.prune_expired_rate_limits(
  observed_at timestamptz DEFAULT now(),
  retention_interval interval DEFAULT interval '1 hour'
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF retention_interval < interval '0 seconds' OR retention_interval > interval '7 days' THEN
    RAISE EXCEPTION 'Rate-limit retention interval is outside the bounded range';
  END IF;

  DELETE FROM security.rate_limit_buckets
  WHERE expires_at < observed_at - retention_interval;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON SCHEMA security IS
  'Cross-domain security controls that contain no participant content or raw network identifiers.';
COMMENT ON TABLE security.rate_limit_buckets IS
  'Distributed fixed-window counters keyed only by bounded policy and HMAC-derived subject hash.';
COMMENT ON FUNCTION security.consume_rate_limit(text, character, integer, integer, timestamptz) IS
  'Atomically consumes one distributed rate-limit allowance and returns bounded retry metadata.';
