const AbstractService = require('../AbstractService');

class CloudFormationService extends AbstractService {
  getOutputs() {
    const params = {
      StackName: this.stackName
    };

    return this.awsRequest('CloudFormation:describeStacks', params)
      .then(({ Stacks }) => Stacks && Stacks[0].Outputs)
      .catch((e) => {
        console.error('error in describeStacks in cloud formation', e);
        return [];
      });
  }
}

module.exports = CloudFormationService;
