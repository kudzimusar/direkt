#!/usr/bin/env bash
set -euo pipefail

echo "::add-mask::${API_ID_TOKEN}"
echo "::add-mask::${WEB_ID_TOKEN}"
ah="X-Serverless-Authorization: Bearer ${API_ID_TOKEN}"
wh="X-Serverless-Authorization: Bearer ${WEB_ID_TOKEN}"
suffix="${SOURCE_SHA:0:10}"
contact="w6-${suffix}@example.invalid"
jar="${RUNNER_TEMP}/w6-cookies.txt"

unauth_api="$(curl -sS -o /dev/null -w '%{http_code}' "${API_URL}/api/v1/health/ready" || true)"
unauth_web="$(curl -sS -o /dev/null -w '%{http_code}' "${WEB_URL}/" || true)"
test "${unauth_api}" = "403"
test "${unauth_web}" = "403"

curl -fsS -H "${ah}" -X POST -H 'content-type: application/json' \
  --data "$(jq -n --arg contact "${contact}" '{channel:"email",contact:$contact}')" \
  "${API_URL}/api/v1/auth/challenges" > "${RUNNER_TEMP}/api-challenge.json"
api_challenge="$(jq -r '.challengeId' "${RUNNER_TEMP}/api-challenge.json")"
api_code="$(jq -r '.synthetic.code' "${RUNNER_TEMP}/api-challenge.json")"
curl -fsS -H "${ah}" -X POST -H 'content-type: application/json' \
  --data "$(jq -n --arg challengeId "${api_challenge}" --arg code "${api_code}" '{challengeId:$challengeId,code:$code,deviceLabel:"W6 fixture provisioner"}')" \
  "${API_URL}/api/v1/auth/challenges/verify" > "${RUNNER_TEMP}/api-session.json"
access="$(jq -r '.accessToken' "${RUNNER_TEMP}/api-session.json")"
test -n "${access}"
echo "::add-mask::${access}"
apph="Authorization: Bearer ${access}"

jq -n --arg suffix "${suffix}" '{pathway:"experienced_informal",displayName:("W6 Synthetic Provider " + $suffix),operatingModel:"mobile",localitySummary:"Kabwata, Lusaka",serviceAreaSummary:"Kabwata synthetic commercial area",experienceSummary:"Synthetic W6 commercial provider fixture only."}' > "${RUNNER_TEMP}/provider-create.json"
curl -fsS -H "${ah}" -H "${apph}" -X POST -H 'content-type: application/json' \
  --data @"${RUNNER_TEMP}/provider-create.json" "${API_URL}/api/v1/providers" > "${RUNNER_TEMP}/provider.json"
provider_id="$(jq -r '.id' "${RUNNER_TEMP}/provider.json")"
[[ "${provider_id}" =~ ^[0-9a-fA-F-]{36}$ ]]

curl -fsS -H "${wh}" -c "${jar}" "${WEB_URL}/api/auth/bootstrap" > "${RUNNER_TEMP}/bootstrap.json"
csrf="$(jq -r '.csrfToken' "${RUNNER_TEMP}/bootstrap.json")"
test -n "${csrf}"
curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -c "${jar}" -X POST -H 'content-type: application/json' \
  --data "$(jq -n --arg contact "${contact}" '{channel:"email",contact:$contact}')" "${WEB_URL}/api/auth/challenge" > "${RUNNER_TEMP}/web-challenge.json"
web_challenge="$(jq -r '.challengeId' "${RUNNER_TEMP}/web-challenge.json")"
web_code="$(jq -r '.synthetic.code' "${RUNNER_TEMP}/web-challenge.json")"
curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -c "${jar}" -X POST -H 'content-type: application/json' \
  --data "$(jq -n --arg challengeId "${web_challenge}" --arg code "${web_code}" '{challengeId:$challengeId,code:$code,deviceLabel:"W6 managed commercial canary"}')" "${WEB_URL}/api/auth/verify" > "${RUNNER_TEMP}/verify.json"
csrf="$(jq -r '.csrfToken' "${RUNNER_TEMP}/verify.json")"
test -n "${csrf}"

curl -fsS -H "${wh}" -b "${jar}" "${WEB_URL}/api/provider/state" > "${RUNNER_TEMP}/commercial-before.json"
jq -e --arg provider_id "${provider_id}" '
  .workspace.providerId == $provider_id
  and .commercial.providerScope == "actor_resolved"
  and (.commercial.products | length) > 0
  and .commercial.verificationMutation == false
  and .commercial.publicationMutation == false
  and .commercial.rankingMutation == false
  and .commercial.credentialStored == false
' "${RUNNER_TEMP}/commercial-before.json" >/dev/null

product_key="$(jq -r '.commercial.products[0].productKey' "${RUNNER_TEMP}/commercial-before.json")"
price_key="$(jq -r '.commercial.products[0].prices[] | select(.status == "active") | .priceKey' "${RUNNER_TEMP}/commercial-before.json" | head -1)"
test -n "${product_key}"
test -n "${price_key}"

subscription_key="web-commercial-w6-${suffix}"
subscription_action="$(jq -n --arg productKey "${product_key}" --arg priceKey "${price_key}" --arg idempotencyKey "${subscription_key}" '{action:"create-subscription",productKey:$productKey,priceKey:$priceKey,idempotencyKey:$idempotencyKey}')"
for attempt in 1 2; do
  curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -X POST -H 'content-type: application/json' \
    --data "${subscription_action}" "${WEB_URL}/api/provider/action" > "${RUNNER_TEMP}/subscription-${attempt}.json"
