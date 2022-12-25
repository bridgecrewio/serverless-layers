import * as AWS from 'aws-sdk';

const fs = require('fs');

export class ArtifactoryS3BucketService {
  constructor(serverlessLayersConfig) {
    this.serverlessLayersConfig = serverlessLayersConfig;

    this.s3Client = new AWS.S3({
      region: serverlessLayersConfig.artifactoryRegion,
      credentials: {
        // @ts-ignore
        accessKeyId: serverlessLayersConfig.s3ArtifactoryAccessKeyId,
        // @ts-ignore
        secretAccessKey: serverlessLayersConfig.s3ArtifactorySecretAccessKey,
        sessionToken: serverlessLayersConfig.s3ArtifactorySessionToken
      }
    });
  }

  async downloadLayerHashMappingJsonFile() {
    try {
      const params = {
        Bucket: this.serverlessLayersConfig.artifactoryBucketName,
        Key: this.serverlessLayersConfig.artifactoryJsonMappingKey
      };

      console.debug(`going to download hash mapping file - key ${this.serverlessLayersConfig.artifactoryJsonMappingKey} from bucket ${this.serverlessLayersConfig.artifactoryBucketName} in region ${this.s3Client.config.region} and endpoint ${this.s3Client.config.endpoint}`);
      const response = await this.s3Client.getObject(params).promise();

      return JSON.parse(response.Body.toString()).layerInfo.layerArn;
    } catch (e) {
      // @ts-ignore
      if (e.code === 'NoSuchKey') {
        console.debug(`key ${this.serverlessLayersConfig.artifactoryJsonMappingKey} was not found in bucket ${this.serverlessLayersConfig.artifactoryBucketName}`);
        return undefined;
      }

      console.error(`could not query bucket ${this.serverlessLayersConfig.artifactoryBucketName} for key ${this.serverlessLayersConfig.artifactoryJsonMappingKey}`, e);
      throw e;
    }
  }

  async uploadLayerHashMappingFile(layerArn) {
    const params = {
      Bucket: this.serverlessLayersConfig.artifactoryBucketName,
      Key: this.serverlessLayersConfig.artifactoryJsonMappingKey,
      Body: this.generateHashMappingFileContent(layerArn),
      ContentType: 'application/zip'
    };

    console.debug(`going to upload hash mapping file - key ${this.serverlessLayersConfig.artifactoryJsonMappingKey} for bucket ${this.serverlessLayersConfig.artifactoryBucketName}`);

    const response = await this.s3Client.putObject(params).promise();

    console.debug(`file ${this.serverlessLayersConfig.artifactoryJsonMappingKey} was successfully uploaded to ${this.serverlessLayersConfig.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }

  generateHashMappingFileContent(layerArn) {
    return JSON.stringify({
      layerInfo: {
        packagesHash: this.serverlessLayersConfig.artifactoryHashKey,
        layerArn
      }
    });
  }

  async uploadLayerZipFile() {
    console.debug(`going to upload file ${this.serverlessLayersConfig.tempArtifactoryZipFileName} to ${this.serverlessLayersConfig.artifactoryBucketName} bucket for key ${this.serverlessLayersConfig.artifactoryZipKey}`);

    const zipFile = await fs.createReadStream((this.serverlessLayersConfig.tempArtifactoryZipFileName));

    const params = {
      Bucket: this.serverlessLayersConfig.artifactoryBucketName,
      Key: this.serverlessLayersConfig.artifactoryZipKey,
      Body: zipFile,
      ContentType: 'application/zip'
    };
    const response = await this.s3Client.putObject(params).promise();

    console.debug(`file ${this.serverlessLayersConfig.artifactoryZipKey} was uploaded to ${this.serverlessLayersConfig.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }
}
