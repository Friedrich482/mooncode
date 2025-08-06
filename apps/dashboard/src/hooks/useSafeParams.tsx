import { useNavigate, useParams } from "react-router";
import { ZodType } from "zod";

const useSafeParams = <T,>(schema: ZodType<T>) => {
  const navigate = useNavigate();
  const params = useParams();

  try {
    const data = schema.parse(params);
    return data;
  } catch {
    navigate("/not-found", { replace: true });
    return undefined as never;
  }
};

export default useSafeParams;
