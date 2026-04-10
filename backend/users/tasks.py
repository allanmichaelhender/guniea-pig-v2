import logging
import time
from datetime import date
from django.core.management import call_command

logger = logging.getLogger(__name__)


def sync_weekly_data():
    """
    Task to be run weekly.
    1. Fetches prices for all active assets since their last sync.
    2. Triggers the Risk/Clustering pipeline.
    """
    today = date.today()
    logger.info(f"Starting automated weekly ingestion pipeline: {today}")

    try:
        # 1. Load Tiingo Tickers
        logger.info("Step 1: Loading Tiingo tickers...")
        call_command("load_tiingo_tickers", "data/supported_tickers.csv")

        # 2. First pass: Load Historical Prices
        logger.info("Step 2: Initial price loading pass...")
        call_command("load_historical_prices", "data/initial_tickers.csv")

        # 3. Wait for rate limits
        logger.info("Step 3: Sleeping for 61 minutes...")
        time.sleep(3660)

        # 4. Second pass: Load Historical Prices
        logger.info("Step 4: Second price loading pass...")
        call_command("load_historical_prices", "data/initial_tickers.csv")

        # 5. Generate Embeddings
        logger.info("Step 5: Generating asset embeddings...")
        call_command("generate_embeddings")

        # 6. Enrich Assets
        logger.info("Step 6: Enriching asset metadata...")
        call_command("enrich_assets")

        # 7. Calculate Risk Metrics
        logger.info("Step 7: Calculating risk metrics and clusters...")
        call_command("calculate_risk_metrics")

    except Exception as e:
        logger.error(f"Pipeline failed at {today}: {str(e)}")
        return {"status": "error", "message": str(e)}

    return {"status": "completed", "sync_date": today.isoformat()}
