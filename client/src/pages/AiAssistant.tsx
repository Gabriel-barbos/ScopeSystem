import { TopBar } from '../components/AiAssistant/TopBar'
import { ChatArea } from '../components/AiAssistant/ChatArea'
import { InputArea } from '../components/AiAssistant/InputArea'
import { useAiChat } from '../services/aiService'

export default function AiAssistantPage() {
  const {
    messages,
    status,
    mode,
    category,
    error,
    setCategory,
    handleModeChange,
    handleSend,
    handleRetry,
  } = useAiChat()

  return (
    <div className="flex h-screen flex-col">
      <TopBar />

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