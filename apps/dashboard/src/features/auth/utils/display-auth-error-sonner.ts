import { toast } from "sonner";

export const displayAuthErrorSonner = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get("error");
  const errorDescriptionParam = urlParams.get("error_description");

  if (errorParam && errorDescriptionParam) {
    setTimeout(() => {
      toast.error(`Authentication error: ${errorParam}`, {
        description: errorDescriptionParam,
        position: "top-center",
      });
    });
  }
};
