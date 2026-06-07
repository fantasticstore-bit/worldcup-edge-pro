from __future__ import annotations

import csv
import io
import json
import mimetypes
import os
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from statistics import median
from urllib.parse import parse_qs, urlparse

from app.betting_core import (
    DEFAULT_PLAYABLE_BOOKMAKERS,
    MODEL_PROFILES,
    ROOT,
    apply_profile,
    connect,
    evaluated_matches,
    get_controls,
    init_db,
    match_key,
    play_grade,
    pro_score,
    summary,
    top_plays,
)


STATIC_DIR = ROOT / "static"
DEFAULT_LOGIN_USER = "ciobez"
DEFAULT_LOGIN_PASSWORD = "change-me-before-deploy"

COUNTRY_BOOKMAKERS = {
    "all": {
        "label": "Tutti",
        "books": [],
        "links": {},
    },
    "nl": {
        "label": "Olanda",
        "books": ["Unibet (NL)", "Betfair", "Betsson", "Coolbet"],
        "links": {
            "Unibet (NL)": "https://www.unibet.nl/",
            "Betfair": "https://www.betfair.com/",
            "Bet365": "https://www.bet365.nl/",
            "TOTO": "https://www.toto.nl/",
            "JACKS.NL": "https://jacks.nl/sports",
            "Circus.nl": "https://www.circus.nl/",
            "BetCity": "https://www.betcity.nl/",
        },
    },
    "it": {
        "label": "Italia",
        "books": ["Codere (IT)", "Betfair", "888sport"],
        "links": {
            "Codere (IT)": "https://www.codere.it/",
            "Betfair": "https://www.betfair.it/",
            "888sport": "https://www.888sport.it/",
        },
    },
}


def json_bytes(payload, status=200):
    return status, "application/json", json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")


