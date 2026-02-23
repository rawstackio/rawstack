import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';

/**
 * Opt-in domain configuration for stacks.
 *
 * When provided, stacks should:
 * - request/attach an ACM certificate
 * - attach the domain alias to CloudFront/ALB
 * - create Route53 records
 */
export interface DomainConfig {
  /**
   * The apex hosted zone name, e.g. "example.com" (no trailing dot).
   */
  readonly hostedZoneName: string;

  /**
   * Optional explicit hosted zone id. If omitted, `fromLookup` is used.
   */
  readonly hostedZoneId?: string;

  /**
   * The full record name you want to use, e.g. "app.example.com".
   */
  readonly domainName: string;

  /**
   * Also create a record for the `www.` version that aliases to the same target.
   *
   * Only used when `domainName` is the apex domain or when you explicitly want it.
   */
  readonly addWww?: boolean;
}

export function isDomainConfigEnabled(cfg?: DomainConfig): cfg is DomainConfig {
  return !!cfg && !!cfg.domainName && !!cfg.hostedZoneName;
}

export function getHostedZone(
  scope: Construct,
  cfg: DomainConfig,
  id: string = 'HostedZone'
): route53.IHostedZone {
  if (cfg.hostedZoneId) {
    return route53.HostedZone.fromHostedZoneAttributes(scope, id, {
      hostedZoneId: cfg.hostedZoneId,
      zoneName: cfg.hostedZoneName,
    });
  }

  // fromLookup requires context lookups; works fine in standard CDK workflows.
  return route53.HostedZone.fromLookup(scope, id, {
    domainName: cfg.hostedZoneName,
  });
}

export function toWwwDomain(domainName: string): string {
  return domainName.startsWith('www.') ? domainName : `www.${domainName}`;
}
