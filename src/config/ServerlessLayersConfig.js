export class ServerlessLayersConfig {
  constructor(options) {
    this.shouldInstallPackages = !options.shouldInstallPackages || (options.shouldInstallPackages === 'true');

    this.shouldUseLayersArtifactory = (options.shouldUseLayersArtifactory === 'true');
    this.artifactoryBucketName = options.artifactoryBucketName;
    this.artifactoryRegion = options.artifactoryRegion;

    this.s3ArtifactoryAccessKeyId = process.env.SLS_CODE_ARTIFACTS_AWS_ACCESS_KEY_ID;
    this.s3ArtifactorySecretAccessKey = process.env.SLS_CODE_ARTIFACTS_AWS_SECRET_ACCESS_KEY;
    this.s3ArtifactorySessionToken = process.env.SLS_CODE_ARTIFACTS_AWS_SESSION_TOKEN;

    this.artifactoryLayerName = options.artifactoryLayerName;
    this.artifactoryHashKey = options.artifactoryHashKey;
    this.artifactoryJsonMappingKey = `${this.artifactoryLayerName}/${this.artifactoryHashKey}.json`;
    this.artifactoryZipKey = `${options.artifactoryLayerName}/${options.artifactoryLayerName}.zip`;
    this.tempArtifactoryZipFileName = `${options.artifactoryLayerName}.zip`;

    this.organizationId = options.organizationId;
  }
}
