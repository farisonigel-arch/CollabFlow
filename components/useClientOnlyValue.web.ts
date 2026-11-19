// This web-only helper is intentionally simple because Expo web does not use
// the server-rendered fallback path in the app shell.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return client;
}
