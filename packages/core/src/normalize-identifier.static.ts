import { InjectableIdentifier } from '@automock/common';

export function normalizeIdentifier(
  identifier: InjectableIdentifier,
  metadata?: never
): { identifier: InjectableIdentifier; metadata?: never } {
  if (metadata) {
    return Object.assign({ identifier }, { metadata });
  }

  return { identifier };
}
