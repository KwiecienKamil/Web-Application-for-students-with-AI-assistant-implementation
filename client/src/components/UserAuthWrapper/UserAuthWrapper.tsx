import type { ReactNode } from "react";
import "./user-login-wrapper.css";

type UserAuthWrapperProps = {
  children: ReactNode;
};

const UserAuthWrapper = ({ children }: UserAuthWrapperProps) => {
  return <div id="user-auth-wrapper">{children}</div>;
};

export default UserAuthWrapper;
