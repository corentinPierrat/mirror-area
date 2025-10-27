import logging
from typing import Any, Dict, Iterable, List, Optional, Tuple

logger = logging.getLogger(__name__)

FACEIT_EVENT_MATCH_FINISHED = "match_status_finished"
FACEIT_TRIGGER_EVENT = "match_finished"

def normalise_score_value(value: Any) -> Optional[int]:
    if isinstance(value, dict):
        for candidate_key in ("score", "value", "points"):
            if candidate_key in value:
                return normalise_score_value(value[candidate_key])
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.lstrip("-").isdigit():
            return int(stripped)
    return None


def extract_scores(results_payload: Dict[str, Any]) -> Dict[str, Tuple[Optional[int], Optional[int]]]:
    scores_raw = results_payload.get("score") if isinstance(results_payload, dict) else None
    if not isinstance(scores_raw, dict):
        return {}

    faction_scores: Dict[str, Optional[int]] = {}
    for faction_id, score_value in scores_raw.items():
        faction_scores[str(faction_id)] = normalise_score_value(score_value)

    factions = list(faction_scores.keys())
    if len(factions) != 2:
        return {faction: (score, None) for faction, score in faction_scores.items()}

    faction_a, faction_b = factions
    score_a = faction_scores.get(faction_a)
    score_b = faction_scores.get(faction_b)
    return {
        faction_a: (score_a, score_b),
        faction_b: (score_b, score_a),
    }


def parse_faceit_webhook(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    event_type = data.get("event") or data.get("type")
    if event_type != FACEIT_EVENT_MATCH_FINISHED:
        logger.debug("Ignoring FACEIT event %s", event_type)
        return []

    payload = data.get("payload") or {}
    results_payload = payload.get("results") if isinstance(payload, dict) else {}
    scores_map = extract_scores(results_payload if isinstance(results_payload, dict) else {})

    winning_faction = None
    if isinstance(results_payload, dict):
        winner_raw = results_payload.get("winner")
        if isinstance(winner_raw, dict):
            winning_faction = winner_raw.get("faction_id") or winner_raw.get("team_id")
        else:
            winning_faction = winner_raw
    winning_faction = str(winning_faction) if winning_faction is not None else None

    teams_payload: Iterable[Dict[str, Any]] = payload.get("teams") if isinstance(payload, dict) else []
    if not isinstance(teams_payload, list):
        teams_payload = []

    player_events: List[Dict[str, Any]] = []
    for team in teams_payload:
        faction_id = str(team.get("faction_id") or team.get("faction") or team.get("team_id") or "")
        players_payload = team.get("players") or []
        if not isinstance(players_payload, list):
            continue

        score_pair = scores_map.get(faction_id, (None, None))
        team_score, opponent_score = score_pair
        is_winner = winning_faction is not None and faction_id and faction_id.lower() == winning_faction.lower()

        for player in players_payload:
            player_id = player.get("player_id") or player.get("id")
            if not player_id:
                continue

            player_events.append({
                "event": FACEIT_TRIGGER_EVENT,
                "player_id": player_id,
                "team_score": team_score,
                "opponent_score": opponent_score,
                "is_winner": is_winner,
                "player_stats": player.get("player_stats") or player.get("stats") or {},
            })

    return player_events
