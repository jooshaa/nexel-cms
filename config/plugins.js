module.exports = ({ env }) => ({
  // ─── Cloudinary Upload Provider ─────────────────────────────
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: 'dyavjhlmb',
        api_key: '916653853662689',
        api_secret: 'e8JYq3qWa0BIOfnxp1re5V1uIls', 
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },

  // ─── Users & Permissions ──────────────────────────────────────
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
});
