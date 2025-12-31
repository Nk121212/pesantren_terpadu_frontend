// lib/api-canteen.ts
import {
  apiFetch,
  buildQueryString,
  ApiResponse,
  getToken,
  API_BASE_URL,
} from "./api-core";

export interface Merchant {
  id: number;
  userId: number;
  name: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface CanteenTransaction {
  id: number;
  santriId: number;
  merchantId: number;
  amount: number;
  description?: string;
  paymentMethod: "QRIS" | "VA" | "EWALLET" | "BANK_TRANSFER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofUrl?: string;
  createdAt: string;
  savingsTransactionId?: number; // ← TAMBAH INI
  santri?: {
    id: number;
    name: string;
  };
  merchant?: {
    id: number;
    name: string;
  };
  savingsTransaction?: {
    id: number;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description?: string;
  };
}

export interface CreateMerchantDto {
  userId: number;
  name: string;
}

export interface CreateCanteenTxDto {
  santriId: number;
  merchantId: number;
  amount: number;
  description?: string;
  paymentMethod?: "QRIS" | "VA" | "EWALLET" | "BANK_TRANSFER";
  proofUrl?: string;
  createdBy?: number;
}

// Type guard functions
function isMerchant(data: unknown): data is Merchant {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.userId === "number" &&
    typeof obj.name === "string" &&
    typeof obj.balance === "string" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string"
  );
}

function isMerchantArray(data: unknown): data is Merchant[] {
  return Array.isArray(data) && data.every(isMerchant);
}

function isCanteenTransaction(data: unknown): data is CanteenTransaction {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  const validPaymentMethods = ["QRIS", "VA", "EWALLET", "BANK_TRANSFER"];
  const validStatuses = ["PENDING", "APPROVED", "REJECTED"];

  // Handle amount yang bisa string atau number
  const amount = obj.amount;
  const isAmountValid =
    typeof amount === "number" ||
    (typeof amount === "string" &&
      !isNaN(Number(amount)) &&
      amount.trim() !== "");

  // Handle savingsTransactionId yang bisa string, number, atau undefined
  const savingsTransactionId = obj.savingsTransactionId;
  const isSavingsTxIdValid =
    savingsTransactionId === undefined ||
    typeof savingsTransactionId === "number" ||
    (typeof savingsTransactionId === "string" &&
      !isNaN(Number(savingsTransactionId)));

  // Validate required fields
  const hasRequiredFields =
    (typeof obj.id === "number" ||
      (typeof obj.id === "string" && !isNaN(Number(obj.id)))) &&
    (typeof obj.santriId === "number" ||
      (typeof obj.santriId === "string" && !isNaN(Number(obj.santriId)))) &&
    (typeof obj.merchantId === "number" ||
      (typeof obj.merchantId === "string" && !isNaN(Number(obj.merchantId)))) &&
    isAmountValid &&
    typeof obj.createdAt === "string" &&
    validPaymentMethods.includes(obj.paymentMethod as string) &&
    validStatuses.includes(obj.status as string);

  if (!hasRequiredFields) {
    console.error("Missing required fields:", {
      id: obj.id,
      idType: typeof obj.id,
      santriId: obj.santriId,
      santriIdType: typeof obj.santriId,
      merchantId: obj.merchantId,
      merchantIdType: typeof obj.merchantId,
      amount: obj.amount,
      amountType: typeof obj.amount,
      isAmountValid,
      createdAt: obj.createdAt,
      createdAtType: typeof obj.createdAt,
      paymentMethod: obj.paymentMethod,
      isValidPayment: validPaymentMethods.includes(obj.paymentMethod as string),
      status: obj.status,
      isValidStatus: validStatuses.includes(obj.status as string),
    });
    return false;
  }

  // Validate optional fields
  const optionalFieldsValid =
    (obj.description === undefined || typeof obj.description === "string") &&
    (obj.proofUrl === undefined || typeof obj.proofUrl === "string") &&
    isSavingsTxIdValid;

  return optionalFieldsValid;
}

function isCanteenTransactionArray(
  data: unknown
): data is CanteenTransaction[] {
  return Array.isArray(data) && data.every(isCanteenTransaction);
}

