module.exports = ({ env }) => ({
  upload: {
    provider: 'minio',
    providerOptions: {
      accessKey: env('MINIO_ACCESS'),
      secretKey: env('MINIO_SECRET'),
      endpoint: 'https://files.mypolitics.pl',
      bucket: 'mypolitics2',
    },
  },
});
