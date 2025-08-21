import { businessApi } from "@/utils/apis/business";
import { productApi } from "@/utils/apis/product";
import { ProductsResponse } from "@/schemas/initiateSetup/product";
import type { Assistant } from "@/schemas/assistant/assistant";
import { assistantApi } from "@/utils/apis/assistant";
import { getSession } from "next-auth/react";
import { whatsAppApi } from "@/utils/apis/whatsapp";

type Branch = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  paymentInformation?: {
    accountName: string;
    accountCode: string;
    accountNumber: string;
  };
};

export interface SetupStatus {
  title: string;
  already: boolean;
}

export async function checkSetupHelper(
  branchId: string
): Promise<SetupStatus[]> {
  const statuses: SetupStatus[] = [];

  try {
    const session = await getSession();
    const token = session?.user.accessToken;
    const organizationId = session?.organizationId;

    const branch: Branch | null = await businessApi
      .getBranchById(branchId)
      .then((res) => res.data)
      .catch(() => null);

    const branchSetup =
      !!branch?.paymentInformation &&
      !!branch.paymentInformation.accountName &&
      !!branch.paymentInformation.accountNumber;

    statuses.push({
      title: "Branch",
      already: branchSetup,
    });

    const hasProducts = await productApi
      .getAll({ page: 1, perPage: 1 })
      .then((res) => {
        const data = res as ProductsResponse;
        return data.data?.products?.length > 0;
      })
      .catch(() => false);

    statuses.push({
      title: "Product",
      already: hasProducts,
    });

    const headers: Record<string, string> = {};
    if (organizationId) headers["x-organization-id"] = organizationId;
    if (branchId) headers["x-branch-id"] = branchId;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const assistants: Assistant[] = await assistantApi
      .getAssistants(true, { headers })
      .then((res) => res.data.assistants)
      .catch(() => []);

    statuses.push({
      title: "AI Configuration",
      already: Array.isArray(assistants) && assistants.length > 0 ? true : false,
    });

    const resultWhatsapp = await whatsAppApi.getSettings();
    if (
      resultWhatsapp &&
      resultWhatsapp.success &&
      Array.isArray(resultWhatsapp.data)
    ) {
      statuses.push({ title: "WhatsApp Configuration", already: true });
      statuses.push({ title: "WhatsApp QR", already: true });
    } else {
      statuses.push({ title: "WhatsApp Configuration", already: false });
      statuses.push({ title: "WhatsApp QR", already: false });
    }
  } catch (err) {
    console.error("[checkSetupHelper] error:", err);
  }

  return statuses;
}
