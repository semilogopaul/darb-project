# Generated by Django 5.1.6 on 2025-03-04 21:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0002_repayment_is_verified_repayment_reference'),
    ]

    operations = [
        migrations.AddField(
            model_name='campaign',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='campaigns/'),
        ),
    ]