class Handler(SimpleHTTPRequestHandler):
    server_version = "WorldCupEdge/0.1"

    def log_message(self, format, *args):
        return

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api_get(parsed)
            return
        self.serve_static(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api_post(parsed)
            return
        self.send_error(404)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if not length:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def send_payload(self, status, content_type, body):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_api_get(self, parsed):
        conn = connect()
        init_db(conn)
        query = parse_qs(parsed.query)
        try:
            if parsed.path == "/api/summary":
                payload = summary(conn)
            elif parsed.path == "/api/matches":
                rows = evaluated_matches(conn)
                status_filter = query.get("status", ["all"])[0]
                search = query.get("search", [""])[0].lower().strip()
                if status_filter == "value":
                    rows = [r for r in rows if r["recommendation"] not in ("SKIP", "ADD ODDS")]
                elif status_filter == "missing":
                    rows = [r for r in rows if r["recommendation"] == "ADD ODDS"]
                elif status_filter == "skip":
                    rows = [r for r in rows if r["recommendation"] == "SKIP"]
                if search:
                    rows = [
                        r for r in rows
                        if search in f"{r['home_team']} {r['away_team']} {r['group']} {r['match_id']}".lower()
                    ]
                payload = {"matches": rows}
            elif parsed.path == "/api/top_plays":
                limit = min(25, max(1, int(query.get("limit", ["10"])[0])))
                payload = {"plays": top_plays(conn, limit)}
            elif parsed.path == "/api/assistant":
                payload = betting_assistant(conn, query)
            elif parsed.path == "/api/demo_bundle":
                payload = demo_bundle()
            elif parsed.path == "/api/daily_report":
                payload = daily_report(conn, query)
            elif parsed.path == "/api/market_pulse":
                payload = market_pulse(conn)
            elif parsed.path == "/api/bets":
                payload = {"bets": enriched_bets(conn)}
            elif parsed.path == "/api/performance":
                payload = performance_lab(conn)
            elif parsed.path == "/api/product_status":
                payload = product_status(conn)
            elif parsed.path == "/api/controls":
                payload = {"controls": get_controls(conn)}
            elif parsed.path == "/api/odds":
                payload = {"odds": recent_odds(conn, query)}
            elif parsed.path == "/api/bookmakers":
                payload = {"bookmakers": bookmakers(conn)}
            elif parsed.path == "/api/book_finder":
                payload = book_finder(conn, query)
            elif parsed.path == "/api/match":
                payload = match_detail(conn, query.get("match_id", [""])[0])
            elif parsed.path == "/api/profiles":
                payload = {"profiles": list(MODEL_PROFILES.keys())}
            elif parsed.path == "/api/export/value.csv":
                rows = [
                    row for row in evaluated_matches(conn)
                    if row["recommendation"] not in ("SKIP", "ADD ODDS")
                ]
                self.send_csv("worldcup_edge_value_spots.csv", export_matches_csv(rows))
                return
            elif parsed.path == "/api/export/bets.csv":
                rows = conn.execute("SELECT * FROM bets ORDER BY created_at DESC, id DESC").fetchall()
                self.send_csv("worldcup_edge_bets_backup.csv", export_bets_csv(rows))
                return
            elif parsed.path == "/api/export/assistant.csv":
                payload = betting_assistant(conn, query)
                self.send_csv("worldcup_edge_daily_assistant.csv", export_assistant_csv(payload))
                return
            else:
                self.send_error(404)
                return
            self.send_payload(*json_bytes(payload))
        except Exception as exc:
            self.send_payload(*json_bytes({"error": str(exc)}, 500))
        finally:
            conn.close()

    def handle_api_post(self, parsed):
        conn = connect()
        init_db(conn)
        try:
            data = self.read_json()
            if parsed.path == "/api/controls":
                for key, value in data.items():
                    conn.execute(
                        "INSERT OR REPLACE INTO controls(key, value) VALUES(?, ?)",
                        (key, float(value)),
                    )
                conn.commit()
                payload = {"controls": get_controls(conn)}
            elif parsed.path == "/api/bets":
                duplicate = conn.execute(
                    """
                    SELECT id, status FROM bets
                    WHERE match_id = ?
                      AND selection = ?
                      AND status IN ('planned', 'open')
                    LIMIT 1
                    """,
                    (data.get("match_id"), data.get("selection")),
                ).fetchone()
                if duplicate:
                    raise ValueError("Bet già salvata nel tracker")
                conn.execute(
                    """
                    INSERT INTO bets(match_id, selection, odds, stake, model_probability, ev, kelly, notes)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        data.get("match_id"),
                        data.get("selection"),
                        float(data.get("odds") or 0),
                        float(data.get("stake") or 0),
                        float(data.get("model_probability") or 0),
                        float(data.get("ev") or 0),
                        float(data.get("kelly") or 0),
                        data.get("notes", ""),
                    ),
                )
                conn.commit()
                payload = {"ok": True}
            elif parsed.path in ("/api/login", "/api/license"):
                username = str(data.get("username", "")).strip()
                password = str(data.get("password") or data.get("code") or "").strip()
                expected_user = os.environ.get("WORLD_CUP_EDGE_USER", DEFAULT_LOGIN_USER).strip()
                expected_password = os.environ.get("WORLD_CUP_EDGE_PASSWORD", DEFAULT_LOGIN_PASSWORD).strip()
                payload = {
                    "ok": username == expected_user and password == expected_password,
                    "product": "WorldCup Edge Pro",
                    "user": expected_user,
                }
                if not payload["ok"]:
                    self.send_payload(*json_bytes({"error": "Login non valido"}, 403))
                    return
            elif parsed.path == "/api/bets/update":
                bet_id = int(data.get("id"))
                result_profit = data.get("result_profit")
                if result_profit in (None, ""):
                    current = conn.execute("SELECT odds, stake FROM bets WHERE id = ?", (bet_id,)).fetchone()
                    status = data.get("status")
                    if current and status == "won":
                        result_profit = float(current["stake"] or 0) * (float(current["odds"] or 0) - 1)
                    elif current and status == "lost":
                        result_profit = -float(current["stake"] or 0)
                    elif current and status in ("push", "void"):
                        result_profit = 0
                conn.execute(
                    """
                    UPDATE bets
                    SET status = COALESCE(?, status),
                        result_profit = COALESCE(?, result_profit),
                        notes = COALESCE(?, notes)
                    WHERE id = ?
                    """,
                    (
                        data.get("status"),
                        float(result_profit) if result_profit not in (None, "") else None,
                        data.get("notes"),
                        bet_id,
                    ),
                )
                conn.commit()
                payload = {"ok": True}
            elif parsed.path == "/api/profile":
                payload = {"controls": apply_profile(conn, data.get("profile", "conservative"))}
            elif parsed.path == "/api/import_odds":
                payload = import_odds(conn, data)
            elif parsed.path == "/api/fetch_odds_api":
                payload = fetch_odds_api(conn, data)
            elif parsed.path == "/api/bookmakers":
                payload = {"bookmakers": update_bookmakers(conn, data)}
            else:
                self.send_error(404)
                return
            self.send_payload(*json_bytes(payload))
        except Exception as exc:
            self.send_payload(*json_bytes({"error": str(exc)}, 500))
        finally:
            conn.close()

    def serve_static(self, path):
        if path in ("", "/"):
            path = "/index.html"
        target = (STATIC_DIR / path.lstrip("/")).resolve()
        if not str(target).startswith(str(STATIC_DIR.resolve())) or not target.exists() or target.is_dir():
            self.send_error(404)
            return
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        body = target.read_bytes()
        self.send_payload(200, content_type, body)

    def send_csv(self, filename, text):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def import_odds(conn, data):
    rows = []
    if "rows" in data:
        rows = data["rows"]
    elif "csv" in data:
        rows = list(csv.DictReader(data["csv"].splitlines()))
    inserted = 0
    for row in rows:
        home = row.get("home_team") or row.get("Home Team") or row.get("home")
        away = row.get("away_team") or row.get("Away Team") or row.get("away")
        home_odds = row.get("home_odds") or row.get("Home Odds")
        draw_odds = row.get("draw_odds") or row.get("Draw Odds")
        away_odds = row.get("away_odds") or row.get("Away Odds")
        if not (home and away and home_odds and draw_odds and away_odds):
            continue
        conn.execute(
            """
            INSERT INTO odds(match_key, bookmaker, source, home_odds, draw_odds, away_odds, notes)
            VALUES(?, ?, ?, ?, ?, ?, ?)
            """,
            (
                match_key(home, away),
                row.get("bookmaker") or row.get("Bookmaker") or "Manual",
                row.get("source") or "Manual import",
                float(home_odds),
                float(draw_odds),
                float(away_odds),
                row.get("notes") or "",
            ),
        )
        ensure_bookmaker_pref(conn, row.get("bookmaker") or row.get("Bookmaker") or "Manual")
        inserted += 1
    conn.commit()
    return {"inserted": inserted}


def enriched_bets(conn):
    rows = [
        dict(row)
        for row in conn.execute("SELECT * FROM bets ORDER BY created_at DESC, id DESC").fetchall()
    ]
    matches = {row["match_id"]: row for row in evaluated_matches(conn)}
    for bet in rows:
        match = matches.get(bet.get("match_id"))
        outcome = None
        if match:
            outcome = next(
                (item for item in match.get("outcomes", []) if item.get("label") == bet.get("selection")),
                None,
            )
        current_odds = float(outcome.get("best_odds")) if outcome and outcome.get("best_odds") else None
        placed_odds = float(bet.get("odds") or 0)
        clv = (placed_odds / current_odds - 1) if current_odds and placed_odds else None
        bet["current_best_odds"] = current_odds
        bet["current_best_bookmaker"] = outcome.get("best_bookmaker") if outcome else None
        bet["clv"] = clv
        bet["clv_status"] = clv_status(clv)
        bet["current_recommendation"] = match.get("recommendation") if match else None
        bet["current_price_alert"] = match.get("price_alert") if match else None
        if match and match.get("recommendation") not in ("SKIP", "ADD ODDS"):
            score = pro_score(match)
            bet["current_pro_score"] = score
            bet["current_play_grade"] = play_grade(score, match.get("confidence") or 0)
        else:
            bet["current_pro_score"] = None
            bet["current_play_grade"] = None
    return rows


def clv_status(clv):
    if clv is None:
        return "No live price"
    if clv >= 0.02:
        return "Beat market"
    if clv <= -0.02:
        return "Drifting"
    return "Flat"


def performance_lab(conn):
    bets = enriched_bets(conn)
    settled = [bet for bet in bets if bet.get("status") in ("won", "lost", "push", "void")]
    open_bets = [bet for bet in bets if bet.get("status") in ("planned", "open")]
    total_profit = sum(float(bet.get("result_profit") or 0) for bet in bets)
    settled_stake = sum(float(bet.get("stake") or 0) for bet in settled)
    clv_values = [float(bet["clv"]) for bet in bets if bet.get("clv") is not None]
    won = sum(1 for bet in settled if bet.get("status") == "won")
    lost = sum(1 for bet in settled if bet.get("status") == "lost")
    decided = won + lost
    ordered = sorted(bets, key=lambda bet: (bet.get("created_at") or "", int(bet.get("id") or 0)))
    running = 0.0
    equity = []
    for bet in ordered:
        running += float(bet.get("result_profit") or 0)
        equity.append(
            {
                "id": bet.get("id"),
                "created_at": bet.get("created_at"),
                "match_id": bet.get("match_id"),
                "selection": bet.get("selection"),
                "profit": float(bet.get("result_profit") or 0),
                "equity": running,
            }
        )
    return {
        "totals": {
            "bets": len(bets),
            "open_bets": len(open_bets),
            "settled_bets": len(settled),
            "profit": total_profit,
            "settled_stake": settled_stake,
            "roi": total_profit / settled_stake if settled_stake else 0.0,
            "strike_rate": won / decided if decided else 0.0,
            "avg_clv": sum(clv_values) / len(clv_values) if clv_values else 0.0,
            "beat_market_rate": sum(1 for value in clv_values if value > 0.02) / len(clv_values) if clv_values else 0.0,
            "avg_stake": sum(float(bet.get("stake") or 0) for bet in bets) / len(bets) if bets else 0.0,
        },
        "equity": equity,
        "by_status": group_performance(bets, "status"),
        "by_grade": group_performance(bets, "current_play_grade"),
        "by_price_alert": group_performance(bets, "current_price_alert"),
        "best_bets": sorted(bets, key=lambda bet: float(bet.get("result_profit") or 0), reverse=True)[:5],
        "worst_bets": sorted(bets, key=lambda bet: float(bet.get("result_profit") or 0))[:5],
        "best_clv": sorted(
            [bet for bet in bets if bet.get("clv") is not None],
            key=lambda bet: float(bet.get("clv") or 0),
            reverse=True,
        )[:5],
    }


def betting_assistant(conn, query):
    country = query.get("country", ["nl"])[0]
    country_cfg = COUNTRY_BOOKMAKERS.get(country, COUNTRY_BOOKMAKERS["nl"])
    summary_data = summary(conn)
    controls = get_controls(conn)
    unit = float(controls.get("unit_size", 1) or 1)
    bankroll = float(summary_data.get("bankroll_current") or controls.get("bankroll_start") or 0)
    max_exposure = float(summary_data.get("max_exposure") or 0)
    open_exposure = float(summary_data.get("open_exposure") or 0)
    remaining_exposure = max(0.0, max_exposure - open_exposure)
    plays = top_plays(conn, 8)
    cards = []
    for play in plays:
        outcome = next(
            (item for item in play.get("outcomes", []) if item.get("label") == play.get("recommendation")),
            None,
        )
        if not outcome:
            continue
        model_prob = float(outcome.get("model_prob") or 0)
        min_ev = float(controls.get("min_ev") or 0)
        min_playable_odds = ((1 + min_ev) / model_prob) if model_prob else None
        stake = min(float(play.get("suggested_stake") or 0), remaining_exposure or float(play.get("suggested_stake") or 0))
        best_country = best_country_price(conn, play["match_id"], outcome.get("code"), country_cfg)
        feed_price = float(play.get("pick_best_odds") or 0)
        country_price = float(best_country.get("odds") or 0) if best_country else 0
        usable_price = country_price or feed_price
        price_ok = bool(min_playable_odds and usable_price >= min_playable_odds)
        grade = play.get("play_grade") or "Watch"
        if not price_ok:
            action = "NON GIOCARE"
            tone = "bad"
        elif play.get("price_alert") in ("PRICE LOST", "PREZZO PERSO"):
            action = "Aspetta prezzo"
            tone = "bad"
        elif play.get("price_alert") in ("SMALL ONLY", "WATCH"):
            action = "Solo piccola"
            tone = "watch"
        elif grade == "A":
            action = "Giocabile"
            tone = "good"
        else:
            action = "Controlla quota"
            tone = "watch"
        cards.append(
            {
                "match_id": play["match_id"],
                "match": f"{play['home_team']} - {play['away_team']}",
                "date": play.get("date"),
                "time": play.get("time"),
                "pick": play.get("recommendation"),
                "grade": grade,
                "action": action,
                "tone": tone,
                "stake": round(stake, 2),
                "units": round(stake / unit, 2) if unit else 0,
                "best_odds": play.get("pick_best_odds"),
                "best_bookmaker": play.get("pick_best_bookmaker"),
                "country_best_odds": best_country.get("odds") if best_country else None,
                "country_best_bookmaker": best_country.get("bookmaker") if best_country else None,
                "min_playable_odds": round(min_playable_odds, 2) if min_playable_odds else None,
                "price_status": price_status(usable_price, min_playable_odds),
                "ev": play.get("best_ev"),
                "confidence": play.get("confidence"),
                "price_alert": play.get("price_alert"),
                "why": assistant_reason(play, min_playable_odds, best_country),
            }
        )
    playable_count = len([card for card in cards if card["tone"] == "good"])
    watch_count = len([card for card in cards if card["tone"] == "watch"])
    blocked_count = len([card for card in cards if card["tone"] == "bad"])
    opportunity_count = playable_count + watch_count
    if playable_count:
        primary = f"{playable_count} giocabili ora, {watch_count} da verificare, {blocked_count} da saltare."
    elif opportunity_count:
        primary = f"{opportunity_count} opportunità da verificare, nessuna forzata."
    else:
        primary = "Nessuna entrata pulita ora: il modello protegge il bankroll."
    return {
        "country": country,
        "country_label": country_cfg["label"],
        "bankroll": bankroll,
        "unit_size": unit,
        "open_exposure": open_exposure,
        "max_exposure": max_exposure,
        "remaining_exposure": remaining_exposure,
        "risk_status": summary_data.get("risk_status"),
        "plan": {
            "title": "Cosa faccio oggi",
            "primary": primary,
            "subtitle": "Price discipline per matchday: quota minima, stake e bookmaker prima di decidere.",
            "bankroll_note": f"Bankroll {bankroll:.2f} u, unità {unit:.2f} u, spazio residuo {remaining_exposure:.2f} u.",
            "rule": "Gioca solo se trovi almeno la quota minima. Se il bookmaker è sotto, passa o aspetta.",
            "legend": [
                {"label": "Verde", "text": "playable"},
                {"label": "Arancione", "text": "watch / stake piccolo"},
                {"label": "Rosso", "text": "no play"},
            ],
        },
        "cards": cards[:5],
    }


def price_status(price, minimum):
    if not price or not minimum:
        return "Controlla manualmente"
    if price < minimum:
        return f"Quota sotto minimo: serve {minimum:.2f}, trovata {price:.2f}"
    if price >= minimum * 1.08:
        return "Prezzo forte: sopra la quota minima"
    return "Prezzo giocabile: sopra il minimo"


def daily_report(conn, query):
    assistant = betting_assistant(conn, query)
    pulse = market_pulse(conn)
    status = product_status(conn)
    return {
        "generated_for": assistant["country_label"],
        "assistant": assistant,
        "market_pulse": pulse,
        "product": status,
        "legal_note": "Analytics only. Non garantisce profitto, non piazza scommesse e non sostituisce il giudizio personale.",
    }


def market_pulse(conn):
    rows = []
    for row in top_plays(conn, 12):
        try:
            key_row = conn.execute("SELECT match_key FROM matches WHERE match_id = ?", (row["match_id"],)).fetchone()
            movement = line_movement(conn, key_row["match_key"], row) if key_row else None
        except Exception:
            movement = None
        if not movement:
            rows.append(
                {
                    "match_id": row["match_id"],
                    "match": f"{row['home_team']} - {row['away_team']}",
                    "pick": row["recommendation"],
                    "direction": "flat",
                    "label": "Pochi dati",
                    "tone": "watch",
                    "delta": 0,
                    "latest": None,
                    "previous": None,
                }
            )
            continue
        direction = movement.get("direction")
        delta = float(movement.get("delta") or 0)
        if direction == "down":
            label, tone = "Quota in discesa", "bad"
        elif direction == "up":
            label, tone = "Quota in salita", "watch"
        else:
            label, tone = "Mercato stabile", "good"
        rows.append(
            {
                "match_id": row["match_id"],
                "match": f"{row['home_team']} - {row['away_team']}",
                "pick": row["recommendation"],
                "direction": direction,
                "label": label,
                "tone": tone,
                "delta": delta,
                "latest": movement.get("latest", {}).get("median_odds"),
                "previous": movement.get("previous", {}).get("median_odds") if movement.get("previous") else None,
            }
        )
    return {"items": rows[:6]}


def demo_bundle():
    cards = [
        {
            "match_id": "DEMO-1",
            "match": "Brazil - Argentina",
            "date": "2026-06-18",
            "time": "21:00",
            "pick": "Brazil vincente",
            "grade": "A",
            "action": "Giocabile",
            "tone": "good",
            "stake": 12.5,
            "units": 1.25,
            "best_odds": 2.42,
            "best_bookmaker": "DemoBook",
            "country_best_odds": 2.42,
            "country_best_bookmaker": "DemoBook",
            "min_playable_odds": 2.18,
            "price_status": "Prezzo forte: sopra la quota minima",
            "ev": 0.11,
            "confidence": 0.72,
            "price_alert": "BEST PRICE",
            "why": "Demo dati · quota minima 2.18 · nessun dato/API reale mostrato",
        },
        {
            "match_id": "DEMO-2",
            "match": "France - Senegal",
            "date": "2026-06-19",
            "time": "18:00",
            "pick": "Senegal vincente",
            "grade": "B",
            "action": "NON GIOCARE",
            "tone": "bad",
            "stake": 0,
            "units": 0,
            "best_odds": 5.4,
            "best_bookmaker": "DemoBook",
            "country_best_odds": 4.2,
            "country_best_bookmaker": "DemoBook",
            "min_playable_odds": 4.85,
            "price_status": "Quota sotto minimo: serve 4.85, trovata 4.20",
            "ev": 0.02,
            "confidence": 0.51,
            "price_alert": "PRICE LOST",
            "why": "Demo dati · esempio di value perso",
        },
    ]
    assistant = {
        "country": "demo",
        "country_label": "Demo",
        "bankroll": 1000,
        "unit_size": 10,
        "open_exposure": 20,
        "max_exposure": 80,
        "remaining_exposure": 60,
        "risk_status": "OK",
        "plan": {
            "title": "Demo mode",
            "primary": "1 giocabile, 1 da non giocare per prezzo perso.",
            "bankroll_note": "Bankroll demo 1000 u, unità 10 u, spazio residuo 60 u.",
            "rule": "Dati dimostrativi: nessuna API, nessuna quota privata, nessun account bookmaker.",
        },
        "cards": cards,
    }
    return {
        "summary": {
            "matches": 72,
            "value_spots": 12,
            "missing_odds": 0,
            "bankroll_current": 1000,
            "tracked_profit": 0,
            "open_exposure": 20,
            "max_exposure": 80,
            "roi": 0,
            "risk_status": "OK",
            "bets_count": 2,
            "strike_rate": 0,
        },
        "assistant": assistant,
        "market_pulse": {
            "items": [
                {"match_id": "DEMO-1", "match": "Brazil - Argentina", "pick": "Brazil vincente", "label": "Mercato stabile", "tone": "good", "delta": 0.01, "latest": 2.34, "previous": 2.33},
                {"match_id": "DEMO-2", "match": "France - Senegal", "pick": "Senegal vincente", "label": "Quota in discesa", "tone": "bad", "delta": -0.42, "latest": 4.20, "previous": 4.62},
            ]
        },
    }


def best_country_price(conn, match_id, outcome_code, country_cfg):
    row = conn.execute("SELECT match_key FROM matches WHERE match_id = ?", (match_id,)).fetchone()
    if not row:
        return None
    column = {"HOME": "home_odds", "DRAW": "draw_odds", "AWAY": "away_odds"}.get(outcome_code)
    if not column:
        return None
    params = [row["match_key"]]
    book_filter = ""
    if country_cfg.get("books"):
        placeholders = ",".join("?" for _ in country_cfg["books"])
        book_filter = f" AND bookmaker IN ({placeholders})"
        params.extend(country_cfg["books"])
    prices = conn.execute(
        f"""
        SELECT bookmaker, {column} AS odds, updated_at
        FROM odds
        WHERE match_key = ?
          AND {column} > 1
          {book_filter}
        ORDER BY {column} DESC
        LIMIT 1
        """,
        params,
    ).fetchone()
    return dict(prices) if prices else None


def assistant_reason(play, min_playable_odds, country_best):
    parts = [
        f"EV {float(play.get('best_ev') or 0) * 100:.1f}%",
        f"confidence {float(play.get('confidence') or 0) * 100:.1f}%",
        f"alert {play.get('price_alert')}",
    ]
    if min_playable_odds:
        parts.append(f"quota minima {min_playable_odds:.2f}")
    if country_best:
        parts.append(f"nel paese trovi {float(country_best['odds']):.2f} su {country_best['bookmaker']}")
    else:
        parts.append("controllo paese non disponibile nel feed")
    return " · ".join(parts)


def product_status(conn):
    summary_data = summary(conn)
    perf = performance_lab(conn)
    odds_count = conn.execute("SELECT COUNT(*) AS count FROM odds").fetchone()["count"]
    event_count = conn.execute("SELECT COUNT(DISTINCT match_key) AS count FROM odds").fetchone()["count"]
    bookmaker_count = conn.execute(
        "SELECT COUNT(DISTINCT bookmaker) AS count FROM odds WHERE bookmaker IS NOT NULL AND bookmaker <> ''"
    ).fetchone()["count"]
    checklist = [
        {
            "label": "Real odds feed",
            "status": "ready" if odds_count > 0 else "missing",
            "detail": f"{odds_count} odds snapshot su {event_count} match.",
        },
        {
            "label": "Playable bookmaker filter",
            "status": "ready" if bookmaker_count > 0 else "missing",
            "detail": f"{bookmaker_count} bookmaker rilevati e filtrabili.",
        },
        {
            "label": "Top Plays engine",
            "status": "ready" if summary_data["value_spots"] > 0 else "missing",
            "detail": f"{summary_data['value_spots']} value spot, shortlist ordinata per score.",
        },
        {
            "label": "Bankroll and risk controls",
            "status": "ready" if summary_data.get("max_exposure", 0) > 0 else "missing",
            "detail": f"Exposure {summary_data['open_exposure']:.2f}/{summary_data['max_exposure']:.2f} u.",
        },
        {
            "label": "Performance Lab",
            "status": "ready" if perf["totals"]["bets"] > 0 else "partial",
            "detail": f"{perf['totals']['bets']} bet tracciate, avg CLV {perf['totals']['avg_clv'] * 100:.1f}%.",
        },
        {
            "label": "Commercial access gate",
            "status": "ready",
            "detail": "Login privato locale attivo e configurabile via WORLD_CUP_EDGE_USER/PASSWORD.",
        },
        {
            "label": "Responsible-use disclaimer",
            "status": "ready",
            "detail": "Disclaimer mostrato prima dell'accesso alla dashboard.",
        },
        {
            "label": "Demo mode",
            "status": "ready",
            "detail": "Demo senza API private e senza dati bookmaker sensibili.",
        },
        {
            "label": "Daily report",
            "status": "ready",
            "detail": "Daily Betting Sheet stampabile e CSV operativo.",
        },
        {
            "label": "Cloud billing",
            "status": "partial",
            "detail": "Pronto come roadmap: richiede hosting, auth clienti e Stripe.",
        },
        {
            "label": "App Store package",
            "status": "partial",
            "detail": "Richiede app mobile, privacy policy, screenshot e review Apple.",
        },
    ]
    ready = sum(1 for item in checklist if item["status"] == "ready")
    score = round((ready / len(checklist)) * 100)
    return {
        "product": "WorldCup Edge Pro",
        "version": "0.9-commercial-beta",
        "readiness_score": score,
        "release_status": "commercial beta" if score >= 85 else "private beta",
        "checklist": checklist,
        "positioning": "Sports betting market analytics, price intelligence, bankroll tracking, and performance reporting.",
    }


def group_performance(bets, key):
    groups = {}
    for bet in bets:
        label = bet.get(key) or "Unknown"
        item = groups.setdefault(label, {"label": label, "bets": 0, "stake": 0.0, "profit": 0.0, "clv_values": []})
        item["bets"] += 1
        item["stake"] += float(bet.get("stake") or 0)
        item["profit"] += float(bet.get("result_profit") or 0)
        if bet.get("clv") is not None:
            item["clv_values"].append(float(bet.get("clv")))
    rows = []
    for item in groups.values():
        rows.append(
            {
                "label": item["label"],
                "bets": item["bets"],
                "stake": item["stake"],
                "profit": item["profit"],
                "roi": item["profit"] / item["stake"] if item["stake"] else 0.0,
                "avg_clv": sum(item["clv_values"]) / len(item["clv_values"]) if item["clv_values"] else 0.0,
            }
        )
    return sorted(rows, key=lambda row: (row["profit"], row["bets"]), reverse=True)


def recent_odds(conn, query):
    limit = min(500, max(1, int(query.get("limit", ["120"])[0])))
    rows = conn.execute(
        """
        SELECT
            odds.id,
            odds.match_key,
            matches.match_id,
            matches.home_team,
            matches.away_team,
            odds.bookmaker,
            odds.source,
            odds.home_odds,
            odds.draw_odds,
            odds.away_odds,
            odds.updated_at,
            odds.notes
        FROM odds
        LEFT JOIN matches ON matches.match_key = odds.match_key
        ORDER BY odds.updated_at DESC, odds.id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    return [dict(row) for row in rows]


def bookmakers(conn):
    ensure_all_bookmaker_prefs(conn)
    rows = conn.execute(
        """
        SELECT
            odds.bookmaker,
            COUNT(*) AS rows_count,
            MAX(odds.updated_at) AS latest,
            COALESCE(bookmaker_prefs.enabled, 1) AS enabled
        FROM odds
        LEFT JOIN bookmaker_prefs ON bookmaker_prefs.bookmaker = odds.bookmaker
        WHERE odds.bookmaker IS NOT NULL AND odds.bookmaker <> ''
        GROUP BY odds.bookmaker
        ORDER BY rows_count DESC, odds.bookmaker
        """
    ).fetchall()
    return [dict(row) for row in rows]


def book_finder(conn, query):
    country = query.get("country", ["nl"])[0]
    match_id = query.get("match_id", [""])[0]
    country_cfg = COUNTRY_BOOKMAKERS.get(country, COUNTRY_BOOKMAKERS["all"])
    match_rows = conn.execute("SELECT match_id, home_team, away_team, match_key, match_date, utc_time FROM matches ORDER BY match_date, utc_time, match_id").fetchall()
    if not match_id and match_rows:
        match_id = match_rows[0]["match_id"]
    match_row = next((row for row in match_rows if row["match_id"] == match_id), None)
    matches_payload = [dict(row) for row in match_rows]
    countries_payload = [
        {"code": code, "label": cfg["label"]}
        for code, cfg in COUNTRY_BOOKMAKERS.items()
    ]
    if not match_row:
        return {"countries": countries_payload, "matches": matches_payload, "country": country, "prices": [], "manual_links": []}
    params = [match_row["match_key"]]
    book_filter = ""
    if country_cfg["books"]:
        placeholders = ",".join("?" for _ in country_cfg["books"])
        book_filter = f" AND bookmaker IN ({placeholders})"
        params.extend(country_cfg["books"])
    rows = conn.execute(
        f"""
        SELECT bookmaker, source, home_odds, draw_odds, away_odds, updated_at
        FROM odds
        WHERE match_key = ?
          AND home_odds > 1
          AND draw_odds > 1
          AND away_odds > 1
          {book_filter}
        ORDER BY updated_at DESC, bookmaker
        """,
        params,
    ).fetchall()
    prices = [dict(row) for row in rows]
    outcomes = [
        {
            "code": "home",
            "label": f"{match_row['home_team']} vincente",
            "best": best_price(prices, "home_odds"),
        },
        {"code": "draw", "label": "Pareggio", "best": best_price(prices, "draw_odds")},
        {
            "code": "away",
            "label": f"{match_row['away_team']} vincente",
            "best": best_price(prices, "away_odds"),
        },
    ]
    manual_links = [
        {"bookmaker": bookmaker, "url": url, "in_feed": any(row["bookmaker"] == bookmaker for row in prices)}
        for bookmaker, url in country_cfg.get("links", {}).items()
    ]
    return {
        "countries": countries_payload,
        "matches": matches_payload,
        "country": country,
        "country_label": country_cfg["label"],
        "match": dict(match_row),
        "prices": prices,
        "outcomes": outcomes,
        "manual_links": manual_links,
        "note": "I prezzi mostrati arrivano dal feed quote disponibile. I link manuali servono per controllare bookmaker locali non presenti nel feed.",
    }


def best_price(rows, column):
    if not rows:
        return None
    valid = [row for row in rows if row.get(column)]
    if not valid:
        return None
    row = max(valid, key=lambda item: float(item[column]))
    return {
        "odds": float(row[column]),
        "bookmaker": row["bookmaker"],
        "updated_at": row["updated_at"],
    }


def update_bookmakers(conn, data):
    enabled = set(data.get("enabled", []))
    all_books = [row["bookmaker"] for row in bookmakers(conn)]
    conn.execute("DELETE FROM bookmaker_prefs")
    for bookmaker in all_books:
        conn.execute(
            "INSERT INTO bookmaker_prefs(bookmaker, enabled) VALUES(?, ?)",
            (bookmaker, 1 if bookmaker in enabled else 0),
        )
    conn.commit()
    return bookmakers(conn)


def ensure_bookmaker_pref(conn, bookmaker):
    if not bookmaker:
        return
    enabled = 1 if bookmaker in DEFAULT_PLAYABLE_BOOKMAKERS else 0
    conn.execute(
        "INSERT OR IGNORE INTO bookmaker_prefs(bookmaker, enabled) VALUES(?, ?)",
        (bookmaker, enabled),
    )


def ensure_all_bookmaker_prefs(conn):
    rows = conn.execute(
        "SELECT DISTINCT bookmaker FROM odds WHERE bookmaker IS NOT NULL AND bookmaker <> ''"
    ).fetchall()
    for row in rows:
        ensure_bookmaker_pref(conn, row["bookmaker"])
    conn.commit()


def match_detail(conn, match_id):
    rows = evaluated_matches(conn)
    for row in rows:
        if row["match_id"] == match_id:
            match_key_row = conn.execute("SELECT match_key FROM matches WHERE match_id = ?", (match_id,)).fetchone()
            key = match_key_row["match_key"] if match_key_row else ""
            odds_rows = conn.execute(
                """
                SELECT bookmaker, source, home_odds, draw_odds, away_odds, updated_at, notes
                FROM odds
                WHERE match_key = ?
                ORDER BY updated_at DESC, bookmaker
                """,
                (key,),
            ).fetchall()
            row["odds_snapshots"] = [dict(item) for item in odds_rows]
            row["line_movement"] = line_movement(conn, key, row)
            row["timing_alert"] = timing_alert(row, row["line_movement"])
            return row
    raise ValueError("Match non trovato")


def line_movement(conn, key, row):
    code_to_column = {"HOME": "home_odds", "DRAW": "draw_odds", "AWAY": "away_odds"}
    best = max(row.get("outcomes", []), key=lambda item: item.get("ev", -999), default=None)
    if not best:
        return None
    column = code_to_column.get(best.get("code"))
    if not column:
        return None
    enabled_books = {
        item["bookmaker"]
        for item in conn.execute("SELECT bookmaker FROM bookmaker_prefs WHERE enabled = 1").fetchall()
    }
    params = [key]
    book_filter = ""
    if enabled_books:
        placeholders = ",".join("?" for _ in enabled_books)
        book_filter = f" AND bookmaker IN ({placeholders})"
        params.extend(sorted(enabled_books))
    rows = conn.execute(
        f"""
        SELECT updated_at, {column} AS odds
        FROM odds
        WHERE match_key = ?
          AND {column} > 1
          {book_filter}
        ORDER BY updated_at DESC, id DESC
        """,
        params,
    ).fetchall()
    if not rows:
        return None
    buckets = {}
    for item in rows:
        buckets.setdefault(item["updated_at"], []).append(float(item["odds"]))
    points = [
        {"updated_at": timestamp, "median_odds": median(values), "best_odds": max(values)}
        for timestamp, values in buckets.items()
    ]
    latest = points[0]
    previous = points[1] if len(points) > 1 else None
    delta = (latest["median_odds"] - previous["median_odds"]) if previous else 0
    direction = "up" if delta > 0.001 else "down" if delta < -0.001 else "flat"
    return {
        "selection": best.get("label"),
        "code": best.get("code"),
        "latest": latest,
        "previous": previous,
        "delta": delta,
        "direction": direction,
        "points": points[:8],
    }


def timing_alert(row, movement):
    base_alert = row.get("price_alert") or "WATCH"
    base_note = row.get("price_note") or ""
    if row.get("recommendation") in ("SKIP", "ADD ODDS"):
        return {"level": "WAIT", "label": "WAIT", "note": row.get("reason") or "Non pronta.", "tone": "bad"}
    if not movement or not movement.get("previous"):
        return {"level": base_alert, "label": base_alert, "note": base_note, "tone": alert_tone(base_alert)}
    direction = movement.get("direction")
    delta = float(movement.get("delta") or 0)
    confidence = float(row.get("confidence") or 0)
    best_gap = float(row.get("price_gap") or 0)
    if direction == "down" and abs(delta) >= 0.03:
        return {
            "level": "PRICE LOST",
            "label": "PREZZO PERSO",
            "note": "La mediana sta scendendo: entra solo se trovi ancora la best odds indicata.",
            "tone": "bad",
        }
    if direction == "up" and delta >= 0.03:
        return {
            "level": "WAIT",
            "label": "ASPETTA",
            "note": "La quota sta salendo: il mercato potrebbe regalare un prezzo migliore.",
            "tone": "watch",
        }
    if confidence >= 0.55 and best_gap >= 0.015:
        return {
            "level": "ENTER",
            "label": "ENTRA ORA",
            "note": "Segnale forte e prezzo sopra mediana: non inseguire oltre.",
            "tone": "good",
        }
    return {"level": base_alert, "label": base_alert, "note": base_note, "tone": alert_tone(base_alert)}


def alert_tone(alert):
    if alert in ("BEST PRICE", "GOOD PRICE", "ENTER"):
        return "good"
    if alert in ("WATCH", "SMALL ONLY", "WAIT"):
        return "watch"
    return "neutral"


def fetch_odds_api(conn, data):
    api_key = (data.get("api_key", "") or os.environ.get("THE_ODDS_API_KEY", "")).strip()
    if not api_key:
        raise ValueError("API key mancante")
    sport = data.get("sport", "soccer_fifa_world_cup")
    regions = data.get("regions", "eu")
    bookmakers = data.get("bookmakers", "").strip()
    params = {
        "apiKey": api_key,
        "regions": regions,
        "markets": "h2h",
        "oddsFormat": "decimal",
    }
    if bookmakers:
        params["bookmakers"] = bookmakers
    url = f"https://api.the-odds-api.com/v4/sports/{urllib.parse.quote(sport)}/odds?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
    rows = []
    for event in payload:
        home = event.get("home_team")
        away = event.get("away_team")
        if not home or not away:
            continue
        for bookmaker in event.get("bookmakers", []):
            for market in bookmaker.get("markets", []):
                if market.get("key") != "h2h":
                    continue
                prices = {"home": None, "draw": None, "away": None}
                for outcome in market.get("outcomes", []):
                    name = outcome.get("name")
                    price = outcome.get("price")
                    if name == home:
                        prices["home"] = price
                    elif name == away:
                        prices["away"] = price
                    elif name == "Draw":
                        prices["draw"] = price
                if all(prices.values()):
                    rows.append(
                        {
                            "home_team": home,
                            "away_team": away,
                            "home_odds": prices["home"],
                            "draw_odds": prices["draw"],
                            "away_odds": prices["away"],
                            "bookmaker": bookmaker.get("title") or bookmaker.get("key") or "The Odds API",
                            "source": "The Odds API",
                            "notes": event.get("commence_time") or "",
                        }
                    )
    result = import_odds(conn, {"rows": rows})
    result["events"] = len(payload)
    result["source"] = "The Odds API"
    return result


def export_matches_csv(rows):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "match_id",
            "date",
            "group",
            "home_team",
            "away_team",
            "recommendation",
            "best_ev",
            "best_edge",
            "kelly",
            "confidence",
            "pick_odds",
            "pick_bookmaker",
            "pick_best_odds",
            "pick_best_bookmaker",
            "pick_median_odds",
            "overround",
            "reason",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row["match_id"],
                row["date"],
                row["group"],
                row["home_team"],
                row["away_team"],
                row["recommendation"],
                row["best_ev"],
                row["best_edge"],
                row["kelly"],
                row["confidence"],
                row.get("pick_odds"),
                row.get("pick_bookmaker"),
                row.get("pick_best_odds"),
                row.get("pick_best_bookmaker"),
                row.get("pick_median_odds"),
                row["overround"],
                row["reason"],
            ]
        )
    return output.getvalue()


