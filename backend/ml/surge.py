import pandas as pd
import numpy as np


def calculate_surge_metrics(rolling_vol_df: pd.DataFrame, lookback_weeks: int = 156):
    """
    Calculates volatility surge metrics for each asset.

    Args:
        rolling_vol_df: DataFrame of rolling 52-week volatility (Index=Date, Cols=Assets)
        lookback_weeks: How far back to establish the "baseline" (default 3 years)

    Returns:
        dict: {asset_id: {volatility_z_score, volatility_median, is_volatility_surge}}
    """
    surge_updates = {}

    # We only care about the distribution over the lookback window
    # We include the current week in the window for simplicity, or strictly use prior window
    # Standard practice: compare Current to History.
    history_df = rolling_vol_df.tail(lookback_weeks)

    # Calculate stats over the time axis (axis=0)
    # Median = The "Normal" volatility level
    medians = history_df.median()

    # Std Dev of the volatility itself (Vol of Vol)
    stds = history_df.std()

    # Current volatility (latest date)
    latest = rolling_vol_df.iloc[-1]

    for asset_id in rolling_vol_df.columns:
        current_vol = latest.get(asset_id)
        median_vol = medians.get(asset_id)
        std_vol = stds.get(asset_id)

        if (
            pd.isna(current_vol)
            or pd.isna(median_vol)
            or pd.isna(std_vol)
            or std_vol == 0
        ):
            continue

        # Z-Score = (Current - Median) / StdDev
        # We use Median as the center because it's more robust to previous spikes than Mean
        z_score = (current_vol - median_vol) / std_vol

        # Threshold: > 2.0 sigmas is a surge (approx top 2.5% events if normal)
        is_surge = z_score > 2.0

        surge_updates[asset_id] = {
            "volatility_z_score": round(z_score, 2),
            "volatility_median": round(median_vol, 4),
            "is_volatility_surge": is_surge,
        }

    return surge_updates
