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
      console.debug(`going to download  key ${this.artifactoryHashKey} from bucket ${this.artifactoryBucketName} in region ${this.s3Client.config.region} and endpoint ${this.s3Client.config.endpoint}`);
      const response = this.s3Client.getObject({
        Bucket: this.artifactoryBucketName,
        Key: `${this.artifactoryLayerName}/${this.artifactoryHashKey}.json`
      }).promise();

      const responseParsed = response.Body?.toString();
      return responseParsed;
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

  async uploadLayerZipFile() {
    console.debug(`going to upload file ${this.artifactoryLayerName}.zip to ${this.artifactoryBucketName}`);

    const zipFile = await fs.createReadStream((`${zipFileKeyName}.zip`));
    const response = await this.s3Client.putObject({
      Bucket: this.bucketName,
      Key: `${this.artifactoryHashKey}/${this.artifactoryLayerName}/${this.artifactoryLayerName}.zip`,
      Body: zipFile,
      ContentType: 'application/zip'
    }).promise();

    console.debug(`file ${this.artifactoryLayerName}.zip was uploaded to ${this.artifactoryBucketName}, response is: ${JSON.stringify(response)}`);
  }
}

module.exports = ArtifactoryS3BucketService;
