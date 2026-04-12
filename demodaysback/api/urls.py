from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.event_list, name='event-list'),
    path('events/<int:pk>/', views.event_detail, name='event-detail'),
    path('projects/', views.ProjectList.as_view(), name='project-list'),
    path('projects/<int:pk>/', views.ProjectDetail.as_view(), name='project-detail'),
]