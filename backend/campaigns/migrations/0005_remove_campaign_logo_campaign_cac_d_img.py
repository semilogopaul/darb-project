# Generated by Django 5.1.6 on 2025-03-07 13:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0004_campaign_logo'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='campaign',
            name='logo',
        ),
        migrations.AddField(
            model_name='campaign',
            name='cac_d_img',
            field=models.ImageField(blank=True, null=True, upload_to='cac_documents/'),
        ),
    ]
