import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        batchSize: 5,
        path: 'products',
        arn: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
    },
  ],
};