done
subscription_id="$(jq -r '.subscription.subscriptionId' "${RUNNER_TEMP}/subscription-1.json")"
test "${subscription_id}" = "$(jq -r '.subscription.subscriptionId' "${RUNNER_TEMP}/subscription-2.json")"
jq -e '.subscription.verificationEffect == false and .subscription.publicationEffect == false and .subscription.rankingEffect == false' "${RUNNER_TEMP}/subscription-1.json" >/dev/null

curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -X POST -H 'content-type: application/json' \
  --data "$(jq -n --arg id "${subscription_id}" '{action:"issue-invoice",subscriptionId:$id}')" "${WEB_URL}/api/provider/action" > "${RUNNER_TEMP}/invoice.json"
invoice_id="$(jq -r '.invoice.invoiceId' "${RUNNER_TEMP}/invoice.json")"
test -n "${invoice_id}"

payment_provider_mode="$(jq -r '.commercial.paymentProviderMode' "${RUNNER_TEMP}/commercial-before.json")"
payment_evidence="${payment_provider_mode}_fail_closed"
if [[ "${payment_provider_mode}" == "synthetic" ]]; then
  payment_key="web-payment-w6-${suffix}"
  payment_action="$(jq -n --arg id "${invoice_id}" --arg idempotencyKey "${payment_key}" '{action:"create-payment-intent",invoiceId:$id,idempotencyKey:$idempotencyKey}')"
  for attempt in 1 2; do
    curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -X POST -H 'content-type: application/json' \
      --data "${payment_action}" "${WEB_URL}/api/provider/action" > "${RUNNER_TEMP}/payment-${attempt}.json"
  done
  payment_id="$(jq -r '.paymentIntent.paymentIntentId' "${RUNNER_TEMP}/payment-1.json")"
  test "${payment_id}" = "$(jq -r '.paymentIntent.paymentIntentId' "${RUNNER_TEMP}/payment-2.json")"
  jq -e '.paymentIntent.action.productionMoneyMovement == false and .paymentIntent.action.credentialRequested == false and .paymentIntent.paymentCredentialIncluded == false and .paymentIntent.trustOrRankingMutation == false' "${RUNNER_TEMP}/payment-1.json" >/dev/null
  payment_revision="$(jq -r '.paymentIntent.revision' "${RUNNER_TEMP}/payment-1.json")"
  curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -X POST -H 'content-type: application/json' \
    --data "$(jq -n --arg id "${payment_id}" --argjson revision "${payment_revision}" '{action:"cancel-payment-intent",paymentIntentId:$id,expectedRevision:$revision}')" "${WEB_URL}/api/provider/action" > "${RUNNER_TEMP}/payment-cancel.json"
  jq -e '.paymentIntent.status == "cancelled"' "${RUNNER_TEMP}/payment-cancel.json" >/dev/null
  payment_evidence="synthetic_intent_verified"
else
  payment_key="web-payment-w6-${suffix}"
  status="$(curl -sS -o "${RUNNER_TEMP}/payment-disabled.json" -w '%{http_code}' -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -X POST -H 'content-type: application/json' --data "$(jq -n --arg id "${invoice_id}" --arg key "${payment_key}" '{action:"create-payment-intent",invoiceId:$id,idempotencyKey:$key}')" "${WEB_URL}/api/provider/action")"
  test "${status}" = "503"
  payment_evidence="disabled_fail_closed"
fi

subscription_revision="$(jq -r '.subscription.revision' "${RUNNER_TEMP}/subscription-1.json")"
curl -fsS -H "${wh}" -H "Origin: ${WEB_URL}" -H "x-direkt-csrf: ${csrf}" -b "${jar}" -X POST -H 'content-type: application/json' \
  --data "$(jq -n --arg id "${subscription_id}" --argjson revision "${subscription_revision}" '{action:"cancel-subscription",subscriptionId:$id,expectedRevision:$revision,reason:"Synthetic W6 managed canary cleanup"}')" "${WEB_URL}/api/provider/action" > "${RUNNER_TEMP}/subscription-cancel.json"
jq -e '.subscription.status == "cancelled"' "${RUNNER_TEMP}/subscription-cancel.json" >/dev/null

curl -fsS -H "${wh}" -b "${jar}" "${WEB_URL}/api/provider/state" > "${RUNNER_TEMP}/commercial-after.json"
jq -e --arg sid "${subscription_id}" '.commercial.subscriptions | any(.subscriptionId == $sid and .status == "cancelled")' "${RUNNER_TEMP}/commercial-after.json" >/dev/null
! grep -Eqi 'credentialValue|providerSecret|service_role|sb_secret_' "${RUNNER_TEMP}/commercial-after.json"

jq -n \
  --arg source "${SOURCE_SHA}" \
  --arg providerId "${provider_id}" \
  --arg paymentMode "${payment_evidence}" \
  '{source:$source,providerId:$providerId,dataMode:"synthetic-only",actorResolvedCommercial:true,productCatalogue:true,subscriptionIdempotency:true,invoiceLifecycle:true,paymentMode:$paymentMode,revisionControlledCancellation:true,noTrustEffects:true,noPaymentCredentials:true,unauthenticatedDenied:true}' \
  > "${RUNNER_TEMP}/w6-canary-evidence.json"
