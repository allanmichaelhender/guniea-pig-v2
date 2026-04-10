from django.core.management.base import BaseCommand
from django_q.models import Schedule

class Command(BaseCommand):
    help = "Initializes the weekly background tasks for data ingestion"

    def handle(self, *args, **options):
        # Schedule the weekly sync
        # This will run every Monday at 00:00
        schedule, created = Schedule.objects.get_or_create(
            func="assets.tasks.sync_weekly_data",
            defaults={
                "name": "Weekly Market Data Ingestion",
                "schedule_type": Schedule.WEEKLY,
                "repeats": -1, # Infinite
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS("Successfully created weekly sync schedule."))
        else:
            self.stdout.write(self.style.WARNING("Schedule already exists."))
