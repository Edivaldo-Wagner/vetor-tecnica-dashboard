from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
    ClientViewSet, ServiceOrderViewSet, FinancialRecordViewSet,
    InspectionCategoryViewSet, InspectionItemViewSet, InspectionPhotoViewSet, TeamMemberViewSet, PlatformCompanyViewSet
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'service-orders', ServiceOrderViewSet)
router.register(r'financial-records', FinancialRecordViewSet)
router.register(r'inspection-categories', InspectionCategoryViewSet)
router.register(r'inspection-items', InspectionItemViewSet)
router.register(r'inspection-photos', InspectionPhotoViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'platform-companies', PlatformCompanyViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)