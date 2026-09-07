export const getAuthRedirectUrl = () => {
  const siteUrl =
    import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") || window.location.origin;

  return `${siteUrl}/auth/callback`;
};
