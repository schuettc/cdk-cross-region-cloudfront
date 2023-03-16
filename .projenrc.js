const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.69.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-cross-region-cloudfront',
  license: 'MIT-0',
  author: 'Court Schuett',
  copyrightOwner: 'Court Schuett',
  authorAddress: 'https://subaud.io',
  defaultReleaseBranch: 'main',
  appEntrypoint: 'cdk-cross-region-cloudfront',
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['schuettc'],
  },
  autoApproveUpgrades: true,
  devDeps: ['esbuild'],
  deps: ['dotenv', 'fs-extra', '@types/fs-extra'],
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  defaultReleaseBranch: 'main',
});
const common_exclude = [
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
  'dependabot.yml',
  '.DS_Store',
  '.env',
];

project.addTask('launch', {
  exec: 'yarn && yarn projen && yarn build && yarn cdk bootstrap && yarn cdk deploy --all',
});

project.gitignore.exclude(...common_exclude);
project.synth();
