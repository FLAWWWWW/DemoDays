from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    developer = models.ForeignKey(User, on_delete=models.CASCADE)

class Speaker(models.Model):
    topic = models.CharField(max_length = 200)
    event = models.ForeignKey(Event, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class Feedback(models.Model):
    text = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)