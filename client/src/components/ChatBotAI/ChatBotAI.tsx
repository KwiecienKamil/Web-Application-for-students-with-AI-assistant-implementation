import { RiRobot2Fill } from "react-icons/ri";
import { FaArrowTurnUp } from "react-icons/fa6";
import { FiMenu } from "react-icons/fi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import "./chat-bot-ai.css";
import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { FaRegWindowClose } from "react-icons/fa";

const ChatBotAI = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const user = useAppSelector((user) => user.user.user);

  const time = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
            <FaRegWindowClose
              size={22}
              className="chatbot-close-btn"
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            />
          </div>
          <div className="chatbot-chat-area">
            <div className="chatbot-headline-message">
              <h1>{user?.name ? `Cześć, ${user?.name}👋` : "Cześć 👋"}</h1>
              <p>Jestem Czacior – wirtualny doradca</p>
            </div>
            <div className="chatbot-chat-message-wrapper">
              <div className="chatbot-chat-message-heading flex-row">
                <p>Czacior</p>
                <p>{time}</p>
              </div>
              <div className={`chatbot-chat-message-body`}>
                <p>W czym mogę pomóc?</p>
              </div>
            </div>
          </div>
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
