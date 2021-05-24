'use strict';

const { URL } = require('url');
const MinioSDK = require('minio');

module.exports = {
  provider: 'minio',
  name: 'Minio Server',
  auth: {
    accessKey: {
      label: 'Access API Token',
      type: 'text'
    },
    secretKey: {
      label: 'Secret API Token',
      type: 'text'
    },
    bucket: {
      label: 'Bucket',
      type: 'text'
    },
    endpoint: {
      label: 'Endpoint',
      type: 'text'
    }
  },
  init: ({ accessKey, secretKey, ...config }) => {
    const endPoint = new URL(config.endpoint);
    const useSSL = endPoint.protocol && endPoint.protocol === 'https:';

    const Minio = new MinioSDK.Client({
      endPoint: endPoint.hostname,
      port: parseInt(endPoint.port) || (useSSL ? 443 : 80),
      useSSL: useSSL,
      accessKey,
      secretKey
    });

    return {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          const filename = 'mypolitics2/' + (file.path ? `${file.path}.` : '') + 'public-' + `${file.hash}${file.ext}`;
          const buffer = Buffer.from(file.buffer, 'binary');

          Minio.putObject(config.bucket, filename, buffer, (err, tag) => {
            if (err) {
              reject(err);
            }

            file.url = `${Minio.protocol}//${Minio.host}/${config.bucket}/${filename}`;

            resolve();
          });
        });
      },
      delete: (file) => {
        return new Promise((resolve, reject) => {
          const filename = 'mypolitics2/' + (file.path ? `${file.path}.` : '') + `${file.hash}${file.ext}`;

          Minio.removeObject(config.bucket, filename, (err) => {
            if (err) {
              reject(err);
            }

            resolve();
          });
        });
      }
    };
  }
};
