# Generated by Django 5.1.6 on 2025-03-09 11:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0005_remove_campaign_logo_campaign_cac_d_img'),
    ]

    operations = [
        migrations.AddField(
            model_name='campaign',
            name='funded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