export const canteenApi = {
  async createMerchant(
    data: CreateMerchantDto
  ): Promise<ApiResponse<Merchant>> {
    try {
      const res = await apiFetch(`/canteen/merchant`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (isMerchant(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid merchant data structure:", res.data);
        return {
          success: false,
          error: "Data merchant tidak valid",
        };
      }
    } catch (error) {
      console.error("Error creating merchant:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat merchant",
      };
    }
  },

  async getMerchant(id: number): Promise<ApiResponse<Merchant>> {
    try {
      const res = await apiFetch(`/canteen/merchant/${id}`, { method: "GET" });

      if (isMerchant(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid merchant data structure:", res.data);
        return {
          success: false,
          error: "Data merchant tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching merchant:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data merchant",
      };
    }
  },

  async listMerchants(params?: {
    skip?: number;
    take?: number;
  }): Promise<ApiResponse<Merchant[]>> {
    try {
      const qs = buildQueryString(params);
      const res = await apiFetch(`/canteen/merchant${qs}`, { method: "GET" });

      if (isMerchantArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid merchants array structure:", res.data);
        return {
          success: false,
          error: "Data merchants tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching merchants:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data merchants",
      };
    }
  },

  async createTransaction(
    data: CreateCanteenTxDto,
    file?: File
  ): Promise<ApiResponse<CanteenTransaction>> {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("santriId", data.santriId.toString());
        formData.append("merchantId", data.merchantId.toString());
        formData.append("amount", data.amount.toString());
        if (data.description) formData.append("description", data.description);
        if (data.paymentMethod)
          formData.append("paymentMethod", data.paymentMethod);
        if (data.createdBy)
          formData.append("createdBy", data.createdBy.toString());
        formData.append("proof", file);

        // Debug: log FormData contents
        console.log("📤 FormData contents:");
        for (const pair of formData.entries()) {
          console.log(pair[0] + ": ", pair[1]);
        }

        const response = await fetch(`${API_BASE_URL}/canteen/transaction`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });

        console.log("📥 Response status:", response.status);
        console.log("📥 Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Response error text:", errorText);

          let errorMessage = `Error: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorText;
          } catch {
            errorMessage = errorText || `Error: ${response.status}`;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("✅ Full API response:", result);

        // Type check for file upload response
        if (result && typeof result === "object") {
          // Case 1: Response sudah dalam format ApiResponse {success, data, message}
          if ("success" in result && "data" in result && "message" in result) {
            const apiResponse = result as {
              success: boolean;
              data: unknown;
              message: string;
            };

            if (apiResponse.success) {
              // Normalize and convert data types
              const transactionData = apiResponse.data;

              if (transactionData && typeof transactionData === "object") {
                const tx = transactionData as Record<string, unknown>;

                // Convert string fields to numbers where needed
                const normalizedData: CanteenTransaction = {
                  id:
                    typeof tx.id === "string"
                      ? Number(tx.id)
                      : (tx.id as number),
                  santriId:
                    typeof tx.santriId === "string"
                      ? Number(tx.santriId)
                      : (tx.santriId as number),
                  merchantId:
                    typeof tx.merchantId === "string"
                      ? Number(tx.merchantId)
                      : (tx.merchantId as number),
                  amount:
                    typeof tx.amount === "string"
                      ? Number(tx.amount)
                      : (tx.amount as number),
                  paymentMethod:
                    tx.paymentMethod as CanteenTransaction["paymentMethod"],
                  status: tx.status as CanteenTransaction["status"],
                  createdAt: tx.createdAt as string,
                  description: tx.description as string | undefined,
                  proofUrl: tx.proofUrl as string | undefined,
                  savingsTransactionId: tx.savingsTransactionId
                    ? typeof tx.savingsTransactionId === "string"
                      ? Number(tx.savingsTransactionId)
                      : (tx.savingsTransactionId as number)
                    : undefined,
                };

                // Validate required fields
                if (
                  normalizedData.id &&
                  normalizedData.santriId &&
                  normalizedData.merchantId &&
                  normalizedData.amount &&
                  normalizedData.createdAt &&
                  normalizedData.paymentMethod &&
                  normalizedData.status
                ) {
                  console.log(
                    "✅ Transaction data normalized successfully:",
                    normalizedData
                  );
                  return { success: true, data: normalizedData };
                } else {
                  console.error(
                    "❌ Missing required fields after normalization:",
                    normalizedData
                  );
                }
              } else {
                console.error(
                  "❌ Transaction data is not an object:",
                  transactionData
                );
              }
            } else {
              // API returned success: false
              return {
                success: false,
                error: apiResponse.message || "Upload gagal",
              };
            }
          }
          // Case 2: Response langsung data transaction (tanpa wrapper)
          else if (isCanteenTransaction(result)) {
            return { success: true, data: result };
          }
        }

        // Jika semua validasi gagal
        console.error("❌ Invalid transaction data from file upload:", result);
        return {
          success: false,
          error: "Data transaksi dari upload file tidak valid",
        };
      } else {
        // Original code for non-file upload
        const res = await apiFetch(`/canteen/transaction`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (isCanteenTransaction(res.data)) {
          return { success: true, data: res.data };
        } else {
          console.error("Invalid transaction data structure:", res.data);
          return {
            success: false,
            error: "Data transaksi tidak valid",
          };
        }
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal membuat transaksi",
      };
    }
  },

  async listTransactions(
    merchantId: number
  ): Promise<ApiResponse<CanteenTransaction[]>> {
    try {
      const res = await apiFetch(`/canteen/transactions/${merchantId}`, {
        method: "GET",
      });

      if (isCanteenTransactionArray(res.data)) {
        return { success: true, data: res.data };
      } else {
        console.error("Invalid transactions array structure:", res.data);
        return {
          success: false,
          error: "Data transaksi tidak valid",
        };
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data transaksi",
      };
    }
  },
};
