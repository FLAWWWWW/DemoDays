from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('GUEST', 'Guest'),
        ('SPEAKER', 'Speaker'),
        ('DEVELOPER', 'Developer'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='GUEST')
    bio = models.TextField(max_length=500, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    image = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.username} - ({self.role})"
    
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    location = models.CharField(max_length=255)
    image = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    owner = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='projects')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='projects')
    
    def __str__(self):
        return self.title

class TeamMember(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.project.title}"

class Feedback(models.Model):
    text = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='feedbacks')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)

    def __str__(self):
        return f"Feedback for {self.project.title} by {self.author.username}"
    
class EmailReceiver(models.Model):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email