import type { ReactNode } from "react"
import "./interface-wrapper.css"

type WrapperProps = {
  children: ReactNode;
};

const InterfaceWrapper = ({children}: WrapperProps) => {
  return (
    <div id="interface-wrapper">
        {children}
    </div>
  )
}

export default InterfaceWrapper