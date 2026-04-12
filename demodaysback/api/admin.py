from django.contrib import admin
from .models import Event, Project, Profile, Feedback

admin.site.register(Event)
admin.site.register(Project)
admin.site.register(Profile)
admin.site.register(Feedback)