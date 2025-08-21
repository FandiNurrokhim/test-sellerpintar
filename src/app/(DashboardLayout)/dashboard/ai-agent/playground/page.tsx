"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useBranch } from "@/context/BranchContext";
import { useSession } from "next-auth/react";

import AssistantFormModal from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/assistant/form";
import AssistantDetailModal from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/assistant/detail";
import AssistantPlayground from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/assistant/playground";
import AssistantConversationList from "@/app/(DashboardLayout)/dashboard/ai-agent/partials/assistant/assistant-conversation-list";
import { useToast } from "@/components/atoms/ToastProvider";

import type { Assistant, Conversation } from "@/schemas/assistant/assistant";
import { assistantApi } from "@/utils/apis/assistant";

export default function AssistantPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<Conversation | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);
  const [isNewConversation, setIsNewConversation] = useState(false);

  const { showToast } = useToast();

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const { branchId } = useBranch();

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (organizationId) h["x-organization-id"] = organizationId;
    if (branchId) h["x-branch-id"] = branchId;
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [organizationId, branchId, token]);

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectAssistant = useCallback(
    async (assistant: Assistant) => {
      setSelectedAssistant(assistant);
      setSelectedConversation(null);
      setIsNewConversation(false);
      setLoading(true);
      try {
        const res = await assistantApi.getConversationByAssistant(
          assistant.id,
          true,
          { headers }
        );
        const data = Array.isArray(res.data.conversations)
          ? res.data.conversations
          : [];
        setConversations(data);
        if (data.length === 0) {
          setSelectedConversation(null);
        }
      } catch (err) {
        setConversations([]);
        setSelectedConversation(null);
        showToast(
          "Failed to fetch conversations " +
            (err instanceof Error ? err.message : ""),
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [headers, showToast]
  );

  const fetchAssistants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assistantApi.getAssistants(true, { headers });
      const data = Array.isArray(res.data.assistants)
        ? res.data.assistants
        : [];
      setAssistants(data);
      if (data[0]) {
        setSelectedAssistant(data[0]);
        await handleSelectAssistant(data[0]);
      } else {
        setSelectedAssistant(null);
        setConversations([]);
      }
    } catch (err) {
      setAssistants([]);
      showToast(
        "Failed to fetch assistants " +
          (err instanceof Error ? err.message : ""),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [headers, handleSelectAssistant, showToast]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants, branchId]);

  useEffect(() => {
    if (
      pendingConversationId &&
      conversations.length > 0 &&
      (selectedConversation === null ||
        selectedConversation?.id === pendingConversationId)
    ) {
      const found = conversations.find((c) => c.id === pendingConversationId);
      if (found) {
        setSelectedConversation(found);
        setPendingConversationId(null);
      }
    }
  }, [pendingConversationId, conversations, selectedConversation]);

  const refetchConversations = async () => {
    if (!isNewConversation || !selectedAssistant) return;

    setLoading(true);
    try {
      const res = await assistantApi.getConversationByAssistant(
        selectedAssistant.id,
        true,
        { headers }
      );
      const data = Array.isArray(res.data.conversations)
        ? res.data.conversations
        : [];
      setConversations(data);

      if (pendingConversationId) {
        const found = data.find((c) => c.id === pendingConversationId);
        if (found) {
          setSelectedConversation(found);
        } else if (data.length > 0) {
          setSelectedConversation(data[0]);
        } else {
          setSelectedConversation(null);
        }
        setPendingConversationId(null);
      }
      setIsNewConversation(false);
    } catch (err) {
      setConversations([]);
      setSelectedConversation(null);
      showToast(
        "Failed to fetch conversations " +
          (err instanceof Error ? err.message : ""),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AssistantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async () => {
          await fetchAssistants();
          setIsModalOpen(false);
        }}
      />

      <AssistantFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={selectedAssistant}
        onSubmit={async () => {
          await fetchAssistants();
          setIsModalOpen(false);
        }}
        isEdit
      />

      {selectedAssistant && (
        <AssistantDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          assistant={selectedAssistant}
        />
      )}

      <div
        className="flex h-[90vh] bg-white dark:bg-[#161618] rounded-2xl overflow-hidden"
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
        {/* Assistant Conversation List */}
        <div
          className={`flex-shrink-0 w-[340px] h-full bg-white dark:bg-[#161618] flex flex-col`}
        >
          <AssistantConversationList
            assistants={assistants}
            selectedAssistant={selectedAssistant}
            conversations={conversations}
            selectedConversation={selectedConversation}
            loading={loading}
            setSelectedAssistant={handleSelectAssistant}
            setSelectedConversation={setSelectedConversation}
            setPendingConversationId={setPendingConversationId}
            setIsNewConversation={setIsNewConversation}
          />
        </div>
        <div
          className={`flex-1 flex flex-col h-full ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          <AssistantPlayground
            assistantId={selectedAssistant?.id || ""}
            conversationId={selectedConversation?.id || ""}
            refetch={refetchConversations}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            isNewConversation={isNewConversation}
            onConversationIdChange={(id: string | null) => {
              if (id === null) {
                setSelectedConversation(null);
                setPendingConversationId(null);
                return;
              }

              const found = conversations.find((c) => c.id === id);
              if (found) {
                setSelectedConversation(found);
                setPendingConversationId(null);
              } else {
                setPendingConversationId(id);
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
