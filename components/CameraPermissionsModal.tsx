"use client";

import { useState, useEffect } from "react";
import { HiMicrophone, HiVideoCamera, HiX } from "react-icons/hi";
import Image from "next/image";

interface CameraPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: (
    stream: MediaStream | null,
    permissions: { camera: boolean; microphone: boolean }
  ) => void;
}

export default function CameraPermissionsModal({
  isOpen,
  onClose,
  onPermissionsGranted,
}: CameraPermissionsModalProps) {
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
  });
  const [isLoading, setIsLoading] = useState({
    camera: false,
    microphone: false,
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const handleEnableMicrophone = async () => {
    setIsLoading({ ...isLoading, microphone: true });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setPermissions({ ...permissions, microphone: true });
      setMediaStream((prev) => {
        if (prev) {
          // Add audio tracks to existing stream
          stream.getAudioTracks().forEach((track) => prev.addTrack(track));
          return prev;
        }
        return stream;
      });
    } catch (error) {
      console.error("Microphone permission denied:", error);
      alert(
        "Microphone access denied. Please enable it in your browser settings."
      );
    } finally {
      setIsLoading({ ...isLoading, microphone: false });
    }
  };

  const handleEnableCamera = async () => {
    setIsLoading({ ...isLoading, camera: true });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setPermissions({ ...permissions, camera: true });
      setMediaStream((prev) => {
        if (prev) {
          // Add video tracks to existing stream
          stream.getVideoTracks().forEach((track) => prev.addTrack(track));
          return prev;
        }
        return stream;
      });
    } catch (error) {
      console.error("Camera permission denied:", error);
      alert("Camera access denied. Please enable it in your browser settings.");
    } finally {
      setIsLoading({ ...isLoading, camera: false });
    }
  };

  const handleComplete = () => {
    onPermissionsGranted(mediaStream, permissions);
    onClose();
  };

  // Auto-complete if both permissions are granted
  useEffect(() => {
    if (permissions.camera && permissions.microphone) {
      // Small delay for better UX
      setTimeout(() => {
        handleComplete();
      }, 600);
    }
  }, [permissions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black md:bg-transparent md:p-4">
      {/* Backdrop - Desktop only */}
      <div
        className="hidden md:block absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[440px] h-full md:h-auto flex flex-col">
        <div className="relative bg-black rounded-none md:rounded-3xl flex-1 md:flex-none flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 z-10"
            aria-label="Close modal"
          >
            <HiX className="w-7 h-7 text-white" />
          </button>

          {/* Content Container */}
          <div className="flex-1 flex flex-col justify-between md:justify-start px-6 md:px-12 pt-24 md:pt-16 pb-32 md:pb-12">
            {/* Top Section - Image and Text */}
            <div className="flex flex-col items-center">
              {/* Decorative Image */}
              <div className="mb-12 md:mb-16">
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <Image
                    src="/images/3d-glossy-shape 2.svg"
                    alt="3D Shape"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Title and Subtitle */}
              <div className="text-center mb-8 md:mb-0">
                <h2 className="text-4xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Camera & Mic
                  <br />
                  Permissions
                </h2>
                <p className="text-lg md:text-xl text-white/50 font-normal">
                  Just a few things before you stream.
                </p>
              </div>
            </div>

            {/* Bottom Section - Permission Buttons */}
            <div className="space-y-3 md:space-y-4 mt-auto md:mt-16">
              {/* Enable Microphone Button */}
              <button
                onClick={handleEnableMicrophone}
                disabled={permissions.microphone || isLoading.microphone}
                className={`w-full py-5 md:py-6 px-8 rounded-full font-semibold text-lg md:text-xl flex items-center justify-center gap-4 transition-all duration-300 ${
                  permissions.microphone
                    ? "bg-green-500/20 text-green-400 border-2 border-green-500/40"
                    : "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                } ${isLoading.microphone ? "opacity-70 cursor-wait" : ""}`}
              >
                <HiMicrophone className="w-6 h-6 md:w-7 md:h-7" />
                <span>
                  {isLoading.microphone
                    ? "Requesting Access..."
                    : permissions.microphone
                      ? "Microphone Enabled"
                      : "Enable Microphone"}
                </span>
                {permissions.microphone && (
                  <span className="ml-auto">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </button>

              {/* Enable Camera Button */}
              <button
                onClick={handleEnableCamera}
                disabled={permissions.camera || isLoading.camera}
                className={`w-full py-5 md:py-6 px-8 rounded-full font-semibold text-lg md:text-xl flex items-center justify-center gap-4 transition-all duration-300 ${
                  permissions.camera
                    ? "bg-green-500/20 text-green-400 border-2 border-green-500/40"
                    : "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                } ${isLoading.camera ? "opacity-70 cursor-wait" : ""}`}
              >
                <HiVideoCamera className="w-6 h-6 md:w-7 md:h-7" />
                <span>
                  {isLoading.camera
                    ? "Requesting Access..."
                    : permissions.camera
                      ? "Camera Enabled"
                      : "Enable Camera"}
                </span>
                {permissions.camera && (
                  <span className="ml-auto">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
