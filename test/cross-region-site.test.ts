import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CertificateStack } from '../src/cdk-cross-region-cloudfront';

const certStackProps = {
  siteSubdomain: process.env.SITE_SUBDOMAIN || '',
  domain: process.env.DOMAIN || '',
  hostedZoneId: process.env.HOSTED_ZONE_ID || '',
};

test('Snapshot', () => {
  const app = new App();
  const stack = new CertificateStack(app, 'certTest', {
    ...certStackProps,
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
