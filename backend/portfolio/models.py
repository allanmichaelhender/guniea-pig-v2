from django.db import models
from django.conf import settings
from assets.models import Asset


class Portfolio(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolios",
        null=True,  # Nullable only for system/example portfolios if needed, generally strictly user-bound
        blank=True,
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # If true, this portfolio is visible to guests (e.g. "60/40 Benchmark")
    is_public = models.BooleanField(default=False)

    # --- Cached Analytics ---
    # Stored on Create/Update to avoid recalculating on every read
    annualized_return = models.FloatField(null=True, blank=True)
    volatility = models.FloatField(null=True, blank=True)
    sharpe_ratio = models.FloatField(null=True, blank=True)
    max_drawdown = models.FloatField(null=True, blank=True)
    performance_history = models.JSONField(null=True, blank=True, help_text="Time series data for charts")

    def __str__(self):
        return f"{self.name} ({self.user})"


class Holding(models.Model):
    portfolio = models.ForeignKey(
        Portfolio, on_delete=models.CASCADE, related_name="holdings"
    )
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="holdings")
    # Weight: 0.0 to 1.0. Validation enforced in API/Serializer.
    weight = models.FloatField()

    class Meta:
        unique_together = ("portfolio", "asset")
