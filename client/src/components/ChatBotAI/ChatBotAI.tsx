import { RiRobot2Fill } from "react-icons/ri";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { FaArrowTurnUp } from "react-icons/fa6";
import { FiMenu } from "react-icons/fi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import "./chat-bot-ai.css";
import { useState } from "react";

const ChatBotAI = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      {isChatbotOpen ? (
        <div id="chatbot-wrapper">
          <div className="chatbot-header flex-between">
            <FiMenu size={20} className="chatbot-nav-btn" />
            <div className="chatbot-header-info">
              <RiRobot2Fill size={24} />
              Chatbot
            </div>
            <IoArrowDownCircleOutline
              size={24}
              className="chatbot-close-btn"
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            />
          </div>
          <div className="chatbot-chat-area">XXX</div>
          <div className="chatbot-input-area flex-center">
            <input type="text" name="" id="chatbot-input" />
            <div className="chatbot-input-area-button flex-center">
              <FaArrowTurnUp />
            </div>
          </div>
        </div>
      ) : (
        <div
          id="chatbot-icon"
          className="flex-center"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        >
          <IoChatboxEllipsesOutline size={30} />
        </div>
      )}
    </>
  );
};

export default ChatBotAI;
