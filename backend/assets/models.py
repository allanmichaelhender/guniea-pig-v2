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

    # For semantic search embeddings
    embedding = VectorField(dimensions=384, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["exchange"]),
            models.Index(fields=["assetType"]),
        ]
