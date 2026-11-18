import { RiRobot2Fill } from "react-icons/ri";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { FaArrowTurnUp } from "react-icons/fa6";

import "./chat-bot-ai.css";

const ChatBotAI = () => {
  return (
    <div id="chatbot-wrapper">
      <div className="chatbot-header flex-between">
        <div className="chatbot-header-info">
          <RiRobot2Fill size={24} />
          Chatbot
        </div>
        <IoArrowDownCircleOutline size={24} />
      </div>
      <div className="chatbot-chat-area">XXX</div>
      <div className="chatbot-input-area flex-center">
        <input type="text" name="" id="" />
        <div className="chatbot-input-area-button flex-center">
          <FaArrowTurnUp />
        </div>
      </div>
    </div>
  );
};

export default ChatBotAI;
