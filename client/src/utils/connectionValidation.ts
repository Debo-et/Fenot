// src/utils/connectionValidation.ts
import { Node } from 'reactflow';
import { COMPONENT_REGISTRY, ComponentCategory } from '../pages/ComponentRegistry';

// Re-export the category type for convenience
export type { ComponentCategory };

/**
 * Extracts the category from a node's metadata, falling back to registry lookup.
 */
export function getNodeCategory(node: Node): ComponentCategory | 'unknown' {
  // First try the category stored during node creation (metadata.category)
  const storedCategory = node.data?.metadata?.category as ComponentCategory | undefined;
  if (storedCategory) return storedCategory;

  // Fallback to registry using componentKey
  const componentKey = node.data?.componentKey;
  if (componentKey) {
    const def = COMPONENT_REGISTRY[componentKey];
    return def?.category || 'unknown';
  }

  return 'unknown';
}

/**
 * Result of a connection validation.
 */
export interface ValidationResult {
  allowed: boolean;
  reason?: string; // User-friendly message when not allowed
}

/**
 * Defines the compatibility rules between source and target categories.
 * This is easily extensible: add more rules as new categories or component types appear.
 */
const CATEGORY_RULES: Array<{
  source: ComponentCategory | ComponentCategory[];
  target: ComponentCategory | ComponentCategory[];
  allowed: boolean;
  reason?: string;
}> = [
  // Rule 1: Analytics → Visualization is allowed
  {
    source: 'analytics',
    target: 'visualization',
    allowed: true,
  },
  // Rule 2: Analytics → anything else is forbidden
  {
    source: 'analytics',
    target: ['input', 'transform', 'output', 'analytics'],
    allowed: false,
    reason: 'Analytics components can only connect to Visualization components.',
  },
  // Rule 3: Input or Transform → Visualization is forbidden
  {
    source: ['input', 'transform'],
    target: 'visualization',
    allowed: false,
    reason: 'Visualization components can only receive data from Analytics components.',
  },
  // Rule 4: Input/Transform → anything else is allowed (implicitly)
  // We don't need an explicit rule; the validator will default to 'allowed'
  // if no rule explicitly disallows it.
];

/**
 * Default validation: if no rule explicitly allows or disallows, we assume allowed.
 */
export function validateConnection(
  sourceNode: Node,
  targetNode: Node
): ValidationResult {
  const sourceCat = getNodeCategory(sourceNode);
  const targetCat = getNodeCategory(targetNode);

  // If either category is unknown, we disallow (or you could allow – here we disallow for safety)
  if (sourceCat === 'unknown' || targetCat === 'unknown') {
    return {
      allowed: false,
      reason: 'Cannot validate connection: unknown component type.',
    };
  }

  // Find a rule that matches both source and target
  for (const rule of CATEGORY_RULES) {
    const sourceMatches = Array.isArray(rule.source)
      ? rule.source.includes(sourceCat)
      : rule.source === sourceCat;

    const targetMatches = Array.isArray(rule.target)
      ? rule.target.includes(targetCat)
      : rule.target === targetCat;

    if (sourceMatches && targetMatches) {
      return {
        allowed: rule.allowed,
        reason: rule.allowed ? undefined : rule.reason,
      };
    }
  }

  // No rule explicitly prohibits → allowed
  return { allowed: true };
}