import type { AWS } from '@serverless/typescript';

import getProductList from '@functions/getProductList';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const {
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_USERNAME,
  PG_PASSWORD
} = process.env;
const filterCount = 10;

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST,
      PG_PORT,
      PG_DATABASE,
      PG_USERNAME,
      PG_PASSWORD,
      PRODUCT_QUEUE: 'product-queue',
      PRODUCT_TOPIC: 'product-topic',
      SNS_ARN: { Ref: 'createProductTopic' }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'createProductTopic',
        },
      }
    ],
    lambdaHashingVersion: '20201221',
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:provider.environment.PRODUCT_QUEUE}',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: '${self:provider.environment.PRODUCT_TOPIC}',
        },
      },
      createProductTopicForBigCount: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'vladislavzheromsky@gmail.com',
          Protocol: 'email',
          TopicArn: { Ref: 'createProductTopic' },
          FilterPolicy: {
            count: [{ 'numeric': ['>', filterCount] }]
          },
        },
      },
      createProductTopicForSmallCount: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'uladzislau_zheromski@epam.com',
          Protocol: 'email',
          TopicArn: { Ref: 'createProductTopic' },
          FilterPolicy: {
            count: [{ 'numeric': ['<=', filterCount] }]
          },
        }
      },
    },
    Outputs: {
      catalogItemsQueueUrl: {
        Value: {
          Ref: 'catalogItemsQueue',
        },
      },
      createProductTopicArn: {
        Value: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      }
    },
  },
  functions: {
    createProduct,
    getProductById,
    getProductList,
    catalogBatchProcess
  }
};

module.exports = serverlessConfiguration;
