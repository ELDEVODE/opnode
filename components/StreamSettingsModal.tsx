"use client";

import { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import {
  HiOutlineSpeakerWave,
  HiOutlineMicrophone,
  HiOutlineVideoCamera,
} from "react-icons/hi2";
import Image from "next/image";

interface StreamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: DeviceSettings) => void;
  currentSettings?: DeviceSettings;
}

export interface DeviceSettings {
  microphone: string;
  speaker: string;
  camera: string;
  micVolume: number;
  speakerVolume: number;
}

export default function StreamSettingsModal({
  isOpen,
  onClose,
  onConfirm,
  currentSettings,
}: StreamSettingsModalProps) {
  const [devices, setDevices] = useState<{
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
    cameras: MediaDeviceInfo[];
  }>({
    microphones: [],
    speakers: [],
    cameras: [],
  });

  const [settings, setSettings] = useState<DeviceSettings>({
    microphone: currentSettings?.microphone || "",
    speaker: currentSettings?.speaker || "",
    camera: currentSettings?.camera || "",
    micVolume: currentSettings?.micVolume || 60,
    speakerVolume: currentSettings?.speakerVolume || 60,
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();

      const mics = allDevices.filter((device) => device.kind === "audioinput");
      const speakers = allDevices.filter(
        (device) => device.kind === "audiooutput"
      );
      const cams = allDevices.filter((device) => device.kind === "videoinput");

      setDevices({
        microphones: mics,
        speakers: speakers,
        cameras: cams,
      });

      // Set default selections if not already set
      if (!settings.microphone && mics.length > 0) {
        setSettings((prev) => ({ ...prev, microphone: mics[0].deviceId }));
      }
      if (!settings.speaker && speakers.length > 0) {
        setSettings((prev) => ({ ...prev, speaker: speakers[0].deviceId }));
      }
      if (!settings.camera && cams.length > 0) {
        setSettings((prev) => ({ ...prev, camera: cams[0].deviceId }));
      }
    } catch (error) {
      console.error("Error loading devices:", error);
    }
  };

  const handleConfirm = () => {
    onConfirm(settings);
    onClose();
  };

  const getDeviceLabel = (deviceId: string, deviceList: MediaDeviceInfo[]) => {
    const device = deviceList.find((d) => d.deviceId === deviceId);
    return device?.label || "Default";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0D0D0D] rounded-3xl w-full max-w-md lg:max-w-lg border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center justify-center py-6 px-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            aria-label="Close"
          >
            <HiX className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 relative">
              <Image
                src="/images/3d-glossy-shape 2.svg"
                alt="Stream icon"
                width={80}
                height={80}
                className="rounded-2xl"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl lg:text-3xl font-bold">Camera & Mic</h2>
              <p className="text-white/60 text-sm mt-1">
                Set up your streaming gear.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Microphone Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">
              Microphone
            </label>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "microphone" ? null : "microphone"
                  )
                }
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:bg-[#222] transition"
              >
                <span className="text-white text-sm">
                  {getDeviceLabel(settings.microphone, devices.microphones)}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${openDropdown === "microphone" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdown === "microphone" && (
                <div className="absolute z-10 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  {devices.microphones.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        setSettings((prev) => ({
                          ...prev,
                          microphone: device.deviceId,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition"
                    >
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 8)}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Speaker Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Speaker</label>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "speaker" ? null : "speaker")
                }
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:bg-[#222] transition"
              >
                <span className="text-white text-sm">
                  {getDeviceLabel(settings.speaker, devices.speakers)}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${openDropdown === "speaker" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdown === "speaker" && (
                <div className="absolute z-10 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  {devices.speakers.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        setSettings((prev) => ({
                          ...prev,
                          speaker: device.deviceId,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition"
                    >
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Camera Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Camera</label>
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "camera" ? null : "camera")
                }
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3.5 text-left flex items-center justify-between hover:bg-[#222] transition"
              >
                <span className="text-white text-sm">
                  {getDeviceLabel(settings.camera, devices.cameras)}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${openDropdown === "camera" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDropdown === "camera" && (
                <div className="absolute z-10 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  {devices.cameras.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        setSettings((prev) => ({
                          ...prev,
                          camera: device.deviceId,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 transition"
                    >
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volume Sliders */}
          <div className="space-y-6 pt-2">
            {/* Speaker Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <HiOutlineSpeakerWave className="w-6 h-6 text-white/70" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.speakerVolume}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      speakerVolume: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1 mx-4 h-2 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                  style={{
                    background: `linear-gradient(to right, #FF9100 0%, #FF9100 ${settings.speakerVolume}%, rgba(255,255,255,0.2) ${settings.speakerVolume}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Microphone Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <HiOutlineMicrophone className="w-6 h-6 text-white/70" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.micVolume}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      micVolume: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1 mx-4 h-2 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500"
                  style={{
                    background: `linear-gradient(to right, #FF9100 0%, #FF9100 ${settings.micVolume}%, rgba(255,255,255,0.2) ${settings.micVolume}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          <button
            onClick={handleConfirm}
            className="w-full bg-white text-black font-semibold text-base py-4 rounded-full hover:bg-white/90 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
