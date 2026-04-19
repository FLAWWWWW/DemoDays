from rest_framework import serializers
from .models import Event, Project, Profile, Feedback, EmailReceiver
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'role', 'bio', 'phone']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class EventSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(max_length=200)
    date = serializers.DateField()
    description = serializers.CharField()
    location = serializers.CharField(max_length=255)
    image = serializers.CharField(max_length=255)
    def create(self, validated_data):
        return Event.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.date = validated_data.get('date', instance.date)
        instance.description = validated_data.get('description', instance.description)
        instance.location = validated_data.get('location', instance.location)
        instance.save()
        return instance
    
class FeedbackSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    text = serializers.CharField()
    rating = serializers.IntegerField(default=5)
    project_id = serializers.IntegerField()
    author = serializers.CharField(read_only=True)

    def create(self, validated_data):
        project = Project.objects.get(id=validated_data.pop('project_id'))
        return Feedback.objects.create(project=project, **validated_data)

    def update(self, instance, validated_data):
        instance.text = validated_data.get('text', instance.text)
        instance.rating = validated_data.get('rating', instance.rating)
        instance.save()
        return instance
    
class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'owner', 'event', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name', 'role']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords aren't matching"})
        try:
            validate_password(data['password'])
        except exceptions.ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return data
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("User with such an email exists.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'Guest')
        username = validated_data.pop('username', None) or validated_data['email']

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()

        if hasattr(user, 'profile'):
            user.profile.role = role
            user.profile.save()
        return user

class EmailReceiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailReceiver
        fields = ['email']

class UserMeSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']