import * as AWS from 'aws-sdk';
const { ArtifactoryS3BucketService } = require('./ArtifactoryS3BucketService');

export class ArtifactoryService {

  constructor(serverlessLayersConfig, zipService) {
    this.artifactoryS3BucketService = new ArtifactoryS3BucketService(serverlessLayersConfig);
    // this.artifactoryBucketName = serverlessLayersConfig.artifactoryBucketName;
    // this.artifactoryHashKey = serverlessLayersConfig.artifactoryHashKey;
    this.artifactoryLayerName = serverlessLayersConfig.artifactoryLayerName;
    //
    // this.s3Client = new AWS.S3({
    //   region: serverlessLayersConfig.artifactoryRegion,
    //   credentials: {
    //     // @ts-ignore
    //     accessKeyId: serverlessLayersConfig.s3ArtifactoryAccessKeyId,
    //     // @ts-ignore
    //     secretAccessKey: serverlessLayersConfig.s3ArtifactorySecretAccessKey,
    //     sessionToken: serverlessLayersConfig.s3ArtifactorySessionToken
    //   }
    // });

    this.zipService = zipService;
  }

  async updateLayerFromArtifactory() {
    // check if hash - key exists in bucket - if so - download json file, check the version and arn and update lambda layer
    // if not exists - do all the package stuff and upload
    // await this.zipService.package();
    // await this.bucketService.uploadZipFile();
    // const version = await this.layersService.publishVersion();
    // this.relateLayerWithFunctions(version.LayerVersionArn); ??

    const version = this.artifactoryS3BucketService.downloadLayerFile();
    if (!version) {
      await this.zipService.package(`${this.artifactoryLayerName}.zip`);
      await this.artifactoryS3BucketService.uploadLayerZipFile();

    }
  }

}
