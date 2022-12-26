"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerlessLayersConfig = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ServerlessLayersConfig = /*#__PURE__*/function () {
  function ServerlessLayersConfig(options) {
    (0, _classCallCheck2["default"])(this, ServerlessLayersConfig);
    this.shouldNotInstallPackages = options.shouldNotInstallPackages === 'true';
    this.shouldUseLayersArtifactory = options.shouldUseLayersArtifactory === 'true';
    this.artifactoryBucketName = options.artifactoryBucketName;
    this.artifactoryRegion = options.artifactoryRegion;
    this.s3ArtifactoryAccessKeyId = process.env.SLS_CODE_ARTIFACTS_AWS_ACCESS_KEY_ID;
    this.s3ArtifactorySecretAccessKey = process.env.SLS_CODE_ARTIFACTS_AWS_SECRET_ACCESS_KEY;
    this.s3ArtifactorySessionToken = process.env.SLS_CODE_ARTIFACTS_AWS_SESSION_TOKEN;
    this.artifactoryLayerNamePrefix = options.artifactoryLayerName;
    this.artifactoryHashKey = options.artifactoryHashKey;
    this.organizationId = options.organizationId;
  }

  (0, _createClass2["default"])(ServerlessLayersConfig, [{
    key: "init",
    value: function init(plugin) {
      this.artifactoryLayerName = plugin.getLayerName(this.artifactoryLayerNamePrefix);
      this.artifactoryJsonMappingKey = "".concat(this.artifactoryLayerName, "/").concat(this.artifactoryHashKey, ".json");
      this.artifactoryZipKey = "".concat(this.artifactoryLayerName, "/").concat(this.artifactoryLayerName, ".zip");
      this.tempArtifactoryZipFileName = "".concat(this.artifactoryLayerName, ".zip");
    }
  }]);
  return ServerlessLayersConfig;
}();

exports.ServerlessLayersConfig = ServerlessLayersConfig;
//# sourceMappingURL=ServerlessLayersConfig.js.map