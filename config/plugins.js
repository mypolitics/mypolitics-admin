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
  graphql: {
    endpoint: '/graphql',
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 100,
    federation: true,
    apolloServer: {
      tracing: true,
      federation: true,
    }
  }
});
