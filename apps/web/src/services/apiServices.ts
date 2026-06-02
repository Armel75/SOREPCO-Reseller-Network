import api from './api';

export const geoService = {
  getRegions: async () => {
    const res = await api.get('/geo/regions');
    return res.data;
  }
};

export const metadataService = {
  getSalesMetadata: async () => {
    const res = await api.get('/metadata/sales');
    return res.data;
  },
  getBTPlMetadata: async () => {
    const res = await api.get('/metadata/btp');
    return res.data;
  }
};

export const constructionSiteService = {
  getAll: async () => {
    const res = await api.get('/sites');
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/sites', data);
    return res.data;
  }
};

export const resellerService = {
  getAll: async (params?: any) => {
    const res = await api.get('/resellers', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/resellers', data);
    return res.data;
  }
};

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  }
};
