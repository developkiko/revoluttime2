"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — TransactionsTab (с загрузкой из API)
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";

interface TransactionsTabProps {
  onSelectPlans?: () => void;
}

interface TransactionItem {
  date: string;
  type: string;
  amount: string;
  status: string;
  txid: string;
}

const WORKER_URL = process.env.NEXT_PUBLIC_UP_WORKER_URL || "https://ultra-proxy-api.pornorage.workers.dev";

export function TransactionsTab({ onSelectPlans }: TransactionsTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WORKER_URL}/api/user/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email }),
    })
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const thClass = "text-left px-3 py-2.5 text-[13px] text-[var(--text-secondary)] font-medium border-b border-[var(--border-default)]";
  const tdClass = "px-3 py-2.5 text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)]";

  const statusBadge = (s: string) => {
    const confirmed = s === "confirmed";
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${confirmed ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${confirmed ? "bg-green-400" : "bg-yellow-400"}`} />
        {confirmed ? t("dash_tx_confirmed") : t("dash_tx_pending")}
      </span>
    );
  };

  const amountColor = (a: string) =>
    a.startsWith("+") ? "text-green-400" : "text-red-400";

  return (
    <div>
      <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
        {t("dash_tab_transactions")}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-8">
        {t("dash_history_title")}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>{t("dash_tx_date")}</th>
              <th className={thClass}>{t("dash_tx_type")}</th>
              <th className={thClass}>{t("dash_tx_amount")}</th>
              <th className={thClass}>{t("dash_tx_status")}</th>
              <th className={thClass}>{t("dash_tx_txid")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-[var(--text-muted)] py-8 text-sm">...</td></tr>
            ) : transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <tr key={i}>
                  <td className={tdClass}>{tx.date}</td>
                  <td className={tdClass}>{tx.type === "deposit" ? t("dash_tx_deposit") : t("dash_tx_withdraw")}</td>
                  <td className={`${tdClass} ${amountColor(tx.amount)} font-mono text-xs`}>{tx.amount}</td>
                  <td className={tdClass}>{statusBadge(tx.status)}</td>
                  <td className={`${tdClass} font-mono text-xs text-[var(--text-secondary)]`}>{tx.txid.slice(0, 12)}...</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-8 text-sm">
                  {t("dash_no_transactions")}{" "}
                  {onSelectPlans ? (
                    <button onClick={onSelectPlans} className="text-[var(--color-accent-soft)] hover:text-[var(--text-heading)] underline cursor-pointer">{t("dash_no_tx_plan_link")}</button>
                  ) : (
                    <span className="text-[var(--color-accent-soft)]">{t("dash_no_tx_plan_link")}</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
