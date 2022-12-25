const { ArtifactoryS3BucketService } = require('./ArtifactoryS3BucketService');
const { ArtifactoryLayerService } = require('./ArtifactoryLayerService');

export class ArtifactoryService {

  constructor(serverlessLayersConfig, zipService, plugin) {
    this.artifactoryS3BucketService = new ArtifactoryS3BucketService(serverlessLayersConfig);
    this.artifactoryLayerService = new ArtifactoryLayerService(serverlessLayersConfig, plugin.settings.compatibleRuntimes) //TODO - check if lazy initialization
    this.tempArtifactoryZipFileName = serverlessLayersConfig.tempArtifactoryZipFileName;
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

    let layerVersionArn = await this.artifactoryS3BucketService.downloadLayerHashMappingJsonFile();
    if (!layerVersionArn) {
      await this.zipService.package(this.tempArtifactoryZipFileName);
      await this.artifactoryS3BucketService.uploadLayerZipFile();
      layerVersionArn = await this.artifactoryLayerService.publishLayerFromArtifactory();
      await this.artifactoryS3BucketService.uploadLayerHashMappingFile(layerVersionArn);
    }

    return layerVersionArn;
  }
}
