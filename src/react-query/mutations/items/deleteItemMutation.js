import { useMutation, useQueryClient } from "react-query";
import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const useDeleteItemMutation = (organization) => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore();

  return useMutation(
    async (itemId) => {
      await httpService.makeRequest(
        "delete",
        `${window.env.API_URL}shipment/item/${itemId}`
      );
    },
    {
      onSuccess: async () => {
        showAlert({
          type: "success",
          message: "Item deleted successfully!",
          open: true,
        });
        await queryClient.invalidateQueries({
          queryKey: ["items", organization],
        });
      },
      onError: () => {
        showAlert({
          type: "error",
          message: "Error in deleting item!",
          open: true,
        });
      },
    }
  );
};
