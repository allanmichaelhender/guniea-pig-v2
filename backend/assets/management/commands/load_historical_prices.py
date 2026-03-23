import csv
import os
import time
import requests
from datetime import datetime
from django.core.management.base import BaseCommand
from assets.models import Asset, Price


class Command(BaseCommand):
    help = (
        "Fetch historical daily adjusted prices from Tiingo for tickers in a CSV file."
    )

    def add_arguments(self, parser):
        parser.add_argument("file", type=str, help="Path to the tickers CSV file")

    def handle(self, *args, **options):
        api_key = os.environ.get("TIINGO_API_KEY")
        if not api_key:
            self.stdout.write(self.style.ERROR("TIINGO_API_KEY not set."))
            return

        # 1. Read tickers from CSV
        with open(options["file"], "r") as f:
            target_tickers = {row[0].strip() for row in csv.reader(f) if row}

        self.stdout.write(f"Found {len(target_tickers)} tickers in file.")

        # 2. Mark as base assets
        Asset.objects.filter(ticker__in=target_tickers).update(is_base_asset=True)

        # 3. Filter assets: In DB AND Not synced today
        today = datetime.now().date()
        assets = Asset.objects.filter(ticker__in=target_tickers).exclude(
            last_price_sync=today
        )

        if not assets.exists():
            self.stdout.write(self.style.SUCCESS("All assets are up to date."))
            return

        self.stdout.write(f"Processing {assets.count()} assets...")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {api_key}",
        }

        for i, asset in enumerate(assets):
            url = f"https://api.tiingo.com/tiingo/daily/{asset.ticker}/prices"
            params = {
                "startDate": "2019-01-01",
                "columns": "date,adjClose",
                "resampleFreq": "weekly",
            }

            try:
                response = requests.get(url, headers=headers, params=params, timeout=10)

                if response.status_code == 429:
                    self.stdout.write(self.style.WARNING("Rate limit hit. Stopping."))
                    break

                response.raise_for_status()
                data = response.json()

                prices = [
                    Price(
                        asset=asset,
                        date=datetime.strptime(row["date"][:10], "%Y-%m-%d").date(),
                        adj_close=row["adjClose"],
                    )
                    for row in data
                ]
                Price.objects.bulk_create(prices, ignore_conflicts=True)

                asset.last_price_sync = today
                asset.save(update_fields=["last_price_sync"])

                self.stdout.write(
                    f"[{i + 1}/{len(assets)}] {asset.ticker}: Saved {len(prices)} rows."
                )
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error {asset.ticker}: {e}"))
