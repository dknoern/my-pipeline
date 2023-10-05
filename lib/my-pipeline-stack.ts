import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { MyPipelineAppStage } from './my-pipeline-app-stage';

export class MyPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('dknoern/my-pipeline', 'main',{
          authentication: cdk.SecretValue.secretsManager('pipeline-token'),
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    const betaStage = pipeline.addStage(new MyPipelineAppStage(this, "beta", {
      env: { account: "484951121041", region: "us-west-2" }
    }));
    betaStage.addPost(new ManualApprovalStep('approval'));

  const gammaStage = pipeline.addStage(new MyPipelineAppStage(this, 'gamma', {
    env: { account: '484951121041', region: 'us-west-1' }
  }));

      
  }

  
}