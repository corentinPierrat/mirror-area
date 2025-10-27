from typing import Optional

MIN_INTERVAL_MINUTES = 1


def to_positive_number(value) -> Optional[float]:
    if value in (None, "", [], {}):
        return None
    if isinstance(value, (int, float)):
        number = float(value)
    else:
        try:
            number = float(str(value).strip())
        except (TypeError, ValueError):
            return None
    return number if number > 0 else None


def parse_interval_minutes(params: dict) -> Optional[int]:
    for key in ("interval_minutes", "minutes", "mins", "interval"):
        minutes = to_positive_number(params.get(key))
        if minutes:
            return max(MIN_INTERVAL_MINUTES, int(minutes))

    textual = params.get("every")
    minutes = to_positive_number(textual)
    if minutes:
        return max(MIN_INTERVAL_MINUTES, int(minutes))

    return None
