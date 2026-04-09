import { TopBar } from '../components/AiAssistant/TopBar'
import { ChatArea } from '../components/AiAssistant/ChatArea'
import { InputArea } from '../components/AiAssistant/InputArea'
import { useAiChat } from '../services/aiService'
import { useAuth } from '@/context/Authcontext'

export default function AiAssistantPage() {
  const { user } = useAuth()
  const {
    messages,
    status,
    mode,
    category,
    error,
    apiStatus,       
    apiStatusDetail, 
    setCategory,
    handleModeChange,
    handleSend,
    handleRetry,
  } = useAiChat(user?.name)

   return (
    <div className="flex h-full flex-col">  
      <TopBar 
        apiStatus={apiStatus} 
        apiStatusDetail={apiStatusDetail} 
      />

      <ChatArea
        messages={messages}
        status={status}
        error={error}
        mode={mode}
        onRetry={handleRetry}
      />

      <InputArea
        mode={mode}
        category={category}
        status={status}
        onModeChange={handleModeChange}
        onCategoryChange={setCategory}
        onSend={handleSend}
      />
    </div>
  )
}