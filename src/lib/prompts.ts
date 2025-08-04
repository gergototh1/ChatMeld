// src/lib/prompts.ts

/**
 * All prompts used for generating AI responses and controlling the chat flow.
 * Placeholders like {{name}} will be replaced at runtime.
 */

export const Prompts = {
  /**
   * Determines which agent should speak next in an ongoing conversation.
   * Placeholders:
   * - {{agents}}: A list of available agents and their descriptions.
   * - {{conversation}}: The recent conversation history.
   */
  nextSpeaker: () => [
    {
      role: 'system',
      content: `You are observing an online chat session. You predict who will speak next from the following options:

{{agents}}

Only reply with the name of the person who will speak next, based on the conversation so far and the description of the speakers. If a person is addressed by name in the last message, then assume that they are the next speaker. "User" is not a valid option.`,
    },
    {
      role: 'user',
      content: `Only reply with the name of the person who will speak next, based on the conversation so far and the description of the speakers. You cannot reply "User". Always reply with a name. Here is the conversation so far:
###
{{conversation}}`,
    },
  ],

  /**
   * Determines which agent should speak first to start a conversation.
   * Placeholders:
   * - {{agents}}: A list of available agents and their descriptions.
   */
  firstSpeaker: () => [
    {
      role: 'system',
      content: `You are observing an online chat session. You predict who will speak first from the following options:

{{agents}}

Only reply with the name of the person who will speak first, based on the description of the speakers.`,
    },
    {
      role: 'user',
      content: 'Only reply with the name of the person who will speak first, based on the description of the speakers. Always reply with a name.',
    },
  ],

  /**
   * Generates the very first message from an agent to start a conversation.
   * Placeholders:
   * - {{name}}: The speaking agent's name.
   * - {{description}}: The speaking agent's description.
   * - {{traits}}: The speaking agent's specific traits for this conversation.
   * - {{agents}}: A list of the other agents in the chat.
   * - {{username}}: The name of the human user (e.g., "User").
   */
  firstMessage: () => [
    {
      role: 'system',
      content: `You are "{{name}}": {{description}} {{traits}} Act as "{{name}}" and only send messages in their name.
You are chatting with {{agents}} AI agents, as well as a human user, {{username}}. Send a message to start the conversation. Keep your messages short and concise. Bring your unique perspective and your own style as {{name}} into the conversation. Do not ask how you can help. The message must start with "{{name}}:".`,
    },
    {
      role: 'user',
      content: `Write the first message as "{{name}}", in a topic that is interesting for you. Write exactly one message. The message must start with "{{name}}:".`,
    },
  ],

  /**
   * Generates a standard response from an agent in an ongoing conversation.
   * Placeholders:
   * - {{name}}: The speaking agent's name.
   * - {{description}}: The speaking agent's description.
   * - {{traits}}: The speaking agent's specific traits for this conversation.
   * - {{agents}}: A list of the other agents in the chat.
   * - {{username}}: The name of the human user (e.g., "User").
   * - {{conversation}}: The full conversation history.
   */
  nextMessage: () => [
    {
      role: 'system',
      content: `You are "{{name}}": {{description}} {{traits}} Act as "{{name}}" and only send messages in their name. You are chatting with AI agents {{agents}}, as well as a human user, {{username}}.
###
Instructions:
Send a message to continue the conversation. React to the other participants' messages, while bringing your unique perspective and your own style as {{name}} into the conversation. Keep the message short and concise: it is a chat message written on the spot. Your response must start with "{{name}}:" and contain exactly one message.
###
Before you reply, you should attend, think and remember all the instructions set here.`,
    },
    {
      role: 'user',
      content: `Write the next message as "{{name}}", reacting to previous messages. Write exactly one message. Here is the conversation so far:
###
{{conversation}}
{{name}}: [Your message here]`,
    },
  ],

  /**
   * Generates a follow-up response when the same agent is asked to speak again.
   * Placeholders: (Same as nextMessage)
   */
  continueMessage: () => [
    {
      role: 'system',
      content: `You are "{{name}}": {{description}} {{traits}} Act as "{{name}}" and only send messages in their name. You are chatting with AI agents {{agents}}, as well as a human user, {{username}}.
###
Instructions:
Continue or expand your previous message to further the conversation. React to the other participants' messages, while bringing your unique perspective and your own style as {{name}} into the conversation. Keep your messages short and concise. Your response must start with "{{name}}:" and contain exactly one message.
###
Before you reply, you should attend, think and remember all the instructions set here.`,
    },
    {
      role: 'user',
      content: `Continue or expand the last message of "{{name}}", reacting to previous messages. Write exactly one message. Here is the conversation so far:
###
{{conversation}}
{{name}}: [Your message here]`,
    },
  ],

  /**
   * Generates a check-in message when auto-advance should stop.
   * The agent politely asks the user if they are still present.
   * Placeholders:
   * - {{name}}: The speaking agent's name.
   * - {{description}}: The speaking agent's description.
   * - {{traits}}: The speaking agent's specific traits for this conversation.
   * - {{agents}}: A list of the other agents in the chat.
   * - {{username}}: The name of the human user (e.g., "User").
   * - {{conversation}}: The full conversation history.
   */
  checkInMessage: () => [
    {
      role: 'system',
      content: `You are "{{name}}": {{description}} {{traits}} Act as "{{name}}" and only send messages in their name. You are chatting with AI agents {{agents}}, as well as a human user, {{username}}. It's unclear if the user is still participating.`,
    },
    {
      role: 'user',
      content: `Write a short message as "{{name}}" asking if {{username}} is still around. You can also ask if they want to continue the conversation, or question them about the topic. The message must start with "{{name}}:". Here is the conversation so far:
###
{{conversation}}`,
    },
  ],
};
