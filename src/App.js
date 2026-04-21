import React, { useState, useEffect } from "react";

/**
 * 釣果管理アプリ (Fishing Profit)
 * - 任意の日付の利益計算・入力
 * - 前日・翌日へのナビゲーション
 * - 月次の集計 (当月のみ)
 * - 履歴の閲覧
 */
export default function App() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [screen, setScreen] = useState("home");
  const [viewDate, setViewDate] = useState(todayISO); // 表示中の日付
  
  const [trip, setTrip] = useState({
    people: 6,
    price: 8000,
    fuel: 18000,
  });
  const [history, setHistory] = useState([]);

  // 初期ロード: ローカルストレージからデータを復元
  useEffect(() => {
    const saved = localStorage.getItem("fishing_history");
    if (saved) setHistory(JSON.parse(saved));

    const last = localStorage.getItem("fishing_lastTrip");
    if (last) setTrip(JSON.parse(last));
  }, []);

  // 日付操作ヘルパー
  const handleDateChange = (offset) => {
    const date = new Date(viewDate);
    date.setDate(date.getDate() + offset);
    setViewDate(date.toISOString().slice(0, 10));
  };

  const moveToday = () => setViewDate(todayISO);

  // 釣行データの保存
  const saveTrip = () => {
    if (trip.people <= 0 || trip.price < 0 || trip.fuel < 0) {
      alert("正しい数値を入力してください。");
      return;
    }

    const newTrip = {
      id: Date.now(),
      ...trip,
      date: viewDate, // 表示中の日付で保存
      sales: trip.people * trip.price,
      profit: trip.people * trip.price - trip.fuel,
    };

    // 同じ日付のデータがあれば上書き、なければ追加
    const filteredHistory = history.filter(h => h.date !== viewDate);
    const updated = [newTrip, ...filteredHistory].sort((a, b) => b.date.localeCompare(a.date));
    
    setHistory(updated);
    localStorage.setItem("fishing_history", JSON.stringify(updated));
    localStorage.setItem("fishing_lastTrip", JSON.stringify(trip));

    setScreen("home");
  };

  // 表示中の日付のデータ
  const currentTrip = history.find((h) => h.date === viewDate);

  // 当月の集計
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const monthlyData = history.filter((h) => h.date.startsWith(currentMonthStr));
  const monthlyProfit = monthlyData.reduce((sum, h) => sum + h.profit, 0);
  const monthlySales = monthlyData.reduce((sum, h) => sum + h.sales, 0);

  // ---------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------

  const renderContent = () => {
    switch (screen) {
      case "input":
        return (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>🚤 データの入力</h2>
              <div style={styles.dateBadge}>{viewDate}</div>
            </div>
            
            {/* カスタムCSSの挿入 (スライダー用) */}
            <style>{`
              input[type=range] {
                -webkit-appearance: none;
                width: 100%;
                height: 8px;
                background: #e2e8f0;
                border-radius: 5px;
                outline: none;
              }
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 28px;
                height: 28px;
                background: #2563eb;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);
              }
            `}</style>

            <div style={styles.card}>
              {/* 人数スライダー */}
              <div style={styles.formGroup}>
                <div style={styles.inputHeader}>
                  <label style={styles.label}>乗船人数</label>
                  <span style={styles.valueBadge}>{trip.people} 人</span>
                </div>
                <input
                  style={styles.slider}
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={trip.people}
                  onChange={(e) => setTrip({ ...trip, people: Number(e.target.value) })}
                />
              </div>

              {/* 料金スライダー */}
              <div style={styles.formGroup}>
                <div style={styles.inputHeader}>
                  <label style={styles.label}>乗船料金</label>
                  <span style={styles.valueBadge}>{trip.price.toLocaleString()} 円</span>
                </div>
                <input
                  style={styles.slider}
                  type="range"
                  min="0"
                  max="50000"
                  step="100"
                  value={trip.price}
                  onChange={(e) => setTrip({ ...trip, price: Number(e.target.value) })}
                />
              </div>

              {/* 燃料スライダー */}
              <div style={styles.formGroup}>
                <div style={styles.inputHeader}>
                  <label style={styles.label}>燃料代</label>
                  <span style={styles.valueBadge}>{trip.fuel.toLocaleString()} 円</span>
                </div>
                <input
                  style={styles.slider}
                  type="range"
                  min="0"
                  max="200000"
                  step="100"
                  value={trip.fuel}
                  onChange={(e) => setTrip({ ...trip, fuel: Number(e.target.value) })}
                />
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryItem}>
                  <span>予想売上:</span>
                  <span style={styles.summaryValue}>{(trip.people * trip.price).toLocaleString()} 円</span>
                </div>
                <div style={styles.summaryItem}>
                  <span>予想利益:</span>
                  <span style={{...styles.summaryValue, color: "#2563eb"}}>
                    {(trip.people * trip.price - trip.fuel).toLocaleString()} 円
                  </span>
                </div>
              </div>
              
              <button style={styles.primaryButton} onClick={saveTrip}>データを保存する</button>
              <button style={styles.secondaryButton} onClick={() => setScreen("home")}>キャンセルして戻る</button>
            </div>
          </>
        );

      case "monthly":
        return (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>📅 今月の統計</h2>
            </div>
            <div style={{...styles.card, textAlign: "center", background: "linear-gradient(135deg, #0ea5e9, #2563eb)", color: "white"}}>
              <p style={{margin: 0, opacity: 0.9, fontSize: "14px"}}>今月の純利益</p>
              <h1 style={{margin: "10px 0", fontSize: "32px"}}>{monthlyProfit.toLocaleString()} <span style={{fontSize: "18px"}}>円</span></h1>
              <div style={{display: "flex", justifyContent: "space-around", marginTop: "15px", fontSize: "14px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "15px"}}>
                <div>
                  <p style={{margin: 0, opacity: 0.8}}>総売上</p>
                  <p style={{margin: "4px 0", fontWeight: "bold"}}>{monthlySales.toLocaleString()} 円</p>
                </div>
                <div>
                  <p style={{margin: 0, opacity: 0.8}}>釣行回数</p>
                  <p style={{margin: "4px 0", fontWeight: "bold"}}>{monthlyData.length} 回</p>
                </div>
              </div>
            </div>
            <h3 style={{...styles.label, marginTop: "25px"}}>履歴 (最新15件)</h3>
            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
              {history.length > 0 ? (
                history.slice(0, 15).map((h) => (
                  <div key={h.id} style={styles.historyCard} onClick={() => { setViewDate(h.date); setScreen("home"); }}>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: "12px", color: "#64748b"}}>{h.date}</div>
                      <div style={{fontWeight: "bold", fontSize: "16px"}}>{h.profit.toLocaleString()} 円</div>
                    </div>
                    <div style={{textAlign: "right", fontSize: "13px", color: "#94a3b8"}}>
                      {h.people}人 / {h.price.toLocaleString()}円 ➡️
                    </div>
                  </div>
                ))
              ) : (
                <p style={{textAlign: "center", color: "#94a3b8", padding: "20px"}}>履歴がありません</p>
              )}
            </div>
            <button style={{...styles.secondaryButton, marginTop: "30px"}} onClick={() => setScreen("home")}>
              ホーム画面に戻る
            </button>
          </>
        );

      default: // Home
        const isToday = viewDate === todayISO;
        return (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>🚤 釣行結果</h2>
              <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                <button style={styles.arrowButton} onClick={() => handleDateChange(-1)}>◀</button>
                <div style={styles.datePickerContainer}>
                  <input
                    type="date"
                    style={styles.datePickerInput}
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                  />
                  <span style={styles.dateDisplay}>
                    {viewDate.replace(/-/g, "/")} {isToday ? "(今日)" : ""}
                  </span>
                </div>
                <button style={styles.arrowButton} onClick={() => handleDateChange(1)}>▶</button>
              </div>
            </div>

            {!isToday && (
              <button style={styles.todayButton} onClick={moveToday}>今日に戻る</button>
            )}

            <div style={styles.card}>
              {currentTrip ? (
                <>
                  <div style={{textAlign: "center", padding: "10px 0"}}>
                    <p style={{margin: 0, color: "#64748b", fontSize: "14px"}}>この日の純利益</p>
                    <h1 style={{
                      margin: "10px 0", 
                      fontSize: "42px", 
                      color: currentTrip.profit >= 0 ? "#059669" : "#dc2626"
                    }}>
                      {currentTrip.profit.toLocaleString()} <span style={{fontSize: "20px"}}>円</span>
                    </h1>
                  </div>
                  <div style={styles.statsGrid}>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>総売上</span>
                      <span style={styles.statValue}>{currentTrip.sales.toLocaleString()} 円</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>人数</span>
                      <span style={styles.statValue}>{currentTrip.people} 人</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>燃料代</span>
                      <span style={styles.statValue}>{currentTrip.fuel.toLocaleString()} 円</span>
                    </div>
                  </div>
                  <button style={{...styles.secondaryButton, marginTop: "20px", fontSize: "14px", padding: "8px"}} onClick={() => setScreen("input")}>
                    この日のデータを修正する
                  </button>
                </>
              ) : (
                <div style={{textAlign: "center", padding: "30px 0", color: "#94a3b8"}}>
                  <p style={{fontSize: "16px", marginBottom: "15px"}}>
                    {viewDate} のデータは未入力です
                  </p>
                  <button style={{...styles.primaryButton, width: "auto", padding: "10px 24px"}} onClick={() => setScreen("input")}>
                    入力を開始する
                  </button>
                </div>
              )}
            </div>

            <div style={{...styles.card, marginTop: "20px", background: "#f8fafc", border: "1px solid #e2e8f0"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <span style={{fontSize: "14px", color: "#64748b"}}>今月の累計利益</span>
                  <div style={{fontSize: "20px", fontWeight: "bold", color: "#1e293b"}}>{monthlyProfit.toLocaleString()} 円</div>
                </div>
                <button style={{...styles.secondaryButton, width: "auto", margin: 0, padding: "8px 16px", fontSize: "14px"}} onClick={() => setScreen("monthly")}>
                  詳細表示
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={styles.appWrapper}>
      <main style={styles.container}>
        {renderContent()}
      </main>

      {/* 固定ボトムナビゲーション */}
      <nav style={styles.navBar}>
        <button 
          style={screen === "home" ? {...styles.navItem, ...styles.navItemActive} : styles.navItem} 
          onClick={() => setScreen("home")}
        >
          <span style={styles.navIcon}>🏠</span>
          <span style={styles.navLabel}>ホーム</span>
        </button>
        <button 
          style={screen === "input" ? {...styles.navItem, ...styles.navItemActive} : styles.navItem} 
          onClick={() => setScreen("input")}
        >
          <span style={styles.navIcon}>➕</span>
          <span style={styles.navLabel}>入力</span>
        </button>
        <button 
          style={screen === "monthly" ? {...styles.navItem, ...styles.navItemActive} : styles.navItem} 
          onClick={() => setScreen("monthly")}
        >
          <span style={styles.navIcon}>📊</span>
          <span style={styles.navLabel}>履歴</span>
        </button>
      </nav>
    </div>
  );
}

// ---------------------------------------------------------
// Styles (Premium Design)
// ---------------------------------------------------------
const styles = {
  appWrapper: {
    backgroundColor: "#f1f5f9",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px 16px 100px 16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: "#1e293b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "800",
    margin: 0,
    color: "#0f172a",
  },
  dateBadge: {
    backgroundColor: "white",
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  datePickerContainer: {
    position: "relative",
    backgroundColor: "white",
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  datePickerInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  dateDisplay: {
    pointerEvents: "none",
  },
  arrowButton: {
    backgroundColor: "#e2e8f0",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "12px",
    color: "#475569",
    transition: "background-color 0.2s",
  },
  todayButton: {
    width: "100%",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    border: "none",
    padding: "8px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "16px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "18px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    boxSizing: "border-box",
    outline: "none",
  },
  slider: {
    marginTop: "12px",
    cursor: "pointer",
  },
  inputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  primaryButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: "700",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4)",
    marginTop: "16px",
  },
  secondaryButton: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    backgroundColor: "white",
    color: "#475569",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    marginTop: "12px",
  },
  summaryBox: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "20px",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "15px",
    color: "#64748b",
  },
  summaryValue: {
    fontWeight: "bold",
    color: "#1e293b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "20px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px",
  },
  statItem: {
    textAlign: "center",
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#475569",
  },
  historyCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  navBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "72px",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
    borderTop: "1px solid #e2e8f0",
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    height: "100%",
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#94a3b8",
    transition: "color 0.2s",
  },
  navItemActive: {
    color: "#2563eb",
  },
  navIcon: {
    fontSize: "22px",
    marginBottom: "2px",
  },
  navLabel: {
    fontSize: "11px",
    fontWeight: "bold",
  },
};