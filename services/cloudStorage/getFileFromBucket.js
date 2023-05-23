import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { awsBucketAccess, awsBucketSecret, bucketName } from '../../config/index.js';

const client = new S3Client({
  region: 'us-west-1',
  credentials: {
    accessKeyId: awsBucketAccess,
    secretAccessKey: awsBucketSecret,
  },
});

const getFileFromBucket = async (key) => {
  const params = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(params);
  return response.Body.transformToByteArray();
};

export default getFileFromBucket;
