import React, { useState, useEffect, useRef } from "react";
import { MdSend, MdOutlineEmojiEmotions } from "react-icons/md";
import { IoMdAttach } from "react-icons/io";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  type: "sent" | "received";
  timestamp: string;
  senderId: string;
  recipientId: string;
  auctionId: string;
  createdAt: Date;
}

interface ChatProps {
  seller: {
    id: string;
    name: string;
  };
  auctionTitle: string;
  auctionId: string;
}

function Chat({ seller, auctionTitle, auctionId }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userId = session?.user?.id;
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Track window size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !auctionId) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`/api/messages/${auctionId}`);

        // Format messages with sent/received type
        const formattedMessages = response.data.map((msg: any) => ({
          ...msg,
          type: msg.senderId === userId ? "sent" : "received",
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, auctionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !userId || !seller.id || !auctionId || isSending) return;

    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now().toString(),
      text: newMessage,
      type: "sent" as const,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      senderId: userId,
      recipientId: seller.id,
      auctionId,
      createdAt: new Date(),
    };

    setMessages([...messages, tempMessage]);
    setNewMessage("");
    setIsSending(true);

    try {
      await axios.post("/api/messages", {
        text: newMessage,
        recipientId: seller.id,
        auctionId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on failure
      setMessages(messages.filter((msg) => msg.id !== tempMessage.id));
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Determine if we're on mobile
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Calculate dynamic height for chat container
  const getChatContainerHeight = () => {
    if (isMobile) {
      return "calc(100% - 120px)"; // Smaller on mobile to account for keyboard
    } else if (isTablet) {
      return "calc(100% - 130px)";
    } else {
      return "calc(100% - 140px)";
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Chat messages area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2"
        style={{ height: getChatContainerHeight() }}
      >
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
            <p className="text-gray-500 text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 p-4 text-center">
            <div className="bg-gray-100 rounded-full p-4 mb-3">
              <Image 
                src="/placeholder-user.jpg" 
                alt="Chat" 
                width={48} 
                height={48} 
                className="rounded-full"
              />
            </div>
            <p className="font-medium mb-1">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation with {seller.name}</p>
          </div>
        ) : (
          <>
            {/* Date separator */}
            <div className="flex justify-center my-2">
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            {/* Messages */}
            {messages.map((message, index) => {
              const isSent = message.type === "sent";
              const isConsecutive = index > 0 && messages[index - 1].type === message.type;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isSent ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-1" : "mt-3"}`}
                >
                  {!isSent && !isConsecutive && (
                    <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                      <Image
                        src="/placeholder-user.jpg"
                        alt={seller.name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div
                    className={`
                      max-w-[75%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg
                      ${isSent 
                        ? "bg-indigo-500 text-white rounded-tr-none" 
                        : "bg-gray-100 text-gray-800 rounded-tl-none"}
                      ${isConsecutive ? (isSent ? "mr-2" : "ml-10") : ""}
                    `}
                  >
                    <p className="text-sm sm:text-base break-words">{message.text}</p>
                    <div className={`flex justify-end mt-1 ${isSent ? "text-indigo-100" : "text-gray-400"}`}>
                      <small className="text-[10px] sm:text-xs">
                        {message.timestamp}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input area */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 sm:p-3 md:p-4 flex items-center bg-gray-50 border-t"
      >
        {!isMobile && (
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            disabled={!session}
          >
            <IoMdAttach size={isMobile ? 18 : 20} />
          </button>
        )}
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 sm:p-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mx-1 sm:mx-2 text-sm sm:text-base"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!session || isSending}
        />
        
        {!isMobile && (
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            disabled={!session}
          >
            <MdOutlineEmojiEmotions size={isMobile ? 18 : 20} />
          </button>
        )}
        
        <button
          type="submit"
          className={`p-2 sm:p-2.5 rounded-full flex items-center justify-center transition-colors ${
            !newMessage.trim() || !session || isSending
              ? "bg-gray-300 text-gray-500"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
          disabled={!newMessage.trim() || !session || isSending}
        >
          <MdSend size={isMobile ? 18 : 20} />
        </button>
      </form>
    </div>
  );
}

export default Chat;
