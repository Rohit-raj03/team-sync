import ImageKit from "@imagekit/nodejs";
import config from "./config.js";

/**
 * Validates if ImageKit credentials are present in the environment
 * @returns {boolean}
 */
export const isImageKitConfigured = () => {
  return Boolean(config.IMAGEKIT_PRIVATE_KEY);
};

let imageKitClientInstance = null;

/**
 * Initialize and get the ImageKit SDK client instance
 * @returns {ImageKit}
 */
export const getImageKitClient = () => {
  if (imageKitClientInstance) {
    return imageKitClientInstance;
  }

  if (!config.IMAGEKIT_PRIVATE_KEY) {
    console.warn(
      "⚠️ [ImageKit Warning]: IMAGEKIT_PRIVATE_KEY is missing from environment. Media upload features will require valid credentials."
    );
  }

  imageKitClientInstance = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY || "dummy_private_key_unconfigured",
    publicKey: config.IMAGEKIT_PUBLIC_KEY || "dummy_public_key",
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/teamsync",
  });

  return imageKitClientInstance;
};

export const imagekit = getImageKitClient();

export default imagekit;

