module.exports = ({ env }) => ({
  // Default API rate limit and response config
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
});
