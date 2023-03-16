/* eslint-disable import/no-extraneous-dependencies */
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface CertificateResourcesProps {
  siteSubdomain: string;
  domain: string;
  hostedZoneId: string;
}
export class CertificateResources extends Construct {
  public readonly siteCertificate: Certificate;

  constructor(scope: Construct, id: string, props: CertificateResourcesProps) {
    super(scope, id);

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
      zoneName: props.domain,
      hostedZoneId: props.hostedZoneId,
    });

    this.siteCertificate = new Certificate(this, 'siteCertificate', {
      domainName: props.siteSubdomain + '.' + props.domain,
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
