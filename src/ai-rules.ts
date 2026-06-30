import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type AiRulesPlatform = 'cursor' | 'claude' | 'other';
export type AiPlatformChoice = AiRulesPlatform | 'none';

export const AI_PLATFORM_CHOICES: { value: AiPlatformChoice; label: string }[] = [
  { value: 'cursor', label: 'Cursor (.cursor/rules/*.mdc)' },
  { value: 'claude', label: 'Claude Code (.claude/rules/*.md + CLAUDE.md)' },
  { value: 'other', label: 'AGENTS.md + GitHub Copilot instructions' },
  { value: 'none', label: 'Skip AI rules' },
];

function aiRulesPackageRoot() {
  const packageJsonPath = import.meta.resolve('@thomaslorincz/ai-rules/package.json');
  return path.dirname(fileURLToPath(packageJsonPath));
}

export function aiRulesCliPath() {
  return path.join(aiRulesPackageRoot(), 'dist', 'cli.js');
}
