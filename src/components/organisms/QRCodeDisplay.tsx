import { useToast } from "@/components/atoms/ToastProvider";
import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { whatsAppApi } from "@/utils/apis/whatsapp";
import type { WhatsAppBotStatus } from "@/types/whatsapp";
import Image from "next/image";

export const QRCodeDisplay = forwardRef<HTMLDivElement, Record<string, never>>(
  () => {
    const { data: session } = useSession();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [botStatus, setBotStatus] =
      useState<WhatsAppBotStatus>("DISCONNECTED");
    const [error, setError] = useState<string>("");
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [whatsappConfig, setWhatsappConfig] = useState<{
      name: string;
      assistantName: string;
    }>({
      name: "Dora WhatsApp Official",
      assistantName: "Dora Assistant",
    });
    const { showToast } = useToast();
    const isPollingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);

    const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
    const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");
    const organizationId = session?.organizationId || org.id;
    const branchId =
      session?.branchId || sessionStorage.getItem("branchId") || branch.id;

    const headers = useMemo(() => {
      const headerObj: Record<string, string> = {};
      const token = session?.user?.accessToken;
      if (organizationId) headerObj["x-organization-id"] = organizationId;
      if (branchId) headerObj["x-branch-id"] = branchId;
      if (token) headerObj["Authorization"] = `Bearer ${token}`;
      return headerObj;
    }, [organizationId, branchId, session?.user?.accessToken]);

    const clearPollingTimeout = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, []);

    const stopPolling = useCallback(() => {
      isPollingRef.current = false;
      clearPollingTimeout();
    }, [clearPollingTimeout]);

    const pollStatus = useCallback(async () => {
      const currentWhatsAppId = sessionStorage.getItem("whatsappConfigId");

      if (!currentWhatsAppId || !isPollingRef.current) {
        return;
      }

      try {
        const statusResponse = await whatsAppApi.getStatus(
          currentWhatsAppId,
          true,
          {},
          headers
        );
        const status = statusResponse.data?.status ?? "INACTIVE";

        if (statusResponse.data?.settings) {
          setWhatsappConfig({
            name: statusResponse.data.settings.name || "Dora WhatsApp Official",
            assistantName:
              statusResponse.data.settings.assistantName || "Dora Assistant",
          });
        }

        setBotStatus(status);

        switch (status) {
          case "ACTIVE":
            setConnectionStatus(true);
            setError("");
            sessionStorage.setItem("alreadySetupWhatsApp", "true");
            sessionStorage.setItem("alreadySetupWhatsAppQR", "true");
            setMessage("Your WhatsApp is now connected and ready to use.");
            stopPolling();
            isConnectingRef.current = false;
            showToast("WhatsApp connected successfully!", "success");
            break;

          case "READY":
            setConnectionStatus(true);
            sessionStorage.setItem("alreadySetupWhatsApp", "true");
            sessionStorage.setItem("alreadySetupWhatsAppQR", "true");
            setError("");
            setMessage("Your WhatsApp is ready to use.");
            stopPolling();
            showToast("WhatsApp is ready!", "success");
            break;

          case "AUTH_FAILURE":
            setError("Authentication failed. Please try again.");
            setMessage("Authentication failed. Please try again.");
            stopPolling();
            isConnectingRef.current = false;
            // showToast("WhatsApp authentication failed", "error");
            break;

          case "ERROR":
            setError("Connection failed. Please try again.");
            setMessage("An error occurred while connecting.");
            stopPolling();
            isConnectingRef.current = false;
            break;

          case "INITIALIZING":
          case "CONNECTING":
          case "DISCONNECTED":
          case "INACTIVE":
          default:
            if (isPollingRef.current) {
              timeoutRef.current = setTimeout(() => pollStatus(), 1000);
            }
            break;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get WhatsApp status.";
        setError(errorMessage);
        showToast("Failed to check WhatsApp status", "error");
        stopPolling();
        isConnectingRef.current = false;
      }
    }, [headers, showToast, stopPolling]);

    const startPolling = useCallback(() => {
      if (!isPollingRef.current) {
        isPollingRef.current = true;
        timeoutRef.current = setTimeout(() => pollStatus(), 1000);
      }
    }, [pollStatus]);

    const initiateWhatsAppConnection = useCallback(async () => {
      const currentWhatsAppId = sessionStorage.getItem("whatsappConfigId");

      if (!currentWhatsAppId) {
        setError("WhatsApp configuration ID not found");
        setBotStatus("ERROR");
        return;
      }

      if (isConnectingRef.current) {
        return;
      }

      isConnectingRef.current = true;
      setError("");
      setBotStatus("INITIALIZING");
      setMessage("Initializing WhatsApp connection...");

      try {
        const connectResponse = await whatsAppApi.connect(
          currentWhatsAppId,
          true,
          {},
          headers
        );

        const responseData = connectResponse.data || connectResponse;
        const status = responseData.status;

        setQrCode(responseData.qrCode || null);
        setMessage(responseData.message || "Connection in progress...");
        setBotStatus(status);

        if (status === "ACTIVE") {
          setConnectionStatus(true);
          setError("");
          isConnectingRef.current = false;

          sessionStorage.setItem("alreadySetupWhatsApp", "true");
          sessionStorage.setItem("alreadySetupWhatsAppQR", "true");
          showToast("WhatsApp connected successfully!", "success");
          return;
        }

        if (status === "READY") {
          setConnectionStatus(true);
          sessionStorage.setItem("alreadySetupWhatsApp", "true");
          sessionStorage.setItem("alreadySetupWhatsAppQR", "true");
          setError("");
          isConnectingRef.current = false;
          showToast("WhatsApp is ready!", "success");
          return;
        }

        if (status === "AUTH_FAILURE") {
          setError("Authentication failed. Please try again.");
          isConnectingRef.current = false;
          // showToast("WhatsApp authentication failed", "error");
          return;
        }

        if (status === "INITIALIZING" || status === "CONNECTING") {
          startPolling();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initiate WhatsApp connection.";
        setError(errorMessage);
        setBotStatus("ERROR");
        isConnectingRef.current = false;
        showToast("Failed to initiate WhatsApp connection", "error");
      }
    }, [headers, showToast, startPolling]);

    useEffect(() => {
      const currentWhatsAppId = sessionStorage.getItem("whatsappConfigId");

      if (currentWhatsAppId && !connectionStatus && !isConnectingRef.current) {
        initiateWhatsAppConnection();
      }

      return () => {
        stopPolling();
        isConnectingRef.current = false;
      };
    }, [connectionStatus, initiateWhatsAppConnection, stopPolling]);

    useEffect(() => {
      if (
        (botStatus === "INITIALIZING" || botStatus === "CONNECTING") &&
        !isPollingRef.current
      ) {
        startPolling();
      }
    }, [botStatus, startPolling]);

    return (
      <div className="grid grid-cols-1 gap-6">
        <div
          className="relative rounded-2xl p-8 h-[260px] bg-cover bg-center bg-no-repeat w-full"
          style={{ backgroundImage: "url('/images/background/main-bg.png')" }}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 ${
                  connectionStatus ? "bg-[#0F9808]" : "bg-red-500"
                } rounded-full`}
              >
                {""}
              </span>
              <h1 className="!font-sentient text-[22px] text-white dark:text-white">
                {whatsappConfig.name}
              </h1>
            </div>
            <p className="!font-sentient text-white dark:text-white/50">
              {whatsappConfig.assistantName}
            </p>
          </div>
          <div className="absolute flex flex-col rounded-lg text-center right-10 bottom-0 mb-[-220px] h-[408px] w-[304px] bg-white p-4 shadow-lg">
            <div className="relative mb-4">
              {qrCode ? (
                <Image
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  width={272}
                  height={272}
                  className={`w-full h-auto rounded-lg transition-all duration-300 ${
                    connectionStatus ? "blur-sm opacity-50" : ""
                  }`}
                  unoptimized={true}
                  onError={() => {
                    setError("Failed to load QR Code image");
                  }}
                />
              ) : (
                <div className="w-full h-[272px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-center px-4">
                    {error
                      ? "Error loading QR Code"
                      : botStatus === "READY"
                      ? ""
                      : "Loading QR Code..."}
                  </p>
                </div>
              )}
              {connectionStatus && (
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
            <h2 className="!font-sentient text-[19px] text-black mb-2">
              {connectionStatus
                ? "WhatsApp Connected"
                : botStatus === "CONNECTING" || botStatus === "INITIALIZING"
                ? "Connecting..."
                : botStatus === "AUTH_FAILURE"
                ? "Authentication Failed"
                : "Scan QR Code to Connect"}
            </h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </div>
        </div>
      </div>
    );
  }
);

QRCodeDisplay.displayName = "QRCodeDisplay";
