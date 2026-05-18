import { Condition, AccessContext } from '../types';

export function evaluateCondition(condition: Condition, context: AccessContext): boolean {
  // Handle logical blocks
  if (condition.and) {
    return condition.and.every(c => evaluateCondition(c, context));
  }
  if (condition.or) {
    return condition.or.some(c => evaluateCondition(c, context));
  }
  if (condition.not) {
    return !evaluateCondition(condition.not, context);
  }

  // Handle leaf condition
  const { field, operator, value } = condition;
  if (!field || !operator) return true;

  const actualValue = context[field];

  switch (operator) {
    case 'eq':
      return actualValue === value;
    case 'neq':
      return actualValue !== value;
    case 'in':
      return Array.isArray(value) && value.includes(actualValue);
    case 'nin':
      return Array.isArray(value) && !value.includes(actualValue);
    case 'gt':
      return actualValue > value;
    case 'gte':
      return actualValue >= value;
    case 'lt':
      return actualValue < value;
    case 'lte':
      return actualValue <= value;
    case 'contains':
      return (
        (typeof actualValue === 'string' && actualValue.includes(value)) ||
        (Array.isArray(actualValue) && actualValue.includes(value))
      );
    case 'regex':
      return new RegExp(value).test(actualValue);
    case 'exists':
      return actualValue !== undefined && actualValue !== null;
    default:
      return false;
  }
}

export function evaluateConditions(conditions: Condition | Condition[], context: AccessContext): boolean {
  if (!conditions) return true;
  if (Array.isArray(conditions)) {
    if (conditions.length === 0) return true;
    return conditions.every(c => evaluateCondition(c, context));
  }
  return evaluateCondition(conditions, context);
}

