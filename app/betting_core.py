from __future__ import annotations

import math
import re
import sqlite3
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from statistics import median


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "worldcup_model.sqlite"

DEFAULT_CONTROLS = {
    "base_draw_probability": 0.27,
    "min_ev": 0.08,
    "min_edge": 0.025,
    "max_overround": 0.08,
    "max_decimal_odds": 8.0,
    "kelly_fraction": 0.20,
    "kelly_cap": 0.02,
    "strength_exponent": 3.0,
    "market_respect": 0.85,
    "odds_mode": 0.0,
    "bankroll_start": 1000.0,
    "unit_size": 10.0,
    "max_stake": 30.0,
    "stake_mode": 1.0,
    "max_exposure_pct": 0.08,
}

MODEL_PROFILES = {
    "conservative": {
        "base_draw_probability": 0.27,
        "min_ev": 0.08,
        "min_edge": 0.025,
        "max_overround": 0.08,
        "max_decimal_odds": 8.0,
        "kelly_fraction": 0.20,
        "kelly_cap": 0.02,
        "strength_exponent": 3.0,
        "market_respect": 0.85,
        "odds_mode": 0.0,
        "bankroll_start": 1000.0,
        "unit_size": 10.0,
        "max_stake": 25.0,
        "stake_mode": 1.0,
        "max_exposure_pct": 0.06,
    },
    "balanced": {
        "base_draw_probability": 0.27,
        "min_ev": 0.06,
        "min_edge": 0.018,
        "max_overround": 0.10,
        "max_decimal_odds": 10.0,
        "kelly_fraction": 0.25,
        "kelly_cap": 0.03,
        "strength_exponent": 2.6,
        "market_respect": 0.75,
        "odds_mode": 0.0,
        "bankroll_start": 1000.0,
        "unit_size": 10.0,
        "max_stake": 30.0,
        "stake_mode": 1.0,
        "max_exposure_pct": 0.08,
    },
    "aggressive": {
        "base_draw_probability": 0.26,
        "min_ev": 0.035,
        "min_edge": 0.010,
        "max_overround": 0.12,
        "max_decimal_odds": 14.0,
        "kelly_fraction": 0.35,
        "kelly_cap": 0.04,
        "strength_exponent": 2.2,
        "market_respect": 0.60,
        "odds_mode": 1.0,
        "bankroll_start": 1000.0,
        "unit_size": 10.0,
        "max_stake": 40.0,
        "stake_mode": 1.0,
        "max_exposure_pct": 0.12,
    },
}

DEFAULT_PLAYABLE_BOOKMAKERS = {
    "888sport",
    "Betclic (FR)",
    "Betfair",
    "Betsson",
    "Codere (IT)",
    "Coolbet",
    "LeoVegas (SE)",
    "Marathon Bet",
    "Nordic Bet",
    "Pinnacle",
    "PMU (FR)",
    "Tipico",
    "Unibet (FR)",
    "Unibet (NL)",
    "Unibet (SE)",
    "William Hill",
    "Winamax (DE)",
    "Winamax (FR)",
}

ALIASES = {
    "usa": "United States",
    "u s a": "United States",
    "us": "United States",
    "united states": "United States",
    "bosnia herzegovina": "Bosnia and Herzegovina",
    "bosnia and herzegovina": "Bosnia and Herzegovina",
    "bosnia & herzegovina": "Bosnia and Herzegovina",
    "curacao": "Curacao",
    "curacao": "Curacao",
    "cote divoire": "Ivory Coast",
    "cote d ivoire": "Ivory Coast",
    "ivory coast": "Ivory Coast",
    "cabo verde": "Cape Verde",
    "cape verde": "Cape Verde",
    "south korea": "South Korea",
    "korea republic": "South Korea",
}


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def normalize_name(name: str | None) -> str:
    if not name:
        return ""
    text = unicodedata.normalize("NFKD", str(name)).encode("ascii", "ignore").decode("ascii")
    text = text.lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text).strip()
    return ALIASES.get(text, " ".join(part.capitalize() for part in text.split()))


