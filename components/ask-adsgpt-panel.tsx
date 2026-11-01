"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { EnrichedClient } from "@/lib/types";
import {
  applyAssistantAction,
  buildAssistantReply,
  SUGGESTION_CHIPS,
  type AssistantAction,
} from "@/lib/assistant";
import {
  EMPTY_SESSION_OVERRIDES,
  type SessionOverrides,
} from "@/lib/clients";

type ChatItem =
  | { id: string; kind: "user"; text: string }
  | {
      id: string;
      kind: "assistant";
      text: string;
      actions: AssistantAction[];
    }
  | {
      id: string;
      kind: "confirmation";
      text: string;
      undoOverrides: SessionOverrides;
    };

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 rounded-2xl bg-bg-alt px-4 py-3"
      aria-label="AdsGPT is typing"
    >
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
    </div>
  );
}

export function AskAdsGptPanel({
  clients,
  overrides,
  onOverridesChange,
}: {
  clients: EnrichedClient[];
  overrides: SessionOverrides;
  onOverridesChange: (next: SessionOverrides) => void;
}) {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationStarted = items.length > 0 || typing;

  const scrollChatToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [items, typing, scrollChatToBottom]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const dispatchMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typing) return;

      setItems((prev) => [
        ...prev,
        { id: nextId(), kind: "user", text: trimmed },
      ]);
      setInput("");
      setTyping(true);

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        const reply = buildAssistantReply(trimmed, clients, overrides);
        setItems((prev) => [
          ...prev,
          {
            id: nextId(),
            kind: "assistant",
            text: reply.text,
            actions: reply.actions,
          },
        ]);
        setTyping(false);
      }, 600);
    },
    [clients, overrides, typing],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    dispatchMessage(input);
  }

  function handleAction(action: AssistantAction) {
    const result = applyAssistantAction(action, clients, overrides);
    onOverridesChange(result.overrides);
    setItems((prev) => [
      ...prev,
      {
        id: nextId(),
        kind: "confirmation",
        text: result.confirmationText,
        undoOverrides: result.previousOverrides,
      },
    ]);
  }

  function handleUndo(undoOverrides: SessionOverrides) {
    onOverridesChange({
      todaySpendOverride: { ...undoOverrides.todaySpendOverride },
      pausedCreativeIds: Object.fromEntries(
        Object.entries(undoOverrides.pausedCreativeIds).map(([id, ids]) => [
          id,
          [...ids],
        ]),
      ),
    });
  }

  return (
    <div className="flex h-[520px] flex-col rounded-3xl border border-[#E4E7FB] bg-white p-6 shadow-[0_8px_30px_rgba(5,5,69,0.06)] lg:h-[620px]">
      <div className="shrink-0 border-b border-line px-5 py-5 lg:px-6">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full brand-gradient"
            aria-hidden
          />
          <h3 className="text-h3">Ask AdsGPT</h3>
        </div>
        <p className="mt-1 text-label-muted normal-case tracking-normal">
          Scripted demo on sample data.
        </p>
      </div>

      <div
        className={`shrink-0 border-b border-line px-5 py-3 lg:px-6 ${
          conversationStarted ? "overflow-x-auto" : ""
        }`}
      >
        <div
          className={
            conversationStarted
              ? "flex w-max flex-nowrap gap-2"
              : "flex flex-wrap gap-2"
          }
        >
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => dispatchMessage(chip)}
              className="hover-chip-border shrink-0 rounded-full border border-line bg-bg-alt px-4 py-2.5 text-left text-[15px] font-medium normal-case tracking-normal whitespace-nowrap text-navy"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain px-5 py-4 lg:px-6"
      >
        {items.map((item) => {
          if (item.kind === "user") {
            return (
              <div key={item.id} className="flex justify-end">
                <p className="max-w-[92%] rounded-2xl bg-navy px-4 py-2.5 text-[16px] leading-normal text-white">
                  {item.text}
                </p>
              </div>
            );
          }

          if (item.kind === "confirmation") {
            return (
              <div
                key={item.id}
                className="rounded-card border border-success/30 bg-success/12 px-4 py-3 text-[16px] leading-normal text-navy"
              >
                <span>{item.text} </span>
                <button
                  type="button"
                  onClick={() => handleUndo(item.undoOverrides)}
                  className="font-semibold text-navy underline decoration-line underline-offset-2 hover:decoration-navy"
                >
                  Undo
                </button>
              </div>
            );
          }

          return (
            <div key={item.id} className="max-w-full space-y-3">
              <p className="whitespace-pre-line rounded-2xl bg-bg-alt px-4 py-3 text-[16px] leading-normal text-text">
                {item.text}
              </p>
              {item.actions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleAction(action)}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-label-muted normal-case tracking-normal text-navy transition-colors hover:border-lavender"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        {typing ? (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-line p-4 lg:p-5"
      >
        <div className="flex h-12 items-center gap-2 rounded-full border border-line bg-bg-alt pl-4 pr-1.5">
          <label className="sr-only" htmlFor="ask-adsgpt-input">
            Message AdsGPT
          </label>
          <input
            id="ask-adsgpt-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about spend, fatigue, pacing…"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-navy outline-none placeholder:text-fg-muted"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="hover-chip-border shrink-0 rounded-full bg-ink px-5 py-2 text-[16px] font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
