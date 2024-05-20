import { IoIosSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { FaStopCircle } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { TypeAnimation } from "react-type-animation";
import Logo from "./assets/logo.png";

const App = () => {
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  const decodeHTMLEntities = (text) => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = text;
    return tempElement.textContent || tempElement.innerText || "";
  };
  console.log(import.meta.env.VITE_USERNAME);
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => {
        setIsMicrophoneActive(true); // Set microphone active
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // handleSendMessage(transcript);
      };
      recognitionInstance.onend = () => {
        setIsMicrophoneActive(false); // Set microphone inactive
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event);
        setIsMicrophoneActive(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the messages list whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput("");

    try {
      const authResponse = await fetch(import.meta.env.VITE_AUTH_RESPONSE, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: import.meta.env.VITE_USERNAME,
          password: import.meta.env.VITE_PASSWORD,
        }),
      });

      if (!authResponse.ok) {
        throw new Error("Failed to authenticate");
      }
      const authData = await authResponse.json();
      setToken(authData.access_token);

      const chatResponse = await fetch(import.meta.env.VITE_CHAT_RESPONSE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
          message: input,
          stream: false,
          run_id: import.meta.env.VITE_RUN_ID,
          assistant: import.meta.env.VITE_ASSISTANT,
          with_html: true,
          filters: {},
        }),
      });

      if (!chatResponse.ok) {
        throw new Error("Failed to send message");
      }

      const chatData = await chatResponse.json();
      // const plainText = chatData.ui.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags to get plain text
      const plainText = decodeHTMLEntities(chatData.ui);

      setIsAnimating(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: plainText,
          isUser: false,
          isHTML: true,
          animate: true,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAnimationComplete = (index) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg, i) =>
        i === index ? { ...msg, animate: false } : msg
      )
    );
    setIsAnimating(false);
  };

  const handleMicrophoneClick = () => {
    if (recognition) {
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md flex flex-col h-[95vh] lg:h-[80vh] md:h-[80vh] sm:h-[85vh] overflow-y-auto">
        <div className="mb-4 flex justify-center sticky top-0 bg-white z-10 py-2 border-b border-gray-300">
          <img src={Logo} alt="Logo" className="h-12 w-full object-contain" />
        </div>
        <div className="flex flex-col flex-1 space-y-4 overflow-y-scroll p-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.isUser ? "justify-end" : ""
              } space-x-3`}
            >
              <img
                src={
                  message.isUser
                    ? "https://static.vecteezy.com/system/resources/previews/004/819/327/original/male-avatar-profile-icon-of-smiling-caucasian-man-vector.jpg"
                    : "https://png.pngtree.com/png-vector/20230225/ourmid/pngtree-smart-chatbot-cartoon-clipart-png-image_6620453.png"
                }
                alt={message.isUser ? "User" : "Bot"}
                className="w-8 h-8 rounded-full"
              />
              {message.isHTML ? (
                message.animate ? (
                  <TypeAnimation
                    key={index}
                    splitter={(str) => str.split(/(?= )/)}
                    sequence={[
                      message.text,
                      () => handleAnimationComplete(index),
                    ]}
                    speed={{ type: "keyStrokeDelayInMs", value: 30 }}
                    omitDeletionAnimation={true}
                    style={{
                      fontSize: "1em",
                      display: "block",
                      whiteSpace: "pre-wrap",
                    }}
                    repeat={0}
                    onStep={scrollToBottom}
                    className={`p-3 rounded-lg ${
                      message.isUser
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200 text-black self-start"
                    }`}
                  />
                ) : (
                  <div
                    className={`p-3 rounded-lg ${
                      message.isUser
                        ? "bg-blue-500 text-white self-end justify-end"
                        : "bg-gray-200 text-black self-start justify-start"
                    }`}
                  >
                    {message.text}
                  </div>
                )
              ) : (
                <div
                  className={`p-3 rounded-lg ${
                    message.isUser
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 text-black self-start"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 flex items-center sticky bottom-0 bg-white py-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow p-4 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 absolute right-2 text-black/40 hover:bg-slate-100 text-2xl rounded-full"
          >
            <IoIosSend />
          </button>
          <button
            onClick={handleMicrophoneClick}
            className="p-2 absolute right-8 mr-4 text-black/40 text-2xl rounded-full hover:bg-slate-100"
          >
            {isMicrophoneActive ? <FaStopCircle /> : <FaMicrophone />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
