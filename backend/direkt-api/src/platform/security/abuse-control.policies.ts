export interface AbuseControlPolicy {
  key: string;
  method: string;
  pathPattern: RegExp;
  requestLimit: number;
  windowSeconds: number;
}

const POLICIES: readonly AbuseControlPolicy[] = [
  {
    key: 'auth_challenge_request',
    method: 'POST',
    pathPattern: /^\/api\/v1\/auth\/challenges$/,
    requestLimit: 5,
    windowSeconds: 300,
  },
  {
    key: 'auth_challenge_verify',
    method: 'POST',
    pathPattern: /^\/api\/v1\/auth\/challenges\/verify$/,
    requestLimit: 10,
    windowSeconds: 300,
  },
  {
    key: 'auth_firebase_exchange',
    method: 'POST',
    pathPattern: /^\/api\/v1\/auth\/firebase\/exchange$/,
    requestLimit: 10,
    windowSeconds: 300,
  },
  {
    key: 'auth_session_rotate',
    method: 'POST',
    pathPattern: /^\/api\/v1\/auth\/sessions\/rotate$/,
    requestLimit: 30,
    windowSeconds: 60,
  },
  {
    key: 'public_discovery_search',
    method: 'GET',
    pathPattern: /^\/api\/v1\/public\/providers\/search$/,
    requestLimit: 120,
    windowSeconds: 60,
  },
  {
    key: 'interaction_enquiry_create',
    method: 'POST',
    pathPattern: /^\/api\/v1\/enquiries$/,
    requestLimit: 20,
    windowSeconds: 600,
  },
  {
    key: 'interaction_review_create',
    method: 'POST',
    pathPattern: /^\/api\/v1\/interactions\/[0-9a-f-]{36}\/reviews$/i,
    requestLimit: 10,
    windowSeconds: 3600,
  },
  {
    key: 'interaction_review_report',
    method: 'POST',
    pathPattern: /^\/api\/v1\/reviews\/[0-9a-f-]{36}\/reports$/i,
    requestLimit: 10,
    windowSeconds: 3600,
  },
  {
    key: 'interaction_complaint_create',
    method: 'POST',
    pathPattern: /^\/api\/v1\/interactions\/[0-9a-f-]{36}\/complaints$/i,
    requestLimit: 5,
    windowSeconds: 3600,
  },
  {
    key: 'synthetic_payment_webhook',
    method: 'POST',
    pathPattern: /^\/api\/v1\/webhooks\/payments\/synthetic$/,
    requestLimit: 120,
    windowSeconds: 60,
  },
];

export function abuseControlPolicy(method: string, path: string): AbuseControlPolicy | null {
  const normalizedMethod = method.toUpperCase();
  return (
    POLICIES.find(
      (policy) => policy.method === normalizedMethod && policy.pathPattern.test(path),
    ) ?? null
  );
}

export function abuseControlPolicies(): readonly AbuseControlPolicy[] {
  return POLICIES;
}
