import pandas as pd
import financedatabase as fd
from django.core.management.base import BaseCommand
from assets.models import Asset

class Command(BaseCommand):
    help = "Enrich assets with metadata (Name, Sector, Industry) from FinanceDatabase"

    def handle(self, *args, **options):
        self.stdout.write("Fetching FinanceDatabase datasets (this may take a moment)...")
        
        try:
            equities = fd.Equities().select() # Returns the full datafram of equities
            etfs = fd.ETFs().select()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error fetching FinanceDatabase: {e}"))
            return

        self.stdout.write(f"Loaded {len(equities)} equities and {len(etfs)} ETFs.")

        # We scan all assets to ensure metadata is up to date
        assets = Asset.objects.all()
        updated_assets = []
        count_enriched = 0
        
        for asset in assets:
            # Normalize ticker (Tiingo 'BRK-B' vs FD 'BRK.B')
            search_tickers = [asset.ticker, asset.ticker.replace('-', '.'), asset.ticker.replace('.', '-')]
            match = None
            
            # Try finding a match in Equities or ETFs
            # We check both datasets regardless of assetType to be robust
            for t in search_tickers:
                if t in equities.index:
                    match = equities.loc[t]
                    break
                elif t in etfs.index:
                    match = etfs.loc[t]
                    break
            
            if match is not None:
                # Helper to safely get value or None if NaN (Pandas uses NaN for missing)
                def get_val(col):
                    val = match.get(col)
                    return val if pd.notna(val) else None

                asset.name = get_val('short_name') or get_val('long_name') or get_val('name')
                asset.sector = get_val('sector')
                asset.industry = get_val('industry')
                asset.country = get_val('country')
                
                updated_assets.append(asset)
                count_enriched += 1

            if len(updated_assets) >= 1000:
                Asset.objects.bulk_update(updated_assets, ['name', 'sector', 'industry', 'country'])
                updated_assets = []
                self.stdout.write(f"Enriched {count_enriched} assets...")

        if updated_assets:
            Asset.objects.bulk_update(updated_assets, ['name', 'sector', 'industry', 'country'])
            
        self.stdout.write(self.style.SUCCESS(f"Successfully enriched {count_enriched} assets."))
