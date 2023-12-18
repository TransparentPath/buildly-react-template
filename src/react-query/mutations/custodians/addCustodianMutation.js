import { useMutation, useQueryClient } from "react-query";
import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const useAddCustodianMutation = (
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
        "post",
        `${window.env.API_URL}custodian/contact/`,
        contactData
      );
      if (contactResponse && contactResponse.data) {
        const contactInfo = contactResponse.data.url;
        let custodianPayload = {
          ...custodianData,
          contact_data: [contactInfo],
        };
        if (!custodianData.custody_org_uuid) {
          const orgResponse = await httpService.makeRequest(
            "post",
            `${window.env.API_URL}organization/`,
            { name: custodianPayload.name, organization_type: 1 }
          );
          if (orgResponse && orgResponse.data) {
            custodianPayload = {
              ...custodianPayload,
              custody_org_uuid: orgResponse.data.organization_uuid,
            };
          }
        }
        const response = await httpService.makeRequest(
          "post",
          `${window.env.API_URL}custodian/custodian/`,
          custodianPayload
        );
        return response.data;
      }
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
          message:
            "Successfully added custodian. Please ensure your organization admin assigns an organization to this custodian",
          open: true,
        });
      },
      onError: () => {
        showAlert({
          type: "error",
          message: "Error in creating custodian",
          open: true,
        });
      },
    }
  );
};
