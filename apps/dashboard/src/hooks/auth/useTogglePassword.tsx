import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const useTogglePassword = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const handleEyeIconClick = () => setIsPasswordVisible((prev) => !prev);
  const EyeIconComponent = () => (
    <div
      className="hover:text-primary absolute z-10 pr-2"
      onClick={handleEyeIconClick}
      title={`${isPasswordVisible ? "Hide" : "Show"} the password`}
    >
      {isPasswordVisible ? <EyeOff /> : <Eye />}
    </div>
  );

  return {
    isPasswordVisible,
    EyeIconComponent,
  };
};

export default useTogglePassword;
