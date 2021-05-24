module.exports = ({ env }) => ({
  upload: {
    provider: 'minio',
    providerOptions: {
      accessKey: env('MINIO_ACCESS'),
      secretKey: env('MINIO_SECRET'),
      endpoint: env('MINIO_END_POINT'),
      bucket: 'mypolitics-cdn',
    },
  },
});
