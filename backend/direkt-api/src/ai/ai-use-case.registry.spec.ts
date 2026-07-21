import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAiUseCaseDefinition, listAiUseCaseDefinitions } from './ai-use-case.registry';

describe('AI use-case registry', () => {
  it('requires bounded governance fields for every registered use case', () => {
    for (const definition of listAiUseCaseDefinitions()) {
      expect(definition.key.length).toBeGreaterThan(3);
      expect(definition.allowedInputClasses.length).toBeGreaterThan(0);
      expect(definition.prohibitedInputClasses).toContain('secrets');
      expect(definition.maxInputChars).toBeGreaterThan(0);
      expect(definition.maxLatencyMs).toBeGreaterThan(0);
      expect(definition.evaluationSuite).toContain('.evaluation.json');
      expect(definition.promptVersion).toMatch(/-v\d+$/);
      expect(definition.killSwitchEnv).toMatch(/^DIREKT_AI_[A-Z0-9_]+_MODE$/);
      expect(definition.fallback.length).toBeGreaterThan(10);
    }
  });

  it('requires a source-controlled evaluation suite for every implemented use case', () => {
    for (const definition of listAiUseCaseDefinitions().filter(
      (entry) => entry.activation === 'implemented',
    )) {
      expect(existsSync(resolve(process.cwd(), definition.evaluationSuite))).toBe(true);
    }
  });

  it('keeps restricted operations AI gated and prohibits secrets', () => {
    const definition = getAiUseCaseDefinition('operations.case.summary');

    expect(definition.activation).toBe('restricted-gated');
    expect(definition.allowedInputClasses).toEqual(['restricted-trust-evidence']);
    expect(definition.prohibitedInputClasses).toContain('secrets');
    expect(definition.humanConfirmationRequired).toBe(true);
  });

  it('requires confirmation and deterministic fallback for discovery intent assistance', () => {
    const definition = getAiUseCaseDefinition('customer.discovery.intent');

    expect(definition.activation).toBe('implemented');
    expect(definition.humanConfirmationRequired).toBe(true);
    expect(definition.allowedInputClasses).toEqual(['public-safe']);
    expect(definition.prohibitedInputClasses).toEqual([
      'account-private',
      'restricted-trust-evidence',
      'secrets',
    ]);
    expect(definition.fallback).toContain('Deterministic');
  });
});
