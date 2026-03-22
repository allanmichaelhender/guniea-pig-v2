"""
URL configuration for guinea_pig project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("api/", include("api.urls")),
    # path("assets/", include("assets.urls")),
    # path("portfolio/", include("portfolio.urls")),
    # path("ml/", include("ml.urls")),
    # path("tasks/", include("tasks.urls")),
]
