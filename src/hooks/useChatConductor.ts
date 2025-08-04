// src/hooks/useChatConductor.ts
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { useMessageStore } from '../store/messageStore';
import { useSettingsStore } from '../store/settingsStore';
import { determineNextSpeaker, generateAgentResponse } from '../lib/chat-logic';
import type { Message } from '../types';

const NEXT_SPEAKER_DELAY = 3000;

const getNextMessageDelay = (lastMessage: Message | undefined): number => {
  if (!lastMessage || lastMessage.agentId === 'user') {
    return 3000;
  }
  const wordCount = lastMessage.content.split(/\s+/).length;
  const delay = Math.max(2000, wordCount * 250);
  return Math.min(delay, 8000);
};

export function useChatConductor(conversationId: number) {
  const { conversations, updateConversation } = useConversationStore();
  const { messages, addMessage } = useMessageStore();
  const {
    openAiApiKey,
    googleApiKey,
    autoAdvance,
    maxAutoAdvance,
    maxContextMessages,
    setAutoAdvance,
  } = useSettingsStore();
  const [isPaused, setIsPaused] = useState(!autoAdvance);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingAgentId, setThinkingAgentId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false); // New ref to track if we're already processing a message
  
  const conversation = conversations.find((c) => c.id === conversationId);
  
  // Ensure agent settings are properly merged with base agent data
  const agents = useMemo(() => {
    if (!conversation) return [];
    
    return conversation.agents.map((baseAgent) => {
      const settings = conversation.agentSettings?.find(
        (s) => s.agentId === baseAgent.id,
      );
      return {
        ...baseAgent,
        ...(settings || {}),
      };
    });
  }, [conversation]);

  useEffect(() => {
    setIsPaused(!autoAdvance);
  }, [autoAdvance]);

  const startConductor = useCallback(() => {
    if (!isRunningRef.current) {
      console.log('[Conductor] Started');
      isRunningRef.current = true;
      setIsRunning(true);
    }
  }, []);

  const finishTurn = useCallback(() => {
    setIsThinking(false);
    setThinkingAgentId(null);
    isProcessingRef.current = false; // Reset processing flag when done
  }, []);

  const stopConductor = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    finishTurn();
    if (isRunningRef.current) {
      console.log('[Conductor] Stopped');
      isRunningRef.current = false;
      setIsRunning(false);
    }
  }, [finishTurn]);

  const getAiSinceUser = useCallback(() => {
    let count = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].agentId === 'user') break;
      count++;
    }
    return count;
  }, [messages]);

  const runNextTurn = useCallback(async (forcedNextSpeakerId?: number) => {
    // Prevent multiple concurrent messages
    if (isProcessingRef.current) {
      console.log('[Conductor] Already processing a message, skipping');
      return;
    }
    
    console.log('[Conductor] Triggered');
    isProcessingRef.current = true; // Set processing flag
    startConductor();
    
    if (isPaused && !forcedNextSpeakerId && (!messages.length || messages[messages.length - 1].agentId !== 'user')) {
      console.log('[Conductor] Paused');
      stopConductor();
      return;
    }
    
    const apiKeys = { openAiApiKey, googleApiKey };
    if (!Object.values(apiKeys).some(Boolean)) {
      console.log('[Conductor] Missing API key');
      stopConductor();
      return;
    }
    
    if (agents.length === 0) {
      console.log('[Conductor] No agents in conversation');
      stopConductor();
      return;
    }
    
    setIsThinking(true);
    console.log('[Conductor] Determining next speaker');
    const nextSpeakerId =
      forcedNextSpeakerId ??
      (await determineNextSpeaker(messages, agents, apiKeys, maxContextMessages));
    
    if (!nextSpeakerId) {
      console.log('[Conductor] Could not determine next speaker');
      stopConductor();
      return;
    }
    
    setThinkingAgentId(nextSpeakerId);
    await updateConversation(conversationId, { nextSpeakerId });
    console.log(`[Conductor] Next speaker is ${nextSpeakerId}`);
    
    const delay = getNextMessageDelay(messages[messages.length - 1]);
    console.log(`[Conductor] Waiting ${delay}ms before generating message`);
    await new Promise((res) => setTimeout(res, delay));
    
    const lastMsg = messages[messages.length - 1];
    if (isPaused && !forcedNextSpeakerId && lastMsg && lastMsg.agentId !== 'user') {
      console.log('[Conductor] Paused during wait');
      stopConductor();
      return;
    }
    
    console.log(`[Conductor] Generating response for ${nextSpeakerId}`);
    const checkIn = autoAdvance && getAiSinceUser() >= maxAutoAdvance; // Check-in with User after limit
    
    // Find the agent with all settings applied
    const agent = agents.find(a => a.id === nextSpeakerId);
    
    const responseContent = await generateAgentResponse(
      nextSpeakerId,
      messages,
      agents,
      apiKeys,
      { checkIn, traits: agent?.traits }, // Pass traits explicitly
      maxContextMessages,
    );
    
    if (responseContent) {
      console.log(`[Conductor] Adding message from ${nextSpeakerId}:`, responseContent);
      await addMessage({
        conversationId,
        agentId: nextSpeakerId,
        content: responseContent,
      });
      
      if (checkIn) {
        setAutoAdvance(false);
      }
    }
    
    finishTurn();
  }, [
    isPaused,
    openAiApiKey,
    googleApiKey,
    agents,
    messages,
    conversationId,
    addMessage,
    finishTurn,
    stopConductor,
    startConductor,
    updateConversation,
    autoAdvance,
    maxAutoAdvance,
    maxContextMessages,
    getAiSinceUser,
    setAutoAdvance,
  ]);

  useEffect(() => {
    // Only clear the timer, don't stop the entire conductor
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    const lastMessage = messages[messages.length - 1];
    if (isPaused) {
      if (!lastMessage || lastMessage.agentId !== 'user') return;
    }
    
    if (!isPaused || !lastMessage || lastMessage.agentId === 'user') {
      startConductor();
      timerRef.current = setTimeout(() => {
        runNextTurn();
      }, NEXT_SPEAKER_DELAY);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [messages, isPaused, runNextTurn, startConductor]);

  const pause = () => setAutoAdvance(false);
  const resume = () => setAutoAdvance(true);
  
  const forceTurn = (agentId: number) => {
    console.log(`Forcing turn for agent ${agentId}`);
    stopConductor();
    runNextTurn(agentId);
  };

  return { isPaused, isThinking, thinkingAgentId, isRunning, pause, resume, forceTurn };
}