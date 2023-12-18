import { httpService } from "@modules/http/http.service";
import { useStore } from "../../../zustand/alert/alertStore";

export const getCustodianTypeQuery = async () => {
  const showErrorAlert = () => {
    const { showAlert } = useStore();
    showAlert({
      type: "error",
      message: "Couldn't load custodian types due to some error!",
      open: true,
    });
  };

  try {
    const response = await httpService.makeRequest(
      "get",
      `${window.env.API_URL}custodian/custodian_type/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching custodians types:", error);
    showErrorAlert();
    return [];
  }
};
