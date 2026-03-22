# backend/assets/migrations/0001_initial.py

from django.db import migrations, models
from pgvector.django import VectorExtension  # 1. Import this
import pgvector.django


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        VectorExtension(),  # 2. Add this BEFORE CreateModel
        migrations.CreateModel(
            name='Asset',
            fields=[
                ('ticker', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('exchange', models.CharField(max_length=10)),
                ('assetType', models.CharField(max_length=20)),
                ('priceCurrency', models.CharField(max_length=3)),
                ('startDate', models.DateField(blank=True, null=True)),
                ('endDate', models.DateField(blank=True, null=True)),
                # Your vector field is here
                ('embedding', pgvector.django.VectorField(blank=True, dimensions=384, null=True)),
            ],
            options={
                'indexes': [
                    models.Index(fields=['exchange'], name='assets_asse_exchang_...'),
                    models.Index(fields=['assetType'], name='assets_asse_assetTy_...'),
                ],
            },
        ),
    ]
