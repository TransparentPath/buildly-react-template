import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const getCustodianQuery = async (organization) => {
  const showErrorAlert = () => {
    const { showAlert } = useStore();
    showAlert({
      type: "error",
      message: "Couldn't load custodians due to some error!",
      open: true,
    });
  };

  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}custodian/custodian/?organization_uuid=${organization}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching custodians:", error);
    showErrorAlert();
    return [];
  }
};
