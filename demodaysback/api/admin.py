from django.contrib import admin
from .models import Event, Project, Speaker, Feedback

admin.site.register(Event)
admin.site.register(Project)
admin.site.register(Speaker)
admin.site.register(Feedback)