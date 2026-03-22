from django.core.management.base import BaseCommand
from assets.models import Asset
from sentence_transformers import SentenceTransformer


class Command(BaseCommand):
    help = "Generate vector embeddings for assets using sentence-transformers"

    def handle(self, *args, **options):
        self.stdout.write("Loading model 'sentence-transformers/all-MiniLM-L6-v2'...")
        # Load the model defined in your architecture plan
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        assets = Asset.objects.all()
        batch_size = 100
        batch = []
        count_updated = 0

        self.stdout.write(f"Processing {assets.count()} assets...")

        for asset in assets:
            # 1. Construct the deterministic sentence for the asset
            # Template: "Name (Ticker) is a [Type] listed on [Exchange]. Sector: [Sector]. Industry: [Industry]."
            name_str = asset.name if asset.name else asset.ticker

            parts = [
                f"{name_str} ({asset.ticker})",
                f"is a {asset.assetType} listed on {asset.exchange}.",
            ]

            if asset.sector:
                parts.append(f"Sector: {asset.sector}.")
            if asset.industry:
                parts.append(f"Industry: {asset.industry}.")
            if asset.country:
                parts.append(f"Country: {asset.country}.")

            text_representation = " ".join(parts)

            # Store tuple of (asset_obj, text)
            batch.append((asset, text_representation))

            # 2. Process in batches
            if len(batch) >= batch_size:
                self._process_batch(batch, model)
                count_updated += len(batch)
                self.stdout.write(f"Embedded {count_updated} assets...")
                batch = []

        # Process remaining
        if batch:
            self._process_batch(batch, model)
            count_updated += len(batch)

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully generated embeddings for {count_updated} assets."
            )
        )

    def _process_batch(self, batch, model):
        texts = [item[1] for item in batch]
        # Encode returns numpy arrays, convert to list for pgvector
        embeddings = model.encode(texts)

        update_list = []
        for i, (asset, _) in enumerate(batch):
            asset.embedding = embeddings[i].tolist()
            update_list.append(asset)

        # Bulk update only the embedding field
        Asset.objects.bulk_update(update_list, ["embedding"])
