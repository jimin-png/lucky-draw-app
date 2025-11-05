"use client";
import { useState } from "react";
import { ethers } from "ethers";
import LuckyDrawABI from "../LuckyDrawABI.json";

const contractAddress = "0x2Bba738ef7CA7cDa988104A1A92FFd06fB643896";

export default function Home() {
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [history, setHistory] = useState([]);

  async function draw() {
    if (!window.ethereum) return alert("MetaMask를 설치하세요!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, LuckyDrawABI, signer);

    setSpinning(true);

    try {
      const seed = Math.floor(Math.random() * 1000);
      const tx = await contract.draw(seed);
      await tx.wait();

      const value = await contract.getLastResult();
      const num = Number(value);

      setResult(num);
      setMessage(num === 7 ? "대박! Lucky 7 당첨!" : "아쉽게도 꽝");
      if (num === 7) setTokens((t) => t + 1);

      const [addrs, results] = await contract.getHistory(5);
      const newHistory = addrs.map((addr, i) => ({
        addr,
        val: Number(results[i]),
      }));
      setHistory(newHistory);
    } catch (err) {
      if (err.code === 4001) {
        setMessage("⚠️ 트랜잭션이 MetaMask에서 거부되었습니다.");
        setResult(null);
      } else {
        console.error(err);
        alert("트랜잭션 실행 중 오류가 발생했습니다.");
      }
    } finally {
      setSpinning(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "60px",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h1
        style={{
          color: "#333",
          fontSize: "18px",
          fontWeight: "bold",
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        92313453 유지민
      </h1>

      <h2
        style={{
          color: "#2d2d2d",
          fontSize: "36px",
          fontWeight: "900",
          marginTop: "14px",
          textAlign: "center",
          textShadow: "2px 2px 8px rgba(0,0,0,0.1)",
          letterSpacing: "1px",
        }}
      >
         블록체인 복불복 App
      </h2>

      <button
        onClick={draw}
        style={{
          background: spinning
            ? "linear-gradient(90deg, #aaa, #ccc)"
            : "linear-gradient(90deg, #4f46e5, #6d28d9)",
          color: "white",
          padding: "16px 36px",
          borderRadius: "16px",
          marginTop: "40px",
          cursor: spinning ? "not-allowed" : "pointer",
          fontSize: "20px",
          fontWeight: "bold",
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          transform: spinning ? "scale(0.97) rotate(4deg)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        {spinning ? "돌리는 중..." : "복불복 시작"}
      </button>

      {result !== null && (
        <div
          style={{
            marginTop: "50px",
            padding: "25px",
            width: "340px",
            background: "linear-gradient(180deg, #f9f9f9, #ffffff)",
            borderRadius: "24px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            textAlign: "center",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <h3
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#333",
            }}
          >
            결과: {result}
          </h3>
          <p
            style={{
              marginTop: "12px",
              fontSize: "18px",
              color: "#555",
              fontWeight: "600",
            }}
          >
            {message}
          </p>
          <p
            style={{
              marginTop: "12px",
              fontWeight: "bold",
              color: "#2d2d2d",
              fontSize: "17px",
            }}
          >
            내 Lucky Token : {tokens}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "60px", width: "340px" }}>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "800",
              marginBottom: "14px",
              color: "#2d2d2d",
            }}
          >
             최근 도전 기록
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((h, i) => (
              <li
                key={i}
                style={{
                  padding: "12px",
                  marginBottom: "10px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "16px",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                <span>{h.addr.slice(0, 6)}...{h.addr.slice(-4)}</span>
                <span>{h.val}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
