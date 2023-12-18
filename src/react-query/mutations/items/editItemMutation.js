import { useMutation, useQueryClient } from "react-query";
import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const useEditItemMutation = (
  organization,
  setFormModal,
  setConfirmModal
) => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore();

  return useMutation(
    async (itemData) => {
      const response = await httpService.makeRequest(
        "patch",
        `${window.env.API_URL}shipment/item/${itemData.id}`,
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
          message: "Item successfully edited!",
          open: true,
        });
      },
      onError: () => {
        showAlert({
          type: "error",
          message: "Couldn't edit item!",
          open: true,
        });
      },
    }
  );
};