def match_key(home: str, away: str) -> str:
    return f"{normalize_name(home).lower()}|{normalize_name(away).lower()}"


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS controls (
            key TEXT PRIMARY KEY,
            value REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS teams (
            team TEXT PRIMARY KEY,
            normalized_team TEXT NOT NULL UNIQUE,
            group_name TEXT,
            fifa_rank REAL,
            fifa_points REAL,
            strength REAL NOT NULL,
            tier TEXT
        );

        CREATE TABLE IF NOT EXISTS matches (
            match_id TEXT PRIMARY KEY,
            group_name TEXT,
            match_date TEXT,
            utc_time TEXT,
            home_team TEXT NOT NULL,
            away_team TEXT NOT NULL,
            venue TEXT,
            stage TEXT,
            match_key TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS odds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_key TEXT NOT NULL,
            bookmaker TEXT,
            source TEXT,
            home_odds REAL,
            draw_odds REAL,
            away_odds REAL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            notes TEXT
        );

        CREATE TABLE IF NOT EXISTS bets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            match_id TEXT,
            selection TEXT,
            odds REAL,
            stake REAL,
            model_probability REAL,
            ev REAL,
            kelly REAL,
            status TEXT DEFAULT 'planned',
            result_profit REAL DEFAULT 0,
            notes TEXT
        );

        CREATE TABLE IF NOT EXISTS bookmaker_prefs (
            bookmaker TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 1
        );
        """
    )
    for key, value in DEFAULT_CONTROLS.items():
        conn.execute("INSERT OR IGNORE INTO controls(key, value) VALUES(?, ?)", (key, value))
    conn.commit()


def get_controls(conn: sqlite3.Connection) -> dict[str, float]:
    init_db(conn)
    rows = conn.execute("SELECT key, value FROM controls").fetchall()
    values = dict(DEFAULT_CONTROLS)
    values.update({row["key"]: float(row["value"]) for row in rows})
    return values


def odds_mode_name(value: float | int | None) -> str:
    return "best" if float(value or 0) >= 0.5 else "median"


def active_bookmakers(conn: sqlite3.Connection) -> set[str] | None:
    init_db(conn)
    prefs_count = conn.execute("SELECT COUNT(*) AS count FROM bookmaker_prefs").fetchone()["count"]
    rows = conn.execute("SELECT bookmaker FROM bookmaker_prefs WHERE enabled = 1").fetchall()
    if prefs_count == 0:
        return None
    return {row["bookmaker"] for row in rows}


def apply_profile(conn: sqlite3.Connection, profile: str) -> dict[str, float]:
    values = MODEL_PROFILES.get(profile)
    if not values:
        raise ValueError(f"Unknown profile: {profile}")
    for key, value in values.items():
        conn.execute("INSERT OR REPLACE INTO controls(key, value) VALUES(?, ?)", (key, value))
    conn.commit()
    return get_controls(conn)


@dataclass
class Outcome:
    code: str
    label: str
    odds: float
    bookmaker: str | None
    best_odds: float
    best_bookmaker: str | None
    median_odds: float
    model_prob: float
    market_prob: float
    fair_odds: float
    ev: float
    edge: float
    kelly: float


def no_vig_probs(home_odds: float, draw_odds: float, away_odds: float) -> tuple[float, float, float, float]:
    raw = [1 / home_odds, 1 / draw_odds, 1 / away_odds]
    total = sum(raw)
    return raw[0] / total, raw[1] / total, raw[2] / total, total - 1


def kelly_fraction(prob: float, odds: float, fraction: float, cap: float) -> float:
    if odds <= 1:
        return 0.0
    full = ((odds - 1) * prob - (1 - prob)) / (odds - 1)
    return max(0.0, min(cap, full * fraction))


def suggested_stake(kelly: float | None, confidence: float | None, controls: dict[str, float]) -> tuple[float, float, str]:
    bankroll = max(float(controls.get("bankroll_start", 0) or 0), 0.0)
    unit = max(float(controls.get("unit_size", 1) or 1), 0.1)
    cap = max(float(controls.get("max_stake", unit) or unit), 0.0)
    mode = "Kelly" if float(controls.get("stake_mode", 1) or 0) >= 0.5 else "Flat"
    if mode == "Flat":
        multiplier = 1.0 if (confidence or 0) >= 0.25 else 0.5
        stake = unit * multiplier
    else:
        stake = bankroll * max(float(kelly or 0), 0.0)
        if stake > 0:
            stake = max(stake, unit * 0.25)
    stake = min(stake, cap)
    rounded = round(stake * 2) / 2
    if rounded <= 0:
        return 0.0, 0.0, mode
    return round(rounded, 2), round(rounded / unit, 2), mode


def model_probabilities(
    home_strength: float, away_strength: float, draw_prob: float, strength_exponent: float = 3.0
) -> tuple[float, float, float]:
    home_power = max(home_strength, 1) ** strength_exponent
    away_power = max(away_strength, 1) ** strength_exponent
    total = max(home_power + away_power, 0.0001)
    home_share = home_power / total
    away_share = away_power / total
    home_prob = (1 - draw_prob) * home_share
    away_prob = (1 - draw_prob) * away_share
    return home_prob, draw_prob, away_prob


def rate_tier(rank: float | None) -> str:
    if rank is None:
        return "Unknown"
    if rank <= 12:
        return "Elite"
    if rank <= 24:
        return "Strong"
    if rank <= 40:
        return "Solid"
    if rank <= 60:
        return "Live Dog"
    return "Longshot"


def get_market_odds(
    conn: sqlite3.Connection,
    key: str,
    mode: str = "median",
    allowed_bookmakers: set[str] | None = None,
) -> dict | None:
    rows = conn.execute(
        """
        SELECT home_odds, draw_odds, away_odds, bookmaker, source, updated_at
        FROM odds
        WHERE match_key = ?
          AND home_odds > 1
          AND draw_odds > 1
          AND away_odds > 1
        ORDER BY updated_at DESC, id DESC
        """,
        (key,),
    ).fetchall()
    if allowed_bookmakers is not None:
        rows = [row for row in rows if row["bookmaker"] in allowed_bookmakers]
    if not rows:
        return None
    best = {}
    medians = {}
    for column in ("home_odds", "draw_odds", "away_odds"):
        values = [(float(row[column]), row["bookmaker"]) for row in rows]
        best[column] = max(values, key=lambda item: item[0])
        medians[column] = median(value for value, _bookmaker in values)
    if mode == "best":
        home_odds, home_bookmaker = best["home_odds"]
        draw_odds, draw_bookmaker = best["draw_odds"]
        away_odds, away_bookmaker = best["away_odds"]
    else:
        home_odds = medians["home_odds"]
        draw_odds = medians["draw_odds"]
        away_odds = medians["away_odds"]
        home_bookmaker = draw_bookmaker = away_bookmaker = "Market median"
    return {
        "home_odds": home_odds,
        "draw_odds": draw_odds,
        "away_odds": away_odds,
        "home_bookmaker": home_bookmaker,
        "draw_bookmaker": draw_bookmaker,
        "away_bookmaker": away_bookmaker,
        "home_best_odds": best["home_odds"][0],
        "draw_best_odds": best["draw_odds"][0],
        "away_best_odds": best["away_odds"][0],
        "home_best_bookmaker": best["home_odds"][1],
        "draw_best_bookmaker": best["draw_odds"][1],
        "away_best_bookmaker": best["away_odds"][1],
        "home_median_odds": medians["home_odds"],
        "draw_median_odds": medians["draw_odds"],
        "away_median_odds": medians["away_odds"],
        "rows_loaded": len(rows),
        "updated_at": rows[0]["updated_at"],
        "source": rows[0]["source"],
        "mode": mode,
    }


def evaluate_match(conn: sqlite3.Connection, match: sqlite3.Row) -> dict:
    controls = get_controls(conn)
    home = conn.execute(
        "SELECT * FROM teams WHERE normalized_team = ?", (normalize_name(match["home_team"]),)
    ).fetchone()
    away = conn.execute(
        "SELECT * FROM teams WHERE normalized_team = ?", (normalize_name(match["away_team"]),)
    ).fetchone()
    home_strength = float(home["strength"]) if home else 75.0
    away_strength = float(away["strength"]) if away else 75.0
    probs = model_probabilities(
        home_strength,
        away_strength,
        controls["base_draw_probability"],
        controls.get("strength_exponent", 3.0),
    )
    odds_mode = odds_mode_name(controls.get("odds_mode", 0.0))
    allowed_bookmakers = active_bookmakers(conn)
    odds = get_market_odds(conn, match["match_key"], odds_mode, allowed_bookmakers)
    response = {
        "match_id": match["match_id"],
        "group": match["group_name"],
        "date": match["match_date"],
        "time": match["utc_time"],
        "home_team": match["home_team"],
        "away_team": match["away_team"],
        "venue": match["venue"],
        "home_strength": round(home_strength, 2),
        "away_strength": round(away_strength, 2),
        "home_prob": probs[0],
        "draw_prob": probs[1],
        "away_prob": probs[2],
        "recommendation": "ADD ODDS",
        "reason": "Quote mancanti o incomplete",
        "best_edge": None,
        "best_ev": None,
        "kelly": None,
        "overround": None,
        "odds_rows": int(odds["rows_loaded"]) if odds else 0,
        "odds_mode": odds_mode,
        "odds_updated_at": odds["updated_at"] if odds else None,
        "odds_source": odds["source"] if odds else None,
        "bookmaker_filter_active": allowed_bookmakers is not None,
        "confidence": 0.0,
        "explanation": [],
        "outcomes": [],
    }
    if not odds or not all(odds[name] and odds[name] > 1 for name in ("home_odds", "draw_odds", "away_odds")):
        return response

    home_odds, draw_odds, away_odds = float(odds["home_odds"]), float(odds["draw_odds"]), float(odds["away_odds"])
    market_probs = no_vig_probs(home_odds, draw_odds, away_odds)
    labels = [f"{match['home_team']} vincente", "Pareggio", f"{match['away_team']} vincente"]
    market_respect = min(0.95, max(0.0, controls.get("market_respect", 0.35)))
    adjusted_probs = [
        (probs[idx] * (1 - market_respect)) + (market_probs[idx] * market_respect)
        for idx in range(3)
    ]
    values = [
        (
            "HOME",
            home_odds,
            odds["home_bookmaker"],
            odds["home_best_odds"],
            odds["home_best_bookmaker"],
            odds["home_median_odds"],
            adjusted_probs[0],
            market_probs[0],
        ),
        (
            "DRAW",
            draw_odds,
            odds["draw_bookmaker"],
            odds["draw_best_odds"],
            odds["draw_best_bookmaker"],
            odds["draw_median_odds"],
            adjusted_probs[1],
            market_probs[1],
        ),
        (
            "AWAY",
            away_odds,
            odds["away_bookmaker"],
            odds["away_best_odds"],
            odds["away_best_bookmaker"],
            odds["away_median_odds"],
            adjusted_probs[2],
            market_probs[2],
        ),
    ]
    outcomes: list[Outcome] = []
    for idx, (code, decimal_odds, bookmaker, best_odds, best_bookmaker, median_odds, model_prob, market_prob) in enumerate(values):
        ev = decimal_odds * model_prob - 1
        edge = model_prob - market_prob
        fair_odds = 1 / model_prob if model_prob else math.inf
        outcomes.append(
            Outcome(
                code=code,
                label=labels[idx],
                odds=decimal_odds,
                bookmaker=bookmaker,
                best_odds=best_odds,
                best_bookmaker=best_bookmaker,
                median_odds=median_odds,
                model_prob=model_prob,
                market_prob=market_prob,
                fair_odds=fair_odds,
                ev=ev,
                edge=edge,
                kelly=kelly_fraction(model_prob, decimal_odds, controls["kelly_fraction"], controls["kelly_cap"]),
            )
        )
    best = max(outcomes, key=lambda item: item.ev)
    overround = market_probs[3]
    response["overround"] = overround
    response["outcomes"] = [outcome.__dict__ for outcome in outcomes]
    response["best_edge"] = best.edge
    response["best_ev"] = best.ev
    response["kelly"] = best.kelly
    response["pick_bookmaker"] = best.bookmaker
    response["pick_odds"] = best.odds
    response["pick_best_bookmaker"] = best.best_bookmaker
    response["pick_best_odds"] = best.best_odds
    response["pick_median_odds"] = best.median_odds
    response["confidence"] = signal_confidence(best.ev, best.edge, overround, best.odds, controls)
    response.update(price_alert(best.best_odds, best.median_odds, response["confidence"], best.odds))
    stake, units, stake_mode = suggested_stake(best.kelly, response["confidence"], controls)
    response["suggested_stake"] = stake
    response["suggested_units"] = units
    response["stake_mode"] = stake_mode

    if overround > controls["max_overround"]:
        response["recommendation"] = "SKIP"
        response["reason"] = "Margine bookmaker troppo alto"
    elif best.odds > controls["max_decimal_odds"]:
        response["recommendation"] = "SKIP"
        response["reason"] = "Quota troppo estrema"
    elif best.ev < controls["min_ev"] or best.edge < controls.get("min_edge", 0.025):
        response["recommendation"] = "SKIP"
        response["reason"] = "EV o edge sotto soglia"
    else:
        response["recommendation"] = best.label
        response["reason"] = "Value rilevato dal modello"
    response["explanation"] = build_explanation(best, overround, controls, response["reason"])
    return response


def price_alert(best_odds: float | None, median_odds: float | None, confidence: float | None, pick_odds: float | None) -> dict:
    if not best_odds or not median_odds:
        return {"price_gap": 0.0, "price_alert": "NO PRICE", "price_note": "Quote insufficienti."}
    gap = (float(best_odds) - float(median_odds)) / max(float(median_odds), 0.01)
    confidence_value = float(confidence or 0)
    odds = float(pick_odds or best_odds)
    if confidence_value < 0.25:
        alert = "WATCH"
        note = "Segnale ancora fragile: aspetta conferma o stake minimo."
    elif odds >= 8.0:
        alert = "SMALL ONLY"
        note = "Prezzo alto: giocabile solo con stake ridotto."
    elif gap >= 0.04:
        alert = "BEST PRICE"
        note = "La migliore quota batte bene la mediana."
    elif gap >= 0.015:
        alert = "GOOD PRICE"
        note = "Prezzo leggermente sopra mercato."
    else:
        alert = "FAIR PRICE"
        note = "Prezzo vicino alla mediana: non inseguire se scende."
    return {"price_gap": round(gap, 4), "price_alert": alert, "price_note": note}


def signal_confidence(ev: float, edge: float, overround: float, odds: float, controls: dict[str, float]) -> float:
    ev_room = max(0.0, min(1.0, (ev - controls["min_ev"]) / 0.20))
    edge_room = max(0.0, min(1.0, (edge - controls.get("min_edge", 0.025)) / 0.05))
    margin_penalty = max(0.0, min(1.0, overround / max(controls["max_overround"], 0.001)))
    odds_penalty = max(0.0, min(1.0, (odds - 6) / 8))
    score = (0.46 * ev_room) + (0.38 * edge_room) + (0.16 * (1 - margin_penalty)) - (0.10 * odds_penalty)
    return round(max(0.0, min(1.0, score)), 3)


def build_explanation(best: Outcome, overround: float, controls: dict[str, float], reason: str) -> list[str]:
    return [
        reason,
        f"EV {best.ev * 100:.1f}% vs soglia {controls['min_ev'] * 100:.1f}%",
        f"Edge {best.edge * 100:.1f}% vs soglia {controls.get('min_edge', 0.025) * 100:.1f}%",
        f"Fair odds {best.fair_odds:.2f} contro quota mercato {best.odds:.2f}",
        f"Best available {best.best_odds:.2f} su {best.best_bookmaker}",
        f"Overround {overround * 100:.1f}% con limite {controls['max_overround'] * 100:.1f}%",
    ]


def pro_score(row: dict) -> float:
    if row["recommendation"] in ("SKIP", "ADD ODDS"):
        return 0.0
    ev = max(float(row.get("best_ev") or 0), 0)
    edge = max(float(row.get("best_edge") or 0), 0)
    confidence = max(float(row.get("confidence") or 0), 0)
    kelly = max(float(row.get("kelly") or 0), 0)
    odds = float(row.get("pick_best_odds") or row.get("pick_odds") or 0)
    odds_penalty = max(0.0, min(0.30, (odds - 6.5) / 20)) if odds else 0
    score = (confidence * 48) + (min(ev, 0.35) * 80) + (min(edge, 0.08) * 170) + (min(kelly, 0.03) * 320)
    return round(max(0.0, score - (odds_penalty * 100)), 1)


def top_plays(conn: sqlite3.Connection, limit: int = 10) -> list[dict]:
    rows = [
        row for row in evaluated_matches(conn)
        if row["recommendation"] not in ("SKIP", "ADD ODDS")
    ]
    for row in rows:
        row["pro_score"] = pro_score(row)
        row["play_grade"] = play_grade(row["pro_score"], row.get("confidence") or 0)
        row["risk_note"] = risk_note(row)
    return sorted(rows, key=lambda row: (row["pro_score"], row.get("best_ev") or 0), reverse=True)[:limit]


def play_grade(score: float, confidence: float) -> str:
    if score >= 65 and confidence >= 0.55:
        return "A"
    if score >= 48:
        return "B"
    if score >= 32:
        return "C"
    return "Watch"


def risk_note(row: dict) -> str:
    odds = float(row.get("pick_best_odds") or row.get("pick_odds") or 0)
    confidence = float(row.get("confidence") or 0)
    kelly = float(row.get("kelly") or 0)
    if odds >= 8:
        return "Quota alta: stake piccolo anche se il valore è buono."
    if confidence < 0.25:
        return "Edge fragile: meglio aspettare conferma mercato."
    if kelly < 0.007:
        return "Kelly basso: esposizione minima."
    return "Profilo pulito per shortlist."


def evaluated_matches(conn: sqlite3.Connection) -> list[dict]:
    init_db(conn)
    matches = conn.execute("SELECT * FROM matches ORDER BY match_date, utc_time, match_id").fetchall()
    return [evaluate_match(conn, match) for match in matches]


def summary(conn: sqlite3.Connection) -> dict:
    rows = evaluated_matches(conn)
    recs = [row for row in rows if row["recommendation"] not in ("SKIP", "ADD ODDS")]
    add_odds = sum(1 for row in rows if row["recommendation"] == "ADD ODDS")
    skip = sum(1 for row in rows if row["recommendation"] == "SKIP")
    best = top_plays(conn, 5)
    bets = conn.execute(
        """
        SELECT
            COUNT(*) AS count,
            COALESCE(SUM(stake), 0) AS stake,
            COALESCE(SUM(CASE WHEN status IN ('planned', 'open') THEN stake ELSE 0 END), 0) AS exposure,
            COALESCE(SUM(CASE WHEN status IN ('won', 'lost', 'push', 'void') THEN stake ELSE 0 END), 0) AS settled_stake,
            COALESCE(SUM(result_profit), 0) AS profit,
            SUM(CASE WHEN status IN ('planned', 'open') THEN 1 ELSE 0 END) AS open_count,
            SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) AS won_count,
            SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) AS lost_count
        FROM bets
        """
    ).fetchone()
    controls = get_controls(conn)
    settled = int(bets["won_count"] or 0) + int(bets["lost_count"] or 0)
    tracked_profit = float(bets["profit"])
    settled_stake = float(bets["settled_stake"])
    bankroll_current = float(controls.get("bankroll_start", 0)) + tracked_profit
    open_exposure = float(bets["exposure"])
    max_exposure = bankroll_current * float(controls.get("max_exposure_pct", 0.08))
    exposure_ratio = open_exposure / bankroll_current if bankroll_current else 0.0
    return {
        "matches": len(rows),
        "value_spots": len(recs),
        "missing_odds": add_odds,
        "skips": skip,
        "best": best,
        "bets_count": int(bets["count"]),
        "tracked_stake": float(bets["stake"]),
        "tracked_profit": tracked_profit,
        "open_exposure": open_exposure,
        "max_exposure": max_exposure,
        "exposure_ratio": exposure_ratio,
        "risk_status": "LIMIT" if open_exposure > max_exposure else "OK",
        "open_bets": int(bets["open_count"] or 0),
        "settled_stake": settled_stake,
        "roi": tracked_profit / settled_stake if settled_stake else 0.0,
        "settled_bets": settled,
        "won_bets": int(bets["won_count"] or 0),
        "lost_bets": int(bets["lost_count"] or 0),
        "strike_rate": (int(bets["won_count"] or 0) / settled) if settled else 0.0,
        "bankroll_current": bankroll_current,
        "controls": controls,
    }
