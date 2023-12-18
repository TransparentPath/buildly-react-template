import { useMutation, useQueryClient } from "react-query";
import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const useAddItemMutation = (
  organization,
  setFormModal,
  setConfirmModal
) => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore();

  return useMutation(
    async (itemData) => {
      const response = await httpService.makeRequest(
        "post",
        `${window.env.API_URL}shipment/item/`,
        itemData
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["items", organization],
        });
        setFormModal(false);
        setConfirmModal(false);
        showAlert({
          type: "success",
          message: "Successfully added item",
          open: true,
        });
      },
      onError: () => {
        showAlert({
          type: "error",
          message: "Error in creating item",
          open: true,
        });
      },
    }
  );
};
