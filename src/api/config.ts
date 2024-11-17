export const API_CONFIG = {
    GDC: {
      BASE_URL: 'https://api.gdc.cancer.gov',
      ENDPOINTS: {
        PROJECTS: '/projects',
        CASES: '/cases',
        FILES: '/files',
        DATA: '/data'
      },
      DEFAULT_PARAMS: {
        format: 'json',
        size: 1000
      }
    },
    LOCAL: {
      BASE_URL: '/api'
    }
  };