from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'user_type', 'is_approved', 'has_defaulted')
    list_filter = ('user_type', 'is_approved', 'has_defaulted')
    search_fields = ('username', 'email')
