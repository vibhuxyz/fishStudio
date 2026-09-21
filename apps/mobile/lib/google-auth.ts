// Native Google Sign-In. Returns a Google ID token that auth-service verifies
// and exchanges for our own session — the same tokens the OTP login yields.
//
// The SDK is required lazily, not imported: it reads native constants the
// moment its module loads, so a top-level import would take down the whole
// login screen in a binary that doesn't contain the native module (Expo Go, or
// a dev build made before the package was added). Lazily, that case becomes a
// readable error instead.

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** False when no Google client is configured; the UI then keeps its stub. */
export const isGoogleSignInConfigured = !!WEB_CLIENT_ID;

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

let sdk: GoogleSigninModule | null = null;

function loadSdk(): GoogleSigninModule {
  if (sdk) return sdk;
  try {
    const loaded: GoogleSigninModule =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@react-native-google-signin/google-signin");
    // The web client ID is what makes the ID token's audience match the one
    // auth-service verifies against — on both platforms. The iOS client ID only
    // tells the iOS SDK which app registration to sign in with.
    loaded.GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
    });
    sdk = loaded;
    return loaded;
  } catch {
    throw new Error(
      "Google sign-in needs the latest app build. Please use email for now.",
    );
  }
}

export class GoogleSignInCancelled extends Error {
  constructor() {
    super("Google sign-in cancelled");
  }
}

/** Shows the Google account picker. Throws GoogleSignInCancelled if dismissed. */
export async function getGoogleIdToken(): Promise<string> {
  const { GoogleSignin } = loadSdk();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (response.type !== "success") throw new GoogleSignInCancelled();

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google did not return an ID token. Please try again.");
  }
  return idToken;
}

/** Forget the chosen Google account so the next sign-in shows the picker. */
export async function signOutOfGoogle(): Promise<void> {
  if (!isGoogleSignInConfigured) return;
  try {
    await loadSdk().GoogleSignin.signOut();
  } catch {
    // Not signed in with Google, or SDK unavailable — nothing to clear.
  }
}
