const AWS = require('aws-sdk');

const fs = require('fs');

class ArtifactoryS3BucketService {
  constructor(serverlessLayersConfig, path) {
    this.serverlessLayersConfig = serverlessLayersConfig;
    this.s3Client = {};
    this.currentPath = path;
  }

  initService() {
    this.s3Client = new AWS.S3({
      region: this.serverlessLayersConfig.artifactoryRegion,
      credentials: {
        accessKeyId: this.serverlessLayersConfig.s3ArtifactoryAccessKeyId,
        secretAccessKey: this.serverlessLayersConfig.s3ArtifactorySecretAccessKey,
        sessionToken: this.serverlessLayersConfig.s3ArtifactorySessionToken
      }
    });
  }

  async downloadLayerHashMappingJsonFile() {
    console.debug(`[ LayersPlugin - Artifacts ]: going to download hash mapping file - key ${this.serverlessLayersConfig.artifactoryJsonMappingKey} from bucket ${this.serverlessLayersConfig.artifactoryBucketName} in region ${this.s3Client.config.region} and endpoint ${this.s3Client.config.endpoint}`);

    try {
      const params = {
        Bucket: this.serverlessLayersConfig.artifactoryBucketName,
        Key: this.serverlessLayersConfig.artifactoryJsonMappingKey
      };

      const response = await this.s3Client.getObject(params).promise();

      return JSON.parse(response.Body.toString()).layerInfo.layerArn;
    } catch (e) {
      if (e.code === 'NoSuchKey') {
        console.debug(`[ LayersPlugin - Artifacts ]: key ${this.serverlessLayersConfig.artifactoryJsonMappingKey} was not found in bucket ${this.serverlessLayersConfig.artifactoryBucketName}`);
        return undefined;
      }

      console.error(`[ LayersPlugin - Artifacts ]: could not query bucket ${this.serverlessLayersConfig.artifactoryBucketName} for key ${this.serverlessLayersConfig.artifactoryJsonMappingKey}`, e);
      throw e;
    }
  }

  async uploadLayerHashMappingFile(layerArn) {
    console.debug(`[ LayersPlugin - Artifacts ]: going to upload hash mapping file - key ${this.serverlessLayersConfig.artifactoryJsonMappingKey} for bucket ${this.serverlessLayersConfig.artifactoryBucketName}`);

    const params = {
      Bucket: this.serverlessLayersConfig.artifactoryBucketName,
      Key: this.serverlessLayersConfig.artifactoryJsonMappingKey,
      Body: this.generateHashMappingFileContent(layerArn),
      ContentType: 'application/zip'
    };

    const response = await this.s3Client.putObject(params).promise();

    console.debug(`[ LayersPlugin - Artifacts ]: file ${this.serverlessLayersConfig.artifactoryJsonMappingKey} was successfully uploaded to ${this.serverlessLayersConfig.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }

  generateHashMappingFileContent(layerArn) {
    return JSON.stringify({
      layerInfo: {
        packagesHash: this.serverlessLayersConfig.artifactoryHashKey,
        layerArn
      }
    });
  }

  async uploadLayerZipFile(zipFileName) {
    console.debug(`[ LayersPlugin - Artifacts ]: going to upload file ${zipFileName} to ${this.serverlessLayersConfig.artifactoryBucketName} bucket for key ${this.serverlessLayersConfig.artifactoryZipKey}`);

    console.debug(`[ LayersPlugin - Artifacts ]: going to list files for path ${this.currentPath}`);
    let files = fs.readdirSync(this.currentPath);
    console.debug(`[ LayersPlugin - Artifacts ]: ls for ${this.currentPath}: ${files}`);

    console.debug(`[ LayersPlugin - Artifacts ]: cwd: ${process.cwd()}, going to list files for path ${process.cwd()}`);
    files = fs.readdirSync(process.cwd());
    console.debug(`[ LayersPlugin - Artifacts ]: cwd: ls for ${process.cwd()}: ${files}`);

    const zipFile = await fs.createReadStream(zipFileName);

    const params = {
      Bucket: this.serverlessLayersConfig.artifactoryBucketName,
      Key: this.serverlessLayersConfig.artifactoryZipKey,
      Body: zipFile,
      ContentType: 'application/zip'
    };
    const response = await this.s3Client.putObject(params).promise();

    console.debug(`[ LayersPlugin - Artifacts ]: file ${this.serverlessLayersConfig.artifactoryZipKey} was uploaded to ${this.serverlessLayersConfig.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }
}

module.exports = { ArtifactoryS3BucketService };
