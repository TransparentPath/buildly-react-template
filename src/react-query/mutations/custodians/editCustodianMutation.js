import { useMutation, useQueryClient } from "react-query";
import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const useEditCustodianMutation = (
  organization,
  setFormModal,
  setConfirmModal
) => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore();

  return useMutation(
    async (arrayData) => {
      const [custodianData, contactData] = arrayData;
      const contactResponse = await httpService.makeRequest(
        "patch",
        `${window.env.API_URL}custodian/contact/${contactData.id}`,
        contactData
      );
      const custodianResponse = await httpService.makeRequest(
        "patch",
        `${window.env.API_URL}custodian/custodian/${custodianData.id}`,
        custodianData
      );
      const response = {
        contactResponse,
        custodianResponse,
      };
      return response;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["custodians", organization],
        });
        await queryClient.invalidateQueries({
          queryKey: ["contact", organization],
        });
        setFormModal(false);
        setConfirmModal(false);
        showAlert({
          type: "success",
          message: "Custodian successfully edited!",
          open: true,
        });
      },
      onError: () => {
        showAlert({
          type: "error",
          message: "Couldn't edit custodian!",
          open: true,
        });
      },
    }
  );
};
