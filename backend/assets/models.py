from django.db import models
from pgvector.django import VectorField


class Asset(models.Model):
    # Tiingo base fields
    ticker = models.CharField(max_length=20, primary_key=True)
    exchange = models.CharField(max_length=50)
    assetType = models.CharField(max_length=20)
    priceCurrency = models.CharField(max_length=3)
    startDate = models.DateField(null=True, blank=True)
    endDate = models.DateField(null=True, blank=True)

    # FinanceDatabase encrichment
    name = models.CharField(max_length=200, blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)

    # Indicates whether we have data downloaded or not, 1 = data is downloaded, 0 = no data
    have_data = models.IntegerField(blank=True, default=0)

    # New flags for V2 logic
    is_base_asset = models.BooleanField(
        default=False, help_text="Is part of the curated 100 universe"
    )
    last_price_sync = models.DateField(
        null=True, blank=True, help_text="Date of last successful price fetch"
    )
    
    # Risk Metrics (Calculated)
    cluster_id = models.IntegerField(null=True, blank=True, help_text="KMeans cluster assignment")
    sigma_52 = models.FloatField(null=True, blank=True, help_text="Annualized volatility (52-week)")
    cluster_x = models.FloatField(null=True, blank=True, help_text="PCA component 1 for visualization")
    cluster_y = models.FloatField(null=True, blank=True, help_text="PCA component 2 for visualization")

    # For semantic search embeddings
    embedding = VectorField(dimensions=384, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["exchange"]),
            models.Index(fields=["assetType"]),
        ]


class Price(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="prices")
    date = models.DateField()
    # We use FloatField (double precision) for analytics performance
    adj_close = models.FloatField(help_text="Adjusted closing price")

    class Meta:
        unique_together = ("asset", "date")
        indexes = [
            models.Index(fields=["asset", "date"]),
            models.Index(fields=["date"]),
        ]
