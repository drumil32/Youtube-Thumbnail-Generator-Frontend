import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  children: React.ReactNode;
  sender?: 'user' | 'bot';
  className?: string;
}

export const ChatBubble = ({ children, sender = 'bot', className }: ChatBubbleProps) => {
  return (
    <div
      className={cn(
        "max-w-sm p-4 rounded-2xl shadow-soft animate-bounce-in",
        sender === 'user' 
          ? "bg-gradient-primary text-chat-bubble-foreground ml-auto rounded-br-md" 
          : "bg-chat-bubble-secondary text-chat-bubble-secondary-foreground mr-auto rounded-bl-md",
        className
      )}
    >
      {children}
    </div>
  );
};