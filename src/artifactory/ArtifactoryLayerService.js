import * as AWS from 'aws-sdk';

export class ArtifactoryLayerService {
  constructor(serverlessLayersConfig, compatibleRuntimes) {
    this.serverlessLayersConfig = serverlessLayersConfig;

    this.lambdaLayerClient = new AWS.Lambda({
      region: serverlessLayersConfig.artifactoryRegion,
      credentials: {
        accessKeyId: serverlessLayersConfig.s3ArtifactoryAccessKeyId,
        secretAccessKey: serverlessLayersConfig.s3ArtifactorySecretAccessKey,
        sessionToken: serverlessLayersConfig.s3ArtifactorySessionToken
      }
    });

    this.compatibleRuntimes = compatibleRuntimes;
  }

  async publishLayerFromArtifactory() {
    console.log(`[ LayersPlugin - Artifacts ]: going to publish new layer version from artifactory, layer zip is in bucket ${this.serverlessLayersConfig.artifactoryBucketName} and zip key is ${this.serverlessLayersConfig.artifactoryZipKey}, layer name is ${this.serverlessLayersConfig.artifactoryLayerName} for the following runtimes ${this.compatibleRuntimes}`);

    const params = {
      Content: {
        S3Bucket: this.serverlessLayersConfig.artifactoryBucketName,
        S3Key: this.serverlessLayersConfig.artifactoryZipKey
      },
      LayerName: this.serverlessLayersConfig.artifactoryLayerName,
      Description: 'created by serverless-layers plugin from artifactory',
      CompatibleRuntimes: this.compatibleRuntimes
    };

    const response = await this.lambdaLayerClient.publishLayerVersion(params).promise();
    console.log(`[ LayersPlugin - Artifacts ]: new layer version published, response is - ${JSON.stringify(response)}`);

    await this.addLayerVersionPermissionForAwsAccountInTheSameRegion(response.LayerArn, response.Version);

    return response.LayerVersionArn;
  }

  async addLayerVersionPermissionForAwsAccountInTheSameRegion(layerArn, versionNumber) {
    console.log(`[ LayersPlugin - Artifacts ]: going to add layer version permissions for layer arn ${layerArn} and version number ${versionNumber} for region ${this.serverlessLayersConfig.artifactoryRegion}`);

    const response = await this.lambdaLayerClient.addLayerVersionPermission({
      LayerName: layerArn,
      VersionNumber: versionNumber,
      StatementId: `layer-version-permission-for-${this.serverlessLayersConfig.artifactoryRegion}`,
      Action: 'lambda:GetLayerVersion',
      Principal: '*',
      OrganizationId: this.serverlessLayersConfig.organizationId
    }).promise();

    console.log(`[ LayersPlugin - Artifacts ]: new permission was added for layer ${layerArn} in ${this.serverlessLayersConfig.artifactoryRegion}, response is - ${JSON.stringify(response)}`);
  }
}
