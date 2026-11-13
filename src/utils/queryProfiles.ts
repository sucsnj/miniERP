export const LIVE_TENANT_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

export const MOUNT_TENANT_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export default LIVE_TENANT_QUERY_OPTIONS;
