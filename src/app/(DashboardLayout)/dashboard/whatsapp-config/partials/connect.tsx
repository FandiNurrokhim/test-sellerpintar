// connect.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import ModalSideSimple from "@/components/organisms/Modal/ModalSideSimple";
import Image from "next/image";
import { whatsAppApi } from "@/utils/apis/whatsapp";
import type { WhatsAppSetting, WhatsAppBotStatus } from "@/types/whatsapp";

type WhatsAppSettingWithIndex = WhatsAppSetting & {
  [key: string]: unknown;
};

interface ConnectWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (whatsApp: WhatsAppSettingWithIndex) => Promise<void>;
  onSuccess?: () => void;
  whatsApp: WhatsAppSettingWithIndex | null;
  isReconnect?: boolean;
}

export const ConnectWhatsAppModal: React.FC<ConnectWhatsAppModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  whatsApp,
  isReconnect = false,
}) => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [botStatus, setBotStatus] = useState<WhatsAppBotStatus>("DISCONNECTED");
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const isReconnectRef = useRef(isReconnect);
  useEffect(() => {
    isReconnectRef.current = isReconnect;
  }, [isReconnect]);

  const isPollingRef = useRef(false);

  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const headers = useMemo(() => {
    const headerObj: Record<string, string> = {};
    const token = session?.user?.accessToken;
    if (organizationId) headerObj["x-organization-id"] = organizationId;
    if (branchId) headerObj["x-branch-id"] = branchId;
    if (token) headerObj["Authorization"] = `Bearer ${token}`;
    return headerObj;
  }, [organizationId, branchId, session?.user?.accessToken]);

  const pollStatus = useCallback(async () => {
    if (!isOpen || !whatsApp?.id || !isPollingRef.current) {
      return;
    }

    try {
      const statusResponse = await whatsAppApi.getStatus(
        whatsApp.id,
        true,
        {},
        headers
      );

      const status = statusResponse.data?.status ?? "INACTIVE";
      setBotStatus(status);

      switch (status) {
        case "ACTIVE":
          setIsConnected(true);
          setError("");
          setMessage("Your WhatsApp is now connected and ready to use.");
          onSubmit?.(whatsApp);
          isPollingRef.current = false;
          return;

        case "AUTH_FAILURE":
          isPollingRef.current = false;
          return;

        case "ERROR":
          setError("Connection failed. Please try again.");
          setMessage("An error occurred while connecting.");
          isPollingRef.current = false;
          return;

        default:
          setTimeout(pollStatus, 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get WhatsApp status."
      );
      setMessage("An error occurred during polling.");
      isPollingRef.current = false;
    }
  }, [isOpen, whatsApp, headers, onSubmit]);

  useEffect(() => {
    const initiateConnectionAndPolling = async () => {
      if (!isOpen || !whatsApp?.id || isPollingRef.current) return;

      setIsLoading(true);
      setError("");
      setQrCode(null);
      setBotStatus("INITIALIZING");
      setMessage("Preparing to connect. Please wait...");
      isPollingRef.current = true;

      try {
        let connectResponse;
        if (isReconnectRef.current) {
          connectResponse = await whatsAppApi.restart(
            whatsApp.id,
            true,
            {},
            headers
          );
        } else {
          connectResponse = await whatsAppApi.connect(
            whatsApp.id,
            true,
            {},
            headers
          );
        }

        const responseData = connectResponse.data || connectResponse;
        const qrCodeUrl = responseData.qrCode;
        const status = responseData.status;
        const message = responseData.message;

        const decodedQrCode = qrCodeUrl || null;

        setQrCode(decodedQrCode);
        setBotStatus(status);
        setMessage(message);
        setIsLoading(false);

        if (status === "ACTIVE") {
          setIsConnected(true);
          setError("");
          onSubmit?.(whatsApp);
          isPollingRef.current = false;
          return;
        }

        if (status === "AUTH_FAILURE") {
          isPollingRef.current = false;
          return;
        }

        if (status === "INITIALIZING") {
          setTimeout(pollStatus, 1000);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initiate WhatsApp connection."
        );
        setBotStatus("ERROR");
        setMessage("Failed to initiate connection.");
        isPollingRef.current = false;
      }
    };

    if (isOpen && whatsApp?.id) {
      initiateConnectionAndPolling();
    } else {
      setIsConnected(false);
      setIsLoading(false);
      setQrCode(null);
      setBotStatus("INACTIVE");
      setError("");
      setMessage("");
      isPollingRef.current = false;
    }

    return () => {
      isPollingRef.current = false;
    };
  }, [isOpen, headers, onSubmit, onSuccess, whatsApp, pollStatus]);

  return (
    <ModalSideSimple isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full relative">
        <div
          className="relative rounded-tl-2xl p-8 h-[260px] bg-cover bg-center bg-no-repeat w-full"
          style={{ backgroundImage: "url('/images/background/side-bg.png')" }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 border-[1px] border-white ${
                isConnected ? "bg-[#0F9808]" : "bg-red-500"
              } rounded-full`}
            >
              {""}
            </span>
            <h1 className="!font-sentient text-[22px] text-white">
              {whatsApp?.name || "WhatsApp Bot"}
            </h1>
          </div>
          <p className="!font-sentient text-white dark:text-white/50">
            {whatsApp?.assistantName || "Assistant"}
          </p>
        </div>

        <div className="absolute top-[165px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex flex-col w-[274px] rounded-lg text-center bg-white p-4 shadow-lg">
            <div className="relative">
              {qrCode ? (
                <Image
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  width={272}
                  height={272}
                  className={`w-full h-auto rounded-lg transition-all duration-300 ${
                    isConnected ? "blur-sm opacity-50" : ""
                  }`}
                  unoptimized={true}
                  onError={() => {
                    setError("Failed to load QR Code image");
                  }}
                />
              ) : (
                <div className="w-full h-[272px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-center px-4">
                    {isLoading
                      ? "Loading QR Code..."
                      : error
                      ? "Error loading QR Code"
                      : "No QR Code available"}
                  </p>
                </div>
              )}
              {isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/images/assets/Success.gif"
                    alt="Success"
                    width={80}
                    height={80}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="text-center px-8 pb-8">
          <h2 className="!font-sentient text-[19px] text-black dark:text-white mb-2">
            {isConnected
              ? "WhatsApp Connected"
              : botStatus === "CONNECTING" || botStatus === "INITIALIZING"
              ? "Connecting..."
              : botStatus === "AUTH_FAILURE"
              ? "Authentication Failed"
              : "Scan QR Code to Connect"}
          </h2>
          <p className="text-gray-500 text-sm">{message}</p>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </ModalSideSimple>
  );
};
