// 1. Provides a real-time chat interface for users to communicate during an auction.
// 2. Displays messages between the current user and the seller, including:
//    - Sent messages (by the current user).
//    - Received messages (from the seller).
// 3. Fetches existing messages for the auction from the `/api/messages/:auctionId` endpoint when the component loads.
// 4. Implements polling to fetch new messages every 5 seconds for real-time updates.
// 5. Allows users to send messages by:
//    - Typing in an input field.
//    - Clicking the send button (or pressing Enter).
//    - Sending the message to the `/api/messages` endpoint via a POST request.
// 6. Optimistically updates the chat UI with the new message before the server confirms it.
//    - Removes the message if the server request fails and displays an error.
// 7. Automatically scrolls to the latest message when new messages are added.
// 8. Displays a loading state while fetching messages and a placeholder if no messages exist.
// 9. Restricts chat functionality to authenticated users using `next-auth`'s `useSession` hook.
// 10. Uses Tailwind CSS for responsive and visually appealing styling.
import React, { useState, useEffect, useRef } from "react";
import { MdSend } from "react-icons/md";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = session?.user?.id;

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !userId || !seller.id || !auctionId) return;

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
    }
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-b-lg bg-white">
      <header className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center">
          <div className="relative w-10 h-10">
            <Image
              src="/placeholder-user.jpg"
              alt={seller.name}
              fill
              className="object-cover rounded-full"
              sizes="40px"
              priority
            />
          </div>
          <div className="ml-2">
            <span className="font-semibold block">{seller.name}</span>
            <span className="text-xs text-gray-500">{auctionTitle}</span>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 h-[380px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "sent" ? "justify-end" : ""
              } `}
            >
              <div
                className={`p-2 rounded-lg ${
                  message.type === "received" ? "bg-blue-200" : "bg-green-200"
                } mb-4`}
              >
                <p>{message.text}</p>
                <small className="block text-right text-xs text-gray-500">
                  {message.timestamp}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 flex items-center bg-gray-100"
      >
        <input
          type="text"
          placeholder="Type your message here..."
          className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!session}
        />
        <button
          type="submit"
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:bg-gray-400"
          disabled={!newMessage.trim() || !session}
        >
          <MdSend />
        </button>
      </form>
    </div>
  );
}

export default Chat;
