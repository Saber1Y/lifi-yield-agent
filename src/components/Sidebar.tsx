'use client';

import Link from 'next/link';
import {
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
} from 'react-icons/hi';

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  chats?: ChatHistory[];
  activeChat?: string;
  isOpen: boolean;
  onSelectChat?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteChat?: (id: string) => void;
  onToggle: () => void;
  currentPage?:
    | 'dashboard'
    | 'chat'
    | 'approvals'
    | 'policies'
    | 'reports'
    | 'telegram';
  showChatHistory?: boolean;
}

export function Sidebar({ 
  chats = [], 
  activeChat, 
  isOpen, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat,
  onToggle,
  currentPage = 'chat',
  showChatHistory = true,
}: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 lg:relative z-40 flex h-[100dvh] min-h-0 w-72 max-w-[85vw] flex-col border-r border-[#232330] bg-[linear-gradient(180deg,#0D0D12,#0A0A0F)] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="border-b border-[#232330] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#707083]">
                Agent Lily
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                Operator Console
              </div>
            </div>
            <button
              onClick={onToggle}
              className="rounded-xl p-2 text-[#A0A0B0] transition-colors hover:bg-[#1A1A24] hover:text-white"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="rounded-2xl border border-[#2A2A35] bg-[#111119] p-3">
            <div className="text-xs text-[#8F90A6]">
              Cross-chain treasury copilot for approvals, routing, policy, and reporting.
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 space-y-3">
          <div className="rounded-2xl border border-[#2A2A35] bg-[#12121A] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-[#1A1A24] text-white'
                  : 'text-[#A0A0B0] hover:bg-[#1A1A24] hover:text-white'
              }`}
            >
              <HiOutlineChartBar className="h-5 w-5" />
              Overview
            </Link>
            <Link
              href="/dashboard/approvals"
              className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                currentPage === 'approvals'
                  ? 'bg-[#1A1A24] text-white'
                  : 'text-[#A0A0B0] hover:bg-[#1A1A24] hover:text-white'
              }`}
            >
              <HiOutlineClipboardList className="h-5 w-5" />
              Approvals
            </Link>
            <Link
              href="/dashboard/reports"
              className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                currentPage === 'reports'
                  ? 'bg-[#1A1A24] text-white'
                  : 'text-[#A0A0B0] hover:bg-[#1A1A24] hover:text-white'
              }`}
            >
              <HiOutlineDocumentReport className="h-5 w-5" />
              Reports
            </Link>
            <Link
              href="/dashboard/chat"
              className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                currentPage === 'chat'
                  ? 'bg-[#1A1A24] text-white'
                  : 'text-[#A0A0B0] hover:bg-[#1A1A24] hover:text-white'
              }`}
            >
              <HiOutlineChatAlt2 className="h-5 w-5" />
              Chat
            </Link>
          </div>

          {showChatHistory && onNewChat ? (
            <button
              onClick={onNewChat}
              className="w-full py-3 px-4 rounded-xl bg-[#1A1A24] border border-[#2A2A35] text-white font-medium hover:border-[#fab6f5] transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span> New Chat
            </button>
          ) : null}
        </div>

        {/* Chat List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          {showChatHistory ? (
            <>
              <div className="text-xs text-[#606070] uppercase tracking-wider px-3 py-2">
                Recent Chats
              </div>
              
              {chats.length === 0 ? (
                <div className="px-3 py-8 text-center text-[#606070] text-sm">
                  No chats yet
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div 
                      key={chat.id}
                      className={`group flex items-center gap-2 w-full text-left px-3 py-3 rounded-lg transition-colors ${
                        activeChat === chat.id
                          ? 'bg-[#1A1A24] text-white'
                          : 'text-[#A0A0B0] hover:bg-[#12121A] hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => onSelectChat?.(chat.id)}
                        className="flex-1 min-w-0"
                      >
                        <div className="text-sm font-medium truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-[#606070] mt-1">
                          {String(new Date(chat.timestamp).getMonth() + 1).padStart(2, '0')}/{String(new Date(chat.timestamp).getDate()).padStart(2, '0')}/{new Date(chat.timestamp).getFullYear()}
                        </div>
                      </button>
                      {onDeleteChat ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-2 rounded-lg text-[#606070] hover:text-[#EF4444] hover:bg-[#1A1A24] opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[#2A2A35] bg-[#12121A] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-[#606070]">
                Workspace
              </div>
              <p className="mt-3 text-sm leading-6 text-[#A0A0B0]">
                Modular control room for automation insights, approvals, reports, and chat.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#232330] p-4">
          <div className="flex items-center gap-2 text-xs text-[#606070]">
            <div className="h-2 w-2 rounded-full bg-[#fab6f5]"></div>
            Live Operator Mode
          </div>
        </div>
      </aside>
    </>
  );
}
