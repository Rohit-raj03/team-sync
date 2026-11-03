import { OAuth2Client } from "google-auth-library";
import config from "../config/config.js";

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token using google-auth-library
 * @param {string} credential - Raw Google ID token JWT received from frontend
 * @returns {Promise<{ googleId: string, email: string, name: string, avatar: string, isEmailVerified: boolean }>}
 */
export const verifyGoogleToken = async (credential) => {
  if (!credential) {
    const error = new Error("Google credential token is required");
    error.statusCode = 400;
    throw error;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      const error = new Error("Unable to retrieve Google user payload");
      error.statusCode = 401;
      throw error;
    }

    if (!payload.email_verified) {
      const error = new Error("Google email address is not verified");
      error.statusCode = 401;
      throw error;
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase().trim(),
      name: payload.name || "Google User",
      avatar: payload.picture || "",
      isEmailVerified: Boolean(payload.email_verified),
    };
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error("Invalid or expired Google authentication token");
    error.statusCode = 401;
    throw error;
  }
};

export default {
  verifyGoogleToken,
};

