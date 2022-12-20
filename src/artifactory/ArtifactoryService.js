const { ArtifactoryS3BucketService } = require('./ArtifactoryS3BucketService');
const { ArtifactoryLayerService } = require('./ArtifactoryLayerService');

export class ArtifactoryService {

  constructor(serverlessLayersConfig, zipService, plugin) {
    this.artifactoryS3BucketService = new ArtifactoryS3BucketService(serverlessLayersConfig);
    this.artifactoryLayerService = new ArtifactoryLayerService(serverlessLayersConfig, plugin.settings.compatibleRuntimes) //TODO - check if lazy initialization
    // this.artifactoryBucketName = serverlessLayersConfig.artifactoryBucketName;
    // this.artifactoryHashKey = serverlessLayersConfig.artifactoryHashKey;
    this.artifactoryLayerName = serverlessLayersConfig.artifactoryLayerName;
    this.zipFileKey = `${this.artifactoryLayerName}.zip`;
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
    // upload file to artifactory {hash:version}

    let layerVersionArn = this.artifactoryS3BucketService.downloadLayerFile();
    if (!layerVersionArn) {
      await this.zipService.package(this.zipFileKey);
      await this.artifactoryS3BucketService.uploadLayerZipFile(this.zipFileKey);
      layerVersionArn = await this.artifactoryLayerService.publishLayerFromArtifactory(this.zipFileKey);
      await this.artifactoryS3BucketService.uploadHashMappingFile(layerVersionArn);
    }

    return layerVersionArn;

    // this.relateLayerWithFunctions(version.LayerVersionArn); ??
    // upload file to artifactory {hash:version}
  }

}
