import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import davies_bouldin_score
from sklearn.preprocessing import StandardScaler, RobustScaler
from assets.models import Asset, Price
from ml.surge import calculate_surge_metrics
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats


def run_risk_pipeline():
    """
    Orchestrates the calculation of risk metrics:
    1. Sigma-52 (Annualized Volatility)
    2. Hidden Risk Clusters (KMeans)
    3. Cluster Map Coordinates (PCA)
    """
    print("Fetching price history...")

    # 1. Load Data
    qs = Price.objects.exclude(asset__assetType="ETF").values(
        "asset_id", "date", "adj_close"
    )
    df = pd.DataFrame.from_records(qs)

    if df.empty:
        return {"status": "error", "message": "No price data found."}

    # Pivot: Index = Date, Columns = Ticker (asset_id)
    prices_df = df.pivot(index="date", columns="asset_id", values="adj_close")
    prices_df.sort_index(inplace=True)

    # 2. Calculate Weekly Log Returns
    log_returns = np.log(prices_df / prices_df.shift(1))

    # Drop the first row (NaN from shift)
    log_returns = log_returns.dropna(how="all")

    updates = {}  # asset_id -> {field: value}

    # --- Metric A: Sigma-52 (1-Year Volatility) ---
    rolling_vol = log_returns.rolling(window=52).std() * np.sqrt(52)
    latest_vol = rolling_vol.iloc[-1]

    for asset_id, vol in latest_vol.items():
        if not np.isnan(vol):
            updates[asset_id] = {"sigma_52": vol}

    # --- Metric A.2: Volatility Surge ---
    # Calculate Z-scores using the rolling vol dataframe we just made
    surge_data = calculate_surge_metrics(rolling_vol)
    for asset_id, metrics in surge_data.items():
        updates[asset_id].update(metrics)

    # --- Metric B: Hidden Risk Clustering ---
    lookback_window = 156
    recent_returns = log_returns.tail(lookback_window)

    # 1. Threshold: Keep assets with at least 140 weeks of data
    min_weeks = 140
    cluster_data = recent_returns.dropna(axis=1, thresh=min_weeks)

    cluster_data = cluster_data.ffill().fillna(0)

    # Save the market mean return for detrending ETFs later (Market Beta)
    market_mean_returns = cluster_data.mean(axis=1)

    # Features Matrix: Rows = Assets, Columns = Weekly Returns
    X = cluster_data.T

    # --- De-trending (Relative Returns) ---
    # Subtract mean return of all assets for each week to remove "Market Beta"
    X_detrended = X.sub(X.mean(axis=0), axis=1)

    # Scale the de-trended data
    scaler = RobustScaler()
    X_scaled = pd.DataFrame(
        scaler.fit_transform(X_detrended), index=X.index, columns=X.columns
    )

    z_scores = np.abs(stats.zscore(X_scaled.std(axis=1)))
    X_normal = X_scaled[z_scores < 1]
    X_outliers = X_scaled[z_scores >= 1]

    n_clustered = 0

    # We train the model ONLY on "Normal" assets (low vol/z-score) to get stable clusters
    if X_normal.empty or len(X_normal) < 5:
        return {"status": "error", "message": "Not enough data for clustering."}

    # 1. Find the best K automatically
    best_k = 2
    best_score = -1
    max_k = 20

    for k_test in range(2, max_k + 1):
        test_kmeans = KMeans(n_clusters=k_test, random_state=42, n_init=10)
        test_labels = test_kmeans.fit_predict(X_normal)

        # Davies-Bouldin score: lower is better
        score = davies_bouldin_score(X_normal, test_labels)
        if score < best_score or best_score == -1:
            best_score = score
            best_k = k_test

    print(f"Optimal clusters found: {best_k} (Score: {best_score:.3f})")

    kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    kmeans.fit(X_normal)
    labels = kmeans.labels_

    # 2. PCA for 2D Map
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_normal)

    # Map back to asset IDs
    for i, asset_id in enumerate(X_normal.index):
        if asset_id not in updates:
            updates[asset_id] = {}

        updates[asset_id]["cluster_id"] = int(labels[i])
        updates[asset_id]["cluster_x"] = float(coords[i, 0])
        updates[asset_id]["cluster_y"] = float(coords[i, 1])

    n_clustered += len(X_normal)

    # --- Phase 2: Classify ETFs using the Stock Model ---
    print("Classifying ETFs...")
    etf_qs = Price.objects.filter(asset__assetType="ETF").values(
        "asset_id", "date", "adj_close"
    )
    etf_df_raw = pd.DataFrame.from_records(etf_qs)

    if not etf_df_raw.empty:
        # 1. Pivot and calculate returns exactly like stocks
        etf_prices = etf_df_raw.pivot(
            index="date", columns="asset_id", values="adj_close"
        ).sort_index()

        etf_returns = np.log(etf_prices / etf_prices.shift(1)).tail(lookback_window)

        # Align ETF columns (dates) to the Training Data (X)
        etf_aligned = etf_returns.reindex(cluster_data.index).ffill().fillna(0).T

        # Detrend ETFs using the MARKET MEAN from the stock universe
        # This puts ETFs in the same relative space as the stocks
        etf_detrended = etf_aligned.sub(market_mean_returns, axis=1)

        # 2. Project into existing space (Use transform, NOT fit)
        etf_scaled = scaler.transform(etf_detrended)
        etf_labels = kmeans.predict(etf_scaled)
        etf_coords = pca.transform(etf_scaled)

        # 3. Add to updates dictionary
        for i, asset_id in enumerate(etf_aligned.index):
            if asset_id not in updates:
                updates[asset_id] = {}
            updates[asset_id]["cluster_id"] = int(etf_labels[i])
            updates[asset_id]["cluster_x"] = float(etf_coords[i, 0])
            updates[asset_id]["cluster_y"] = float(etf_coords[i, 1])

    # --- Phase 3: Classify Outliers using the Stock Model ---
    if not X_outliers.empty:
        # Predict clusters for high-volatility assets using the model trained on normal assets
        outlier_labels = kmeans.predict(X_outliers)
        outlier_coords = pca.transform(X_outliers)

        # 4. Add to the same updates dictionary
        for i, asset_id in enumerate(X_outliers.index):
            if asset_id not in updates:
                updates[asset_id] = {}
            updates[asset_id]["cluster_id"] = int(outlier_labels[i])
            updates[asset_id]["cluster_x"] = float(outlier_coords[i, 0])
            updates[asset_id]["cluster_y"] = float(outlier_coords[i, 1])

        n_clustered += len(X_outliers)

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
            asset.volatility_z_score = fields.get("volatility_z_score")
            asset.volatility_median = fields.get("volatility_median")
            asset.is_volatility_surge = fields.get("is_volatility_surge", False)
            assets_to_update.append(asset)

    if assets_to_update:
        Asset.objects.bulk_update(
            assets_to_update,
            [
                "sigma_52",
                "cluster_id",
                "cluster_x",
                "cluster_y",
                "volatility_z_score",
                "volatility_median",
                "is_volatility_surge",
            ],
        )

    # 3. Create the debug plot (optional)
    plt.figure(figsize=(10, 7))
    # Plot the normal clusters
    sns.scatterplot(
        x=coords[:, 0],
        y=coords[:, 1],
        hue=labels,
        palette="viridis",
        s=100,
        alpha=0.7,
    )

    plt.title("Asset Risk Map (De-trended & Scaled)")
    plt.xlabel("PC1 (Primary Trend)")
    plt.ylabel("PC2 (Secondary Trend)")
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.savefig("risk_map.png", bbox_inches="tight")
    print("Plot saved as risk_map.png")

    return {
        "status": "success",
        "updated": len(assets_to_update),
        "clustered": n_clustered,
    }
