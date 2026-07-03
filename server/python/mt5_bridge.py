"""
MetaTrader5 Bridge Service (FIXED VERSION)
- Proper MT5 initialization with explicit terminal path
- Stable background connection (no re-init loop bug)
- Exposes account, positions, trades via HTTP
"""

import json
import os
import time
import threading
from datetime import datetime, timedelta

import MetaTrader5 as mt5
from flask import Flask, jsonify, request
from flask_cors import CORS


# CONFIG


MT5_PATH = r"C:\Program Files\MetaTrader 5\terminal64.exe"
LOG_FILE = os.path.join(os.path.dirname(__file__), "bridge.log")

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except:
        pass


# FLASK APP


app = Flask(__name__)
CORS(app)

MT5_READY = False
MT5_ACCOUNT = None
MT5_ERROR = None


# MT5 CONNECTION (FIXED)


def init_mt5():
    """Initialize MT5 ONCE properly"""
    global MT5_ERROR

    log("Initializing MT5...")

    if not mt5.initialize(path=MT5_PATH):
        MT5_ERROR = str(mt5.last_error())
        log(f"MT5 init failed: {MT5_ERROR}")
        return False

    log("MT5 initialized successfully")
    return True


def background_worker():
    global MT5_READY, MT5_ACCOUNT, MT5_ERROR

    # INIT ONCE
    if not init_mt5():
        return

    # LOOP ONLY FOR DATA CHECK (NOT RE-INIT)
    while True:
        try:
            acc = mt5.account_info()

            if acc:
                MT5_ACCOUNT = acc
                MT5_READY = True
                MT5_ERROR = None
                log(f"Connected | Login: {acc.login} | Balance: {acc.balance:.2f}")
            else:
                MT5_READY = False
                MT5_ERROR = "No account logged into MT5 terminal"
                log(MT5_ERROR)

        except Exception as e:
            MT5_ERROR = str(e)
            log(f"Error: {e}")

        time.sleep(10)


threading.Thread(target=background_worker, daemon=True).start()



def account_to_dict(acc):
    if acc is None:
        return None

    return {
        "login": acc.login,
        "name": acc.name,
        "server": acc.server,
        "company": acc.company,
        "balance": acc.balance,
        "equity": acc.equity,
        "margin": acc.margin,
        "marginFree": acc.margin_free,
        "marginLevel": acc.margin_level,
        "currency": acc.currency,
        "leverage": acc.leverage,
        "connected": True
    }


def ensure_mt5():
    if not MT5_READY:
        raise RuntimeError(MT5_ERROR or "MT5 not connected")

    acc = mt5.account_info()
    if acc is None:
        raise RuntimeError("No account logged into MT5")

    return acc

# ─────────────────────────────────────────────
# API ROUTES
# ─────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({
        "status": "ok" if MT5_READY else "error",
        "error": MT5_ERROR,
        "connected": MT5_READY and mt5.account_info() is not None,
    })


@app.route("/account")
def account():
    try:
        acc = ensure_mt5()
        return jsonify(account_to_dict(acc))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/positions")
def positions():
    try:
        ensure_mt5()

        positions = mt5.positions_get()
        data = []

        if positions:
            for p in positions:
                data.append({
                    "ticket": p.ticket,
                    "symbol": p.symbol,
                    "type": "buy" if p.type == 0 else "sell",
                    "volume": p.volume,
                    "openPrice": p.price_open,
                    "currentPrice": p.price_current,
                    "profit": p.profit,
                })

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    print("Starting MT5 Bridge...")
    print("Server: http://127.0.0.1:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)