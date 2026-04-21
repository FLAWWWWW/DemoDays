from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Event, Project, Feedback, Profile
from .serializers import EventSerializer, ProjectSerializer, FeedbackSerializer, RegisterSerializer, EmailReceiverSerializer, UserMeSerializer

@api_view(['GET', 'POST'])
def event_list(request):
    if request.method == 'GET':
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def event_detail(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = EventSerializer(event)
    return Response(serializer.data)

#вьюшка принимающая только POST запросы для имейлов
@api_view(['POST'])
def collect_email(request):
    serializer = EmailReceiverSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Email collected!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ProjectList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
    
    def post(self,request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_feedback(request):
    serializer = FeedbackSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(
            {"message": "Feedback submitted successfully!"},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None

    def get(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = self.get_object(pk)
        if not project:
            return Response(status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        
        print("ERRORS667: ")
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class SubscribeView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Subscribed successfully"}, status=status.HTTP_200_OK)
    
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)

class UploadAvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        avatar_file = request.FILES.get('avatar')

        if not avatar_file:
            return Response({"error": "No avatar file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return Response({"error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response({"error": "File too large. Maximum size is 5MB."}, status=status.HTTP_400_BAD_REQUEST)

        # Create media directory if it doesn't exist
        import os
        from django.conf import settings
        media_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
        os.makedirs(media_dir, exist_ok=True)

        # Generate unique filename
        import uuid
        file_extension = os.path.splitext(avatar_file.name)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(media_dir, unique_filename)

        # Save file
        with open(file_path, 'wb+') as destination:
            for chunk in avatar_file.chunks():
                destination.write(chunk)

        # Update user's profile image URL
        profile, created = Profile.objects.get_or_create(user=user)
        profile.image = f"/media/avatars/{unique_filename}"
        profile.save()

        return Response({
            "message": "Avatar uploaded successfully",
            "avatar_url": profile.image
        }, status=status.HTTP_200_OK)