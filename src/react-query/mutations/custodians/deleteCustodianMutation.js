import { useMutation, useQueryClient } from "react-query";
import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const useDeleteCustodianMutation = (organization) => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore();

  return useMutation(
    async (dataArray) => {
      const [custodianId, contactId] = dataArray;
      await httpService.makeRequest(
        "delete",
        `${window.env.API_URL}custodian/custodian/${custodianId}`
      );
      await httpService.makeRequest(
        "delete",
        `${window.env.API_URL}custodian/contact/${contactId}`
      );
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["custodians", organization],
        });
        await queryClient.invalidateQueries({
          queryKey: ["contact", organization],
        });
        showAlert({
          type: "success",
          message: "Custodian deleted successfully!",
          open: true,
        });
      },
      onError: () => {
        showAlert({
          type: "error",
          message: "Error in deleting custodian!",
          open: true,
        });
      },
    }
  );
};
