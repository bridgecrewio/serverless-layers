import * as AWS from 'aws-sdk';
const fs = require('fs');

class ArtifactoryLayerService {
  constructor(serverlessLayersConfig, compatibleRuntimes) {
    this.artifactoryBucketName = serverlessLayersConfig.artifactoryBucketName;
    this.artifactoryHashKey = serverlessLayersConfig.artifactoryHashKey;
    this.artifactoryLayerName = serverlessLayersConfig.artifactoryLayerName;
    this.artifactoryLayerRegion = serverlessLayersConfig.artifactoryLayerRegion;

    this.lambdaLayerClient = new AWS.Lambda({
      region: serverlessLayersConfig.artifactoryRegion,
      credentials: {
        // @ts-ignore
        accessKeyId: serverlessLayersConfig.s3ArtifactoryAccessKeyId,
        // @ts-ignore
        secretAccessKey: serverlessLayersConfig.s3ArtifactorySecretAccessKey,
        sessionToken: serverlessLayersConfig.s3ArtifactorySessionToken
      }
    });

    this.compatibleRuntimes = compatibleRuntimes;
    this.layerName = serverlessLayersConfig.artifactoryLayerName;
  }

  async publishLayerFromArtifactory(s3FileKey) {
    const params = {
      Content: { /* required */
        S3Bucket: this.artifactoryBucketName,
        S3Key: s3FileKey,
        ZipFile: fs.readFileSync(s3FileKey)
      },
      LayerName: this.layerName,
      CompatibleRuntimes: this.compatibleRuntimes,
      Description: 'created by serverless-layers plugin from artifactory'
    };
    const response = await this.lambdaLayerClient.publishLayerVersion(params).promise();
    await this.addLayerVersionPermissionForAwsAccountInTheSameRegion(response.LayerVersionArn, response.Version);

    console.log(`new layer version published, response is - ${JSON.stringify(response)}`);
    return response.LayerVersionArn;
  }

  async addLayerVersionPermissionForAwsAccountInTheSameRegion(layerArn, versionNumber) {
    const response = await this.lambdaLayerClient.addLayerVersionPermission({
      LayerName: layerArn,
      VersionNumber: versionNumber,
      StatementId: `later-version-permission-for-${this.artifactoryLayerRegion}`,
      Action: 'lambda:GetLayerVersion',
      Principal: '*',
      OrganizationId: 'need to fetch from ssm'
    }).promise();

    console.log(`new permission for layer ${layerArn} in ${this.artifactoryLayerRegion}, response is - ${JSON.stringify(response)}`);
  }
}

module.exports = ArtifactoryLayerService;
