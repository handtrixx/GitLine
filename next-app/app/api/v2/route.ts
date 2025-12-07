import { docsRoute } from 'next-rest-framework';

// export const runtime = 'edge'; // Edge runtime is supported.

export const { GET } = docsRoute({
  deniedPaths: [ '/api/v1/**'],
  // allowedPaths: [...], // Explicitly set which endpoints to include in the generated OpenAPI spec.
  // Override and customize the generated OpenAPI spec.
  openApiObject: {
    info: {
      title: 'GitLine API',
      version: '0.0.1',
      description: 'The GitLine API.'
    }
    // ...
  },
  // openApiJsonPath: '/openapi.json', // Customize the path where the OpenAPI spec will be generated.
  // Customize the rendered documentation.
  docsConfig: {
    provider: 'swagger-ui', // redoc | swagger-ui
    title: 'GitLine API',
    description: 'My GitLine API description.'
    // ...
  }
});