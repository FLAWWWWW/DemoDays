from rest_framework import serializers
from .models import Event, Project, Profile, Feedback, EmailReceiver
from django.contrib.auth.models import User

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
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return data
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("User with such an email exists.")
        return data
    
    def create(self, validated_data):
        role = validated_data.pop('role')
        validated_data.pop('password_confirm')

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        Profile.objects.create(user=user, role=role)

        return user

class EmailReceiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailReceiver
        fields = ['email']