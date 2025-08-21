/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeaderTitlePage from "@/components/templates/HeaderTitlePage";

import WhatsAppConversationList from "@/app/(DashboardLayout)/dashboard/whatsapp-chat/partials/whatsapp-conversation-list";
import WhatsAppPlayground from "@/app/(DashboardLayout)/dashboard/whatsapp-chat/partials/playground";

import type {
  WhatsApp,
  ConversationInternal,
  GetHistoryResponse,
} from "@/schemas/whatsapp/whatsapp";
import { useSession } from "next-auth/react";
import { whatsAppApi } from "@/utils/apis/whatsapp";
import { WhatsAppSetting, GetHistoryParams } from "@/types/whatsapp";

interface WhatsAppAssistant extends WhatsApp {
  whatsAppSettingId: string;
  phoneNumber: string;
  botStatus: string;
}

interface WhatsAppSettingsApiResponse {
  success: boolean;
  data: WhatsAppSetting[];
}

export default function WhatsAppChatPage() {
  const searchParams = useSearchParams();
  const conversationIdFromUrl = searchParams.get("id");

  const [assistants, setAssistants] = useState<WhatsAppAssistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] =
    useState<WhatsAppAssistant | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationInternal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationInternal[]>(
    []
  );
  const { data: session } = useSession();

  const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
  const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");
  const organizationId = org.id || session?.organizationId;
  const branchId =
    branch.id || sessionStorage.getItem("branchId") || session?.branchId;

  const headers = useMemo(
    () => ({
      "x-organization-id": organizationId,
      "x-branch-id": branchId,
      ...(session?.user?.accessToken && {
        Authorization: `Bearer ${session.user.accessToken}`,
      }),
    }),
    [organizationId, branchId, session?.user?.accessToken]
  );

  useEffect(() => {
    const loadAssistants = async () => {
      if (!organizationId || !branchId) return;

      setLoading(true);
      try {
        const result = (await whatsAppApi.getSettings(
          true,
          {},
          headers
        )) as WhatsAppSettingsApiResponse;

        if (result?.success && result.data && Array.isArray(result.data)) {
          const transformedAssistants: WhatsAppAssistant[] = result.data.map(
            (setting) => ({
              id: setting.assistantId,
              name: setting.assistantName || setting.name,
              description: `${setting.name}`,
              instructions: "WhatsApp assistant for automated conversations",
              temperature: 0.7,
              createdAt: setting.lastConnectedAt || new Date().toISOString(),
              updatedAt: setting.lastConnectedAt || new Date().toISOString(),
              isActive: setting.isActive && setting.botStatus === "CONNECTED",
              hasSalesCapabilities: false,
              assistantDocumentStores: [],
              flowiseId: undefined,
              details: {
                name: setting.assistantName || setting.name,
                description: `${setting.name}`,
                instructions: "WhatsApp assistant for automated conversations",
                temperature: 0.7,
                model: "gpt-3.5-turbo",
                hasSalesCapabilities: false,
              },
              whatsAppSettingId: setting.id,
              phoneNumber: setting.phoneNumber,
              botStatus: setting.botStatus,
            })
          );

          setAssistants(transformedAssistants);

          if (!selectedAssistant && transformedAssistants.length > 0) {
            setSelectedAssistant(transformedAssistants[0]);
          }
        }
      } catch (error) {
        console.error("Gagal memuat asisten WhatsApp:", error);
        setAssistants([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssistants();
  }, [organizationId, branchId, headers]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!selectedAssistant?.whatsAppSettingId) {
        setConversations([]);
        setSelectedConversation(null);
        return;
      }

      setLoading(true);
      try {
        const params: GetHistoryParams = {
          whatsappInboundSettingsId: selectedAssistant.whatsAppSettingId,
          limit: 20,
          offset: 0,
        };

        const response = (await whatsAppApi.getHistory(
          params,
          true,
          {},
          headers
        )) as unknown as GetHistoryResponse;

        if (
          response.success &&
          response.data.chatRooms &&
          Array.isArray(response.data.chatRooms)
        ) {
          const transformedConversations: ConversationInternal[] =
            response.data.chatRooms.map((chatRoom) => ({
              id: chatRoom.id,
              contactNumber: chatRoom.contactNumber,
              contactName:
                chatRoom.contactName || `Contact ${chatRoom.contactNumber}`,
              autoReply: chatRoom.autoReply,
              messageCount: chatRoom.messageCount,
              lastActive: chatRoom.lastActive,
              lastMessageAt: chatRoom.lastMessageAt,
              handlerId: chatRoom.handlerId,
              lastMessage: chatRoom.lastMessage
                ? {
                    id: chatRoom.lastMessage.id,
                    role: chatRoom.lastMessage.role,
                    content: chatRoom.lastMessage.content,
                    timestamp: chatRoom.lastMessage.timestamp,
                    handlerId: chatRoom.lastMessage.handlerId,
                    metadata: chatRoom.lastMessage.metadata,
                  }
                : undefined,

              userId: chatRoom.handlerId || "",
              status: "active",
              createdAt: chatRoom.lastActive || new Date().toISOString(),
              updatedAt: chatRoom.lastMessageAt || new Date().toISOString(),
              assistantId: selectedAssistant.id,
              type: "whatsapp" as const,
              unreadCount: 0,
              summary: "",
              isArchived: false,
            }));

          setConversations(transformedConversations);

          if (conversationIdFromUrl) {
            const targetConversation = transformedConversations.find(
              (conv) => conv.id === conversationIdFromUrl
            );
            if (targetConversation) {
              setSelectedConversation(targetConversation);
            } else {
              console.warn(
                `Conversation with id ${conversationIdFromUrl} not found`
              );
              if (transformedConversations.length > 0) {
                setSelectedConversation(transformedConversations[0]);
              }
            }
          } else {
            if (transformedConversations.length > 0 && !selectedConversation) {
              setSelectedConversation(transformedConversations[0]);
            }
          }
        } else {
          setConversations([]);
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error("Gagal mengambil percakapan:", error);
        setConversations([]);
        setSelectedConversation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [headers, selectedAssistant]);

  const handleSelectAssistant = useCallback(
    async (assistant: WhatsAppAssistant): Promise<void> => {
      if (selectedAssistant?.id !== assistant.id) {
        setSelectedAssistant(assistant);
        setSelectedConversation(null);
      }
    },
    [selectedAssistant?.id]
  );

  const handleSelectConversation = useCallback(
    (conversation: ConversationInternal | null) => {
      setSelectedConversation(conversation);
    },
    []
  );

  const refetchAssistantsAndConversations = useCallback(async () => {
    if (!organizationId || !branchId) return;

    setLoading(true);
    try {
      const result = (await whatsAppApi.getSettings(
        true,
        {},
        headers
      )) as WhatsAppSettingsApiResponse;

      if (result?.success && result.data && Array.isArray(result.data)) {
        const transformedAssistants: WhatsAppAssistant[] = result.data.map(
          (setting) => ({
            id: setting.assistantId,
            name: setting.assistantName || setting.name,
            description: `${setting.name}`,
            instructions: "WhatsApp assistant for automated conversations",
            temperature: 0.7,
            createdAt: setting.lastConnectedAt || new Date().toISOString(),
            updatedAt: setting.lastConnectedAt || new Date().toISOString(),
            isActive: setting.isActive && setting.botStatus === "CONNECTED",
            hasSalesCapabilities: false,
            assistantDocumentStores: [],
            flowiseId: undefined,
            details: {
              name: setting.assistantName || setting.name,
              description: `${setting.name}`,
              instructions: "WhatsApp assistant for automated conversations",
              temperature: 0.7,
              model: "gpt-3.5-turbo",
              hasSalesCapabilities: false,
            },
            whatsAppSettingId: setting.id,
            phoneNumber: setting.phoneNumber,
            botStatus: setting.botStatus,
          })
        );

        setAssistants(transformedAssistants);

        setSelectedAssistant((currentSelectedAssistant) => {
          if (currentSelectedAssistant) {
            const updatedAssistant = transformedAssistants.find(
              (a) => a.id === currentSelectedAssistant.id
            );
            if (updatedAssistant) {
              return updatedAssistant;
            } else if (transformedAssistants.length > 0) {
              setSelectedConversation(null);
              return transformedAssistants[0];
            } else {
              setSelectedConversation(null);
              return null;
            }
          } else if (transformedAssistants.length > 0) {
            return transformedAssistants[0];
          }
          return null;
        });
      }
    } catch (error) {
      console.error("Gagal mengambil ulang asisten:", error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, branchId, headers]);

  return (
    <div className="flex flex-col h-full">
      <HeaderTitlePage
        title="WhatsApp Chat"
        description="Manage your WhatsApp conversations with AI assistants."
      />

      <div className="flex flex-1 p-4 overflow-hidden">
        <div
          className="flex h-[90vh] bg-white dark:bg-[#161618] rounded-2xl overflow-hidden w-full"
          style={
            isFullscreen
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 50,
                }
              : {}
          }
        >
          <div
            className={`md:max-w-sm max-w-full flex-1 bg-white dark:bg-[#161618] ${
              selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            <WhatsAppConversationList
              assistants={assistants}
              selectedAssistant={selectedAssistant}
              conversations={conversations}
              selectedConversation={selectedConversation}
              loading={loading}
              setSelectedAssistant={handleSelectAssistant}
              setSelectedConversation={handleSelectConversation}
            />
          </div>

          <div
            className={`flex-1 ${
              !selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            <WhatsAppPlayground
              assistantId={selectedAssistant?.id || ""}
              conversationId={selectedConversation?.id || ""}
              whatsAppSettingId={selectedAssistant?.whatsAppSettingId}
              refetch={refetchAssistantsAndConversations}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
              onConversationIdChange={(id: string | null) => {
                if (id === null) {
                  setSelectedConversation(null);
                  return;
                }

                const found = conversations.find((c) => c.id === id);
                if (found) {
                  setSelectedConversation(found);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
