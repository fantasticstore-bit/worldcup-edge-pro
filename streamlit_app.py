from __future__ import annotations

from datetime import date

import streamlit as st


st.set_page_config(
    page_title="WorldCup Edge Pro",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded",
)


DEMO_PLAYS = [
    {
        "rank": 1,
        "grade": "A",
        "match_id": "DEMO-1",
        "match": "Brazil - Argentina",
        "time": "2026-06-18 21:00",
        "pick": "Brazil vincente",
        "action": "Giocabile",
        "tone": "good",
        "stake": 12.5,
        "min_odds": 2.18,
        "best_odds": 2.42,
        "bookmaker": "DemoBook",
        "ev": 0.118,
        "confidence": 0.72,
        "note": "Prezzo forte: sopra la quota minima.",
    },
    {
        "rank": 2,
        "grade": "B",
        "match_id": "DEMO-2",
        "match": "France - Senegal",
        "time": "2026-06-19 18:00",
        "pick": "Senegal vincente",
        "action": "NON GIOCARE",
        "tone": "bad",
        "stake": 0,
        "min_odds": 4.85,
        "best_odds": 4.20,
        "bookmaker": "DemoBook",
        "ev": 0.021,
        "confidence": 0.51,
        "note": "Quota sotto minimo: value perso.",
    },
    {
        "rank": 3,
        "grade": "B",
        "match_id": "DEMO-3",
        "match": "Morocco - Croatia",
        "time": "2026-06-20 20:00",
        "pick": "Morocco vincente",
        "action": "Solo piccola",
        "tone": "watch",
        "stake": 6.5,
        "min_odds": 3.35,
        "best_odds": 3.48,
        "bookmaker": "DemoBook",
        "ev": 0.064,
        "confidence": 0.58,
        "note": "Giocabile solo con stake ridotto.",
    },
]


BOOKS = [
    {"bookmaker": "DemoBook", "one": 2.42, "draw": 3.35, "two": 3.10},
    {"bookmaker": "NorthOdds", "one": 2.36, "draw": 3.45, "two": 3.00},
    {"bookmaker": "MarketPro", "one": 2.28, "draw": 3.30, "two": 3.20},
]


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def money(value: float) -> str:
    return f"{value:.2f} u"


def badge_style(tone: str) -> str:
    colors = {
        "good": ("#0b7a5b", "#eaf3ee"),
        "watch": ("#b26016", "#fff7ed"),
        "bad": ("#9a2f2f", "#f9eeee"),
    }
    fg, bg = colors.get(tone, ("#165a8f", "#eef5fb"))
    return f"color:{fg};background:{bg};border:1px solid {fg}33;border-radius:8px;padding:6px 9px;font-weight:800;"


def play_card(play: dict) -> None:
    with st.container(border=True):
        top = st.columns([0.25, 1, 0.45])
        top[0].markdown(f"### #{play['rank']}")
        top[1].markdown(f"**{play['match']}**  \n{play['time']}")
        top[2].markdown(f"<span style='{badge_style(play['tone'])}'>{play['action']}</span>", unsafe_allow_html=True)
        st.markdown(f"### {play['pick']}")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Stake", money(play["stake"]))
        c2.metric("Quota minima", f"{play['min_odds']:.2f}")
        c3.metric("Best price", f"{play['best_odds']:.2f}")
        c4.metric("EV", pct(play["ev"]))
        st.caption(f"{play['bookmaker']} · confidence {pct(play['confidence'])} · {play['note']}")


def daily_sheet() -> None:
    rows = [
        {
            "Match": item["match"],
            "Pick": item["pick"],
            "Action": item["action"],
            "Stake": money(item["stake"]),
            "Min odds": f"{item['min_odds']:.2f}",
            "Best": f"{item['best_odds']:.2f} {item['bookmaker']}",
            "Note": item["note"],
        }
        for item in DEMO_PLAYS
    ]
    st.dataframe(rows, use_container_width=True, hide_index=True)


def book_finder() -> None:
    st.write("Demo match: **Brazil - Argentina**")
    st.dataframe(BOOKS, use_container_width=True, hide_index=True)
    best = max(BOOKS, key=lambda row: row["one"])
    st.success(f"Best price on selected pick: {best['one']:.2f} at {best['bookmaker']}")


def waitlist() -> None:
    with st.form("waitlist"):
        st.subheader("Request beta access")
        name = st.text_input("Name")
        contact = st.text_input("Email or Telegram")
        use_case = st.selectbox("Use case", ["Private bettor", "Tipster / creator", "Community", "Affiliate / operator"])
        sent = st.form_submit_button("Save interest")
        if sent:
            if not name or not contact:
                st.warning("Add name and contact.")
            else:
                st.success("Interest captured for demo purposes. In production this will go to CRM/email.")
                st.session_state.setdefault("leads", []).append(
                    {"name": name, "contact": contact, "use_case": use_case, "created_at": str(date.today())}
                )


def main() -> None:
    st.sidebar.title("WorldCup Edge Pro")
    page = st.sidebar.radio(
        "View",
        ["Assistant", "Daily Sheet", "Book Finder", "Performance", "Beta Access"],
    )
    st.sidebar.divider()
    st.sidebar.caption("Analytics only. No guaranteed profit. No auto-betting.")

    st.title("WorldCup Edge Pro")
    st.caption("World Cup 2026 betting analytics desk · demo mode")

    if page == "Assistant":
        st.markdown("## Do not enter below minimum odds")
        st.write("This demo shows the core workflow: action, stake, minimum playable odds, and bookmaker check.")
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Bankroll", "1000.00 u")
        k2.metric("Open exposure", "20.00 u")
        k3.metric("Playable now", "1")
        k4.metric("Do not play", "1")
        for play in DEMO_PLAYS:
            play_card(play)

    elif page == "Daily Sheet":
        st.markdown("## Daily Betting Sheet")
        st.write("The sheet a beta user would open every matchday.")
        daily_sheet()
        st.info("Rule: if available odds are below minimum odds, skip the bet.")

    elif page == "Book Finder":
        st.markdown("## Book Finder")
        st.write("Compare demo prices by bookmaker. Real product filters by country and match.")
        book_finder()

    elif page == "Performance":
        st.markdown("## Performance Preview")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("ROI", "0.0%")
        c2.metric("Avg CLV", "+2.4%")
        c3.metric("Beat market", "62%")
        c4.metric("Risk", "OK")
        st.progress(0.62, text="Demo CLV quality")
        st.caption("Performance Lab becomes meaningful after real tracked bets.")

    elif page == "Beta Access":
        st.markdown("## Private beta")
        st.write("Beta price target: **79 EUR** for first 20 users.")
        waitlist()

    st.divider()
    st.caption(
        "WorldCup Edge Pro is analytics-only. It does not guarantee profit, place bets, or handle bookmaker accounts. "
        "Users must follow local law and responsible gambling rules."
    )


if __name__ == "__main__":
    main()
