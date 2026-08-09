import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Live camera capture via getUserMedia — deliberately not a file input, since
 * `<input type="file" capture>` still lets some browsers fall back to the
 * gallery. Shared by the rider and cutting-staff proof-photo flows.
 *
 * getUserMedia only exists in secure contexts (HTTPS, or http://localhost).
 * Staff testing the app over a LAN IP (http://192.168.x.x:3002) will find
 * `navigator.mediaDevices` simply undefined — the call fails immediately,
 * before the OS ever gets a chance to show a permission prompt, which reads
 * to the user as "it's not even asking for permission." Distinguishing that
 * case from an actual permission denial is the whole point of this hook.
 */
type DocumentWithPolicy = Document & {
  permissionsPolicy?: { allowsFeature: (feature: string) => boolean };
  featurePolicy?: { allowsFeature: (feature: string) => boolean };
};

/**
 * True when a Permissions-Policy header (not the user) is what blocked the
 * camera. Chromium-only and non-standard, so an unknown answer is treated as
 * "not blocked" — a wrong guess here would only mislabel a real denial.
 */
const isCameraBlockedByPolicy = (): boolean => {
  if (typeof document === "undefined") return false;
  const policy =
    (document as DocumentWithPolicy).permissionsPolicy ??
    (document as DocumentWithPolicy).featurePolicy;
  if (!policy?.allowsFeature) return false;
  try {
    return !policy.allowsFeature("camera");
  } catch {
    return false;
  }
};

export function useCameraCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsOpen(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const open = useCallback(async () => {
    if (typeof window === "undefined" || !window.isSecureContext) {
      toast.error(
        "Camera needs a secure connection to work. Open this page over HTTPS, or as http://localhost, not a LAN IP.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("This browser doesn't support camera capture — try Chrome or Safari.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setIsOpen(true);
      // The <video> element only mounts once isOpen flips, so attach the
      // stream on the next tick rather than racing the render.
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        // A Permissions-Policy block surfaces as the same NotAllowedError as a
        // real user denial, but no prompt is ever shown — so telling staff to
        // "change your browser settings" sends them somewhere that cannot fix
        // it. Separate the two so the message names the actual problem.
        toast.error(
          isCameraBlockedByPolicy()
            ? "Camera is blocked by this site's security policy. This needs a fix on the server, not on your phone."
            : "Camera permission was denied. Enable it for this site in your browser settings and try again.",
        );
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        toast.error("No camera was found on this device.");
      } else if (name === "NotReadableError") {
        toast.error("The camera is already in use by another app.");
      } else {
        toast.error("Couldn't open the camera. Please try again.");
      }
    }
  }, []);

  const capture = useCallback(
    (quality = 0.85) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return null;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const dataUri = canvas.toDataURL("image/jpeg", quality);
      stop();
      return dataUri;
    },
    [stop],
  );

  return { isOpen, videoRef, open, capture, stop };
}
