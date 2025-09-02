import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  children: React.ReactNode;
  sender?: 'user' | 'bot';
  className?: string;
}

export const ChatBubble = ({ children, sender = 'bot', className }: ChatBubbleProps) => {
  return (
    <div className={cn(
      "flex",
      sender === 'user' ? "justify-end" : "justify-start",
      "mb-6"
    )}>
      <div
        className={cn(
          "max-w-4xl min-w-[300px] p-6 rounded-3xl shadow-lg animate-bounce-in relative",
          sender === 'user' 
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md" 
            : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-800 border border-gray-200 rounded-bl-md",
          className
        )}
      >
        {/* Chat bubble tail */}
        <div className={cn(
          "absolute w-0 h-0 -bottom-2",
          sender === 'user' 
            ? "right-6 border-l-[16px] border-l-blue-600 border-t-[16px] border-t-transparent" 
            : "left-6 border-r-[16px] border-r-gray-100 border-t-[16px] border-t-transparent"
        )} />
        
        {/* Avatar */}
        <div className={cn(
          "absolute -top-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md",
          sender === 'user' 
            ? "-right-2 bg-blue-600 text-white" 
            : "-left-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white"
        )}>
          {sender === 'user' ? '👤' : '🤖'}
        </div>
        
        <div className="text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};