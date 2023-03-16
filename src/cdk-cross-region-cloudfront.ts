/* eslint-disable import/no-extraneous-dependencies */
import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import { SiteResources, CertificateResources } from './';

config();

interface CertificateStackProps extends StackProps {
  siteSubdomain: string;
  domain: string;
  hostedZoneId: string;
}

export class CertificateStack extends Stack {
  siteCertificate: Certificate;
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const certificateResources = new CertificateResources(this, 'certificate', {
      siteSubdomain: props.siteSubdomain,
      domain: props.domain,
      hostedZoneId: props.hostedZoneId,
    });

    this.siteCertificate = certificateResources.siteCertificate;
  }
}

interface SiteStackProps extends StackProps {
  siteCertificate: Certificate;
  siteSubdomain: string;
  domain: string;
  hostedZoneId: string;
}

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const site = new SiteResources(this, 'site', {
      siteCertificate: props.siteCertificate,
      siteSubdomain: props.siteSubdomain,
      domain: props.domain,
      hostedZoneId: props.hostedZoneId,
    });

    new CfnOutput(this, 'distributionURL', {
      value: site.distribution.domainName,
    });

    new CfnOutput(this, 'siteUrl', {
      value: `https://${props.siteSubdomain}.${props.domain}`,
    });
  }
}

const app = new App();

const certEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

const certProps = {
  siteSubdomain: process.env.SITE_SUBDOMAIN || '',
  domain: process.env.DOMAIN || '',
  hostedZoneId: process.env.HOSTED_ZONE_ID || '',
};

const certStack = new CertificateStack(app, 'CertificateStack', {
  ...certProps,
  env: certEnv,
  crossRegionReferences: true,
});

const siteEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-central-1',
};

const siteProps = {
  siteCertificate: certStack.siteCertificate,
  siteSubdomain: process.env.SITE_SUBDOMAIN || '',
  domain: process.env.DOMAIN || '',
  hostedZoneId: process.env.HOSTED_ZONE_ID || '',
};

new SiteStack(app, 'SiteStack', {
  ...siteProps,
  env: siteEnv,
  crossRegionReferences: true,
});

app.synth();
