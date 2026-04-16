from django.contrib import admin
from .models import Event, Project, Profile, Feedback, EmailReceiver

admin.site.register(Event)
admin.site.register(Project)
admin.site.register(Profile)
admin.site.register(Feedback)
admin.site.register(EmailReceiver)