import { useNavigate } from "react-router";
import z from "zod";

const useParseStoredPendingRegistrationEmail = () => {
  const navigate = useNavigate();

  const storedPendingRegistrationEmail = localStorage.getItem(
    "pendingRegistrationEmail",
  );

  const parsedStoredPendingRegistrationEmail = z
    .email()
    .safeParse(storedPendingRegistrationEmail);

  if (!parsedStoredPendingRegistrationEmail.success) {
    navigate("/register");
    return undefined as never;
  }

  return parsedStoredPendingRegistrationEmail.data;
};

export default useParseStoredPendingRegistrationEmail;
