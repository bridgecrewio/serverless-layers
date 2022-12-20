import * as AWS from 'aws-sdk';

const fs = require('fs');

class ArtifactoryS3BucketService {
  constructor(serverlessLayersConfig) {
    this.artifactoryBucketName = serverlessLayersConfig.artifactoryBucketName;
    this.artifactoryHashKey = serverlessLayersConfig.artifactoryHashKey;
    this.artifactoryLayerName = serverlessLayersConfig.artifactoryLayerName;

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

  async downloadLayerFile() {
    try {
      const params = {
        Bucket: this.artifactoryBucketName,
        Key: `${this.artifactoryLayerName}/${this.artifactoryHashKey}.json`
      };

      console.debug(`going to download  key ${this.artifactoryHashKey} from bucket ${this.artifactoryBucketName} in region ${this.s3Client.config.region} and endpoint ${this.s3Client.config.endpoint}`);
      const response = await this.s3Client.getObject(params).promise();

      return JSON.parse(response.Body.toString()).layerInfo.layerArn;
    } catch (e) {
      // @ts-ignore
      if (e.code === 'NoSuchKey') {
        console.debug(`key ${this.artifactoryLayerName}/${this.artifactoryHashKey}.json was not found in bucket ${this.artifactoryBucketName}`);
        return undefined;
      }

      console.error(`could not query bucket ${this.artifactoryBucketName} for key ${this.artifactoryHashKey}`, e);
      throw e;
    }
  }

  async uploadLayerZipFile(zipKey) {
    console.debug(`going to upload file ${zipKey}.zip to ${zipKey}`);

    const zipFile = await fs.createReadStream((`${this.artifactoryLayerName}.zip`));

    const params = {
      Bucket: this.artifactoryBucketName,
      Key: `${this.artifactoryLayerName}/${zipKey}.zip`,
      Body: zipFile,
      ContentType: 'application/zip'
    };
    const response = await this.s3Client.putObject(params).promise();

    console.debug(`file ${zipKey}.zip was uploaded to ${this.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }

  async uploadHashMappingFile(layerArn) {
    console.debug(`going to upload mapping hash file ${this.artifactoryLayerName}/${this.artifactoryHashKey}.json to bucker ${this.artifactoryBucketName}`);
    const params = {
      Bucket: this.artifactoryBucketName,
      Key: `${this.artifactoryLayerName}/${this.artifactoryHashKey}.json`,
      Body: this.generateHashMappingFileContent(layerArn),
      ContentType: 'application/zip'
    };

    const response = await this.s3Client.putObject(params).promise();

    console.debug(`file ${this.artifactoryLayerName}/${this.artifactoryHashKey}.json was successfully uploaded to ${this.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }

  generateHashMappingFileContent(layerArn) {
    return JSON.stringify({
      layerInfo: {
        packagesHash: this.artifactoryHashKey,
        layerArn
      }
    });
  }
}

module.exports = ArtifactoryS3BucketService;
