import ImageKit from "imagekit";
import { ENV } from "@repo/env-config";

export const imagekit = new ImageKit({
  publicKey: ENV.IMAGEKIT_PUBLIC_KEY! || "public_4ZmVOZUtmHZAyMtmB6HncUciBlU=",
  privateKey:
    ENV.IMAGEKIT_PRIVATE_KEY! || "private_QHnRTFQGT+o8aVPmwcLCMyXdqY4=",
  urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT! || "https://ik.imagekit.io/pay",
});
