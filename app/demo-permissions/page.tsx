"use client";

import { useCameraPermissions } from "@/components/providers/CameraPermissionsProvider";
import { useState } from "react";

export default function CameraPermissionsDemo() {
  const { openPermissionsModal } = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: boolean;
    microphone: boolean;
  } | null>(null);

  const handlePermissionsGranted = (
    stream: MediaStream | null,
    permissions: { camera: boolean; microphone: boolean }
  ) => {
    setPermissionStatus(permissions);
    console.log("Permissions granted:", permissions);
    console.log("Media stream:", stream);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#050505]">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Camera Permissions Demo
          </h1>
          <p className="text-lg text-white/60">
            Test the camera and microphone permissions modal for your streaming
            app
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <button
            onClick={openPermissionsModal}
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Open Permissions Modal
          </button>

          {permissionStatus && (
            <div className="bg-black/40 border border-green-500/30 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-green-400">
                ✓ Permissions Status
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Microphone:</span>
                  <span
                    className={`font-semibold ${
                      permissionStatus.microphone
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {permissionStatus.microphone ? "Granted" : "Denied"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Camera:</span>
                  <span
                    className={`font-semibold ${
                      permissionStatus.camera ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {permissionStatus.camera ? "Granted" : "Denied"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-white/40">
          <p>
            This modal appears when users try to go live for the first time.
          </p>
          <p className="mt-2">
            It requests both camera and microphone permissions before streaming
            can begin.
          </p>
        </div>
      </div>
    </div>
  );
}
