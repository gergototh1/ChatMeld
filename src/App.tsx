import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ChatView } from './views/ChatView';
import NewConversationSetupView from './views/NewConversationSetupView';
import AgentsView from './views/AgentsView';
import SettingsView from './views/SettingsView';
import DashboardView from './views/DashboardView';
import { useSettingsStore } from './store/settingsStore';
import { useAgentStore } from './store/agentStore';

function App() {
  const { init } = useSettingsStore();
  const { fetchCustomAgents } = useAgentStore();
  useEffect(() => {
    init();
    fetchCustomAgents();
  }, [init, fetchCustomAgents]);
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/new-chat" element={<NewConversationSetupView />} />
          <Route path="/chat/:conversationId" element={<ChatView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/agents" element={<AgentsView />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
