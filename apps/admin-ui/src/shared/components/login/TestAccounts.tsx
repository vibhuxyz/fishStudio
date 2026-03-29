"use client";

import React from "react";
import { motion } from "framer-motion";
import { TestAccount } from "./data";

interface TestAccountsProps {
  accounts: TestAccount[];
  onSelect: (account: TestAccount) => void;
}

export const TestAccounts: React.FC<TestAccountsProps> = ({ accounts, onSelect }) => {
  return (
    <div className="mb-8">
      <div className="p-1 rounded-[1.5rem] bg-white/[0.02] border border-dashed border-white/10">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Internal Test Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 p-1.5">
          {accounts.map((account, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(account)}
              className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-left transition-all group hover:border-blue-500/30"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <account.icon size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-white text-xs font-bold tracking-tight">
                    {account.name}
                  </h4>
                  {account.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-[7px] font-black uppercase tracking-wider text-blue-400 border border-blue-500/20">
                      {account.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[10px] font-medium mt-0.5 truncate italic">
                  {account.email}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="px-4 pb-2 pt-1 text-center">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">
            Password: <span className="text-blue-500/70 ml-1 select-all">{accounts[0]?.password}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

