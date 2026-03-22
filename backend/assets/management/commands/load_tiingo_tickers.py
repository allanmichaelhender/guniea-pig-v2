import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from assets.models import Asset

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('file', type=str)

    def handle(self, *args, **options):
        existing = set(Asset.objects.values_list('ticker', flat=True))
        to_create = []
        count_skipped = 0
        cutoff_date = datetime(2026, 1, 1).date()

        with open(options['file'], 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                ticker = row.get('ticker')
                start_str = row.get('startDate')
                end_str = row.get('endDate')

                # 1. Skip if no ticker or already exists
                if not ticker or ticker in existing:
                    continue

                # 2. Skip if Start Date is missing
                if not start_str or start_str.strip() == "":
                    count_skipped += 1
                    continue

                # 3. Skip if expired before 2026
                try:
                    # Tiingo format is YYYY-MM-DD
                    end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
                    if end_date < cutoff_date:
                        count_skipped += 1
                        continue
                except (ValueError, TypeError):
                    # If end date is missing/invalid, we assume it's still active 
                    # and keep it, or you can choose to skip it here too.
                    pass

                to_create.append(Asset(
                    ticker=ticker,
                    exchange=row.get('exchange', ''),
                    assetType=row.get('assetType', ''),
                    priceCurrency=row.get('priceCurrency', ''),
                    startDate=start_str,
                    endDate=end_str or None,
                ))

                if len(to_create) >= 500:
                    Asset.objects.bulk_create(to_create, ignore_conflicts=True)
                    to_create = []

            if to_create:
                Asset.objects.bulk_create(to_create, ignore_conflicts=True)

        self.stdout.write(self.style.SUCCESS(f"Import Complete! Skipped {count_skipped} inactive/incomplete assets."))