def export_bets_csv(rows):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "created_at",
            "match_id",
            "selection",
            "odds",
            "stake",
            "model_probability",
            "ev",
            "kelly",
            "status",
            "result_profit",
            "notes",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row["id"],
                row["created_at"],
                row["match_id"],
                row["selection"],
                row["odds"],
                row["stake"],
                row["model_probability"],
                row["ev"],
                row["kelly"],
                row["status"],
                row["result_profit"],
                row["notes"],
            ]
        )
    return output.getvalue()


def export_assistant_csv(payload):
    output = io.StringIO()
    fields = [
        "match_id",
        "match",
        "pick",
        "action",
        "grade",
        "stake",
        "min_playable_odds",
        "best_odds",
        "best_bookmaker",
        "country_best_odds",
        "country_best_bookmaker",
        "price_status",
        "ev",
        "confidence",
        "why",
    ]
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for row in payload.get("cards", []):
        writer.writerow({field: row.get(field, "") for field in fields})
    return output.getvalue()


def run(host="127.0.0.1", port=8765):
    conn = connect()
    init_db(conn)
    auto_fetch_odds(conn)
    conn.close()
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"WorldCup Edge running at http://{host}:{port}")
    httpd.serve_forever()


def auto_fetch_odds(conn):
    if os.environ.get("AUTO_FETCH_ODDS", "1").strip().lower() in ("0", "false", "no"):
        return
    if not os.environ.get("THE_ODDS_API_KEY", "").strip():
        return
    odds_count = conn.execute("SELECT COUNT(*) AS count FROM odds").fetchone()["count"]
    if odds_count:
        return
    try:
        result = fetch_odds_api(conn, {"sport": "soccer_fifa_world_cup", "bookmakers": ""})
        print(f"Auto odds refresh complete: {result.get('inserted', 0)} rows")
    except Exception as exc:
        print(f"Auto odds refresh skipped: {exc}")


if __name__ == "__main__":
    run()
