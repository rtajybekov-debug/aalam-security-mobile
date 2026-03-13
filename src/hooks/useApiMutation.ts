import { useMutation } from "@tanstack/react-query";
import { toastBus } from "../ui/feedback/toastBus";
import { handleApiError } from "../utils/error/handleApiError";

interface UseApiMutationOptions<TData, TVariables> {
  successMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown) => void;
}

export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onError: (err) => {
      const { message } = handleApiError(err);
      toastBus.show({ message, severity: "error" });
      options?.onError?.(err);
    },
    onSuccess: (data, variables) => {
      if (options?.successMessage) {
        toastBus.show({ message: options.successMessage, severity: "success" });
      }
      options?.onSuccess?.(data, variables);
    },
  });
}
