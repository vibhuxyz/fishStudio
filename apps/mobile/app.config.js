// Extends app.json. It exists so the Google Sign-In iOS URL scheme can be
// derived from an env var instead of being hard-coded in app.json.
//
// The scheme is the iOS OAuth client ID with its domain reversed:
//   1234-abc.apps.googleusercontent.com -> com.googleusercontent.apps.1234-abc
// The Expo plugin throws if the scheme is missing, so it is only added when the
// iOS client ID is set — Android builds don't need it.
const IOS_SUFFIX = ".apps.googleusercontent.com";

module.exports = ({ config }) => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const plugins = [...(config.plugins ?? [])];

  if (iosClientId) {
    const id = iosClientId.endsWith(IOS_SUFFIX)
      ? iosClientId.slice(0, -IOS_SUFFIX.length)
      : iosClientId;
    plugins.push([
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: `com.googleusercontent.apps.${id}` },
    ]);
  } else {
    console.warn(
      "[app.config] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not set — Google Sign-In will not work in iOS builds.",
    );
  }

  return { ...config, plugins };
};
