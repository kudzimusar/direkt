from pathlib import Path


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"Expected one {label} target, found {count}")
    return source.replace(old, new)


def remediate_lifecycle_test() -> None:
    path = Path("test/e2e/interaction-lifecycle.e2e.spec.ts")
    source = path.read_text()

    source = replace_once(
        source,
        """interface TrustStateCounts {
  decisions: string;
  claims: string;
  publications: string;
}
""",
        """interface TrustStateCounts {
  decisions: string;
  claims: string;
  publications: string;
}

interface OperationsInteractionListView {
  interactionScope: 'privacy_safe';
  items: Array<{
    interactionId: string;
    customerIdentityExposed: false;
    contactIncluded: false;
    privateEvidenceIncluded: false;
    internalModerationRationaleIncluded: false;
    trustOrRankingMutation: false;
  }>;
}

interface OperationsComplaintListView {
  phase7IncidentDataIncluded: false;
  items: ComplaintView[];
}
""",
        "lifecycle type",
    )

    source = replace_once(
        source,
        """    expect(operationsInteractions.body).toMatchObject({
      interactionScope: 'privacy_safe',
      items: expect.arrayContaining([
        expect.objectContaining({
          interactionId,
          customerIdentityExposed: false,
          contactIncluded: false,
          privateEvidenceIncluded: false,
          internalModerationRationaleIncluded: false,
          trustOrRankingMutation: false,
        }),
      ]),
    });
    expect(JSON.stringify(operationsInteractions.body)).not.toContain('+260 ••• •• 104');
    expect(JSON.stringify(operationsInteractions.body)).not.toContain(customer.identityId);
""",
        """    const operationsInteractionBody =
      operationsInteractions.body as OperationsInteractionListView;
    expect(operationsInteractionBody.interactionScope).toBe('privacy_safe');
    const operationsInteraction = operationsInteractionBody.items.find(
      (item) => item.interactionId === interactionId,
    );
    expect(operationsInteraction).toMatchObject({
      interactionId,
      customerIdentityExposed: false,
      contactIncluded: false,
      privateEvidenceIncluded: false,
      internalModerationRationaleIncluded: false,
      trustOrRankingMutation: false,
    });
    expect(JSON.stringify(operationsInteractionBody)).not.toContain('+260 ••• •• 104');
    expect(JSON.stringify(operationsInteractionBody)).not.toContain(customer.identityId);
""",
        "operations interaction assertion",
    )

    source = replace_once(
        source,
        """    expect(deniedAppeal.body as ReviewView).toMatchObject({
      moderationStatus: 'withheld',
      revision: 4,
      appeals: expect.arrayContaining([
        expect.objectContaining({
          appealId: firstAppealId,
          status: 'denied',
          decisionReasonCode: 'PRIVACY_REMAINS',
        }),
      ]),
    });
""",
        """    const deniedAppealReview = deniedAppeal.body as ReviewView;
    expect(deniedAppealReview).toMatchObject({
      moderationStatus: 'withheld',
      revision: 4,
    });
    const decidedAppeal = deniedAppealReview.appeals.find(
      (appeal) => appeal.appealId === firstAppealId,
    );
    expect(decidedAppeal).toMatchObject({
      appealId: firstAppealId,
      status: 'denied',
      decisionReasonCode: 'PRIVACY_REMAINS',
    });
""",
        "appeal assertion",
    )

    source = replace_once(
        source,
        """    expect(operationsComplaints.body).toMatchObject({
      phase7IncidentDataIncluded: false,
      items: expect.arrayContaining([
        expect.objectContaining({
          complaintId: complaint.complaintId,
          phase7IncidentLinked: false,
          contactIncluded: false,
        }),
      ]),
    });
""",
        """    const operationsComplaintBody =
      operationsComplaints.body as OperationsComplaintListView;
    expect(operationsComplaintBody.phase7IncidentDataIncluded).toBe(false);
    const operationsComplaint = operationsComplaintBody.items.find(
      (item) => item.complaintId === complaint.complaintId,
    );
    expect(operationsComplaint).toMatchObject({
      complaintId: complaint.complaintId,
      phase7IncidentLinked: false,
      contactIncluded: false,
    });
""",
        "operations complaint assertion",
    )

    path.write_text(source)


def remediate_handoff_repository() -> None:
    path = Path("src/interaction/interaction-handoff.repository.ts")
    source = path.read_text()

    obsolete_flag = "      trustOrPublicationMutation: false,\n"
    count = source.count(obsolete_flag)
    if count != 3:
        raise SystemExit(f"Expected three obsolete trust-mutation flags, found {count}")
    source = source.replace(obsolete_flag, "")

    old_event_flags = (
        "        actorIdentifierIncluded: false,\n"
        "        contactIncluded: false,\n"
        "        privateEvidenceIncluded: false,\n"
        "        internalModerationIncluded: false,\n"
    )
    new_event_flags = (
        "        actorIdentityExposed: false,\n"
        "        privateMetadataIncluded: false,\n"
    )
    source = replace_once(source, old_event_flags, new_event_flags, "event privacy projection")

    start_marker = "  private eligibility(row: InteractionRow, now: number): ReviewEligibilityView {"
    end_marker = "\n  private async providerContext"
    start = source.find(start_marker)
    end = source.find(end_marker, start)
    if start < 0 or end < 0:
        raise SystemExit("Could not locate the review eligibility method")

    eligibility = """  private eligibility(row: InteractionRow, now: number): ReviewEligibilityView {
    if (row.status === 'active') {
      return {
        eligible: false,
        reasonCode: 'INTERACTION_ACTIVE',
        eligibleFrom: null,
        eligibleUntil: null,
      };
    }
    if (row.status === 'cancelled') {
      return {
        eligible: false,
        reasonCode: 'INTERACTION_CANCELLED',
        eligibleFrom: null,
        eligibleUntil: null,
      };
    }
    if (row.review_exists) {
      return {
        eligible: false,
        reasonCode: 'ALREADY_REVIEWED',
        eligibleFrom: row.review_eligible_from?.toISOString() ?? null,
        eligibleUntil: row.review_eligible_until?.toISOString() ?? null,
      };
    }
    if (!row.review_eligible_from || !row.review_eligible_until) {
      throw new Error('Completed interaction is missing its review eligibility window.');
    }
    if (row.review_eligible_from.getTime() > now) {
      return {
        eligible: false,
        reasonCode: 'WINDOW_NOT_OPEN',
        eligibleFrom: row.review_eligible_from.toISOString(),
        eligibleUntil: row.review_eligible_until.toISOString(),
      };
    }
    if (row.review_eligible_until.getTime() <= now) {
      return {
        eligible: false,
        reasonCode: 'WINDOW_EXPIRED',
        eligibleFrom: row.review_eligible_from.toISOString(),
        eligibleUntil: row.review_eligible_until.toISOString(),
      };
    }
    return {
      eligible: true,
      reasonCode: 'ELIGIBLE',
      eligibleFrom: row.review_eligible_from.toISOString(),
      eligibleUntil: row.review_eligible_until.toISOString(),
    };
  }
"""
    source = source[:start] + eligibility + source[end:]
    path.write_text(source)


remediate_lifecycle_test()
remediate_handoff_repository()
