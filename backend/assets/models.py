from django.db import models
from pgvector.django import VectorField


class Asset(models.Model):
    ticker = models.CharField(max_length=10, unique=True)
    exchange = models.CharField(max_length=10)
    assetType = models.CharField(max_length=20)
    priceCurrency = models.CharField(max_length=3)
    startDate = models.DateField(null=True, blank=True)
    endDate = models.DateField(null=True, blank=True)
    # For semantic search embeddings
    embedding = VectorField(dimensions=384, null=True, blank=True)

    def __str__(self):
        return f"{self.ticker} ({self.exchange})"

    class Meta:
        indexes = [
            models.Index(fields=["ticker"]),
            models.Index(fields=["exchange"]),
            models.Index(fields=["assetType"]),
        ]
