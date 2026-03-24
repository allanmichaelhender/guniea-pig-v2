from django.core.management.base import BaseCommand
from ml.clustering import run_risk_pipeline


class Command(BaseCommand):
    help = "Calculates volatility (sigma_52) and risk clusters (KMeans) based on price history."

    def handle(self, *args, **options):
        self.stdout.write("Running risk analysis pipeline...")

        result = run_risk_pipeline()

        if result.get("status") == "success":
            self.stdout.write(
                self.style.SUCCESS(
                    f"Pipeline complete. Updated {result['updated']} assets. "
                    f"Modeled on {result['clustered']} assets after removing ETF's and outliers."
                )
            )
        else:
            self.stdout.write(self.style.ERROR(result.get("message", "Unknown error")))
