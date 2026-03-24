import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from assets.models import Asset, Price


def run_risk_pipeline():
    """
    Orchestrates the calculation of risk metrics:
    1. Sigma-52 (Annualized Volatility)
    2. Hidden Risk Clusters (KMeans)
    3. Cluster Map Coordinates (PCA)
    """
    print("Fetching price history...")

    # 1. Load Data
    qs = Price.objects.all().values("asset_id", "date", "adj_close")
    df = pd.DataFrame.from_records(qs)

    if df.empty:
        return {"status": "error", "message": "No price data found."}

    # Pivot: Index = Date, Columns = Ticker (asset_id)
    prices_df = df.pivot(index="date", columns="asset_id", values="adj_close")
    prices_df.sort_index(inplace=True)

    # 2. Calculate Weekly Log Returns
    # ln(P_t / P_{t-1})
    log_returns = np.log(prices_df / prices_df.shift(1))

    # Drop the first row (NaN from shift)
    log_returns = log_returns.dropna(how="all")

    updates = {}  # asset_id -> {field: value}

    # --- Metric A: Sigma-52 (1-Year Volatility) ---
    # Window = 52 weeks. Rolling std dev * sqrt(52).
    rolling_vol = log_returns.rolling(window=52).std() * np.sqrt(52)
    latest_vol = rolling_vol.iloc[-1]

    for asset_id, vol in latest_vol.items():
        if not np.isnan(vol):
            updates[asset_id] = {"sigma_52": vol}

    # --- Metric B: Hidden Risk Clustering (KMeans + PCA) ---
    # Window = 3 years (~156 weeks)
    lookback_window = 156
    recent_returns = log_returns.tail(lookback_window)

    # Filter: Ensure assets have full data for the window to cluster cleanly
    # Assets with missing history in the last 3 years are excluded from the map/clustering
    cluster_data = recent_returns.dropna(axis=1, how="any")

    # Features Matrix: Rows = Assets, Columns = Weekly Returns
    X = cluster_data.T

    n_clustered = 0
    k = 0

    if not X.empty and len(X) > 5:
        # 1. Find the best K automatically
        best_k = 2
        best_score = -1
        max_k = min(20, len(X) - 1)  # Don't try more clusters than you have assets

        for k_test in range(2, max_k + 1):
            test_kmeans = KMeans(n_clusters=k_test, random_state=42, n_init=10)
            test_labels = test_kmeans.fit_predict(X)
            
            # Silhouette score: higher is better (-1 to 1)
            score = silhouette_score(X, test_labels)
            
            if score > best_score:
                best_score = score
                best_k = k_test


        print(f"Optimal clusters found: {best_k} (Score: {best_score:.3f})")
        
        kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
        kmeans.fit(X)
        labels = kmeans.labels_

        # 2. PCA for 2D Map
        # Project the high-dimensional return history into 2D coordinates
        pca = PCA(n_components=2, random_state=42)
        coords = pca.fit_transform(X)

        # Map back to asset IDs
        for i, asset_id in enumerate(X.index):
            if asset_id not in updates:
                updates[asset_id] = {}

            updates[asset_id]["cluster_id"] = int(labels[i])
            updates[asset_id]["cluster_x"] = float(coords[i, 0])
            updates[asset_id]["cluster_y"] = float(coords[i, 1])

        n_clustered = len(X)

    # 3. Save to DB
    print("Saving results to database...")
    assets_to_update = []
    asset_objs = Asset.objects.in_bulk(updates.keys())

    for asset_id, fields in updates.items():
        asset = asset_objs.get(asset_id)
        if asset:
            asset.sigma_52 = fields.get("sigma_52")
            asset.cluster_id = fields.get("cluster_id")
            asset.cluster_x = fields.get("cluster_x")
            asset.cluster_y = fields.get("cluster_y")
            assets_to_update.append(asset)

    if assets_to_update:
        Asset.objects.bulk_update(
            assets_to_update, ["sigma_52", "cluster_id", "cluster_x", "cluster_y"]
        )

    return {
        "status": "success",
        "updated": len(assets_to_update),
        "clustered": n_clustered,
    }
