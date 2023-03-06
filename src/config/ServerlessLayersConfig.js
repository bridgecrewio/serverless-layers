class ServerlessLayersConfig {
  constructor(options, slsVersion) {
    console.log(`[ LayersPlugin ]: - options are: ${JSON.stringify(options)}, sls version is ${slsVersion}`);

    if (this.shouldParseForSlsV3Options(slsVersion, options)) {
      options = options.param.reduce((res, v3Option) => {
        const v3OptionSplitArr = v3Option.split('=');
        const key = v3OptionSplitArr[0];
        const value = v3OptionSplitArr[1];
        res[key] = value;
        return res;
      }, {});
      console.log(`[ LayersPlugin ]: - options after extracting for v3 are: ${JSON.stringify(options)}`);
    }

    this.shouldUseLayersArtifactory = (options.shouldUseLayersArtifactory === 'true');
    this.hashFileName = 'customHash.json';
    this.artifactoryBucketName = options.artifactoryBucketName;
    this.artifactoryRegion = options.artifactoryRegion;

    this.s3ArtifactoryAccessKeyId = process.env.SLS_CODE_ARTIFACTS_AWS_ACCESS_KEY_ID;
    this.s3ArtifactorySecretAccessKey = process.env.SLS_CODE_ARTIFACTS_AWS_SECRET_ACCESS_KEY;
    this.s3ArtifactorySessionToken = process.env.SLS_CODE_ARTIFACTS_AWS_SESSION_TOKEN;

    this.artifactoryHashKey = options.artifactoryHashKey;

    this.organizationId = options.organizationId;
    this.uniqueTag = options.tag;
    this.artifactoryStr = options.artifactoryStr ? options.artifactoryStr : 'artifactory';
  }

  shouldParseForSlsV3Options(slsVersion, options) {
    return slsVersion.startsWith('3') && Object.entries(options).length > 0 && !!options.param;
  }

  init(plugin) {
    const pluginLayerName = plugin.getLayerName();
    this.artifactoryLayerName = pluginLayerName.includes(this.uniqueTag) ? pluginLayerName.replace(this.uniqueTag, this.artifactoryStr) : `${pluginLayerName}-${this.artifactoryStr}`;
    this.artifactoryJsonMappingKey = `${this.artifactoryLayerName}/${this.artifactoryHashKey}.json`;
    this.artifactoryZipKey = `${this.artifactoryLayerName}/${this.artifactoryLayerName}.zip`;
    this.tempArtifactoryZipFileName = `${this.artifactoryLayerName}.zip`;
  }

}

module.exports = { ServerlessLayersConfig };
