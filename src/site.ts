/* eslint-disable import/no-extraneous-dependencies */
import { execSync, ExecSyncOptions } from 'child_process';
import { Stack, RemovalPolicy, DockerImage } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  CachePolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Source, BucketDeployment } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as fsExtra from 'fs-extra';

interface SiteProps {
  siteCertificate: Certificate;
  siteSubdomain: string;
  domain: string;
  hostedZoneId: string;
}
export class SiteResources extends Construct {
  public readonly siteBucket: Bucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: SiteProps) {
    super(scope, id);

    this.siteBucket = new Bucket(this, 'websiteBucket', {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
      zoneName: props.domain,
      hostedZoneId: props.hostedZoneId,
    });

    this.distribution = new Distribution(this, 'CloudfrontDistribution', {
      enableLogging: true,
      domainNames: [props.siteSubdomain + '.' + props.domain],
      certificate: props.siteCertificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new S3Origin(this.siteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: 'index.html',
    });

    new ARecord(this, 'clientSiteARecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      recordName: props.siteSubdomain + '.' + props.domain,
    });

    const execOptions: ExecSyncOptions = { stdio: 'inherit' };

    const bundle = Source.asset('./site', {
      bundling: {
        command: [
          'sh',
          '-c',
          'echo "Docker build not supported. Please install esbuild."',
        ],
        image: DockerImage.fromRegistry('alpine'),
        local: {
          /* istanbul ignore next */
          tryBundle(outputDir: string) {
            try {
              execSync('esbuild --version', execOptions);
            } catch {
              return false;
            }
            execSync(
              'cd site && yarn install --frozen-lockfile && yarn build',
              execOptions,
            );
            fsExtra.copySync('./site/dist', outputDir, {});
            return true;
          },
        },
      },
    });

    const config = {
      siteRegion: Stack.of(this).region,
    };

    new BucketDeployment(this, 'DeployBucket', {
      sources: [bundle, Source.jsonData('config.json', config)],
      destinationBucket: this.siteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });
  }
}
